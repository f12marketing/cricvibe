import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAudio } from '../../contexts/AudioContext';
import { motion } from 'framer-motion';
import { Activity, Trophy, Crosshair, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../../lib/utils';
import UserProfileDropdown from './UserProfileDropdown';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', icon: Activity },
  { to: '/simulator', label: 'Simulator', icon: Crosshair },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

export default function Navbar() {
  const { currentUser } = useAuth();
  const { isMuted, toggleMute } = useAudio();
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-textPrimary">
              Cric<span className="text-primary">Vibe</span>
            </span>
          </Link>
          
          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-textSecondary hover:text-textPrimary hover:bg-surfaceHover"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              className="p-2 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-surfaceHover transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label={isMuted ? "Unmute sound" : "Mute sound"}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>

            {/* User Profile Dropdown — visible on all sizes */}
            {currentUser && (
              <UserProfileDropdown />
            )}
          </div>
        </div>
      </div>

    </nav>
  );
}
