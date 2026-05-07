import { useState } from 'react';
import { Settings, Users, Activity, Play, FastForward, AlertCircle, RefreshCw, Database, Pause } from 'lucide-react';
import { useMatchStore } from '../store/useMatchStore';
import scriptData from '../lib/matchScript.json';

export default function AdminDashboard() {
  const { 
    isPlaying, 
    currentEventIndex, 
    isDecisionWindow, 
    jumpToEvent, 
    pauseSimulation,
    startSimulation
  } = useMatchStore();

  // Fixed React purity issue by using a lazy initializer function
  const [activeUsers] = useState(() => Math.floor(Math.random() * 5000) + 12000);
  const [resetting, setResetting] = useState(false);

  const handleResetLeaderboard = () => {
    setResetting(true);
    setTimeout(() => {
      setResetting(false);
      alert('Global Leaderboard has been reset for the new season.');
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between glass-card p-6 border-b-2 border-primary/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">Admin Console</h1>
            <p className="text-xs text-textMuted uppercase tracking-widest font-semibold">CricVibe Internal Operations</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-danger/10 text-danger rounded-full text-xs font-bold border border-danger/20">
          <AlertCircle className="w-4 h-4" /> restricted access
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0A0F1A] border border-border rounded-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm text-textSecondary uppercase tracking-wider font-semibold">Active Players</span>
            <Users className="w-5 h-5 text-secondary" />
          </div>
          <div className="text-3xl font-display font-bold tabular-nums text-white">{activeUsers.toLocaleString()}</div>
          <div className="text-xs text-secondary mt-1">+14% last hour</div>
        </div>
        
        <div className="bg-[#0A0F1A] border border-border rounded-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm text-textSecondary uppercase tracking-wider font-semibold">Engine Status</span>
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-display font-bold text-white flex items-center gap-2">
            {isPlaying ? (
              <><span className="w-3 h-3 rounded-full bg-primary animate-pulse" /> RUNNING</>
            ) : (
              <><span className="w-3 h-3 rounded-full bg-danger" /> PAUSED</>
            )}
          </div>
          <div className="text-xs text-textMuted mt-1">Mock Script Executing</div>
        </div>

        <div className="bg-[#0A0F1A] border border-border rounded-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm text-textSecondary uppercase tracking-wider font-semibold">DB Writes/sec</span>
            <Database className="w-5 h-5 text-accent" />
          </div>
          <div className="text-3xl font-display font-bold tabular-nums text-white">420</div>
          <div className="text-xs text-textMuted mt-1">Well within quotas</div>
        </div>
      </div>

      {/* Match Engine Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Playback Controls */}
        <div className="glass-card p-6 flex flex-col">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-border pb-3">
            <Play className="w-5 h-5 text-primary" /> Match Progression Engine
          </h2>
          
          <div className="flex gap-4 mb-8">
            {isPlaying ? (
              <button onClick={pauseSimulation} className="flex-1 btn-outline py-3 flex justify-center gap-2">
                <Pause className="w-5 h-5" /> Pause Engine
              </button>
            ) : (
              <button onClick={startSimulation} className="flex-1 btn-primary py-3 flex justify-center gap-2">
                <Play className="w-5 h-5 fill-current" /> Start Engine
              </button>
            )}
            
            <button onClick={() => jumpToEvent(Math.min(currentEventIndex + 1, scriptData.length - 1))} className="flex-1 bg-surfaceHover hover:bg-white/10 text-white rounded-xl font-bold py-3 flex justify-center items-center gap-2 transition-colors border border-border">
              <FastForward className="w-5 h-5" /> Next Event
            </button>
          </div>

          <div className="p-4 bg-backgroundAlt rounded-xl border border-border">
            <div className="text-xs text-textSecondary uppercase tracking-widest font-semibold mb-2">Current State</div>
            <div className="text-sm text-white font-mono break-words">
              Event Index: <span className="text-primary">{currentEventIndex}</span> / {scriptData.length - 1} <br/>
              Decision Window: <span className={isDecisionWindow ? "text-danger font-bold" : "text-white"}>{isDecisionWindow ? 'OPEN (Tactical)' : 'CLOSED'}</span>
            </div>
          </div>
        </div>

        {/* Script Overrides */}
        <div className="glass-card flex flex-col max-h-[400px]">
          <div className="p-6 pb-0">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FastForward className="w-5 h-5 text-secondary" /> Force Trigger Events
            </h2>
            <p className="text-xs text-textSecondary mb-4">Click any event below to immediately jump the mock engine to that phase of the match.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2 custom-scrollbar">
            {scriptData.map((event, idx) => (
              <button
                key={idx}
                onClick={() => jumpToEvent(idx)}
                className={`w-full text-left p-3 rounded-lg border text-sm transition-colors flex items-center justify-between ${
                  currentEventIndex === idx 
                    ? 'bg-primary/20 border-primary/50 text-white' 
                    : 'bg-backgroundAlt border-border text-textSecondary hover:bg-surfaceHover hover:text-white'
                }`}
              >
                <div>
                  <span className="font-mono text-xs opacity-50 mr-3">[{idx.toString().padStart(2, '0')}]</span>
                  <span className={event.type === 'DECISION_WINDOW' ? 'text-danger font-bold' : ''}>
                    {event.type}
                  </span>
                </div>
                <div className="text-xs text-textMuted max-w-[150px] truncate">
                  {event.matchState?.commentary || 'System update...'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mock Match Creation */}
      <div className="glass-card mt-8 p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-accent" /> Mock Match Generator
        </h2>
        <p className="text-xs text-textSecondary mb-6">Instantly swap the active simulation script. This is useful for testing specific tactical scenarios (e.g., Death Overs vs Opening Spell).</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['T20 Death Overs (Default)', 'ODI Middle Phase', 'Test Match Opening'].map((template, idx) => (
            <button 
              key={idx}
              className={`p-4 rounded-xl border text-left transition-all ${
                idx === 0 ? 'bg-accent/20 border-accent text-white' : 'bg-backgroundAlt border-border text-textSecondary hover:bg-surfaceHover hover:border-white/20 hover:text-white'
              }`}
            >
              <div className="font-bold text-sm mb-1">{template}</div>
              <div className="text-xs opacity-70">Loads pre-configured match states.</div>
            </button>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border border-danger/30 rounded-2xl overflow-hidden mt-8">
        <div className="bg-danger/10 p-4 border-b border-danger/30">
          <h2 className="text-danger font-bold text-lg flex items-center gap-2">Danger Zone</h2>
        </div>
        <div className="p-6 bg-backgroundAlt flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-white font-bold mb-1">Wipe Global Leaderboards</h3>
            <p className="text-sm text-textSecondary max-w-md">This will permanently reset all user Cricket IQ scores to zero. Only execute this between major tournament seasons.</p>
          </div>
          <button 
            onClick={handleResetLeaderboard}
            disabled={resetting}
            className="px-6 py-3 bg-danger hover:bg-red-700 text-white font-bold rounded-xl transition-colors whitespace-nowrap min-w-[160px] flex items-center justify-center gap-2"
          >
            {resetting ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Reset Leaderboard'}
          </button>
        </div>
      </div>
    </div>
  );
}
