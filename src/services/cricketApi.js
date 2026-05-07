import scriptData from '../lib/matchScript.json';

const API_KEY = import.meta.env.VITE_CRICKET_API_KEY || '';
const BASE_URL = 'https://cricbuzz-cricket.p.rapidapi.com';

const CACHE_TTL = 15000; // 15 seconds cache to prevent rate limit exhaustion

class CricketAPIService {
  constructor() {
    this.cache = new Map();
    // In production, we'd only attempt live fetch if we have an API key.
    this.isLive = !!API_KEY; 
  }

  /**
   * Core fetch wrapper with exponential backoff and retry logic
   */
  async fetchWithRetry(url, options, retries = 3, backoff = 1000) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (retries > 0) {
        console.warn(`API fetch failed. Retrying in ${backoff}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        return this.fetchWithRetry(url, options, retries - 1, backoff * 2);
      }
      throw error;
    }
  }

  /**
   * Fetches real-time match data with caching and fallback protection
   */
  async getLiveMatch(matchId) {
    // 1. Fallback condition
    if (!this.isLive) {
      console.log('ℹ️ No Cricket API key found. Falling back to internal Mock Engine.');
      return this.getMockData();
    }

    const cacheKey = `match_${matchId}`;
    
    // 2. Cache check
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('ℹ️ Returning cached match data to prevent rate limits.');
        return cached.data;
      }
    }

    // 3. API Fetch & Normalization
    try {
      const data = await this.fetchWithRetry(`${BASE_URL}/matches/v1/${matchId}`, {
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'cricbuzz-cricket.p.rapidapi.com'
        }
      });
      
      const normalizedData = this.normalizeMatchData(data);
      
      // Update Cache
      this.cache.set(cacheKey, { data: normalizedData, timestamp: Date.now() });
      return normalizedData;
      
    } catch (error) {
      console.error('🚨 Live API failed severely, falling back to mock data:', error);
      return this.getMockData();
    }
  }

  /**
   * Normalizes raw API payloads (Cricbuzz/Sportradar) into CricVibe's MatchState schema
   */
  normalizeMatchData(apiData) {
    // Note: This maps against a standard Cricbuzz payload structure.
    return {
      matchId: apiData.matchId,
      score: apiData.score?.runs || 0,
      wickets: apiData.score?.wickets || 0,
      over: apiData.score?.overs || '0.0',
      target: apiData.target || '-',
      reqRate: apiData.reqRate || '-',
      batter: apiData.striker?.name || '-',
      bowler: apiData.bowler?.name || '-',
      commentary: apiData.latestCommentary || 'Match in progress...',
      pressure: this.calculatePressure(apiData),
      isDecisionWindowOpen: apiData.status === 'OVERS_BREAK' || apiData.status === 'WICKET'
    };
  }

  /**
   * Algorithmic calculation of tactical pressure based on run rates
   */
  calculatePressure(apiData) {
    if (!apiData.reqRate || !apiData.currRate) return 50;
    const diff = parseFloat(apiData.reqRate) - parseFloat(apiData.currRate);
    // Rough normalization: if reqRate is 3+ higher than currRate, pressure is 100%
    let pressure = 50 + (diff * 15);
    return Math.max(0, Math.min(100, pressure));
  }

  /**
   * Deterministic mock data fallback that walks through our script
   */
  getMockData() {
    // For the sake of the fallback, we just return the first event. 
    // In actual implementation, the useMatchStore handles the chronological progression of the mock script.
    return scriptData[0].matchState;
  }
}

export const cricketApi = new CricketAPIService();
