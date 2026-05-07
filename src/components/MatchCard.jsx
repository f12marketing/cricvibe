import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { Play, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MatchCard({ match, isLive }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "glass-card-hover p-3.5 sm:p-5 relative overflow-hidden group",
        isLive && "border-l-2 border-l-danger"
      )}
    >
      {/* Hover Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
      
      <div className="relative z-10">
        {/* Header Row */}
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <div className="text-xs font-medium text-textMuted tracking-wide">
            {match.tournament} <span className="text-textMuted/50 mx-1">•</span> {match.venue}
          </div>
          {isLive ? (
            <div className="badge-live">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-danger" />
              </span>
              Live
            </div>
          ) : (
            <div className="badge-accent">Upcoming</div>
          )}
        </div>

        {/* Teams */}
        <div className="space-y-2.5 sm:space-y-3 mb-3.5 sm:mb-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-surfaceHover flex items-center justify-center overflow-hidden border border-border">
                <img src={match.team1Logo} alt={match.team1} className="w-6 h-6 object-contain" />
              </div>
              <span className="font-display font-semibold text-sm sm:text-base text-textPrimary">{match.team1}</span>
            </div>
            {isLive && (
              <span className="font-mono font-bold tabular-nums text-base sm:text-lg text-textPrimary">{match.score1}</span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-surfaceHover flex items-center justify-center overflow-hidden border border-border">
                <img src={match.team2Logo} alt={match.team2} className="w-6 h-6 object-contain" />
              </div>
              <span className="font-display font-semibold text-sm sm:text-base text-textPrimary">{match.team2}</span>
            </div>
            {isLive && (
              <span className="font-mono font-bold tabular-nums text-base sm:text-lg text-textSecondary">{match.score2}</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-[11px] sm:text-xs text-textMuted font-medium max-w-[160px] sm:max-w-[200px] truncate">
            {match.statusText}
          </p>
          {isLive && (
            <Link to="/simulator" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primaryDim transition-colors uppercase tracking-wider">
              <Play className="h-3.5 w-3.5" fill="currentColor" />
              Join
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
