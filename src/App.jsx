import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import OnboardingFlow from './components/OnboardingFlow';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLoadingScreen from './components/AuthLoadingScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AudioProvider } from './contexts/AudioContext';

// Lazy loaded heavy components for code-splitting
const TacticalSimulator = lazy(() => import('./pages/TacticalSimulator'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Inner app — must be inside AuthProvider to use useAuth()
function AppContent() {
  const { currentUser, loading, needsOnboarding } = useAuth();

  // Firebase Auth is still initializing — show branded loading screen
  if (loading) {
    return <AuthLoadingScreen />;
  }

  // User is logged in but hasn't completed onboarding (username/avatar)
  if (currentUser && needsOnboarding) {
    return (
      <AnimatePresence mode="wait">
        <OnboardingFlow key="onboarding" />
      </AnimatePresence>
    );
  }

  return (
      <Router>
        <Suspense fallback={<AuthLoadingScreen />}>
          <Routes>
            {/* Public route — Login page */}
            <Route
              path="/login"
              element={
                currentUser ? <Navigate to="/" replace /> : <LoginPage />
              }
            />

            {/* Protected routes — require authentication */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="simulator" element={<TacticalSimulator />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="admin" element={<AdminDashboard />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AudioProvider>
          <AppContent />
        </AudioProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
