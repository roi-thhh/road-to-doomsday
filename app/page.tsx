'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  MCUItem, 
  WatchStatus, 
  RoleSelection as RoleType, 
  TimelineOrder, 
  ScopeMode, 
  UserProfile 
} from '@/lib/types';
import { 
  getStoredUserProfile, 
  setStoredUserProfile, 
  getStoredUserProgress, 
  setStoredUserProgress, 
  getStoredPartnerProgress, 
  setStoredPartnerProgress 
} from '@/lib/storage';
import LoaderScreen from '@/components/LoaderScreen';
import RoleSelection from '@/components/RoleSelection';
import AuthModal from '@/components/AuthModal';
import StickyControlBar from '@/components/StickyControlBar';
import TimelineTraverse from '@/components/TimelineTraverse';
import MovieModal from '@/components/MovieModal';
import DoomsdayCard from '@/components/DoomsdayCard';
import { 
  fetchDbUserProgress, 
  fetchDbPartnerProgress, 
  saveDbUserProgress, 
  isSupabaseConfigured 
} from '@/lib/supabase';
import { SERIES_ROAD_ROWS, MOVIE_ROAD_ROWS } from '@/lib/mcuData';

export default function Home() {
  // App Phase State: 'loader' -> 'onboarding' -> 'dashboard'
  const [appPhase, setAppPhase] = useState<'loader' | 'onboarding' | 'dashboard'>('loader');
  
  // User Profile & Partner State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<RoleType | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Watch Progress State
  const [userProgress, setUserProgress] = useState<Record<string, WatchStatus>>({});
  const [partnerProgress, setPartnerProgress] = useState<Record<string, WatchStatus>>({});

  // Control Bar Toggles
  const [order, setOrder] = useState<TimelineOrder>('chronological');
  const [scope, setScope] = useState<ScopeMode>('essential');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPhase, setFilterPhase] = useState<number | null>(null);

  // Modal State
  const [selectedMovie, setSelectedMovie] = useState<MCUItem | null>(null);

  // Initial Data Load & Supabase Backend Sync
  useEffect(() => {
    async function loadBackendData() {
      const profile = getStoredUserProfile();
      if (profile) {
        setUserProfile(profile);
        setUserRole(profile.roleSelection);

        // Fetch user progress from Supabase
        const dbProgress = await fetchDbUserProgress(profile.id);
        if (Object.keys(dbProgress).length > 0) {
          setUserProgress(dbProgress);
          setStoredUserProgress(dbProgress);
        } else {
          setUserProgress(getStoredUserProgress());
        }

        // Fetch partner progress from Supabase if linked
        if (profile.partnerId) {
          const dbPartnerProgress = await fetchDbPartnerProgress(profile.partnerId);
          if (Object.keys(dbPartnerProgress).length > 0) {
            setPartnerProgress(dbPartnerProgress);
            setStoredPartnerProgress(dbPartnerProgress);
          } else {
            setPartnerProgress(getStoredPartnerProgress());
          }
        }
      } else {
        setUserProgress(getStoredUserProgress());
        setPartnerProgress(getStoredPartnerProgress());
      }
    }
    loadBackendData();
  }, []);

  // Handle Loader Finish
  const handleLoaderComplete = () => {
    if (userRole) {
      setAppPhase('dashboard');
    } else {
      setAppPhase('onboarding');
    }
  };

  // Handle Role Selection
  const handleSelectRole = (role: RoleType) => {
    setUserRole(role);
    setAppPhase('dashboard');
    setIsAuthModalOpen(true);
  };

  // Handle Auth complete
  const handleAuthenticate = async (profile: UserProfile) => {
    setUserProfile(profile);
    setUserRole(profile.roleSelection);
    setStoredUserProfile(profile);
    setIsAuthModalOpen(false);

    // Fetch user and partner progress from backend
    const dbProgress = await fetchDbUserProgress(profile.id);
    if (Object.keys(dbProgress).length > 0) {
      setUserProgress(dbProgress);
      setStoredUserProgress(dbProgress);
    }

    if (profile.partnerId) {
      const dbPartnerProgress = await fetchDbPartnerProgress(profile.partnerId);
      if (Object.keys(dbPartnerProgress).length > 0) {
        setPartnerProgress(dbPartnerProgress);
        setStoredPartnerProgress(dbPartnerProgress);
      }
    }
  };

  // Handle Watch Status Toggle for a movie (Saves to both Supabase and Local Storage)
  const handleToggleStatus = async (movieId: string, status: WatchStatus, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = { ...userProgress, [movieId]: status };
    setUserProgress(updated);
    setStoredUserProgress(updated);

    // Persist to Supabase real database if user is logged in
    if (userProfile?.id) {
      await saveDbUserProgress(userProfile.id, movieId, status);
    }
  };

  // Handle Partner Progress Refresh / Simulation
  const handleSimulatePartnerProgress = async () => {
    if (userProfile?.partnerId && isSupabaseConfigured()) {
      const dbPartnerProgress = await fetchDbPartnerProgress(userProfile.partnerId);
      if (Object.keys(dbPartnerProgress).length > 0) {
        setPartnerProgress(dbPartnerProgress);
        setStoredPartnerProgress(dbPartnerProgress);
        return;
      }
    }

    // Secondary fallback simulation
    const allIds = [
      ...SERIES_ROAD_ROWS.flat().map((i) => i.id),
      ...MOVIE_ROAD_ROWS.flat().map((i) => i.id),
    ];
    const newPartner: Record<string, WatchStatus> = {};
    allIds.forEach((id) => {
      const rand = Math.random();
      if (rand > 0.6) newPartner[id] = 'watched';
      else if (rand > 0.4) newPartner[id] = 'watching';
      else newPartner[id] = 'unwatched';
    });
    setPartnerProgress(newPartner);
    setStoredPartnerProgress(newPartner);
  };

  // Compute total items count depending on scope
  const totalCount = scope === 'essential'
    ? [...SERIES_ROAD_ROWS.flat(), ...MOVIE_ROAD_ROWS.flat()].filter((i) => i.isEssential).length
    : [...SERIES_ROAD_ROWS.flat(), ...MOVIE_ROAD_ROWS.flat()].length;

  return (
    <main className="min-h-screen bg-neo-dark text-black font-sans selection:bg-neo-yellow selection:text-black">
      <AnimatePresence mode="wait">
        {/* Phase A: Loader Screen */}
        {appPhase === 'loader' && (
          <LoaderScreen key="loader" onComplete={handleLoaderComplete} />
        )}

        {/* Phase A: Role Selection Onboarding */}
        {appPhase === 'onboarding' && (
          <RoleSelection key="onboarding" onSelectRole={handleSelectRole} />
        )}

        {/* Phase C: Main Dashboard & Serpentine Timeline */}
        {appPhase === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col min-h-screen"
          >
            {/* Sticky Top Control Bar */}
            <StickyControlBar
              order={order}
              setOrder={setOrder}
              scope={scope}
              setScope={setScope}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterPhase={filterPhase}
              setFilterPhase={setFilterPhase}
              userProgress={userProgress}
              partnerProgress={partnerProgress}
              totalCount={totalCount}
              userProfile={userProfile}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onLogout={() => {
                setUserProfile(null);
                localStorage.clear();
                setAppPhase('onboarding');
              }}
              onSimulatePartnerClick={handleSimulatePartnerProgress}
            />

            {/* Serpentine Timeline Tree */}
            <TimelineTraverse
              order={order}
              scope={scope}
              searchQuery={searchQuery}
              userProgress={userProgress}
              partnerProgress={partnerProgress}
              onSelectMovie={(item) => setSelectedMovie(item)}
              onToggleStatus={(movieId, status, e) => handleToggleStatus(movieId, status, e)}
            />

            {/* Final Convergence Node: Avengers Doomsday Card */}
            <DoomsdayCard />

            {/* Footer */}
            <footer className="bg-black text-white border-t-8 border-black p-8 text-center font-sans">
              <div className="max-w-4xl mx-auto flex flex-col items-center gap-2">
                <span className="bg-neo-yellow text-black font-black text-xs px-3 py-1 rounded-full uppercase border-2 border-white shadow-brutal-sm">
                  COUPLING MULTIVERSE ENGINE ⚡
                </span>
                <p className="font-bold text-sm text-gray-300">
                  Built for couples to conquer the Marvel Cinematic Universe before <span className="text-neo-yellow font-black">Avengers: Doomsday</span>.
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  © 2026 Road to Doomsday. Neo-Brutalist MCU Sync UI.
                </p>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth & Partner Sync Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        role={userRole}
        onAuthenticate={handleAuthenticate}
      />

      {/* Movie Details Modal */}
      <MovieModal
        item={selectedMovie}
        userStatus={selectedMovie ? userProgress[selectedMovie.id] || 'unwatched' : 'unwatched'}
        partnerStatus={selectedMovie ? partnerProgress[selectedMovie.id] || 'unwatched' : 'unwatched'}
        onClose={() => setSelectedMovie(null)}
        onUpdateStatus={(status) => {
          if (selectedMovie) {
            handleToggleStatus(selectedMovie.id, status);
          }
        }}
      />
    </main>
  );
}
