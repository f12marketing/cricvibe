/**
 * CricVibe Unified Animation System
 * Highly optimized Framer Motion variants for consistent GPU-accelerated performance.
 */

// 1. Page Transitions (Used in Routes/Pages)
export const pageVariants = {
  initial: { opacity: 0, y: 15, scale: 0.98 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { type: "spring", stiffness: 300, damping: 30, staggerChildren: 0.1 } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    transition: { duration: 0.2, ease: "easeInOut" } 
  }
};

// 2. Child Stagger Items (For lists, dashboards)
export const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 25 } }
};

// 3. Neon Glow Pulses (For critical state: countdowns, live alerts)
export const pulseGlowVariants = {
  animate: {
    boxShadow: [
      "0px 0px 0px rgba(0, 230, 118, 0)",
      "0px 0px 30px rgba(0, 230, 118, 0.4)",
      "0px 0px 0px rgba(0, 230, 118, 0)"
    ],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
  },
  danger: {
    boxShadow: [
      "0px 0px 0px rgba(255, 59, 48, 0)",
      "0px 0px 40px rgba(255, 59, 48, 0.6)",
      "0px 0px 0px rgba(255, 59, 48, 0)"
    ],
    transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
  }
};

// 4. Tactical Score Reveals (Pop and settle)
export const scoreRevealVariants = {
  initial: { scale: 0, opacity: 0, rotate: -15 },
  animate: { 
    scale: 1, 
    opacity: 1, 
    rotate: 0,
    transition: { type: "spring", stiffness: 400, damping: 15, delay: 0.2 } 
  }
};

// 5. Countdown Urgency (Heartbeat scaling)
export const heartbeatVariants = {
  animate: {
    scale: [1, 1.15, 1],
    color: ["#ffffff", "#ff3b30", "#ffffff"],
    transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
  },
  critical: {
    scale: [1, 1.3, 1],
    color: ["#ff3b30", "#ff0000", "#ff3b30"],
    transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
  }
};

// 6. Leaderboard Row Movement (Smooth layout transitions via layout prop)
// Used directly via framer-motion `layout` prop, but we provide enter/exit here
export const leaderboardRowVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

// 7. Modal / Overlay Transitions (Verdict screens, Share overlays)
export const modalVariants = {
  initial: { opacity: 0, backdropFilter: "blur(0px)" },
  animate: { 
    opacity: 1, 
    backdropFilter: "blur(24px)",
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    backdropFilter: "blur(0px)",
    transition: { duration: 0.2 }
  }
};

export const modalContentVariants = {
  initial: { scale: 0.8, opacity: 0, y: 40 },
  animate: { 
    scale: 1, 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 25, delay: 0.1 } 
  },
  exit: { 
    scale: 0.9, 
    opacity: 0, 
    transition: { duration: 0.2 } 
  }
};
