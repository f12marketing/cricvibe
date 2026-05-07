import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import { X, XIcon, MessageCircle, Download, Activity, Target, Zap, Share2, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

export default function ShareOverlay({ scoringResult, userDecision, actualDecision, onClose }) {
  const { userProfile } = useAuth();
  const cardRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const isHighScoring = scoringResult?.merit_score >= 80;
  const isMatch = scoringResult?.captain_match;

  const matchResultText = isMatch 
    ? "PERFECT CAPTAINCY" 
    : (isHighScoring ? "TACTICAL MASTERCLASS" : "LEARNING CURVE");

  const accentColorClass = isHighScoring ? "text-primary" : "text-danger";
  const bgGlowClass = isHighScoring ? "bg-primary/20" : "bg-danger/20";
  const borderClass = isHighScoring ? "border-primary/50" : "border-danger/50";

  const shareText = `I just hit a ${scoringResult?.merit_score || 0} Tactical Merit score on CricVibe! 🏏🧠\nMy Cricket IQ is rising. Can you outsmart the captain?\n\n#CricVibe #CricketTactics #T20`;

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const downloadImage = async () => {
    if (!cardRef.current) return;
    try {
      setIsGenerating(true);
      // html-to-image works best when the node is visible in the DOM
      const dataUrl = await toPng(cardRef.current, { 
        quality: 1, 
        pixelRatio: 2, // High resolution for social media
        style: { transform: 'scale(1)', transformOrigin: 'top left' } // Reset any scaling during capture
      });
      
      const link = document.createElement('a');
      link.download = `CricVibe_Scorecard_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-3xl overflow-y-auto p-4"
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 bg-surface rounded-full text-textSecondary hover:text-white transition-colors z-50"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="flex flex-col items-center w-full max-w-4xl py-10 gap-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-textPrimary flex items-center justify-center gap-2">
            <Share2 className="h-6 w-6 text-primary" /> Share Your Brilliance
          </h2>
          <p className="text-textSecondary text-sm sm:text-base">Export this ESPN-style graphic to your socials.</p>
        </div>

        {/* ─── Share Graphic Preview Container ─── */}
        {/* We wrap it in a scaling div so it fits on screen, but the inner card is a fixed 800x1000 for high-res export */}
        <div className="relative w-full max-w-[400px] sm:max-w-[500px] flex justify-center items-center overflow-hidden rounded-2xl shadow-2xl ring-1 ring-border">
          
          <div className="w-full origin-top" style={{ transform: 'scale(1)' }}>
            
            {/* ─── The Actual Exportable Card (800x1000 px inside ref) ─── */}
            {/* Notice we set fixed px widths inside so the generated image is perfectly sized */}
            <div 
              ref={cardRef} 
              className="bg-[#06090F] relative overflow-hidden flex flex-col"
              style={{ width: '800px', height: '1000px', transform: 'scale(0.5)', transformOrigin: 'top left', marginBottom: '-500px', marginRight: '-400px' }}
            >
              {/* ESPN/Broadcast Style Background Elements */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2805&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
              <div className={cn("absolute -top-[300px] -right-[300px] w-[800px] h-[800px] rounded-full blur-[150px] opacity-60", bgGlowClass)} />
              <div className="absolute bottom-0 left-0 right-0 h-[400px] bg-gradient-to-t from-[#06090F] to-transparent" />
              
              {/* Graphic Content */}
              <div className="relative z-10 flex-1 flex flex-col p-16">
                
                {/* Branding Header */}
                <div className="flex justify-between items-center border-b-[3px] border-white/10 pb-8 mb-12">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
                      <Activity className="h-8 w-8 text-primary" />
                    </div>
                    <span className="font-display font-black text-5xl tracking-tighter text-white">
                      Cric<span className="text-primary">Vibe</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold tracking-widest text-white/50 uppercase">Tactical Simulator</div>
                    <div className="text-2xl font-bold text-white">Live Match Analysis</div>
                  </div>
                </div>

                {/* Main Verdict Tag */}
                <div className="flex justify-center mb-16">
                  <div className={cn(
                    "px-8 py-4 rounded-full border-4 flex items-center gap-4 bg-black/40 backdrop-blur-xl",
                    borderClass
                  )}>
                    {isMatch ? <CheckCircle2 className={cn("w-10 h-10", accentColorClass)} /> : <Target className={cn("w-10 h-10", accentColorClass)} />}
                    <span className={cn("font-display font-black text-4xl tracking-widest uppercase", accentColorClass)}>
                      {matchResultText}
                    </span>
                  </div>
                </div>

                {/* Scores Grid */}
                <div className="grid grid-cols-2 gap-10 mb-16">
                  {/* Merit Score */}
                  <div className="bg-white/5 border-2 border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center backdrop-blur-md">
                    <div className="text-2xl font-bold uppercase tracking-widest text-white/50 mb-4">Merit Score</div>
                    <div className={cn("text-9xl font-display font-black tabular-nums leading-none", accentColorClass)}>
                      {scoringResult?.merit_score || 0}
                    </div>
                  </div>
                  
                  {/* IQ Earned */}
                  <div className="bg-white/5 border-2 border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center backdrop-blur-md">
                    <div className="text-2xl font-bold uppercase tracking-widest text-white/50 mb-4">Cricket IQ Earned</div>
                    <div className="flex items-center gap-4">
                      <Zap className="w-16 h-16 text-secondary" />
                      <div className="text-9xl font-display font-black tabular-nums leading-none text-white">
                        +{scoringResult?.iqEarned || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gemini AI Quote Block */}
                <div className="bg-gradient-to-br from-white/10 to-transparent border-l-8 border-l-secondary rounded-2xl p-10 mb-auto relative">
                  <Zap className="absolute -right-6 -bottom-6 w-32 h-32 text-secondary/10" />
                  <div className="text-xl font-bold uppercase tracking-widest text-secondary mb-4 flex items-center gap-3">
                    <Activity className="w-6 h-6" /> Gemini AI Verdict
                  </div>
                  <p className="text-3xl font-light italic text-white leading-relaxed">
                    "{scoringResult?.reasoning || 'Exceptional read of the game situation.'}"
                  </p>
                </div>

                {/* Footer Profile */}
                <div className="mt-12 flex items-center justify-between border-t-[3px] border-white/10 pt-10">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center text-4xl">
                      {userProfile?.avatar === 'captain' ? '🏏' : '🧠'}
                    </div>
                    <div>
                      <div className="text-xl text-white/50 font-bold uppercase tracking-widest mb-1">Strategist</div>
                      <div className="text-4xl font-display font-black text-white">{userProfile?.username || 'Guest Captain'}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">cricvibe.app</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* ─── Share Action Buttons ─── */}
        <div className="flex flex-wrap items-center justify-center gap-4 max-w-lg w-full">
          
          <button 
            onClick={downloadImage}
            disabled={isGenerating}
            className="btn-primary py-4 flex-1 flex items-center justify-center gap-3 min-w-[200px]"
          >
            {isGenerating ? (
              <Activity className="w-5 h-5 animate-pulse" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {isGenerating ? 'Rendering High-Res...' : 'Save for IG Story'}
          </button>

          <button 
            onClick={handleTwitterShare}
            className="py-4 px-6 rounded-xl font-bold text-white flex items-center justify-center gap-3 transition-transform hover:scale-105"
            style={{ backgroundColor: '#000000' }}
          >
            <XIcon className="w-5 h-5" fill="currentColor" /> X (Twitter)
          </button>

          <button 
            onClick={handleWhatsAppShare}
            className="py-4 px-6 rounded-xl font-bold text-white flex items-center justify-center gap-3 transition-transform hover:scale-105"
            style={{ backgroundColor: '#25D366' }}
          >
            <MessageCircle className="w-5 h-5" fill="currentColor" /> WhatsApp
          </button>
        </div>

      </div>
    </motion.div>
  );
}
