# 🚀 CricVibe Deployment Guide

This guide details the complete CI/CD workflow and manual deployment steps required to push CricVibe to a production environment.

## Architecture Overview
*   **Frontend**: Hosted on Vercel (Optimized Vite React SPA)
*   **Backend / Database**: Firebase Cloud Functions & Firestore
*   **Live Data**: RapidAPI (Cricbuzz/Sportradar)

---

## 1. Environment Preparation

Before deploying, ensure you have production values for the following environment variables. In Vercel, navigate to **Project Settings > Environment Variables** and add:

*   `VITE_FIREBASE_API_KEY`
*   `VITE_FIREBASE_AUTH_DOMAIN`
*   `VITE_FIREBASE_PROJECT_ID`
*   `VITE_FIREBASE_STORAGE_BUCKET`
*   `VITE_FIREBASE_MESSAGING_SENDER_ID`
*   `VITE_FIREBASE_APP_ID`
*   `VITE_CRICKET_API_KEY` (Your RapidAPI Key)

For the backend, set your Gemini API key in Firebase Secret Manager (or config):
```bash
firebase functions:secrets:set GEMINI_API_KEY
```

---

## 2. CI/CD Automated Deployment

CricVibe includes a fully configured GitHub Actions workflow (`.github/workflows/deploy.yml`).

### Required GitHub Secrets
To enable automated deployments upon pushing to the `main` branch, add the following secrets to your GitHub repository (**Settings > Secrets and variables > Actions**):

*   **Vercel Secrets:**
    *   `VERCEL_TOKEN`: Generate this from your Vercel Account Settings -> Tokens.
    *   `VERCEL_ORG_ID`: Your Vercel Organization ID.
    *   `VERCEL_PROJECT_ID`: Your Vercel Project ID.
*   **Firebase Secrets:**
    *   `FIREBASE_TOKEN`: Generate by running `firebase login:ci` locally.
*   **App Config Secrets:**
    *   Add all the `VITE_FIREBASE_*` keys listed in step 1.

Once configured, any push or merge to the `main` branch will:
1. Build the frontend with Vite `manualChunks` optimization.
2. Deploy the frontend to Vercel.
3. Deploy the Cloud Functions to Firebase.

---

## 3. Manual Deployment

If you prefer to deploy manually via the CLI:

### Deploying Frontend to Vercel
```bash
npm run build
vercel --prod
```
*(Ensure you have linked the project via `vercel link` first)*

### Deploying Backend to Firebase
```bash
cd functions
npm run deploy
```
*(Ensure you have initialized the project via `firebase init` first)*

---

## 4. Performance Optimizations Implemented

*   **React.lazy & Suspense**: The `TacticalSimulator`, `Leaderboard`, and `AdminDashboard` components are route-split. Users only download the JavaScript for these heavy views when they navigate to them, significantly improving Initial Page Load.
*   **Vite Manual Chunks**: Heavy vendor libraries (`framer-motion`, `firebase`, `recharts`, `react-dom`) are aggressively split into separate chunks in `vite.config.js`. This allows browsers to cache the core libraries independently of your application code updates.
*   **Image Generation**: The `ShareOverlay` generates high-resolution social assets entirely on the client's GPU, saving massive server bandwidth.
