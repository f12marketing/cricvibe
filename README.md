<div align="center">
  <img src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2805&auto=format&fit=crop" width="100%" height="200" style="object-fit: cover; border-radius: 12px; margin-bottom: 20px;" alt="CricVibe Stadium" />
  
  # 🏏 CricVibe: The Tactical Edge
  **The ultimate real-time cricket tactical simulator and second-screen experience.**
  
  [![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg)](https://vitejs.dev/)
  [![Zustand](https://img.shields.io/badge/State-Zustand-orange.svg)](https://docs.pmnd.rs/zustand/)
  [![Firebase](https://img.shields.io/badge/Backend-Firebase-FFCA28.svg)](https://firebase.google.com/)
  [![Gemini](https://img.shields.io/badge/AI-Gemini_1.5-8E75B2.svg)](https://ai.google.dev/)
</div>

---

## 🌟 Overview
**CricVibe** transforms how fans watch T20 cricket. It is an ultra-premium, interactive web application that places you directly in the captain's hotseat. 

Rather than passively watching a broadcast, CricVibe allows you to anticipate the next move. When a critical "Decision Window" opens in a live match, you have 15 seconds to set the field and choose the bowler. Gemini AI then evaluates your tactical merit against the *actual* captain's decision, awarding "Cricket IQ" points and updating a massive, real-time national leaderboard.

## ✨ Key Features
*   **Real-time Match Sync:** Polls live data (via RapidAPI/Sportradar) and automatically triggers interactive decision windows.
*   **Gemini AI Verdicts:** State-of-the-art Generative AI evaluates your tactical field placements against the real-world captain.
*   **Immersive Audio Engine:** Engineered using the native Web Audio API for zero-payload synthesis (crowd roars, countdown ticks, victory stingers).
*   **Global Leaderboards:** Real-time ranking system built on Firebase with an interactive SVG India Heatmap.
*   **Social Scorecards:** Generate and download 1080x1920 ESPN-style broadcast graphics of your tactical performance for Instagram Stories.
*   **Admin Console:** Internal dashboard to override events, control the match engine, and monitor system metrics.

## 🏗 Architecture
CricVibe is built for scale, speed, and aesthetics.
*   **Frontend**: React 18, Vite, Tailwind CSS (Dark Neon Esports Theme), Framer Motion (Micro-interactions).
*   **State Management**: Zustand (Centralized `useMatchStore` & `useLeaderboardStore` with optimistic UI updates).
*   **Backend**: Firebase Cloud Functions (Node 20).
*   **Database**: Firestore (Transactional atomic writes, queue processing).

## 🚀 Quick Start

### 1. Bootstrap Environment
Run the included setup script to install all dependencies and generate your `.env` file:
```bash
bash setup.sh
```

### 2. Configure Credentials
Open the newly created `.env` file and input your Firebase configuration and RapidAPI key.
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_id
VITE_CRICKET_API_KEY=your_rapidapi_key
```

### 3. Run Locally
Start the optimized Vite development server:
```bash
npm run dev
```

*(Note: The app will gracefully fall back to an internal mock match engine if no API keys are provided!)*

## 📦 Production Deployment
CricVibe features an automated CI/CD pipeline. Pushes to `main` will automatically build the code-split, lazy-loaded frontend to **Vercel**, and deploy the secure backend to **Firebase Cloud Functions**. 

For complete deployment details, required secrets, and infrastructure setup, please read the [DEPLOYMENT.md](./DEPLOYMENT.md).

---
<div align="center">
  <i>Built with speed, scale, and a love for the game.</i>
</div>
