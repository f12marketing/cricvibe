import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import NetworkStatus from '../NetworkStatus';
import { Outlet } from 'react-router-dom';
import Particles from '../Particles';
import { Activity, Crosshair, Trophy } from 'lucide-react';
import { cn } from '../../lib/utils';

const BOTTOM_NAV_LINKS = [
  { to: '/', label: 'Home', icon: Activity },
  { to: '/simulator', label: 'Play', icon: Crosshair },
  { to: '/leaderboard', label: 'Ranks', icon: Trophy },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <NetworkStatus />
      
      {/* Ambient Gradient Orbs — reduced on mobile for performance */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[400px] h-[250px] sm:w-[800px] sm:h-[400px] bg-primary/[0.03] blur-[80px] sm:blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[300px] h-[300px] sm:w-[600px] sm:h-[500px] bg-accent/[0.03] blur-[100px] sm:blur-[150px] rounded-full pointer-events-none" />
      <div className="hidden sm:block fixed top-1/2 left-0 w-[400px] h-[400px] bg-secondary/[0.02] blur-[120px] rounded-full pointer-events-none" />
      
      {/* Subtle Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]" 
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '64px 64px'
        }} 
      />

      {/* Subtle Particles — fewer on mobile */}
      <Particles count={typeof window !== 'undefined' && window.innerWidth < 640 ? 6 : 15} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/80 backdrop-blur-xl safe-area-bottom">
        <div className="flex items-stretch justify-around h-16">
          {BOTTOM_NAV_LINKS.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 transition-colors duration-200 relative",
                  isActive
                    ? "text-primary"
                    : "text-textMuted active:text-textSecondary"
                )}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />
                )}
                <Icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_6px_rgba(0,230,118,0.4)]")} />
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
