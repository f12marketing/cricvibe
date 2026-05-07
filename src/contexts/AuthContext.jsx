import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, googleProvider, db } from '../lib/firebase';
import {
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  linkWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// Default avatar options for onboarding
export const AVATAR_OPTIONS = [
  { id: 'captain', emoji: '🏏', label: 'The Captain', color: '#00E676' },
  { id: 'strategist', emoji: '🧠', label: 'The Strategist', color: '#448AFF' },
  { id: 'aggressor', emoji: '🔥', label: 'The Aggressor', color: '#FF5252' },
  { id: 'defender', emoji: '🛡️', label: 'The Defender', color: '#FFD740' },
  { id: 'analyst', emoji: '📊', label: 'The Analyst', color: '#7C4DFF' },
  { id: 'maverick', emoji: '⚡', label: 'The Maverick', color: '#FF6D00' },
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);     // Firebase Auth user
  const [userProfile, setUserProfile] = useState(null);      // Firestore profile data
  const [loading, setLoading] = useState(true);              // Initial auth check
  const [authLoading, setAuthLoading] = useState(false);     // During sign-in actions
  const [error, setError] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Clear errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch or create user profile from Firestore with timeout
  const fetchUserProfile = useCallback(async (user) => {
    if (!user) {
      setUserProfile(null);
      setNeedsOnboarding(false);
      return null;
    }

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firestore timeout')), 4000)
    );

    const fetchTask = async () => {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const profile = { uid: user.uid, ...userSnap.data() };
        setUserProfile(profile);
        setNeedsOnboarding(!profile.username || !profile.avatar);
        return profile;
      } else {
        const newProfile = {
          displayName: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          username: '',
          avatar: '',
          isGuest: user.isAnonymous,
          totalIQ: 0,
          globalRank: null,
          matchesPlayed: 0,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        };
        await setDoc(userRef, newProfile);
        setUserProfile({ uid: user.uid, ...newProfile });
        setNeedsOnboarding(true);
        return { uid: user.uid, ...newProfile };
      }
    };

    try {
      // Race the fetch task against the timeout
      return await Promise.race([fetchTask(), timeoutPromise]);
    } catch (err) {
      console.warn('Using fallback profile due to Firestore error/timeout:', err);
      const fallbackProfile = {
        uid: user.uid,
        displayName: user.displayName || 'Player',
        email: user.email || '',
        photoURL: user.photoURL || '',
        username: user.displayName || '',
        avatar: 'captain',
        isGuest: user.isAnonymous,
        totalIQ: 0,
        globalRank: null,
        matchesPlayed: 0,
      };
      setUserProfile(fallbackProfile);
      setNeedsOnboarding(false);
      return fallbackProfile;
    }
  }, []);

  // Listen to auth state changes (session persistence)
  useEffect(() => {
    // Safety timeout — never hang on loading screen even if Firebase is slow
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(safetyTimer);
      setCurrentUser(user);

      if (user) {
        try {
          await fetchUserProfile(user);
        } catch (err) {
          // Specifically surface the Firestore 'Database not found' message
          if (err?.message?.includes('not found') || err?.code === 'unavailable') {
            console.error('🔴 Firestore database not yet created. Please create it in the Firebase Console: console.firebase.google.com → your project → Firestore Database → Create database.');
          } else {
            console.warn('Firestore unavailable, using fallback profile:', err?.message);
          }
        }
      } else {
        setUserProfile(null);
        setNeedsOnboarding(false);
      }

      setLoading(false);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, [fetchUserProfile]);

  // Google Sign In
  async function loginWithGoogle() {
    setAuthLoading(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      await fetchUserProfile(result.user);
      return result.user;
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed the popup — not a real error
        setError(null);
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError(null);
      } else {
        setError(getErrorMessage(err.code));
      }
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }

  // Guest Login (Anonymous)
  async function loginAsGuest() {
    setAuthLoading(true);
    setError(null);

    try {
      const result = await signInAnonymously(auth);
      await fetchUserProfile(result.user);
      return result.user;
    } catch (err) {
      console.warn("Firebase Auth failed (likely missing API key). Falling back to mock guest session.");
      // MOCK FALLBACK FOR LOCAL TESTING
      const mockUser = {
        uid: 'mock-guest-' + Math.random().toString(36).substr(2, 9),
        isAnonymous: true,
        displayName: 'Mock Guest',
      };
      setCurrentUser(mockUser);
      setUserProfile({
        uid: mockUser.uid,
        username: '',
        avatar: '',
        isGuest: true,
        totalIQ: 0,
        globalRank: null,
        matchesPlayed: 0,
      });
      setNeedsOnboarding(true);
      return mockUser;
    } finally {
      setAuthLoading(false);
    }
  }

  // Upgrade guest account to Google
  async function upgradeGuestToGoogle() {
    if (!currentUser || !currentUser.isAnonymous) return;

    setAuthLoading(true);
    setError(null);

    try {
      const result = await linkWithPopup(currentUser, googleProvider);
      // Update the profile with Google data
      const userRef = doc(db, 'users', result.user.uid);
      await updateDoc(userRef, {
        displayName: result.user.displayName || userProfile?.displayName || '',
        email: result.user.email || '',
        photoURL: result.user.photoURL || '',
        isGuest: false,
        lastLoginAt: serverTimestamp(),
      });
      await fetchUserProfile(result.user);
      return result.user;
    } catch (err) {
      setError(getErrorMessage(err.code));
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }

  // Complete onboarding (set username + avatar)
  async function completeOnboarding(username, avatarId) {
    if (!currentUser) return;

    setAuthLoading(true);
    setError(null);

    // OFFLINE/MOCK FAST PATH: skip Firestore entirely for mock sessions
    const isMockSession = currentUser.uid?.startsWith('mock-guest-');
    if (isMockSession) {
      setUserProfile(prev => ({
        ...prev,
        username: username.trim(),
        avatar: avatarId,
      }));
      setNeedsOnboarding(false);
      setAuthLoading(false);
      return;
    }

    // REAL SESSION: race Firestore against a 5s timeout
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore timeout')), 5000)
    );

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await Promise.race([
        updateDoc(userRef, {
          username: username.trim(),
          avatar: avatarId,
          lastLoginAt: serverTimestamp(),
        }),
        timeout
      ]);
    } catch (err) {
      // Firestore failed or timed out — silently fall through, local state is still set below
      console.warn('Firestore onboarding write failed, using local state:', err.message);
    } finally {
      // Always update local state so the UI unblocks
      setUserProfile(prev => ({
        ...prev,
        username: username.trim(),
        avatar: avatarId,
      }));
      setNeedsOnboarding(false);
      setAuthLoading(false);
    }
  }

  // Logout
  async function logout() {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setNeedsOnboarding(false);
    } catch (err) {
      setError('Failed to sign out. Please try again.');
    }
  }

  const value = {
    currentUser,
    userProfile,
    loading,
    authLoading,
    error,
    needsOnboarding,
    loginWithGoogle,
    loginAsGuest,
    upgradeGuestToGoogle,
    completeOnboarding,
    logout,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Map Firebase error codes to user-friendly messages
function getErrorMessage(code) {
  switch (code) {
    case 'auth/popup-closed-by-user':
      return null;
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment.';
    case 'auth/credential-already-in-use':
      return 'This Google account is already linked to another profile.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
