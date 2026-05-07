import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, TrendingUp, Trophy, ArrowRight, Activity, Power } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import MatchCard from '../components/MatchCard';
import { MatchCardSkeleton, LeaderboardRowSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { cn } from '../lib/utils';
import { useMatchStore } from '../store/useMatchStore';
import { useAuth } from '../contexts/AuthContext';
import { useLeaderboardStore } from '../store/useLeaderboardStore';
import { pageVariants, itemVariants } from '../lib/animations';

const mockUpcomingMatches = [
  {
    id: 'm2', tournament: 'IPL 2026', venue: 'Eden Gardens',
    team1: 'Kolkata', team1Logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Kolkata_Knight_Riders_Logo.svg/1200px-Kolkata_Knight_Riders_Logo.svg.png',
    score1: '-', team2: 'Bangalore', team2Logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Royal_Challengers_Bangalore_2020.svg/1200px-Royal_Challengers_Bangalore_2020.svg.png',
    score2: '-', statusText: 'Starts Tomorrow at 7:30 PM IST',
  },
  {
    id: 'm3', tournament: 'IPL 2026', venue: 'Arun Jaitley Stadium',
    team1: 'Delhi', team1Logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Delhi_Capitals_Logo.svg/1200px-Delhi_Capitals_Logo.svg.png',
    score1: '-', team2: 'Hyderabad', team2Logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Sunrisers_Hyderabad.svg/1200px-Sunrisers_Hyderabad.svg.png',
    score2: '-', statusText: 'Sunday, 3:30 PM IST',
  }
];

const RANK_COLORS = ['text-secondary', 'text-gray-300', 'text-amber-600'];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();
  const { matchState, isPlaying, startSimulation, startLivePolling } = useMatchStore();
  const { users, startLiveSubscription, stopSubscription } = useLeaderboardStore();

  useEffect(() => {
    startLiveSubscription();
    const timer = setTimeout(() => setLoading(false), 800);
    return () => {
      clearTimeout(timer);
      stopSubscription();
    };
  }, [startLiveSubscription, stopSubscription]);

  const dynamicLiveMatch = {
    id: matchState.matchId || 'm1',
    tournament: 'IPL 2026', venue: 'Wankhede Stadium',
    team1: 'Mumbai', team1Logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/Mumbai_Indians_Logo.svg/1200px-Mumbai_Indians_Logo.svg.png',
    score1: `${matchState.score}/${matchState.wickets} (${matchState.over})`,
    team2: 'Chennai', team2Logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Chennai_Super_Kings_Logo.svg/1200px-Chennai_Super_Kings_Logo.svg.png',
    score2: 'Yet to bat',
    statusText: matchState.commentary || 'Match in progress...',
  };

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-5 sm:space-y-8"
    >
      
      {/* ─── Hero Section ─── */}
      <motion.section variants={itemVariants} className="relative overflow-hidden rounded-2xl sm:rounded-3xl glass-card border-0">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div 
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full bg-[url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2805&auto=format&fit=crop')] bg-cover bg-center opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
        </div>

        <div className="relative z-10 p-5 sm:p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <div className="badge-primary mb-6">
              <Activity className="h-3 w-3 animate-pulse" /> Live Season
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-4 leading-[1.1]">
              Play the <br/>
              <span className="text-gradient">Captain's Mind</span>
            </h1>
            <p className="text-sm sm:text-lg text-textSecondary mb-8 font-light max-w-md leading-relaxed">
              The ultimate real-time tactical simulator. Anticipate moves, set the field, and outsmart the world.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/simulator">
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary py-3.5 px-8 inline-flex items-center gap-2.5"
                >
                  <Play className="h-5 w-5" fill="currentColor" />
                  Enter Hotseat
                </motion.button>
              </Link>

              {!isPlaying && (
                <>
                  <button 
                    onClick={() => startLivePolling('live-match-id-123')} 
                    className="btn-ghost text-xs inline-flex items-center gap-2 border border-border text-primary hover:text-primary hover:bg-primary/10"
                  >
                    <Activity className="h-3.5 w-3.5 animate-pulse" /> Go Live
                  </button>
                  <button onClick={startSimulation} className="btn-ghost text-xs inline-flex items-center gap-2 border border-border">
                    <Power className="h-3.5 w-3.5" /> Demo Match
                  </button>
                </>
              )}
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="w-full md:w-80 glass-card p-6 border-t-2 border-t-primary/30 relative"
          >
            <div className="absolute -inset-1 bg-primary/[0.03] blur-2xl z-0 rounded-2xl" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <div className="stat-label mb-1">Cricket IQ</div>
                  <div className="stat-value text-textPrimary">{userProfile?.totalIQ?.toLocaleString() || '0'}</div>
                </div>
                <div className="badge-primary">
                  <TrendingUp className="h-3 w-3" /> +150
                </div>
              </div>

              <div className="h-14 mb-4 -mx-2 opacity-70">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { m: 1, iq: 1000 }, { m: 2, iq: 1500 }, { m: 3, iq: 1200 }, 
                    { m: 4, iq: 1800 }, { m: 5, iq: userProfile?.totalIQ || 0 }
                  ]}>
                    <Line type="monotone" dataKey="iq" stroke="#00E676" strokeWidth={2} dot={false} isAnimationActive={true} animationDuration={1500} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <div>
                  <div className="stat-label">Global Rank</div>
                  <div className="text-lg font-display font-bold text-textPrimary">
                    #{userProfile?.globalRank || '---'}
                  </div>
                </div>
                <div>
                  <div className="stat-label">Accuracy</div>
                  <div className="text-lg font-display font-bold text-primary">78%</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ─── Match Lobby ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="section-title mb-5">Live Action</h2>
            {loading ? (
              <MatchCardSkeleton />
            ) : isPlaying ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MatchCard match={dynamicLiveMatch} isLive={true} />
              </div>
            ) : (
              <EmptyState 
                message="No Live Matches" 
                subMessage="Start the Demo Engine to simulate a match." 
              />
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="section-title">Upcoming Fixtures</h2>
              <button className="btn-ghost text-xs text-textMuted">View All</button>
            </div>
            {loading ? (
              <div className="flex gap-4 overflow-x-hidden">
                <div className="min-w-[300px] flex-1"><MatchCardSkeleton /></div>
                <div className="min-w-[300px] flex-1 hidden sm:block"><MatchCardSkeleton /></div>
              </div>
            ) : (
              <div className="flex overflow-x-auto gap-4 pb-2 snap-x hide-scrollbar">
                {mockUpcomingMatches.map(match => (
                  <div key={match.id} className="min-w-[260px] sm:min-w-[340px] snap-start">
                    <MatchCard match={match} isLive={false} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Leaderboard Sidebar */}
        <section className="glass-card flex flex-col border-t-2 border-t-secondary/30">
          <div className="p-5 border-b border-border flex justify-between items-center">
            <h2 className="text-base font-display font-bold uppercase tracking-wider flex items-center gap-2">
              <Trophy className="h-4 w-4 text-secondary" />
              Top Captains
            </h2>
            <Link to="/leaderboard" className="text-xs text-textMuted hover:text-textSecondary font-medium">
              Full Rankings
            </Link>
          </div>
          
          <div className="flex-1 p-2">
            {loading ? (
              <>
                <LeaderboardRowSkeleton />
                <LeaderboardRowSkeleton />
                <LeaderboardRowSkeleton />
              </>
            ) : (
              users.slice(0, 5).map((user, idx) => (
                <div 
                  key={user.id}
                  className={cn(
                    "flex items-center justify-between p-3.5 rounded-xl mb-0.5 transition-colors",
                    user.isUser ? "bg-primary/[0.06] border border-primary/10" : "hover:bg-surfaceHover"
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={cn(
                      "font-mono font-bold text-xs w-5 text-center tabular-nums",
                      idx < 3 ? RANK_COLORS[idx] : "text-textMuted"
                    )}>
                      {idx + 1}
                    </div>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                      user.isUser ? "bg-primary/20 text-primary" : "bg-surfaceHover text-textSecondary"
                    )}>
                      {user.name.charAt(0)}
                    </div>
                    <span className={cn("text-sm font-medium", user.isUser ? "text-primary" : "text-textPrimary truncate max-w-[100px]")}>
                      {user.name}
                    </span>
                  </div>
                  <div className="font-mono font-bold tabular-nums text-sm text-textSecondary">
                    {user.iq.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t border-border">
            <Link to="/leaderboard" className="btn-outline w-full text-xs py-2.5 flex items-center justify-center gap-2">
              Global Leaderboard <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
