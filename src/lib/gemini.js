const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Global rate limiter state
let lastCallTime = 0;
const RATE_LIMIT_MS = 2000; // 2 seconds between API calls to prevent hammering

/**
 * AI Tactical Scoring System
 * Evaluates user decisions against match context using Gemini API.
 */
export async function getTacticalAnalysis(payload) {
  const {
    matchSituation,
    batterHandedness,
    bowlerType,
    currentScore,
    requiredRate,
    userBowlingChoice,
    userFieldPlacements,
    actualCaptainBowler
  } = payload;

  const captainMatch = userBowlingChoice === actualCaptainBowler;

  // Fallback Scoring System
  const fallbackScore = () => ({
    merit_score: captainMatch ? 85 : 45,
    captain_match: captainMatch,
    confidence: 60,
    reasoning: captainMatch 
      ? "Solid read. Aligns perfectly with the captain's containment strategy."
      : "Aggressive divergent strategy, bypassing the safer defensive options."
  });

  if (!GEMINI_API_KEY) {
    console.warn("Gemini API Key missing. Returning fallback tactical score.");
    return fallbackScore();
  }

  // Rate Limiting Check
  const now = Date.now();
  if (now - lastCallTime < RATE_LIMIT_MS) {
    console.warn("Rate limit exceeded. Falling back to heuristic scoring.");
    return fallbackScore();
  }
  lastCallTime = now;

  // Prompt Engineering Logic
  const prompt = `
    You are an expert cricket tactician analyzing an IPL match decision.
    
    INPUT CONTEXT:
    - Match Situation: ${matchSituation}
    - Current Score: ${currentScore}
    - Required Rate: ${requiredRate}
    - Batter Profile: ${batterHandedness}
    - User Bowler Choice: ${userBowlingChoice} (${bowlerType})
    - User Field Placements: ${userFieldPlacements.join(', ')}
    - Actual Captain Move: ${actualCaptainBowler}

    TASK:
    Analyze the tactical merit of the user's bowling and fielding choices given the required run rate and batter profile.
    
    RULES:
    1. Output MUST be strictly valid JSON.
    2. JSON Schema: { "merit_score": number (0-100), "captain_match": boolean, "confidence": number (0-100), "reasoning": string }
    3. "reasoning" MUST be a maximum of 15 words.
    4. "reasoning" MUST use tactical cricket language and a human expert broadcast tone.
    5. Do not include markdown code blocks (e.g. \`\`\`json). Output raw JSON only.

    EXAMPLES OF GOOD REASONING:
    "Historically, leg spinners reduce Kohli's strike rate in middle overs."
    "Deep square leg prevents boundary probability against pull-heavy batters."
    "Pace off the ball wide outside off neutralizes the slog sweep."
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3, // Lower temperature for more deterministic, analytical responses
          maxOutputTokens: 150,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    let resultText = data.candidates[0].content.parts[0].text;
    
    // Robust parsing: strip potential markdown fences
    resultText = resultText.replace(/```json\n?|\n?```/g, '').trim();
    
    const parsedData = JSON.parse(resultText);
    
    // Schema Validation
    if (
      typeof parsedData.merit_score !== 'number' || 
      typeof parsedData.reasoning !== 'string' ||
      typeof parsedData.captain_match !== 'boolean'
    ) {
      throw new Error("Invalid schema structure returned by AI.");
    }

    // Force 15 word limit safety
    const words = parsedData.reasoning.split(' ');
    if (words.length > 15) {
      parsedData.reasoning = words.slice(0, 15).join(' ') + '...';
    }

    return parsedData;

  } catch (error) {
    console.error("Tactical AI Evaluation Failed:", error);
    // Return graceful fallback on API/Network/Parsing error
    return fallbackScore();
  }
}
