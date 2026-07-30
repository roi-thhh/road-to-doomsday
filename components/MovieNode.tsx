'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MCUItem, WatchStatus } from '@/lib/types';
import { Check, Eye, Flame, Heart, Sparkles, Star } from 'lucide-react';

interface MovieNodeProps {
  item: MCUItem;
  userStatus: WatchStatus;
  partnerStatus?: WatchStatus;
  onClick: () => void;
  onToggleStatus: (status: WatchStatus, e: React.MouseEvent) => void;
}

export default function MovieNode({
  item,
  userStatus,
  partnerStatus,
  onClick,
  onToggleStatus,
}: MovieNodeProps) {
  const isWatched = userStatus === 'watched';
  const isWatching = userStatus === 'watching';
  const isPartnerWatched = partnerStatus === 'watched';

  // Node background styling based on status
  let nodeBg = 'bg-white text-black';
  if (isWatched) nodeBg = 'bg-neo-yellow text-black border-black';
  else if (isWatching) nodeBg = 'bg-neo-blue text-white border-black';

  return (
    <div className="relative group flex flex-col items-center">
      {/* Essential Doomsday Tag */}
      {item.isEssential && (
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -top-4 z-20 bg-neo-red text-white px-2 py-0.5 rounded-full border-2 border-black font-black text-[9px] uppercase tracking-wider shadow-brutal-sm flex items-center gap-1"
        >
          <Flame className="w-3 h-3 fill-current" /> DOOMSDAY PREP
        </motion.div>
      )}

      {/* Partner Completion Ring & Avatar Badge */}
      {isPartnerWatched && (
        <div className="absolute -top-2 -right-2 z-30 bg-neo-pink text-white border-2 border-black rounded-full p-1 shadow-brutal-sm flex items-center justify-center" title="Partner completed this!">
          <Heart className="w-3.5 h-3.5 fill-current animate-pulse" />
        </div>
      )}

      {/* Main Circular Node Container */}
      <motion.div
        whileHover={{ scale: 1.08, rotate: 2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`relative z-10 flex flex-col items-center justify-between p-3 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full border-4 border-black text-center cursor-pointer transition-all duration-300 ${nodeBg} shadow-brutal hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-cover bg-center`}
        style={item.posterUrl ? { backgroundImage: `url(${item.posterUrl})` } : {}}
      >
        {/* Gradient Overlay for Text */}
        {item.posterUrl && (
          <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-neo-yellow from-[35%] via-neo-yellow/80 to-transparent z-0"></div>
        )}

        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between w-full px-2 pt-1 text-[9px] font-black">
          <span className="bg-black text-white px-1.5 py-0.5 rounded border border-black uppercase">
            P{item.phase}
          </span>
          <div className="flex items-center gap-0.5 bg-white px-1.5 py-0.5 rounded border border-black text-black">
            <Star className="w-3 h-3 fill-neo-yellow text-black" />
            <span>{item.imdbRating}</span>
          </div>
        </div>

        {/* Title */}
        <div className={`relative z-10 font-black uppercase leading-tight px-1 font-display w-full ${item.posterUrl ? 'mt-auto pb-5 text-[9px] sm:text-[10px] md:text-[11px] tracking-tight text-black drop-shadow-[1px_1px_0_rgba(255,255,255,0.8)]' : 'text-[10px] sm:text-[11px] md:text-[12px] my-auto'}`}>
          <span className="line-clamp-2">{item.title}</span>
        </div>

        {/* Release Date / Media tag (Only if no poster) */}
        {!item.posterUrl && (
          <span className="relative z-10 text-[8px] md:text-[9px] font-bold opacity-80 uppercase pb-1">
            {item.releaseDate.split(',')[1] || item.releaseDate}
          </span>
        )}

        {/* Status Indicator Bar at bottom of circle */}
        {isWatched && (
          <div className="absolute bottom-1 z-10 bg-black text-neo-yellow px-2 py-0.5 rounded-full border border-black text-[8px] font-black uppercase flex items-center gap-1">
            <Check className="w-2.5 h-2.5" /> WATCHED
          </div>
        )}
        {isWatching && (
          <div className="absolute bottom-1 z-10 bg-neo-yellow text-black px-2 py-0.5 rounded-full border border-black text-[8px] font-black uppercase flex items-center gap-1 animate-pulse">
            <Eye className="w-2.5 h-2.5" /> WATCHING
          </div>
        )}
      </motion.div>

      {/* Quick Action Icon Buttons Next to Node */}
      <div className="flex items-center gap-2 mt-2 z-20">
        <button
          onClick={(e) => onToggleStatus(isWatched ? 'unwatched' : 'watched', e)}
          className={`px-2 py-1 rounded-md border-2 border-black font-black text-[10px] uppercase flex items-center gap-1 shadow-brutal-sm transition-transform active:scale-90 ${
            isWatched
              ? 'bg-neo-green text-black'
              : 'bg-white text-black hover:bg-neo-yellow'
          }`}
          title="Mark Watched"
        >
          <Check className="w-3 h-3" /> {isWatched ? 'DONE' : 'WATCH'}
        </button>

        <button
          onClick={(e) => onToggleStatus(isWatching ? 'unwatched' : 'watching', e)}
          className={`px-2 py-1 rounded-md border-2 border-black font-black text-[10px] uppercase flex items-center gap-1 shadow-brutal-sm transition-transform active:scale-90 ${
            isWatching
              ? 'bg-neo-blue text-white'
              : 'bg-white text-black hover:bg-neo-blue hover:text-white'
          }`}
          title="Mark Currently Watching"
        >
          <Eye className="w-3 h-3" /> {isWatching ? 'ACTIVE' : 'NEXT'}
        </button>
      </div>
    </div>
  );
}
