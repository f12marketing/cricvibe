import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Loader2, AlertCircle, Sparkles, ArrowLeft, Zap } from 'lucide-react';
import { useAuth, AVATAR_OPTIONS } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

const STEPS = ['username', 'avatar'];

export default function OnboardingFlow() {
  const { userProfile, completeOnboarding, authLoading, error } = useAuth();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState(userProfile?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (step === 0 && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step]);

  const validateUsername = (name) => {
    if (!name.trim()) return 'Username is required';
    if (name.trim().length < 3) return 'At least 3 characters';
    if (name.trim().length > 20) return 'Max 20 characters';
    if (!/^[a-zA-Z0-9_.\- ]+$/.test(name.trim())) return 'Letters, numbers, spaces, and _.- only';
    return '';
  };

  const handleUsernameNext = () => {
    const err = validateUsername(username);
    if (err) {
      setUsernameError(err);
      return;
    }
    setUsernameError('');
    setStep(1);
  };

  const handleComplete = async () => {
    if (!selectedAvatar) return;
    await completeOnboarding(username, selectedAvatar);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleUsernameNext();
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-[100] flex items-center justify-center overflow-hidden">

      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.07, 0.04] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-15%] left-[20%] w-[500px] h-[500px] rounded-full bg-primary blur-[160px]"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.03, 0.05, 0.03] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-accent blur-[140px]"
        />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-lg mx-4"
      >
        {/* Step Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {STEPS.map((s, idx) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  idx < step ? "bg-primary text-background" :
                  idx === step ? "bg-primary/20 text-primary border border-primary/30" :
                  "bg-surface text-textMuted border border-border"
                )}>
                  {idx < step ? <Check className="h-4 w-4" /> : idx + 1}
                </div>
                <span className={cn(
                  "text-xs font-medium uppercase tracking-wider hidden sm:block",
                  idx <= step ? "text-textSecondary" : "text-textMuted"
                )}>
                  {s === 'username' ? 'Identity' : 'Avatar'}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={cn(
                  "w-12 h-px transition-colors duration-300",
                  idx < step ? "bg-primary/40" : "bg-border"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="glass-card p-8 relative overflow-hidden">
          {/* Top glow bar */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <AnimatePresence mode="wait">
            {/* ── STEP 1: Username ── */}
            {step === 0 && (
              <motion.div
                key="username-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="font-display font-bold text-xl text-textPrimary">Choose Your Identity</h2>
                </div>
                <p className="text-textMuted text-sm mb-8">This is how other captains will know you on the leaderboard.</p>

                {/* Username Input */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-textMuted mb-2">
                    Captain Name
                  </label>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (usernameError) setUsernameError('');
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="e.g. Virat_King"
                      maxLength={20}
                      className={cn(
                        "w-full bg-backgroundAlt border rounded-xl px-4 py-3.5 text-textPrimary text-sm font-medium placeholder:text-textMuted/50 focus:outline-none transition-all duration-200",
                        usernameError
                          ? "border-danger/40 focus:border-danger/60 focus:ring-1 focus:ring-danger/20"
                          : "border-border focus:border-primary/40 focus:ring-1 focus:ring-primary/15"
                      )}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted text-xs font-mono">
                      {username.length}/20
                    </span>
                  </div>

                  <AnimatePresence>
                    {usernameError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-1.5 mt-2 text-danger text-xs"
                      >
                        <AlertCircle className="h-3 w-3" />
                        {usernameError}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUsernameNext}
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
                >
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </motion.div>
            )}

            {/* ── STEP 2: Avatar ── */}
            {step === 1 && (
              <motion.div
                key="avatar-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => setStep(0)}
                  className="flex items-center gap-1.5 text-textMuted hover:text-textSecondary text-xs font-medium mb-4 transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="h-5 w-5 text-secondary" />
                  <h2 className="font-display font-bold text-xl text-textPrimary">Pick Your Style</h2>
                </div>
                <p className="text-textMuted text-sm mb-6">Your avatar reflects your tactical personality.</p>

                {/* Avatar Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-6 sm:mb-8">
                  {AVATAR_OPTIONS.map((avatar) => {
                    const isSelected = selectedAvatar === avatar.id;
                    return (
                      <motion.button
                        key={avatar.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedAvatar(avatar.id)}
                        className={cn(
                          "relative flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200",
                          isSelected
                            ? "bg-surface border-primary/40 shadow-glow-sm"
                            : "bg-backgroundAlt border-border hover:border-borderHover hover:bg-surfaceHover"
                        )}
                      >
                        {/* Selection indicator */}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                          >
                            <Check className="h-3 w-3 text-background" />
                          </motion.div>
                        )}

                        <div
                          className="text-3xl leading-none"
                          style={{ filter: isSelected ? 'none' : 'grayscale(0.3)' }}
                        >
                          {avatar.emoji}
                        </div>
                        <span className={cn(
                          "text-[11px] font-semibold tracking-wide transition-colors",
                          isSelected ? "text-textPrimary" : "text-textMuted"
                        )}>
                          {avatar.label}
                        </span>

                        {/* Color dot */}
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: avatar.color, opacity: isSelected ? 1 : 0.4 }}
                        />
                      </motion.button>
                    );
                  })}
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm mb-4"
                    >
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleComplete}
                  disabled={!selectedAvatar || authLoading}
                  className={cn(
                    "w-full py-3.5 rounded-xl font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200",
                    selectedAvatar
                      ? "btn-primary"
                      : "bg-surface border border-border text-textMuted cursor-not-allowed"
                  )}
                >
                  {authLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Enter the Arena
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Username Preview */}
        {step === 1 && username && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mt-5 text-textMuted text-xs"
          >
            Signing in as <span className="text-primary font-semibold">{username}</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
