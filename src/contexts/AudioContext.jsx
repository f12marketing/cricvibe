import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const AudioContextState = createContext();

export function useAudio() {
  return useContext(AudioContextState);
}

export function AudioProvider({ children }) {
  const [isMuted, setIsMuted] = useState(false);
  const audioCtxRef = useRef(null);
  const ambienceOscRef = useRef(null);
  const ambienceGainRef = useRef(null);

  // Initialize context on first user interaction to comply with browser autoplay policies
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  useEffect(() => {
    const handleInteraction = () => initAudio();
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [initAudio]);

  // Helper to create white noise buffer
  const createNoiseBuffer = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return null;
    const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }, []);

  // 1. Tick (Countdown)
  const playTick = useCallback(() => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }, [isMuted]);

  // 2. Click (Lock Decision)
  const playClick = useCallback(() => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }, [isMuted]);

  // 3. Victory Stinger
  const playVictory = useCallback(() => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5 (A Major Arpeggio)
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.value = freq;
      
      const startTime = ctx.currentTime + i * 0.15;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }, [isMuted]);

  // 4. Crowd Roar
  const playRoar = useCallback(() => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const noiseBuffer = createNoiseBuffer();
    if (!noiseBuffer) return;

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    noiseSrc.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 1.5);
    filter.frequency.linearRampToValueAtTime(400, ctx.currentTime + 3);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 1); // Swell up
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 3);   // Fade out

    noiseSrc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSrc.start();
    noiseSrc.stop(ctx.currentTime + 3);
  }, [isMuted, createNoiseBuffer]);

  // 5. Stadium Ambience Loop
  const startAmbience = useCallback(() => {
    if (isMuted || !audioCtxRef.current || ambienceGainRef.current) return;
    const ctx = audioCtxRef.current;
    
    const noiseBuffer = createNoiseBuffer();
    if (!noiseBuffer) return;

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    noiseSrc.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 2); // Very quiet, fade in

    noiseSrc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSrc.start();
    
    ambienceOscRef.current = noiseSrc;
    ambienceGainRef.current = gainNode;
  }, [isMuted, createNoiseBuffer]);

  const stopAmbience = useCallback(() => {
    if (ambienceGainRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      ambienceGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1); // Fade out
      setTimeout(() => {
        if (ambienceOscRef.current) {
          ambienceOscRef.current.stop();
          ambienceOscRef.current = null;
          ambienceGainRef.current = null;
        }
      }, 1000);
    }
  }, []);

  // Stop ambience immediately if muted
  useEffect(() => {
    if (isMuted) {
      stopAmbience();
    }
  }, [isMuted, stopAmbience]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const value = {
    isMuted,
    toggleMute,
    playTick,
    playClick,
    playVictory,
    playRoar,
    startAmbience,
    stopAmbience,
    initAudio
  };

  return (
    <AudioContextState.Provider value={value}>
      {children}
    </AudioContextState.Provider>
  );
}
