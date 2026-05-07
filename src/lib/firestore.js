import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';

// Listen to a specific live match
export const subscribeToMatch = (matchId, callback) => {
  const matchRef = doc(db, 'live_matches', matchId);
  return onSnapshot(matchRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  });
};

// Listen to the active event (e.g., current over) for a match
export const subscribeToActiveEvent = (matchId, callback) => {
  const eventsRef = collection(db, 'match_events');
  // Usually, there's only one ACCEPTING_DECISIONS or CALCULATING event at a time per match
  const q = query(
    eventsRef, 
    where('matchId', '==', matchId),
    where('status', 'in', ['ACCEPTING_DECISIONS', 'CALCULATING']),
    orderBy('decisionEndTime', 'desc'),
    limit(1)
  );

  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  });
};

// Submit a tactical decision
export const submitDecision = async (uid, eventId, matchId, selectedBowler, placedFielders) => {
  if (!uid || !eventId) throw new Error("Missing required parameters for submission");

  const decisionId = `${eventId}_${uid}`;
  const decisionRef = doc(db, 'user_decisions', decisionId);

  await setDoc(decisionRef, {
    uid,
    eventId,
    matchId,
    selectedBowler,
    placedFielders,
    status: 'PENDING',
    submittedAt: serverTimestamp()
  });

  return decisionId;
};

// Listen for the AI scored result of a decision
export const subscribeToTacticalScore = (uid, eventId, callback) => {
  const scoreId = `${eventId}_${uid}`;
  const scoreRef = doc(db, 'tactical_scores', scoreId);
  
  return onSnapshot(scoreRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    }
  });
};

// Listen to the global leaderboard
export const subscribeToLeaderboard = (leaderboardId = 'global_season_1', callback) => {
  const lbRef = doc(db, 'leaderboards', leaderboardId);
  return onSnapshot(lbRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    } else {
      callback(null);
    }
  });
};
