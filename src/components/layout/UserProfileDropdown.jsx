import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, AVATAR_OPTIONS } from '../../contexts/AuthContext';
import { User, LogOut, ChevronDown, Crown, Zap, Settings, Shield, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function UserProfileDropdown() {
  const { userProfile, currentUser, logout, upgradeGuestToGoogle } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const dropdownRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!currentUser || !userProfile) return null;

  const avatar = AVATAR_OPTIONS.find(a => a.id === userProfile.avatar);
  const displayName = userProfile.username || userProfile.displayName || 'Player';
  const isGuest = userProfile.isGuest;

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      await upgradeGuestToGoogle();
    } catch {
      // Error handled in context
    } finally {
      setUpgrading(false);
    }
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-200",
          isOpen
            ? "bg-surfaceActive border border-borderHover"
            : "bg-surface border border-border hover:border-borderHover hover:bg-surfaceHover"
        )}
      >
        {/* Avatar */}
        {avatar ? (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{ backgroundColor: `${avatar.color}15`, border: `1px solid ${avatar.color}25` }}
          >
            {avatar.emoji}
          </div>
        ) : currentUser.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt=""
            className="w-7 h-7 rounded-lg object-cover border border-border"
          />
        ) : (
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="hidden sm:flex flex-col items-start">
          <span className="text-xs font-semibold text-textPrimary leading-tight max-w-[100px] truncate">
            {displayName}
          </span>
          {isGuest && (
            <span className="text-[10px] text-textMuted leading-tight">Guest</span>
          )}
        </div>

        <ChevronDown className={cn(
          "h-3.5 w-3.5 text-textMuted transition-transform duration-200 hidden sm:block",
          isOpen && "rotate-180"
        )} />
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+8px)] w-72 rounded-2xl glass-card border border-border shadow-card-hover overflow-hidden z-50"
          >
            {/* User Info Header */}
            <div className="p-4 border-b border-border bg-surface/50">
              <div className="flex items-center gap-3">
                {avatar ? (
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${avatar.color}15`, border: `1px solid ${avatar.color}25` }}
                  >
                    {avatar.emoji}
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-base font-bold text-primary">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-textPrimary truncate">{displayName}</span>
                    {isGuest && (
                      <span className="badge text-[9px] py-0.5 px-1.5 bg-secondary/15 text-secondary border border-secondary/20">
                        Guest
                      </span>
                    )}
                  </div>
                  {userProfile.email && (
                    <p className="text-[11px] text-textMuted truncate">{userProfile.email}</p>
                  )}
                  {avatar && (
                    <p className="text-[11px] text-textMuted">{avatar.label}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Strip */}
            <div className="grid grid-cols-3 gap-px bg-border">
              <div className="bg-backgroundAlt p-3 text-center">
                <div className="text-xs font-bold text-textPrimary font-mono tabular-nums">
                  {(userProfile.totalIQ || 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-textMuted uppercase tracking-wider mt-0.5">IQ</div>
              </div>
              <div className="bg-backgroundAlt p-3 text-center">
                <div className="text-xs font-bold text-textPrimary font-mono tabular-nums">
                  {userProfile.globalRank ? `#${userProfile.globalRank}` : '—'}
                </div>
                <div className="text-[10px] text-textMuted uppercase tracking-wider mt-0.5">Rank</div>
              </div>
              <div className="bg-backgroundAlt p-3 text-center">
                <div className="text-xs font-bold text-textPrimary font-mono tabular-nums">
                  {userProfile.matchesPlayed || 0}
                </div>
                <div className="text-[10px] text-textMuted uppercase tracking-wider mt-0.5">Played</div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              {/* Upgrade CTA for Guests */}
              {isGuest && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/15 text-primary text-sm font-medium hover:bg-primary/15 transition-colors mb-1 disabled:opacity-50"
                >
                  <Shield className="h-4 w-4" />
                  <div className="flex-1 text-left">
                    <div className="text-xs font-semibold">Link Google Account</div>
                    <div className="text-[10px] text-primary/60">Save your progress forever</div>
                  </div>
                </motion.button>
              )}

              {/* Sign Out */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-textMuted hover:text-danger hover:bg-danger/5 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
