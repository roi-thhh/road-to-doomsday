'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TimelineOrder, ScopeMode, WatchStatus, UserProfile } from '@/lib/types';
import { 
  Flame, 
  Sparkles, 
  Layers, 
  Search, 
  Copy, 
  Check, 
  UserCheck, 
  Eye, 
  Zap, 
  Heart,
  Filter,
  RefreshCw,
  LogOut
} from 'lucide-react';

interface StickyControlBarProps {
  order: TimelineOrder;
  setOrder: (order: TimelineOrder) => void;
  scope: ScopeMode;
  setScope: (scope: ScopeMode) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterPhase: number | null;
  setFilterPhase: (phase: number | null) => void;
  userProgress: Record<string, WatchStatus>;
  partnerProgress: Record<string, WatchStatus>;
  totalCount: number;
  userProfile: UserProfile | null;
  onOpenAuth: (mode?: 'signin' | 'signup' | 'partner') => void;
  onLogout: () => void;
  onRefreshPartnerProgress: () => void;
}

export default function StickyControlBar({
  order,
  setOrder,
  scope,
  setScope,
  searchQuery,
  setSearchQuery,
  filterPhase,
  setFilterPhase,
  userProgress,
  partnerProgress,
  totalCount,
  userProfile,
  onOpenAuth,
  onLogout,
  onRefreshPartnerProgress,
}: StickyControlBarProps) {
  const [copied, setCopied] = useState(false);

  // Compute watch stats
  const watchedUser = Object.values(userProgress).filter((s) => s === 'watched').length;
  const watchedPartner = Object.values(partnerProgress).filter((s) => s === 'watched').length;
  const userPercent = totalCount > 0 ? Math.round((watchedUser / totalCount) * 100) : 0;
  const partnerPercent = totalCount > 0 ? Math.round((watchedPartner / totalCount) * 100) : 0;

  const handleCopyId = () => {
    if (userProfile?.id) {
      navigator.clipboard.writeText(userProfile.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-neo-yellow text-black border-b-8 border-black shadow-brutal p-4 font-sans">
      <div className="max-w-7xl mx-auto flex items-center gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-1 lg:pb-0">
        
        {/* Brand & Doomsday Countdown Pill */}
        <div className="flex flex-row items-center gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-neo-red text-white border-4 border-black rounded-lg flex items-center justify-center font-black shadow-brutal-sm">
              ⚡
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none font-display">
                ROAD TO DOOMSDAY
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/80">
                Avengers Watch Sync 2026
              </p>
            </div>
          </div>

          {/* User Profile / Auth & Partner Link Pill */}
          <div className="flex items-center gap-2">
            {userProfile ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyId}
                  className="bg-white text-black px-2.5 py-1 border-2 border-black rounded-md font-black text-xs uppercase flex items-center gap-1 shadow-brutal-sm hover:bg-black hover:text-white transition-colors cursor-pointer"
                  title="Click to copy your User Sync ID for your partner"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-neo-green" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{userProfile.id.slice(0, 8)}</span>
                </button>
                <button
                  onClick={() => onOpenAuth('partner')}
                  className="bg-neo-pink text-black px-2.5 py-1 border-2 border-black rounded-md font-black text-xs uppercase flex items-center gap-1 shadow-brutal-sm hover:bg-black hover:text-white transition-colors cursor-pointer"
                  title="Link or update your partner ID"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>PARTNER</span>
                </button>
                <button
                  onClick={onLogout}
                  className="bg-neo-red text-white p-1.5 border-2 border-black rounded-md hover:bg-black transition-colors cursor-pointer"
                  title="Log Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth('signin')}
                className="bg-black text-neo-yellow px-3 py-1.5 border-2 border-black rounded-lg font-black text-xs uppercase flex items-center gap-1.5 shadow-brutal-sm hover:bg-neo-red hover:text-white transition-all cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>LOG IN / LINK PARTNER</span>
              </button>
            )}
          </div>
        </div>

        {/* Toggles: Order & Scope */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Order Toggle: Chronological vs Release */}
          <div className="bg-black text-white p-1 rounded-xl border-4 border-black flex items-center shadow-brutal-sm">
            <button
              onClick={() => setOrder('chronological')}
              className={`px-3 py-1.5 rounded-lg font-black text-[10px] sm:text-xs uppercase transition-all cursor-pointer ${
                order === 'chronological'
                  ? 'bg-neo-yellow text-black shadow-brutal-sm scale-105'
                  : 'hover:text-neo-yellow'
              }`}
            >
              📅 CHRONOLOGICAL
            </button>
            <button
              onClick={() => setOrder('release')}
              className={`px-3 py-1.5 rounded-lg font-black text-[10px] sm:text-xs uppercase transition-all cursor-pointer ${
                order === 'release'
                  ? 'bg-neo-yellow text-black shadow-brutal-sm scale-105'
                  : 'hover:text-neo-yellow'
              }`}
            >
              🎬 RELEASE ORDER
            </button>
          </div>

          {/* Scope Toggle: Essential vs Completionist */}
          <div className="bg-black text-white p-1 rounded-xl border-4 border-black flex items-center shadow-brutal-sm">
            <button
              onClick={() => setScope('essential')}
              className={`px-3 py-1.5 rounded-lg font-black text-[10px] sm:text-xs uppercase transition-all flex items-center gap-1 cursor-pointer ${
                scope === 'essential'
                  ? 'bg-neo-red text-white shadow-brutal-sm scale-105'
                  : 'hover:text-neo-red'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" /> DOOMSDAY ESSENTIALS
            </button>
            <button
              onClick={() => setScope('completionist')}
              className={`px-3 py-1.5 rounded-lg font-black text-[10px] sm:text-xs uppercase transition-all flex items-center gap-1 cursor-pointer ${
                scope === 'completionist'
                  ? 'bg-neo-blue text-white shadow-brutal-sm scale-105'
                  : 'hover:text-neo-blue'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> 100% COMPLETIONIST
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-black/60" />
            <input
              type="text"
              placeholder="Search title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border-2 border-black rounded-lg text-xs font-bold w-36 focus:w-48 transition-all focus:outline-none shadow-brutal-sm"
            />
          </div>
        </div>

        {/* Watch Progress Counter & Partner Sync Indicator */}
        <div className="flex flex-row items-center gap-3 shrink-0">
          
          <div className="flex flex-row items-center gap-2">
            {/* User Stat Pill */}
            <div className="bg-white border-4 border-black p-2 rounded-xl flex items-center justify-between gap-3 shadow-brutal-sm flex-1">
              <div className="text-left">
                <span className="block text-[10px] font-black uppercase text-black/70 leading-tight">YOUR PROGRESS</span>
                <span className="font-black text-sm text-neo-red">{watchedUser} / {totalCount} ({userPercent}%)</span>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-black bg-neo-yellow flex items-center justify-center font-black text-xs shrink-0">
                ⚡
              </div>
            </div>

            {/* Partner Stat Pill */}
            <div className="bg-white border-4 border-black p-2 rounded-xl flex items-center justify-between gap-3 shadow-brutal-sm flex-1">
              <div className="text-left">
                <span className="block text-[10px] font-black uppercase text-black/70 leading-tight">PARTNER WATCHED</span>
                <span className="font-black text-sm text-neo-blue">{watchedPartner} / {totalCount} ({partnerPercent}%)</span>
              </div>
              <button
                onClick={() => onOpenAuth('partner')}
                className="w-8 h-8 rounded-full border-2 border-black bg-neo-pink text-white flex items-center justify-center font-black text-xs hover:scale-110 transition-transform cursor-pointer shrink-0"
                title="Click to link partner or sync partner timeline"
              >
                <Heart className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>

          {/* Instagram Logo Link */}
          <a 
            href="https://www.instagram.com/roith.hhh?igsh=MWdmNHk2NXpmNjZ6Mg==" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform cursor-pointer border-4 border-black bg-white flex items-center justify-center w-14 h-14 md:w-20 md:h-16 rounded-xl shadow-brutal-sm ml-2"
            title="Follow Rohith Das on Instagram"
          >
            <img src="/logo-black.png" alt="Rohith Das Logo" className="w-full h-full object-contain p-1" />
          </a>
        </div>

      </div>
    </header>
  );
}
