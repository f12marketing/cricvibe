import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute — wraps routes that require authentication.
 * Redirects to /login if user is not signed in.
 * Shows nothing while auth state is loading.
 */
export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  // Still checking auth — render nothing (the AuthProvider handles full-screen loading)
  if (loading) return null;

  // Not authenticated — redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
