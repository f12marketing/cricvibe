import { create } from 'zustand';
import scriptData from '../lib/matchScript.json';
import { cricketApi } from '../services/cricketApi';

export const useMatchStore = create((set, get) => ({
  isPlaying: false,
  currentEventIndex: 0,
  currentEvent: null,
  matchState: scriptData[0].matchState,
  
  isDecisionWindow: false,
  decisionTimeLeft: 0,
  showVerdict: false,
  actualMove: null,
  
  // User Decisions & Verdicts (Centralized)
  locked: false,
  selectedBowler: null,
  placedFielders: [],
  scoringResult: null,

  timerRef: null,
  countdownRef: null,
  livePollingRef: null,
  
  // connectionStatus: 'connected' | 'degraded' | 'offline'
  connectionStatus: navigator.onLine ? 'connected' : 'offline',

  // --- Actions ---

  startSimulation: () => {
    // Stop any live polling
    get().stopLivePolling();
    set({ isPlaying: true, currentEventIndex: 0 });
    get().advanceEvent();
  },

  pauseSimulation: () => {
    const { timerRef, countdownRef } = get();
    if (timerRef) clearTimeout(timerRef);
    if (countdownRef) clearInterval(countdownRef);
    set({ isPlaying: false, timerRef: null, countdownRef: null });
  },

  jumpToEvent: (index) => {
    get().pauseSimulation();
    set({ currentEventIndex: index, isPlaying: true });
    get().advanceEvent();
  },

  startLivePolling: (matchId) => {
    // Stop mock simulation
    get().pauseSimulation();
    
    // Initial fetch
    get().fetchLiveState(matchId);

    // Poll every 15 seconds
    const intervalId = setInterval(() => {
      get().fetchLiveState(matchId);
    }, 15000);

    set({ livePollingRef: intervalId, isPlaying: true });
  },

  stopLivePolling: () => {
    const { livePollingRef } = get();
    if (livePollingRef) clearInterval(livePollingRef);
    set({ livePollingRef: null });
  },

  fetchLiveState: async (matchId) => {
    if (!navigator.onLine) {
      set({ connectionStatus: 'offline' });
      // We don't abort, we just let it try or wait for the next poll
    }

    try {
      const liveData = await cricketApi.getLiveMatch(matchId);
      
      set({ 
        matchState: liveData, 
        connectionStatus: navigator.onLine ? 'connected' : 'offline' 
      });

      // Trigger decision window based on live events
      if (liveData.isDecisionWindowOpen && !get().isDecisionWindow) {
        get().triggerLiveDecisionWindow();
      }
    } catch (err) {
      console.error('Failed to poll live state', err);
      set({ connectionStatus: 'degraded' });
    }
  },

  triggerLiveDecisionWindow: () => {
    const { countdownRef } = get();
    if (countdownRef) clearInterval(countdownRef);

    set({
      isDecisionWindow: true,
      showVerdict: false,
      decisionTimeLeft: 15,
      locked: false,
      selectedBowler: null,
      placedFielders: [],
      scoringResult: null,
    });

    const newCountdownRef = setInterval(() => {
      set((state) => {
        if (state.decisionTimeLeft <= 1) {
          clearInterval(newCountdownRef);
          return { decisionTimeLeft: 0, isDecisionWindow: false };
        }
        return { decisionTimeLeft: state.decisionTimeLeft - 1 };
      });
    }, 1000);
    
    set({ countdownRef: newCountdownRef });
  },

  setPlacedFielders: (fielders) => {
    set({ placedFielders: typeof fielders === 'function' ? fielders(get().placedFielders) : fielders });
  },

  setSelectedBowler: (bowlerId) => {
    set({ selectedBowler: bowlerId });
  },

  lockDecision: () => {
    set({ locked: true });
  },

  clearScoringResult: () => {
    set({ scoringResult: null });
  },

  updateScoringResult: (result) => {
    set({ scoringResult: result });
  },

  advanceEvent: () => {
    const { currentEventIndex, timerRef, countdownRef } = get();
    
    if (currentEventIndex >= scriptData.length) {
      set({ isPlaying: false });
      return;
    }

    const event = scriptData[currentEventIndex];
    const newState = { currentEvent: event };

    if (event.matchState) newState.matchState = event.matchState;

    if (event.type === 'DECISION_WINDOW') {
      newState.isDecisionWindow = true;
      newState.showVerdict = false;
      newState.decisionTimeLeft = event.duration;
      newState.actualMove = event.actualMove;
      
      // Reset user tactical choices
      newState.locked = false;
      newState.selectedBowler = null;
      newState.placedFielders = [];
      newState.scoringResult = null;

      if (countdownRef) clearInterval(countdownRef);
      const newCountdownRef = setInterval(() => {
        set((state) => {
          if (state.decisionTimeLeft <= 1) {
            clearInterval(newCountdownRef);
            return { decisionTimeLeft: 0 };
          }
          return { decisionTimeLeft: state.decisionTimeLeft - 1 };
        });
      }, 1000);
      newState.countdownRef = newCountdownRef;

    } else if (event.type === 'VERDICT') {
      newState.isDecisionWindow = false;
      newState.showVerdict = true;
      if (countdownRef) clearInterval(countdownRef);
      newState.countdownRef = null;

      // Async AI Verdict Generation via Gemini
      const state = get();
      if (state.locked && state.actualMove && state.selectedBowler && state.placedFielders.length === 3) {
        const hit = state.selectedBowler === state.actualMove.bowler;

        // Show optimistic score immediately while Gemini responds
        newState.scoringResult = {
          iqEarned: hit ? 150 : 50,
          merit_score: hit ? 92 : 45,
          captain_match: hit,
          reasoning: state.actualMove.aiFeedback || 'Analyzing your decision...',
          isLoading: true,
        };

        // Fire Gemini call asynchronously — update store when done
        const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (geminiKey) {
          const { actualMove, selectedBowler, placedFielders } = state;
          setTimeout(async () => {
            try {
              const prompt = `You are a world-class T20 cricket tactical analyst. Be concise.\nContext: Death overs, T20 match.\nCaptain chose: Bowler=${actualMove.bowler}, Field=${(actualMove.field||[]).join(', ')}.\nUser chose: Bowler=${selectedBowler}, Field=${placedFielders.join(', ')}.\nScore the user's tactical merit (0-100) and explain in ONE punchy sentence.\nRespond ONLY as valid JSON: {"merit_score": 75, "reasoning": "..."}`;
              const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
                { method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
              );
              const data = await res.json();
              const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
              const aiResult = JSON.parse(raw.replace(/```json|```/g, '').trim());
              get().updateScoringResult({
                iqEarned: hit ? 150 : (aiResult.merit_score || 50),
                merit_score: aiResult.merit_score,
                captain_match: hit,
                reasoning: aiResult.reasoning,
                isLoading: false,
              });
            } catch (e) {
              console.warn('Gemini scoring failed, using fallback:', e.message);
              get().updateScoringResult({ ...get().scoringResult, isLoading: false });
            }
          }, 0);
        } else {
          newState.scoringResult.isLoading = false;
        }
      } else if (!state.locked) {
        newState.scoringResult = {
          iqEarned: 0, merit_score: 0, captain_match: false,
          reasoning: "You missed the tactical window! The captain made their move without you.",
          isLoading: false,
        };
      }

    } else if (event.type === 'BALL') {
      newState.isDecisionWindow = false;
      newState.showVerdict = false;
      if (countdownRef) clearInterval(countdownRef);
      newState.countdownRef = null;
    }

    if (timerRef) clearTimeout(timerRef);
    const newTimerRef = setTimeout(() => {
      set((state) => ({ currentEventIndex: state.currentEventIndex + 1 }));
      get().advanceEvent();
    }, event.duration * 1000);
    newState.timerRef = newTimerRef;

    set(newState);
  }
}));
