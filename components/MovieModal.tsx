'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MCUItem, WatchStatus } from '@/lib/types';
import { 
  X, 
  Star, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Eye, 
  Flame, 
  Skull, 
  Heart, 
  Sparkles, 
  ExternalLink 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MovieModalProps {
  item: MCUItem | null;
  userStatus: WatchStatus;
  partnerStatus?: WatchStatus;
  onClose: () => void;
  onUpdateStatus: (status: WatchStatus) => void;
}

export default function MovieModal({
  item,
  userStatus,
  partnerStatus,
  onClose,
  onUpdateStatus,
}: MovieModalProps) {
  if (!item) return null;

  const handleSetWatched = () => {
    const newStatus = userStatus === 'watched' ? 'unwatched' : 'watched';
    if (newStatus === 'watched') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FACC15', '#EF4444', '#22C55E', '#3B82F6'],
      });
    }
    onUpdateStatus(newStatus);
  };

  const handleSetWatching = () => {
    onUpdateStatus(userStatus === 'watching' ? 'unwatched' : 'watching');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white text-black border-8 border-black rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-brutal-lg font-sans overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Top Decorative Header Accent */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-neo-yellow border-b-4 border-black" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 bg-black text-white p-2 border-2 border-black rounded-xl hover:bg-neo-red hover:text-white transition-colors z-20"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Doomsday Essential Flag */}
          {item.isEssential && (
            <div className="inline-flex items-center gap-1.5 bg-neo-red text-white px-3 py-1 rounded-full border-2 border-black font-black text-xs uppercase shadow-brutal-sm mb-4 mt-2">
              <Flame className="w-4 h-4 fill-current animate-bounce" /> AVENGERS: DOOMSDAY ESSENTIAL PREP
            </div>
          )}

          {/* Title & Metadata */}
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none mb-3 font-display">
            {item.title}
          </h2>

          <div className="flex flex-wrap items-center gap-3 mb-6 font-bold text-xs">
            <span className="bg-black text-neo-yellow px-2.5 py-1 rounded-md border-2 border-black uppercase">
              Phase {item.phase}
            </span>
            <span className="bg-neo-yellow text-black px-2.5 py-1 rounded-md border-2 border-black flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-black" /> {item.imdbRating} / 10
            </span>
            <span className="bg-gray-100 text-black px-2.5 py-1 rounded-md border-2 border-black flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {item.releaseDate}
            </span>
            <span className="bg-gray-100 text-black px-2.5 py-1 rounded-md border-2 border-black flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {item.runtime}
            </span>
          </div>

          {/* Summary */}
          <div className="mb-6 bg-gray-50 border-4 border-black p-4 rounded-xl shadow-brutal-sm">
            <h3 className="text-xs font-black uppercase text-black/70 mb-1">SYNOPSIS</h3>
            <p className="text-sm font-medium leading-relaxed">{item.summary}</p>
          </div>

          {/* DOCTOR DOOM / MULTIVERSE SIGNIFICANCE CARD */}
          <div className="mb-6 bg-neo-yellow border-4 border-black p-4 rounded-xl shadow-brutal-sm relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-neo-red text-white border-2 border-black rounded-md flex items-center justify-center font-black">
                <Skull className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-tight">
                DOCTOR DOOM & MULTIVERSE CONNECTION
              </h3>
            </div>
            <p className="text-xs font-bold text-black leading-relaxed">
              {item.multiverseNote}
            </p>
          </div>

          {/* Partner Watch Status Banner */}
          {partnerStatus === 'watched' && (
            <div className="mb-6 bg-neo-pink text-black border-4 border-black p-3 rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-brutal-sm">
              <Heart className="w-5 h-5 fill-black shrink-0 animate-pulse" />
              <span>YOUR LINKED PARTNER HAS COMPLETED THIS MOVIE! ⚡</span>
            </div>
          )}

          {/* Action Tracking Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={handleSetWatched}
              className={`py-3.5 px-4 rounded-xl border-4 border-black font-black uppercase text-sm flex items-center justify-center gap-2 shadow-brutal cursor-pointer transition-all ${
                userStatus === 'watched'
                  ? 'bg-neo-green text-black scale-105'
                  : 'bg-white text-black hover:bg-neo-yellow'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{userStatus === 'watched' ? '[✓] WATCHED' : '[ ] WATCHED'}</span>
            </button>

            <button
              onClick={handleSetWatching}
              className={`py-3.5 px-4 rounded-xl border-4 border-black font-black uppercase text-sm flex items-center justify-center gap-2 shadow-brutal cursor-pointer transition-all ${
                userStatus === 'watching'
                  ? 'bg-neo-blue text-white scale-105'
                  : 'bg-white text-black hover:bg-neo-blue hover:text-white'
              }`}
            >
              <Eye className="w-5 h-5" />
              <span>{userStatus === 'watching' ? '[✓] WATCHING' : '[ ] WATCHING'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
