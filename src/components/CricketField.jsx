import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { cn } from '../lib/utils';
import { User, Shield } from 'lucide-react';

const ZONES = [
  { id: 'slip', label: 'Slip', x: 120, y: 120 },
  { id: 'point', label: 'Point', x: 50, y: 160 },
  { id: 'cover', label: 'Cover', x: 80, y: 240 },
  { id: 'long-on', label: 'Long-on', x: 200, y: 350 },
  { id: 'deep-midwicket', label: 'Deep Midwk', x: 260, y: 220 },
  { id: 'fine-leg', label: 'Fine Leg', x: 250, y: 80 },
];

const FIELDERS = [
  { id: 'f1', initialX: 50, initialY: 440 },
  { id: 'f2', initialX: 150, initialY: 440 },
  { id: 'f3', initialX: 250, initialY: 440 },
];

export default function CricketField({ placedFielders, setPlacedFielders, locked }) {
  const containerRef = useRef(null);
  
  const [positions, setPositions] = useState(() => {
    const init = {};
    FIELDERS.forEach(f => {
      init[f.id] = { x: f.initialX, y: f.initialY, zoneId: null };
    });
    return init;
  });
  const [activeFielder, setActiveFielder] = useState(null);

  const handleDragEnd = (event, info, fielderId) => {
    if (locked) return;
    if (!containerRef.current) return;
    const bounds = containerRef.current.getBoundingClientRect();
    
    const clientX = info.point.x;
    const clientY = info.point.y;

    const dropX = clientX - bounds.left;
    const dropY = clientY - bounds.top;

    // Relative coordinates in the 300x400 field
    const relX = (dropX / bounds.width) * 300;
    const relY = (dropY / (bounds.height * 0.83)) * 400;

    let closestZone = null;
    let minDistance = 40; // Relative distance tolerance

    ZONES.forEach(zone => {
      const dx = relX - zone.x;
      const dy = relY - zone.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDistance) {
        minDistance = dist;
        closestZone = zone;
      }
    });

    const isZoneOccupied = closestZone && Object.values(positions).some(p => p.zoneId === closestZone.id && p !== positions[fielderId]);

    setPositions(prev => {
      const newPos = { ...prev };
      if (closestZone && !isZoneOccupied) {
        newPos[fielderId] = { x: closestZone.x, y: closestZone.y, zoneId: closestZone.id };
      } else {
        const f = FIELDERS.find(f => f.id === fielderId);
        newPos[fielderId] = { x: f.initialX, y: f.initialY, zoneId: null };
      }
      return newPos;
    });
  };

  const handleZoneClick = (zoneId) => {
    if (locked || !activeFielder) return;
    
    setPositions(prev => ({
      ...prev,
      [activeFielder]: { zoneId }
    }));
    setActiveFielder(null);
  };

  const handleFielderClick = (fielderId) => {
    if (locked) return;
    setActiveFielder(activeFielder === fielderId ? null : fielderId);
  };

  useEffect(() => {
    const activePlacements = Object.values(positions).filter(p => p.zoneId !== null).map(p => p.zoneId);
    setPlacedFielders(activePlacements);
  }, [positions, setPlacedFielders]);

  return (
    <div className="w-full max-w-xs sm:max-w-sm flex-1 flex flex-col items-center">
      <div 
        ref={containerRef}
        className="w-full relative touch-none select-none"
        style={{ aspectRatio: '3/4.8' }}
      >
        {/* SVG Field */}
        <div className="absolute top-0 left-0 w-full h-[83%] border border-border rounded-full overflow-hidden bg-[#1a3518]/40 shadow-inner">
          <svg viewBox="0 0 300 400" className="w-full h-full opacity-70">
            <ellipse cx="150" cy="200" rx="140" ry="190" fill="#1e4a1b" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />
            <ellipse cx="150" cy="200" rx="80" ry="100" fill="#245a20" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <rect x="135" y="160" width="30" height="80" fill="#c4a86e" rx="2" />
            <line x1="130" y1="165" x2="170" y2="165" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
            <line x1="130" y1="235" x2="170" y2="235" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
            <circle cx="150" cy="162" r="1.5" fill="rgba(255,255,255,0.8)" />
            <circle cx="150" cy="238" r="1.5" fill="rgba(255,255,255,0.8)" />
          </svg>
        </div>

        {/* Drop Zones */}
        {ZONES.map(zone => (
          <div 
            key={zone.id}
            onClick={() => handleZoneClick(zone.id)}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center cursor-pointer pointer-events-auto"
            style={{ 
              left: `${(zone.x / 300) * 100}%`, 
              top: `${(zone.y / 400) * 83}%`,
              width: '80px',
              height: '80px'
            }}
          >
            <div className={cn(
              "w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-dashed transition-all duration-300 flex items-center justify-center backdrop-blur-sm",
              Object.values(positions).some(p => p.zoneId === zone.id) 
                ? "border-primary/60 bg-primary/10 text-primary" 
                : activeFielder 
                  ? "border-primary/40 bg-primary/5 text-primary/40 animate-pulse"
                  : "border-white/15 bg-black/20 text-white/20"
            )}>
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 opacity-50" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-semibold uppercase mt-0.5 sm:mt-1 px-1 sm:px-1.5 py-0.5 bg-backgroundAlt/80 rounded text-textMuted tracking-wide whitespace-nowrap">
              {zone.label}
            </span>
          </div>
        ))}

        {/* Bench Area */}
        <div className="absolute bottom-0 left-0 w-full h-[17%] bg-backgroundAlt/60 border-t border-border rounded-b-xl flex flex-col items-center justify-center backdrop-blur-sm">
           <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-textMuted mb-1.5 sm:mb-2 font-semibold">Impact Bench</span>
           <div className="flex gap-6 sm:gap-10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-border/50" />
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-border/50" />
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-border/50" />
           </div>
        </div>

        {/* Draggable Fielders */}
        {FIELDERS.map(fielder => (
          <motion.div
            key={fielder.id}
            whileTap={{ scale: 0.9 }}
            drag={!locked}
            dragMomentum={false}
            dragElastic={0.1}
            onDragEnd={(e, info) => handleDragEnd(e, info, fielder.id)}
            onClick={() => handleFielderClick(fielder.id)}
            animate={{
              left: `${(positions[fielder.id].x / 300) * 100}%`,
              top: `${(positions[fielder.id].y / 480) * 100}%`
            }}
            className={cn(
              "absolute w-10 h-10 sm:w-10 sm:h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-20 shadow-lg border-2 transition-all duration-200 touch-none",
              activeFielder === fielder.id && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110",
              positions[fielder.id].zoneId 
                ? "bg-primary text-background border-primary/50 shadow-glow-sm" 
                : "bg-backgroundAlt text-textSecondary border-border hover:border-borderHover",
              locked && "cursor-not-allowed opacity-70"
            )}
          >
            <User className="w-4 h-4" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
