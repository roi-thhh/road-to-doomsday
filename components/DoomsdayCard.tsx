'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Skull, Flame, Sparkles, Shield, Zap } from 'lucide-react';

export default function DoomsdayCard() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const doomsdayDate = new Date('2026-12-18T00:00:00');

    const updateCountdown = () => {
      const now = new Date();
      const difference = doomsdayDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="relative bg-neo-red text-white border-8 border-black p-8 md:p-12 rounded-3xl shadow-brutal-lg text-center w-full max-w-2xl mx-auto overflow-hidden my-16 font-sans"
    >
      {/* Background Retro Grid */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Skull Emblem */}
        <motion.div
          animate={{ rotate: [0, -4, 4, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-20 h-20 bg-black text-neo-yellow border-4 border-white rounded-full flex items-center justify-center shadow-brutal mb-6"
        >
          <Skull className="w-12 h-12" />
        </motion.div>

        {/* Title */}
        <span className="bg-black text-neo-yellow px-4 py-1 rounded-full border-2 border-white font-black text-xs uppercase tracking-widest mb-3 shadow-brutal-sm inline-flex items-center gap-1.5">
          <Flame className="w-4 h-4 fill-current text-neo-red" /> THE FINAL CONVERGENCE NODE
        </span>

        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tight mb-1 font-display">
          AVENGERS
        </h1>
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-neo-yellow uppercase tracking-widest mb-6 font-display drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          DOOMSDAY
        </h2>

        {/* Live Countdown Grid */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 w-full max-w-lg mb-6">
          <div className="bg-black border-4 border-white p-2 md:p-3 rounded-xl shadow-brutal flex flex-col justify-center">
            <span className="block text-xl sm:text-2xl md:text-4xl font-black text-neo-yellow font-display leading-none mb-1">{timeLeft.days}</span>
            <span className="text-[9px] md:text-xs font-bold uppercase tracking-wider text-gray-300">DAYS</span>
          </div>
          <div className="bg-black border-4 border-white p-2 md:p-3 rounded-xl shadow-brutal flex flex-col justify-center">
            <span className="block text-xl sm:text-2xl md:text-4xl font-black text-white font-display leading-none mb-1">{timeLeft.hours}</span>
            <span className="text-[9px] md:text-xs font-bold uppercase tracking-wider text-gray-300">HOURS</span>
          </div>
          <div className="bg-black border-4 border-white p-2 md:p-3 rounded-xl shadow-brutal flex flex-col justify-center">
            <span className="block text-xl sm:text-2xl md:text-4xl font-black text-neo-yellow font-display leading-none mb-1">{timeLeft.minutes}</span>
            <span className="text-[9px] md:text-xs font-bold uppercase tracking-wider text-gray-300">MINS</span>
          </div>
          <div className="bg-black border-4 border-white p-2 md:p-3 rounded-xl shadow-brutal flex flex-col justify-center">
            <span className="block text-xl sm:text-2xl md:text-4xl font-black text-neo-green font-display leading-none mb-1">{timeLeft.seconds}</span>
            <span className="text-[9px] md:text-xs font-bold uppercase tracking-wider text-gray-300">SECS</span>
          </div>
        </div>

        {/* Quote / Subtext */}
        <p className="text-sm font-bold max-w-md mx-auto leading-relaxed bg-black/40 border-2 border-white/40 p-3 rounded-xl">
          &quot;All hope lies in Doom.&quot; — Victor Von Doom strikes the Multiverse on <span className="text-neo-yellow underline font-black">December 18, 2026</span>.
        </p>
      </div>
    </motion.div>
  );
}
