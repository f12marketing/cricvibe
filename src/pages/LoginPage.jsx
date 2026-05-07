import React, { useState, useMemo } from 'react';
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

  // Pre-calculate random positions for particles to satisfy React purity rules
  const particles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage based for responsiveness
      y: Math.random() * 100,
      targetY: -100 - Math.random() * 200,
      duration: 6 + Math.random() * 8,
      delay: Math.random() * 4
    }));
  }, []);

  const handleGoogleLogin = async () => {
    setLoadingType('google');
    try {
      await loginWithGoogle();
    } catch {
      // Error handled by AuthContext
    } finally {
      setLoadingType(null);
    }
  };

  const handleGuestLogin = async () => {
    setLoadingType('guest');
    try {
      await loginAsGuest();
    } catch {
      // Error handled by AuthContext
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center overflow-hidden">
      {/* ── Ambient Background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glow Effects */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.08, 0.04] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[10%] w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] rounded-full bg-primary blur-[100px] sm:blur-[180px]"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-20%] right-[5%] w-[250px] h-[250px] sm:w-[500px] sm:h-[500px] rounded-full bg-accent blur-[80px] sm:blur-[160px]"
        />

        {/* Particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            animate={{ y: [0, p.targetY], opacity: [0, 0.6, 0] }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* ── Main Content ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <Activity className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display font-bold text-5xl tracking-tight text-textPrimary mb-2">
            Cric<span className="text-primary">Vibe</span>
          </h1>
          <p className="text-textSecondary text-sm font-light uppercase tracking-widest">The Tactical Edge</p>
        </div>

        <div className="glass-card p-8">
          <h2 className="font-display font-bold text-lg mb-1">Welcome, Captain</h2>
          <p className="text-textMuted text-sm mb-8">Sign in to prove your tactical genius</p>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs mb-4"
              >
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleGoogleLogin}
            disabled={authLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-white text-gray-900 font-bold text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 mb-3"
          >
            {loadingType === 'google' ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : "Continue with Google"}
          </button>

          <div className="flex items-center gap-4 my-6 opacity-30">
            <div className="flex-1 h-[1px] bg-white" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-white">OR</span>
            <div className="flex-1 h-[1px] bg-white" />
          </div>

          <button
            onClick={handleGuestLogin}
            disabled={authLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-border bg-surface text-textPrimary font-bold text-sm hover:bg-surfaceHover transition-colors disabled:opacity-50"
          >
            {loadingType === 'guest' ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              <>
                <Users className="h-4 w-4" />
                Play as Guest
                <ChevronRight className="h-4 w-4 ml-auto opacity-40" />
              </>
            )}
          </button>
        </div>

        <div className="mt-8 flex flex-col gap-2.5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-3 text-xs text-textSecondary"
            >
              <div className="w-5 h-5 rounded bg-surface border border-border flex items-center justify-center">
                <f.icon className={`h-3 w-3 ${f.color}`} />
              </div>
              {f.text}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
