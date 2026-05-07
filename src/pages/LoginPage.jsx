import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Shield, Zap, Trophy, ChevronRight, Loader2, AlertCircle, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const FEATURES = [
  { icon: Zap, text: 'Real-time tactical decisions', color: 'text-primary' },
  { icon: Trophy, text: 'Compete on global leaderboards', color: 'text-secondary' },
  { icon: Shield, text: 'AI-powered Cricket IQ scoring', color: 'text-accent' },
];

export default function LoginPage() {
  const { loginWithGoogle, loginAsGuest, authLoading, error } = useAuth();
  const [loadingType, setLoadingType] = useState(null); // 'google' | 'guest'

  const handleGoogleLogin = async () => {
    setLoadingType('google');
    try {
      await loginWithGoogle();
    } catch {
      // Error is handled by AuthContext
    } finally {
      setLoadingType(null);
    }
  };

  const handleGuestLogin = async () => {
    setLoadingType('guest');
    try {
      await loginAsGuest();
    } catch {
      // Error is handled by AuthContext
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center overflow-hidden">

      {/* ── Ambient Background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Primary glow */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.08, 0.04] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[10%] w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] rounded-full bg-primary blur-[100px] sm:blur-[180px]"
        />
        {/* Accent glow */}
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-20%] right-[5%] w-[250px] h-[250px] sm:w-[500px] sm:h-[500px] rounded-full bg-accent blur-[80px] sm:blur-[160px]"
        />
        {/* Secondary glow */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.02, 0.05, 0.02] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] right-[30%] w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] rounded-full bg-secondary blur-[70px] sm:blur-[140px]"
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* Floating cricket particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, Math.random() * -300 - 100],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: Math.random() * 8 + 6,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* ── Main Content ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-3 sm:mx-4"
      >
        {/* Logo + Branding */}
        <div className="text-center mb-7 sm:mb-10">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center shadow-glow-sm">
              <Activity className="h-7 w-7 text-primary" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-display font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight text-textPrimary mb-2 sm:mb-3"
          >
            Cric<span className="text-primary">Vibe</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-textSecondary text-base font-light tracking-wide"
          >
            The Tactical Edge
          </motion.p>
        </div>

        {/* Sign In Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="glass-card p-5 sm:p-8 relative overflow-hidden"
        >
          {/* Subtle top border glow */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <h2 className="font-display font-bold text-lg text-textPrimary mb-1">Welcome, Captain</h2>
          <p className="text-textMuted text-sm mb-5 sm:mb-8">Sign in to prove your tactical genius</p>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="flex items-center gap-2.5 p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Sign In Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            disabled={authLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-white text-gray-800 font-semibold text-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mb-3"
          >
            {loadingType === 'google' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-textMuted text-xs uppercase tracking-widest font-medium">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Guest Login */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGuestLogin}
            disabled={authLoading}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl border border-border bg-surface text-textSecondary font-semibold text-sm transition-all duration-200 hover:bg-surfaceHover hover:text-textPrimary hover:border-borderHover disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loadingType === 'guest' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Users className="h-4 w-4" />
                Play as Guest
                <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-40 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all" />
              </>
            )}
          </motion.button>

          <p className="text-textMuted text-[11px] text-center mt-5 leading-relaxed">
            Guest progress is saved locally. Sign in with Google to sync across devices.
          </p>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-8 flex flex-col gap-2"
        >
          {FEATURES.map(({ icon: Icon, text, color }, idx) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + idx * 0.1, duration: 0.4 }}
              className="flex items-center gap-3 text-sm text-textSecondary"
            >
              <div className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0">
                <Icon className={`h-3 w-3 ${color}`} />
              </div>
              {text}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
