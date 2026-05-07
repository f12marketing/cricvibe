const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Firebase Admin
admin.initializeApp();
const db = getFirestore();

// Initialize Gemini API securely on the backend
// In production, this should be pulled from Google Cloud Secret Manager
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'development_key');

/**
 * 1. AI Scoring & Submission Processing (RPC Endpoint)
 * Secure, rate-limited endpoint for clients to submit their tactical decisions.
 */
exports.submitTacticalDecision = onCall({
  enforceAppCheck: false, // Set to true in production for security
  rateLimits: { maxConcurrentRequests: 100 }
}, async (request) => {
  const { auth, data } = request;
  
  // 1. Authentication Check
  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in to submit decisions.');
  }

  const { matchId, overId, bowlerId, fielders } = data;
  if (!matchId || !overId || !bowlerId || !fielders) {
    throw new HttpsError('invalid-argument', 'Missing required decision payload.');
  }

  const userId = auth.uid;
  const submissionRef = db.collection('matches').doc(matchId).collection('submissions').doc(`${userId}_${overId}`);
  const matchRef = db.collection('matches').doc(matchId);

  // 2. Transaction to prevent duplicate submissions and race conditions
  return await db.runTransaction(async (transaction) => {
    // Check if user already submitted for this specific over
    const submissionDoc = await transaction.get(submissionRef);
    if (submissionDoc.exists) {
      throw new HttpsError('already-exists', 'Decision already locked for this over.');
    }

    // Verify the match window is still open
    const matchDoc = await transaction.get(matchRef);
    if (!matchDoc.exists) {
      throw new HttpsError('not-found', 'Match not found.');
    }
    
    const matchData = matchDoc.data();
    if (!matchData.isDecisionWindowOpen) {
      throw new HttpsError('failed-precondition', 'The tactical window is closed.');
    }

    const actualMove = matchData.currentOvers?.[overId]?.actualMove;
    if (!actualMove) {
      throw new HttpsError('unavailable', 'Captain\'s move not resolvable yet.');
    }

    // 3. AI Scoring Request
    let aiResult = { merit_score: 50, reasoning: "Standard strategic evaluation." };
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        You are a world-class cricket tactical analyst.
        Context: T20 Match in the death overs.
        Actual Captain chose: Bowler ${actualMove.bowler}, Field: ${actualMove.field.join(', ')}.
        User chose: Bowler ${bowlerId}, Field: ${fielders.join(', ')}.
        Evaluate the user's tactical merit score (0-100) compared to the captain.
        Provide a 1-sentence reasoning.
        Output exactly as JSON: { "merit_score": 85, "reasoning": "..." }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      // Clean and parse the markdown JSON block
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      aiResult = JSON.parse(cleanJson);
    } catch (e) {
      console.error('Gemini AI Scoring Error:', e);
      // Failsafe: Continue with default score if AI fails
    }

    // Calculate final IQ
    const isCaptainMatch = bowlerId === actualMove.bowler;
    const iqEarned = isCaptainMatch ? 150 : (aiResult.merit_score || 50);

    // 4. Secure Write
    const payload = {
      userId,
      matchId,
      overId,
      bowlerId,
      fielders,
      iqEarned,
      merit_score: aiResult.merit_score,
      reasoning: aiResult.reasoning,
      captain_match: isCaptainMatch,
      timestamp: FieldValue.serverTimestamp()
    };

    transaction.set(submissionRef, payload);

    // Return the calculated result to the client instantly for the Verdict UI
    return payload; 
  });
});

/**
 * 2. Asynchronous Queue Processing (Leaderboard Aggregation)
 * Triggers in the background when a submission is successfully written.
 * This ensures efficient, non-blocking client requests.
 */
exports.processLeaderboardUpdate = onDocumentCreated('matches/{matchId}/submissions/{submissionId}', async (event) => {
  const submission = event.data.data();
  if (!submission || !submission.iqEarned) return;

  const { userId, iqEarned } = submission;
  const userRef = db.collection('users').doc(userId);

  // Efficient atomic batch update to user's global stats
  await userRef.update({
    totalIQ: FieldValue.increment(iqEarned),
    matchesPlayed: FieldValue.increment(1),
    lastActivityAt: FieldValue.serverTimestamp()
  });

  // Note: For massive global scale (>10k writes/sec), we would implement a 
  // Distributed Counter here rather than direct document updates.
});

/**
 * 3. Match Timer Synchronization (Authoritative Server Clock)
 * A scheduled function that acts as the source of truth for match phases,
 * preventing clients from hacking the timer.
 */
exports.syncMatchTimers = onSchedule("every 1 minutes", async (event) => {
  // In a real scenario, this fetches from the Sports API to sync the state.
  // For now, it aggressively closes expired decision windows across all active matches.
  
  const activeMatchesSnapshot = await db.collection('matches')
    .where('status', '==', 'LIVE')
    .where('isDecisionWindowOpen', '==', true)
    .get();
  
  if (activeMatchesSnapshot.empty) return;

  const batch = db.batch();
  const now = Date.now();

  activeMatchesSnapshot.forEach((doc) => {
    const match = doc.data();
    // If the window has expired server-side, lock it down
    if (match.windowExpiresAt && now > match.windowExpiresAt.toMillis()) {
      batch.update(doc.ref, { 
        isDecisionWindowOpen: false,
        commentary: 'Decision window closed. Play resumes.'
      });
    }
  });

  await batch.commit();
  console.log(`Synchronized timers for ${activeMatchesSnapshot.size} live matches.`);
});
