import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { useMatchStore } from '../store/useMatchStore';

export default function NetworkStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { connectionStatus, startLivePolling } = useMatchStore();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showDegraded = connectionStatus === 'degraded' && !isOffline;

  return (
    <AnimatePresence>
      {(isOffline || showDegraded) && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[200] w-[92%] sm:w-auto min-w-[320px]"
        >
          <div className={`p-4 rounded-2xl shadow-2xl backdrop-blur-2xl border flex items-center justify-between gap-4 ${
            isOffline ? 'bg-danger/80 border-danger/50 text-white' : 'bg-amber-500/80 border-amber-500/50 text-white'
          }`}>
            <div className="flex items-center gap-3.5">
              {isOffline ? (
                <div className="p-2 bg-black/20 rounded-full">
                  <WifiOff className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-2 bg-black/20 rounded-full">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-wide">
                  {isOffline ? 'Connection Lost' : 'Live Data Degraded'}
                </span>
                <span className="text-[11px] opacity-90 font-medium leading-tight mt-0.5">
                  {isOffline 
                    ? 'Reconnecting automatically...' 
                    : 'Falling back to mock engine to prevent disruption.'}
                </span>
              </div>
            </div>
            
            {showDegraded && (
              <button 
                onClick={() => startLivePolling('live-match-id-123')}
                className="bg-black/20 hover:bg-black/40 p-2.5 rounded-xl transition-all active:scale-95 group"
                title="Retry Connection"
              >
                <RefreshCw className="w-4 h-4 text-white group-hover:rotate-180 transition-transform duration-500" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
