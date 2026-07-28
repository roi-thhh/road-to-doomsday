'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RoleSelection as RoleType } from '@/lib/types';
import { Shield, Heart, Crown, Sparkles, ArrowRight } from 'lucide-react';

interface RoleSelectionProps {
  onSelectRole: (role: RoleType) => void;
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  const roles = [
    {
      id: 'boy_friend' as RoleType,
      title: 'BOYFRIEND',
      subtitle: 'The Dedicated Timeline Guardian 🛡️',
      badge: 'PLAYER 1',
      bgColor: 'bg-neo-blue',
      textColor: 'text-white',
      accentColor: 'bg-neo-yellow text-black',
      icon: Shield,
      desc: 'Track every phase, enforce spoiler protection, and keep watch order strict.',
    },
    {
      id: 'girl_friend' as RoleType,
      title: 'GIRLFRIEND',
      subtitle: 'The Cosmic Mastermind ⚡',
      badge: 'PLAYER 2',
      bgColor: 'bg-neo-pink',
      textColor: 'text-black',
      accentColor: 'bg-black text-white',
      icon: Heart,
      desc: 'Rating lore theories, picking popcorn snacks, and leading the multiverse hype.',
    },
    {
      id: 'alpha_male' as RoleType,
      title: 'ALPHAMALE',
      subtitle: 'The Multiversal Lone Conqueror 🗿',
      badge: 'SOLO / LEADER',
      bgColor: 'bg-neo-yellow',
      textColor: 'text-black',
      accentColor: 'bg-neo-red text-white',
      icon: Crown,
      desc: 'Completionist speedrun, zero skips, direct path to Victor Von Doom.',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-neo-dark text-white flex flex-col items-center justify-center p-6 md:p-12 font-sans relative overflow-hidden"
    >
      {/* Neo-brutalist Background accents */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-neo-yellow/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-neo-red/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-2xl mb-12 relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center gap-2 bg-neo-yellow text-black px-4 py-1.5 rounded-full border-4 border-black font-black uppercase text-xs shadow-brutal mb-4"
        >
          <Sparkles className="w-4 h-4" /> STEP 1: CHOOSE YOUR ROLE
        </motion.div>
        
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none mb-4 font-display">
          WHO IS WATCHING?
        </h1>
        <p className="text-gray-300 font-medium text-lg max-w-lg mx-auto">
          Select your watch identity to synchronize your MCU timeline progress with your partner before <span className="text-neo-yellow font-bold uppercase underline">Avengers: Doomsday</span>.
        </p>
      </div>

      {/* 3 Massive Brutalist Role Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl relative z-10">
        {roles.map((role, idx) => {
          const IconComp = role.icon;
          return (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * (idx + 1), duration: 0.4 }}
              whileHover={{ scale: 1.03, y: -6 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectRole(role.id)}
              className={`relative flex flex-col justify-between p-8 rounded-2xl border-8 border-black text-left cursor-pointer ${role.bgColor} ${role.textColor} shadow-brutal-lg hover:shadow-[14px_14px_0px_0px_rgba(255,255,255,1)] transition-all group`}
            >
              {/* Top Badge */}
              <div className="flex justify-between items-start mb-6">
                <span className={`px-3 py-1 font-black text-xs uppercase border-2 border-black rounded-md ${role.accentColor}`}>
                  {role.badge}
                </span>
                <div className="w-14 h-14 bg-black text-white border-4 border-white rounded-full flex items-center justify-center shadow-brutal group-hover:rotate-12 transition-transform">
                  <IconComp className="w-7 h-7" />
                </div>
              </div>

              {/* Title & Details */}
              <div className="my-4">
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-none mb-2 font-display">
                  {role.title}
                </h2>
                <p className="text-sm font-bold opacity-90 mb-3">
                  {role.subtitle}
                </p>
                <p className="text-xs opacity-80 leading-relaxed font-normal">
                  {role.desc}
                </p>
              </div>

              {/* Action Prompt */}
              <div className="pt-4 border-t-4 border-black/20 flex items-center justify-between font-black text-sm uppercase">
                <span>SELECT ROLE</span>
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center group-hover:translate-x-2 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
