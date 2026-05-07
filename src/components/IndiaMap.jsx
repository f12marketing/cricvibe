import React from 'react';
import { motion } from 'framer-motion';

const CITIES = [
  { id: 'mumbai', name: 'Mumbai', x: 28, y: 65, score: 92, active: true },
  { id: 'chennai', name: 'Chennai', x: 45, y: 85, score: 88, active: true },
  { id: 'delhi', name: 'Delhi', x: 35, y: 25, score: 95, active: true },
  { id: 'bangalore', name: 'Bengaluru', x: 38, y: 78, score: 91, active: true },
  { id: 'kolkata', name: 'Kolkata', x: 75, y: 50, score: 85, active: true },
  { id: 'hyderabad', name: 'Hyderabad', x: 45, y: 65, score: 89, active: true },
];

export default function IndiaMap() {
  return (
    <div className="relative w-full aspect-square max-w-md mx-auto bg-backgroundAlt rounded-2xl border border-border overflow-hidden flex items-center justify-center">
      
      {/* Subtle Grid */}
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} 
      />
      
      {/* Geometric Map Shape */}
      <div className="relative w-[80%] h-[90%] opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full">
           <path 
             d="M35 10 L45 5 L60 20 L70 30 L85 45 L80 60 L60 80 L50 95 L40 85 L30 75 L20 65 L15 50 L10 40 L20 25 Z" 
             fill="none" 
             stroke="#00E676" 
             strokeWidth="0.5" 
             strokeDasharray="2 1"
           />
           <path d="M50 5 L50 95 M10 50 L85 50" stroke="#00E676" strokeWidth="0.15" opacity="0.3" />
           <circle cx="50" cy="50" r="30" stroke="#00E676" strokeWidth="0.15" fill="none" opacity="0.2" />
        </svg>
      </div>

      {/* City Nodes */}
      {CITIES.map((city) => (
        <motion.div
          key={city.id}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: Math.random() * 0.5 }}
          className="absolute group cursor-default"
          style={{ left: `${city.x}%`, top: `${city.y}%` }}
        >
          {/* Pulse Ring */}
          <span className="absolute -inset-2.5 rounded-full bg-primary/20 animate-ping" />
          
          {/* Core */}
          <div className="relative w-2.5 h-2.5 bg-primary rounded-full shadow-glow-sm" />
          
          {/* Tooltip */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-backgroundAlt border border-border p-2.5 rounded-lg text-center whitespace-nowrap z-10 pointer-events-none shadow-card">
             <div className="text-[10px] font-display font-semibold text-textPrimary uppercase tracking-wide">{city.name}</div>
             <div className="text-primary text-[10px] font-mono font-bold mt-0.5">IQ: {city.score}</div>
          </div>
        </motion.div>
      ))}

      {/* Radar Sweep */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-screen"
        style={{
          background: 'conic-gradient(from 0deg, transparent 70%, rgba(0,230,118,0.06) 100%)',
          clipPath: 'circle(40% at center)'
        }}
      />
    </div>
  );
}
