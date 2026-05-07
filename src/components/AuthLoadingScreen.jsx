import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Loader2 } from 'lucide-react';

/**
 * Full-screen loading splash shown while Firebase Auth initializes.
 * Matches the premium CricVibe aesthetic.
 */
export default function AuthLoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[200]">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Logo */}
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center shadow-glow-sm">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <span className="font-display font-bold text-4xl tracking-tight text-textPrimary">
            Cric<span className="text-primary">Vibe</span>
          </span>
        </motion.div>

        {/* Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-5 w-5 text-primary/60" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-textMuted text-xs uppercase tracking-widest font-medium"
        >
          Initializing...
        </motion.p>
      </motion.div>
    </div>
  );
}
