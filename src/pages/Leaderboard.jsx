import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, MapPin, Globe, Activity, TrendingUp, Crosshair, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';
import IndiaMap from '../components/IndiaMap';
import { useLeaderboardStore } from '../store/useLeaderboardStore';
import { useAuth } from '../contexts/AuthContext';
import { pageVariants, itemVariants } from '../lib/animations';

const PIE_COLORS = ['#00E676', '#0C1220'];

const mockTrendData = [
  { match: 'M1', accuracy: 65 }, { match: 'M2', accuracy: 70 },
  { match: 'M3', accuracy: 68 }, { match: 'M4', accuracy: 75 },
  { match: 'M5', accuracy: 78 },
];

const TABS = [
  { key: 'GLOBAL', label: 'Global', icon: Globe, activeClass: 'bg-primary/15 text-primary border border-primary/20' },
  { key: 'MATCH', label: 'Live Match', icon: Activity, activeClass: 'bg-secondary/15 text-secondary border border-secondary/20' },
  { key: 'REGIONAL', label: 'Regional', icon: MapPin, activeClass: 'bg-accent/15 text-accent border border-accent/20' },
];

const PODIUM_STYLES = [
  { rank: 'silver', color: 'gray-300', glow: 'rgba(209,213,219,0.15)', size: 'w-14 h-14', barH: 'h-20', borderColor: 'border-gray-400' },
  { rank: 'gold', color: 'secondary', glow: 'rgba(255,215,64,0.2)', size: 'w-16 h-16', barH: 'h-28', borderColor: 'border-secondary' },
  { rank: 'bronze', color: 'amber-600', glow: 'rgba(217,119,6,0.15)', size: 'w-14 h-14', barH: 'h-14', borderColor: 'border-amber-600' },
];

const TrendIcon = ({ trend }) => {
  if (trend === 'up') return <ChevronUp className="h-3.5 w-3.5 text-primary" />;
  if (trend === 'down') return <ChevronDown className="h-3.5 w-3.5 text-danger" />;
  return <Minus className="h-3.5 w-3.5 text-textMuted" />;
};

export default function Leaderboard() {
  const { userProfile } = useAuth();
  const { users, tab, setTab, startLiveSubscription, stopSubscription } = useLeaderboardStore();

  useEffect(() => {
    startLiveSubscription();
    return () => stopSubscription();
  }, [startLiveSubscription, stopSubscription]);

  const top3 = users.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]]; // Silver, Gold, Bronze
  const rest = users.slice(3, 8);

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-4 sm:pb-12"
    >
      
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-5 glass-card p-3 sm:p-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-display font-bold tracking-tight">Master Tacticians</h1>
            <p className="text-textMuted text-xs">Real-time Global Rankings</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="tab-group">
          {TABS.map(({ key, label, icon: Icon, activeClass }) => (
            <button 
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "tab-item flex items-center gap-1.5",
                tab === key ? activeClass : ""
              )}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Global Tab ─── */}
      {tab === 'GLOBAL' && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Podium */}
            <div className="glass-card p-4 sm:p-8 flex items-end justify-center gap-2 sm:gap-3 md:gap-6 min-h-[220px] sm:min-h-[280px]">
              {podiumOrder.map((user, idx) => {
                const style = PODIUM_STYLES[idx];
                const displayRank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                const isGold = displayRank === 1;
                return (
                  <motion.div key={user?.id} layout className="flex flex-col items-center w-1/3 z-10">
                    {isGold && <Crown className="w-5 h-5 sm:w-7 sm:h-7 text-secondary mb-1 sm:mb-2" />}
                    <div className={cn(
                      "text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider mb-1 sm:mb-2 px-1.5 sm:px-2 py-0.5 rounded-full",
                      isGold ? "bg-secondary/15 text-secondary" : displayRank === 2 ? "bg-gray-400/15 text-gray-300" : "bg-amber-600/15 text-amber-500"
                    )}>
                      #{displayRank}
                    </div>
                    <div className={cn(
                      `w-10 h-10 sm:${style.size} rounded-full bg-backgroundAlt border-2 ${style.borderColor} flex items-center justify-center font-display font-bold text-base sm:text-lg mb-1 sm:mb-2`,
                    )} style={{ boxShadow: `0 0 20px ${style.glow}` }}>
                      {user?.name.charAt(0)}
                    </div>
                    <div className={cn("font-display font-semibold text-xs sm:text-sm truncate w-full text-center", isGold && "text-secondary")}>{user?.name}</div>
                    <div className="text-textMuted text-[10px] sm:text-xs mb-2 sm:mb-3 font-mono tabular-nums">{user?.iq.toLocaleString()}</div>
                    <div className={cn(
                      `w-full ${style.barH} rounded-t-lg border-t-2 ${style.borderColor}`,
                      isGold ? "bg-gradient-to-t from-secondary/10 to-secondary/[0.03]" : "bg-gradient-to-t from-white/5 to-transparent"
                    )} />
                  </motion.div>
                );
              })}
            </div>

            {/* Rankings List */}
            <div className="glass-card overflow-hidden">
              <div className="p-3.5 px-5 border-b border-border bg-backgroundAlt text-[10px] text-textMuted uppercase tracking-widest font-semibold flex">
                <div className="w-14 text-center">Rank</div>
                <div className="flex-1">Strategist</div>
                <div className="w-20 text-right hidden sm:block">Accuracy</div>
                <div className="w-12 text-center hidden sm:block">Trend</div>
                <div className="w-28 text-right pr-4">Cricket IQ</div>
              </div>
              <div className="relative">
                <AnimatePresence>
                  {rest.map((user, idx) => (
                    <motion.div 
                      key={user.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className={cn(
                        "flex items-center p-3.5 px-5 border-b border-border/50 transition-colors",
                        user.isUser ? "bg-primary/[0.04] border-l-2 border-l-primary" : "hover:bg-surfaceHover"
                      )}
                    >
                      <div className="w-14 text-center font-mono font-bold text-xs text-textMuted tabular-nums">
                        {idx + 4}
                      </div>
                      <div className="flex-1 flex items-center gap-3">
                         <div className={cn(
                           "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                           user.isUser ? "bg-primary/15 text-primary" : "bg-surfaceHover text-textSecondary"
                         )}>
                           {user.name.charAt(0)}
                         </div>
                         <span className={cn("font-medium text-sm", user.isUser && "text-primary")}>{user.name}</span>
                      </div>
                      <div className="w-20 text-right hidden sm:block text-textSecondary text-sm font-mono tabular-nums">
                        {user.accuracy}%
                      </div>
                      <div className="w-12 text-center hidden sm:flex items-center justify-center">
                        <TrendIcon trend={user.trend} />
                      </div>
                      <div className="w-28 text-right pr-4 font-mono font-bold tabular-nums text-sm text-textPrimary">
                        {user.iq.toLocaleString()}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {/* User Sticky Row */}
                {userProfile && (
                  <motion.div layout className="flex items-center p-3.5 px-5 border-t-2 border-t-primary/30 bg-primary/[0.04]">
                    <div className="w-14 text-center font-mono font-bold text-xs text-primary tabular-nums">
                      {userProfile.globalRank || '---'}
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-primary/15 text-primary">
                          {userProfile.username?.charAt(0) || 'Y'}
                        </div>
                        <span className="font-medium text-sm text-primary">You ({userProfile.username})</span>
                    </div>
                    <div className="w-20 text-right hidden sm:block text-primary text-sm font-mono font-bold tabular-nums">
                      {userProfile.matchesPlayed ? Math.min(100, Math.round(((userProfile.totalIQ / userProfile.matchesPlayed) / 150) * 100)) : 0}%
                    </div>
                    <div className="w-12 text-center hidden sm:flex items-center justify-center"><TrendIcon trend="up" /></div>
                    <div className="w-28 text-right pr-4 font-mono font-bold tabular-nums text-sm text-primary">
                      {userProfile.totalIQ?.toLocaleString() || '0'}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* ─── Sidebar Stats ─── */}
          <div className="space-y-5">
             <div className="glass-card p-5">
                <h3 className="stat-label mb-5 flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" /> Accuracy Trend
                </h3>
                <div className="h-44 -mx-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockTrendData}>
                      <XAxis dataKey="match" stroke="rgba(255,255,255,0.08)" fontSize={11} tickMargin={8} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0C1220', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', fontSize: '12px' }}
                        itemStyle={{ color: '#00E676' }}
                      />
                      <Line type="monotone" dataKey="accuracy" stroke="#00E676" strokeWidth={2.5} dot={{ r: 3.5, fill: '#06090F', stroke: '#00E676', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className="glass-card p-5">
                <h3 className="stat-label mb-5 flex items-center gap-2">
                  <Crosshair className="h-3.5 w-3.5 text-secondary" /> Decision Breakdown
                </h3>
                <div className="flex items-center justify-between">
                  <div className="h-28 w-28 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={[{value: 78}, {value: 22}]} cx="50%" cy="50%" innerRadius={36} outerRadius={52} stroke="none" dataKey="value">
                          <Cell fill={PIE_COLORS[0]} />
                          <Cell fill={PIE_COLORS[1]} />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-mono font-bold text-primary">78%</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <span className="text-textSecondary">Captain Match</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full bg-backgroundAlt" />
                      <span className="text-textMuted">Divergent</span>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </motion.div>
      )}

      {/* ─── Regional Tab ─── */}
      {tab === 'REGIONAL' && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
           <div className="glass-card p-5 sm:p-8 flex flex-col justify-center border-l-2 border-l-accent/40">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold tracking-tight mb-2 sm:mb-3">India Intelligence Heatmap</h2>
              <p className="text-textSecondary font-light mb-5 sm:mb-8 max-w-md leading-relaxed text-xs sm:text-sm">
                Tactical dominance visualized. Delhi currently leads the national average for perfect captain-match predictions in the death overs.
              </p>
              
              <div className="space-y-3">
                {[
                  { rank: '01', name: 'Delhi', stats: '95 Avg IQ • 12k Active', color: 'text-accent' },
                  { rank: '02', name: 'Mumbai', stats: '92 Avg IQ • 18k Active', color: 'text-textMuted' },
                ].map(city => (
                  <div key={city.rank} className="flex items-center justify-between p-3.5 bg-backgroundAlt rounded-xl border border-border">
                    <div className="flex items-center gap-3.5">
                      <div className={cn("text-xl font-mono font-bold tabular-nums", city.color)}>{city.rank}</div>
                      <div>
                        <div className="font-display font-semibold text-sm text-textPrimary">{city.name}</div>
                        <div className="text-[11px] text-textMuted">{city.stats}</div>
                      </div>
                    </div>
                    <TrendingUp className="text-primary h-4 w-4" />
                  </div>
                ))}
              </div>
           </div>
           
           <div className="flex items-center justify-center p-4">
              <IndiaMap />
           </div>
        </motion.div>
      )}

      {/* ─── Match Tab ─── */}
      {tab === 'MATCH' && (
        <motion.div variants={itemVariants} className="glass-card p-6 sm:p-12 text-center border-t-2 border-t-secondary/30">
          <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mx-auto mb-5">
            <Activity className="h-7 w-7 text-secondary" />
          </div>
          <h2 className="text-2xl font-display font-bold tracking-tight mb-3">Live Match Standings</h2>
          <p className="text-textMuted mb-8 max-w-md mx-auto text-sm leading-relaxed">
            Standings will generate once the demo match finishes its first decision window.
          </p>
          <button onClick={() => setTab('GLOBAL')} className="btn-outline text-xs">
            Return to Global
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
