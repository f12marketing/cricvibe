import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Zap, Target, ArrowRight, Activity, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import CricketField from '../components/CricketField';
import VerdictOverlay from '../components/VerdictOverlay';
import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';
import { useMatchStore } from '../store/useMatchStore';
import { pageVariants, itemVariants, heartbeatVariants, pulseGlowVariants } from '../lib/animations';

const MOCK_BOWLERS = [
  { id: 'b1', name: 'Jasprit Bumrah', type: 'Pacer', economy: '6.2' },
  { id: 'b2', name: 'Rashid Khan', type: 'Spinner', economy: '5.8' },
  { id: 'b3', name: 'Trent Boult', type: 'Pacer', economy: '7.1' },
  { id: 'b4', name: 'Sunil Narine', type: 'Spinner', economy: '6.0' }
];

export default function TacticalSimulator() {
  const { currentUser } = useAuth();
  const { startAmbience, stopAmbience, playTick, playClick } = useAudio();
  
  const { 
    matchState, isDecisionWindow, decisionTimeLeft, showVerdict, actualMove,
    locked, selectedBowler, placedFielders, scoringResult,
    setPlacedFielders, setSelectedBowler, lockDecision, clearScoringResult
  } = useMatchStore();

  // Derived state
  let confidence = 10;
  if (selectedBowler) confidence += 30;
  confidence += (placedFielders.length * 20);

  // Handle Ambience
  useEffect(() => {
    startAmbience();
    return () => {
      stopAmbience();
    };
  }, [startAmbience, stopAmbience]);

  // Handle Ticking sound when time is running out
  useEffect(() => {
    if (isDecisionWindow && !locked && decisionTimeLeft > 0 && decisionTimeLeft <= 10) {
      playTick();
    }
  }, [decisionTimeLeft, isDecisionWindow, locked, playTick]);

  const handleLock = () => {
    if (!selectedBowler || placedFielders.length !== 3) return;
    playClick();
    lockDecision();
  };

  const timerProgress = decisionTimeLeft / 15;
  const strokeDash = 2 * Math.PI * 42;

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-6xl mx-auto flex flex-col h-full gap-3 sm:gap-5 pb-4 lg:pb-0"
    >
      
      {/* ─── Match Context Dashboard ─── */}
      <motion.section variants={itemVariants} className="glass-card p-3 sm:p-4 md:p-5 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 items-center border-t-2 border-t-primary/30">
        {/* Score Block */}
        <div className="col-span-2 flex justify-between items-center bg-backgroundAlt p-3 sm:p-4 rounded-xl border border-border">
          <div>
            <div className="badge-live text-[10px] mb-2">
              <Activity className="h-2.5 w-2.5" /> Over {matchState?.over || '0.0'}
            </div>
            <div className="stat-value text-textPrimary">
              {matchState?.score || '0'}
              <span className="text-textMuted text-xl">/{matchState?.wickets || '0'}</span>
            </div>
            <div className="text-xs text-textMuted mt-0.5">Target: {matchState?.target || '-'}</div>
          </div>
          <div className="text-right">
            <div className="stat-label mb-1">Req. Rate</div>
            <div className="stat-value text-secondary">{matchState?.reqRate || '-'}</div>
          </div>
        </div>

        {/* Batter/Bowler Info */}
        <div className="bg-backgroundAlt p-3 sm:p-4 rounded-xl border border-border flex flex-col justify-center gap-2 sm:gap-3">
          <div className="flex justify-between items-center">
            <span className="stat-label">Batter</span>
            <span className="text-sm font-semibold text-textPrimary">{matchState?.batter || '-'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="stat-label">Bowler</span>
            <span className="text-sm font-semibold text-textPrimary">{matchState?.bowler || '-'}</span>
          </div>
        </div>

        {/* Pressure Index */}
        <div className="bg-backgroundAlt p-3 sm:p-4 rounded-xl border border-border">
          <div className="stat-label mb-2">Pressure Index</div>
          <div className="h-2.5 bg-surface rounded-full overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${matchState?.pressure || 50}%` }}
              className="h-full bg-gradient-to-r from-primary via-secondary to-danger rounded-full"
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[9px] text-textMuted uppercase font-semibold tracking-wider">
            <span>Bowling</span>
            <span className="text-danger">Batting</span>
          </div>
        </div>
      </motion.section>

      {/* ─── Commentary ─── */}
      <motion.div variants={itemVariants} className="glass-card p-2.5 sm:p-3 px-3 sm:px-5 text-center text-xs sm:text-sm text-textSecondary border-l-2 border-l-accent/50">
         {matchState?.commentary || 'Match starting soon...'}
      </motion.div>

      {/* ─── Main Grid ─── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 flex-1">
        
        {/* Cricket Field */}
        <div className="lg:col-span-7 glass-card p-3 sm:p-4 relative flex flex-col items-center justify-center min-h-[340px] sm:min-h-[420px] lg:min-h-[480px]">
          <h3 className="absolute top-4 left-4 text-xs font-semibold uppercase tracking-widest text-textMuted flex items-center gap-2 z-10">
            <Target className="h-3.5 w-3.5 text-primary" /> Field Deployment ({placedFielders.length}/3)
          </h3>
          <CricketField 
            placedFielders={placedFielders} 
            setPlacedFielders={setPlacedFielders}
            locked={locked}
          />
        </div>

        {/* Controls */}
        <div className="lg:col-span-5 flex flex-col gap-3 sm:gap-5">
          
          {/* Bowler Selection */}
          <div className="glass-card p-3 sm:p-5 flex-1">
            <h3 className="stat-label mb-4 flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-secondary" /> Next Bowler
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              {MOCK_BOWLERS.map((bowler) => (
                <button
                  key={bowler.id}
                  disabled={locked}
                  onClick={() => setSelectedBowler(bowler.id)}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all duration-200 relative overflow-hidden group",
                    selectedBowler === bowler.id 
                      ? "border-secondary/40 bg-secondary/[0.06] shadow-glow-secondary" 
                      : "border-border hover:border-borderHover bg-backgroundAlt",
                    locked && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {selectedBowler === bowler.id && (
                    <motion.div layoutId="bowlerHighlight" className="absolute inset-0 border-2 border-secondary/30 rounded-xl" />
                  )}
                  <div className="font-display font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 relative z-10 text-textPrimary">{bowler.name}</div>
                  <div className="flex justify-between text-[10px] sm:text-[11px] text-textMuted relative z-10">
                    <span>{bowler.type}</span>
                    <span className="font-mono">Econ: {bowler.economy}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Center */}
          <div className="glass-card p-3 sm:p-5 border-t-2 border-t-primary/20 flex flex-col items-center justify-center relative overflow-hidden">
            
            <div className="relative z-10 flex flex-col items-center w-full">
              {/* Timer Ring */}
              <div className="relative flex items-center justify-center mb-3 sm:mb-5">
                <svg className="w-16 h-16 sm:w-20 sm:h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-surface" />
                  <motion.circle 
                    cx="40" cy="40" r="36" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    fill="transparent" 
                    className={cn(decisionTimeLeft <= 5 ? "text-danger" : "text-primary")}
                    strokeDasharray={2 * Math.PI * 36}
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: (2 * Math.PI * 36) * (1 - decisionTimeLeft / 15) }}
                    transition={{ duration: 1, ease: "linear" }}
                    strokeLinecap="round"
                  />
                </svg>
                <motion.div 
                  variants={heartbeatVariants}
                  animate={decisionTimeLeft <= 5 ? "critical" : "animate"}
                  className={cn(
                    "absolute text-xl sm:text-2xl font-mono font-bold tabular-nums",
                    decisionTimeLeft <= 5 ? "text-danger" : "text-textPrimary"
                  )}
                >
                  {isDecisionWindow ? decisionTimeLeft : "0"}
                </motion.div>
              </div>

              {/* Lock Button */}
              <motion.button
                variants={(!locked && selectedBowler && placedFielders.length === 3) ? pulseGlowVariants : null}
                animate={(!locked && selectedBowler && placedFielders.length === 3) ? "animate" : "initial"}
                onClick={handleLock}
                disabled={locked || !selectedBowler || placedFielders.length !== 3}
                className={cn(
                  "w-full btn-primary py-3.5 text-sm tracking-widest",
                  (locked || !selectedBowler || placedFielders.length !== 3) && "opacity-40 cursor-not-allowed"
                )}
              >
                {locked ? "DECISION LOCKED" : "LOCK DECISION"}
              </motion.button>

              {/* Confidence Meter */}
              <div className="w-full mt-5">
                <div className="flex justify-between text-[10px] text-textMuted uppercase tracking-widest mb-2 font-semibold">
                  <span>Tactical Confidence</span>
                  <span className="text-primary font-mono">{confidence}%</span>
                </div>
                <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                    animate={{ width: `${confidence}%` }}
                    transition={{ type: "spring", bounce: 0.4 }}
                  />
                </div>
              </div>
              
              {/* Hint */}
              <AnimatePresence>
                {!locked && (!selectedBowler || placedFielders.length !== 3) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 text-xs text-secondary text-center mt-4 bg-secondary/[0.06] py-2 px-4 rounded-lg w-full border border-secondary/10"
                  >
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {!selectedBowler ? "Select a bowler." : `Place ${3 - placedFielders.length} more impact fielders.`}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Verdict Overlay */}
              <AnimatePresence>
                {scoringResult && (
                  <VerdictOverlay 
                    scoringResult={scoringResult}
                    userDecision={{
                      bowler: MOCK_BOWLERS.find(b => b.id === selectedBowler)?.name || 'None',
                      field: placedFielders
                    }}
                    actualDecision={{
                      bowler: MOCK_BOWLERS.find(b => b.id === actualMove?.bowler)?.name || 'Unknown',
                      field: actualMove?.field || []
                    }}
                    onContinue={clearScoringResult}
                  />
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
