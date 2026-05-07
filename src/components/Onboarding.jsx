import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Shield } from 'lucide-react';

const LOADING_STEPS = [
  { text: 'Loading Stadium Assets...', icon: Shield },
  { text: 'Initializing AI Engine...', icon: Zap },
  { text: 'Connecting to Hotseat...', icon: Activity },
];

export default function Onboarding({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        const next = p + Math.floor(Math.random() * 12) + 4;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 600);
          return 100;
        }
        return next;
      });
    }, 200);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    if (progress < 35) setStepIndex(0);
    else if (progress < 70) setStepIndex(1);
    else setStepIndex(2);
  }, [progress]);

  const CurrentIcon = LOADING_STEPS[stepIndex].icon;

  return (
    <motion.div 
      key="onboarding"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(15px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.06] blur-[150px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Logo */}
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center gap-4 mb-16"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center shadow-glow-sm">
            <Activity className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display font-bold text-5xl md:text-6xl tracking-tight text-textPrimary">
            Cric<span className="text-primary">Vibe</span>
          </h1>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-72 h-1.5 bg-surfaceHover rounded-full overflow-hidden mb-6 relative">
          <motion.div 
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ ease: "easeOut", duration: 0.3 }}
          />
        </div>
        
        {/* Step Indicator */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 text-textMuted text-xs font-medium uppercase tracking-widest"
          >
            <CurrentIcon className="h-3.5 w-3.5 text-primary animate-pulse" />
            {LOADING_STEPS[stepIndex].text}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
