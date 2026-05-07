import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 CricVibe Critical Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#06090F] flex items-center justify-center p-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-danger/[0.05] blur-[150px] rounded-full pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-3xl max-w-md w-full p-8 text-center flex flex-col items-center relative z-10 shadow-2xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-danger/10 border-2 border-danger/30 flex items-center justify-center mb-6">
              <AlertOctagon className="w-8 h-8 text-danger" />
            </div>
            
            <h1 className="text-2xl font-display font-bold text-white mb-3 tracking-tight">System Disconnected</h1>
            
            <p className="text-textSecondary text-sm mb-8 leading-relaxed">
              We encountered an unexpected tactical error. The server connection might have dropped or a critical asset failed to load.
            </p>
            
            <button 
              onClick={this.handleRetry}
              className="w-full py-3.5 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Reboot Interface
            </button>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-black/50 rounded-xl text-left w-full overflow-auto text-xs text-danger/80 font-mono">
                {this.state.error?.toString()}
              </div>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
