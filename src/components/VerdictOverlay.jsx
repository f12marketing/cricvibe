import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, ArrowRight, Zap, Target, XCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAudio } from '../contexts/AudioContext';
import ShareOverlay from './ShareOverlay';
import { modalVariants, modalContentVariants, scoreRevealVariants } from '../lib/animations';

const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <>{count}</>;
};

export default function VerdictOverlay({ scoringResult, userDecision, actualDecision, onContinue }) {
  const { playVictory, playRoar } = useAudio();
  const [showShare, setShowShare] = useState(false);
  
  const isHighScoring = scoringResult.merit_score >= 80;
  const isMatch = scoringResult.captain_match;

  useEffect(() => {
    if (isHighScoring && isMatch) {
      playRoar();
      setTimeout(playVictory, 500); // Stagger the victory chime slightly after the roar begins
    } else if (isHighScoring) {
      playVictory();
    } else if (isMatch) {
      playVictory();
    }
  }, [isHighScoring, isMatch, playRoar, playVictory]);

  const accentColor = isHighScoring ? 'primary' : 'danger';

  return (
    <motion.div 
      variants={modalVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-8 bg-background/90 backdrop-blur-2xl overflow-y-auto"
    >
      {/* Ambient Glow */}
      <div className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[200px] pointer-events-none",
        isHighScoring ? "bg-primary/10" : "bg-danger/10"
      )} />

      <motion.div 
        variants={modalContentVariants}
        className="relative w-full max-w-3xl glass-card overflow-hidden my-auto"
      >
        {/* Header Strip */}
        <div className={cn(
          "py-3 px-6 text-center text-xs font-semibold uppercase tracking-widest border-b",
          isHighScoring 
            ? "bg-primary/10 text-primary border-primary/20" 
            : "bg-danger/10 text-danger border-danger/20"
        )}>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Tactical Analysis Complete
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8">
          
          {/* Score Circle */}
          <div className="flex flex-col items-center justify-center mb-5 sm:mb-8 text-center">
            <motion.div 
              variants={scoreRevealVariants}
              className={cn(
                "w-20 h-20 sm:w-28 sm:h-28 rounded-full border-2 flex flex-col items-center justify-center mb-3 sm:mb-5 relative",
                isHighScoring 
                  ? "border-primary/40 shadow-glow-md" 
                  : "border-danger/40 shadow-glow-danger"
              )}
            >
              <span className="stat-label mb-1">Merit</span>
              <div className={cn(
                "text-2xl sm:text-4xl font-display font-bold tabular-nums leading-none",
                isHighScoring ? "text-primary" : "text-danger"
              )}>
                <AnimatedCounter value={scoringResult.merit_score || 0} />
              </div>
            </motion.div>

            <div className="flex items-center gap-2 text-base sm:text-xl font-display font-bold">
              IQ Earned: 
              <span className={cn(
                "tabular-nums",
                isHighScoring ? "neon-text" : "text-danger"
              )}>
                +<AnimatedCounter value={scoringResult.iqEarned || 0} />
              </span>
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-backgroundAlt border border-border rounded-xl p-3 sm:p-5 relative">
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-backgroundAlt px-3 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest text-textMuted border border-border">
                Your Call
              </div>
              <div className="text-center mt-1 space-y-1.5">
                <div className="text-lg font-display font-bold text-textPrimary">{userDecision?.bowler || 'Unknown'}</div>
                <div className="text-xs text-textMuted">Field: {userDecision?.field?.join(', ') || 'Standard'}</div>
              </div>
            </div>

            <div className="bg-backgroundAlt border border-border rounded-xl p-3 sm:p-5 relative">
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-backgroundAlt px-3 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest text-textMuted border border-border">
                Captain's Call
              </div>
              <div className="text-center mt-1 space-y-1.5">
                <div className="text-lg font-display font-bold text-textPrimary flex items-center justify-center gap-2">
                  {actualDecision?.bowler || 'Unknown'}
                  {isMatch 
                    ? <CheckCircle2 className="h-5 w-5 text-primary" /> 
                    : <XCircle className="h-5 w-5 text-danger" />
                  }
                </div>
                <div className="text-xs text-textMuted">Field: {actualDecision?.field?.join(', ') || 'Standard'}</div>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          <div className={cn(
            "rounded-xl p-3 sm:p-5 mb-4 sm:mb-6 border-l-2 relative overflow-hidden",
            "bg-accent/5 border-l-accent"
          )}>
            <Zap className="absolute right-[-15px] bottom-[-15px] h-24 w-24 text-accent/5" />
            <div className="flex items-center gap-2 text-[10px] text-accent font-semibold uppercase tracking-widest mb-2">
              <Target className="h-3.5 w-3.5" /> Gemini AI Reasoning
            </div>
            {scoringResult.isLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-full" />
                <div className="h-4 bg-white/10 rounded w-4/5" />
                <p className="text-xs text-accent/60 mt-2 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
                  Gemini AI is analysing your tactics...
                </p>
              </div>
            ) : (
              <p className="text-sm sm:text-base md:text-lg font-light italic text-textSecondary leading-relaxed relative z-10">
                "{scoringResult.reasoning || scoringResult.aiFeedback}"
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => setShowShare(true)}
              className="btn-outline py-2.5 px-6 flex items-center justify-center gap-2 group text-xs"
            >
              <Share2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
              Share Scorecard
            </button>
            <button 
              onClick={onContinue}
              className="btn-primary py-2.5 px-6 flex items-center justify-center gap-2 group text-xs"
            >
              Continue
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

        </div>
      </motion.div>

      <AnimatePresence>
        {showShare && (
          <ShareOverlay 
            scoringResult={scoringResult}
            userDecision={userDecision}
            actualDecision={actualDecision}
            onClose={() => setShowShare(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
