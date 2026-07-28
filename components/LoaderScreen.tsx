'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Sparkles, Film, Skull } from 'lucide-react';

interface LoaderScreenProps {
  onComplete: () => void;
}

export default function LoaderScreen({ onComplete }: LoaderScreenProps) {
  const [progress, setProgress] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Fast reliable progress increment up to 100%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 200);
          return 100;
        }
        return prev + 5;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white p-6 font-display overflow-hidden select-none"
    >
      {/* Background Grid & Glitch Particles */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#FACC15_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* Video Background (if assets/loader.mp4 exists in public folder) */}
      <video
        ref={videoRef}
        src="/assets/loader.mp4"
        autoPlay
        loop
        muted
        playsInline
        onCanPlay={() => setVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          videoLoaded ? 'opacity-40' : 'opacity-0'
        }`}
      />

      {/* Fallback Animated Retro Canvas graphic if video loading */}
      {!videoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="w-[600px] h-[600px] border-[12px] border-dashed border-neo-yellow rounded-full flex items-center justify-center"
          >
            <div className="w-[400px] h-[400px] border-[8px] border-neo-red rounded-full animate-pulse" />
          </motion.div>
        </div>
      )}

      {/* Central Brutalist Loader Box */}
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative z-10 bg-neo-yellow text-black border-8 border-black p-8 md:p-12 rounded-2xl shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] max-w-lg w-full text-center flex flex-col items-center gap-6"
      >
        {/* Doom Skull / Logo Badge */}
        <div className="relative">
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 bg-neo-red text-white border-4 border-black rounded-full flex items-center justify-center shadow-brutal"
          >
            <Skull className="w-14 h-14" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute -top-2 -right-2 bg-black text-neo-yellow px-3 py-1 font-black text-xs border-2 border-white rounded-full uppercase"
          >
            DOOMSDAY INCOMING
          </motion.div>
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none">
            ROAD TO DOOMSDAY
          </h1>
          <p className="text-sm font-bold uppercase mt-2 text-black/80 tracking-widest">
            Couples MCU Watch Tracker
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full bg-white border-4 border-black p-1 rounded-full shadow-brutal relative overflow-hidden">
          <motion.div
            className="h-6 bg-neo-red rounded-full flex items-center justify-end pr-2"
            style={{ width: `${progress}%` }}
          >
            <Zap className="w-4 h-4 text-neo-yellow animate-bounce" />
          </motion.div>
        </div>

        {/* Progress Counter & Status text */}
        <div className="flex justify-between items-center w-full font-black text-sm">
          <span className="bg-black text-white px-3 py-1 rounded border-2 border-black uppercase text-xs">
            {progress < 40 ? 'INIT MULTIVERSE...' : progress < 80 ? 'TIMELINE SYNCING...' : 'PREPARING DOOMSDAY...'}
          </span>
          <span className="text-2xl tracking-tighter font-black">{progress}%</span>
        </div>

        <button
          onClick={onComplete}
          className="mt-2 bg-black text-neo-yellow px-6 py-2.5 rounded-xl border-4 border-black font-black uppercase text-xs shadow-brutal hover:bg-neo-red hover:text-white transition-all cursor-pointer"
        >
          ENTER TRACKER NOW ⚡
        </button>
      </motion.div>
    </motion.div>
  );
}
