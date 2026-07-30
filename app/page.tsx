'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  MCUItem, 
  WatchStatus, 
  RoleSelection as RoleType, 
  TimelineOrder, 
  ScopeMode, 
  UserProfile,
  PartnerRequest
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
  supabase,
  fetchDbUserProfile,
  fetchDbUserProgress, 
  fetchDbPartnerProgress, 
  saveDbUserProgress, 
  isSupabaseConfigured,
  fetchPendingPartnerRequests
} from '@/lib/supabase';
import { SERIES_ROAD_ROWS, MOVIE_ROAD_ROWS } from '@/lib/mcuData';

export default function Home() {
  // App Phase State: 'loader' -> 'onboarding' -> 'dashboard'
  const [appPhase, setAppPhase] = useState<'loader' | 'onboarding' | 'dashboard'>('loader');
  const [hasSessionLoaded, setHasSessionLoaded] = useState(false);
  const [hasVisualLoaderFinished, setHasVisualLoaderFinished] = useState(false);

  // User Profile & Partner State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<RoleType | null>(null);

  useEffect(() => {
    if (hasSessionLoaded && hasVisualLoaderFinished) {
      if (userRole || userProfile) {
        setAppPhase('dashboard');
      } else {
        setAppPhase('onboarding');
      }
    }
  }, [hasSessionLoaded, hasVisualLoaderFinished, userRole, userProfile]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'partner'>('signin');
  const [pendingRequests, setPendingRequests] = useState<PartnerRequest[]>([]);

  // Watch Progress State (Starts clean and empty for new accounts)
  const [userProgress, setUserProgress] = useState<Record<string, WatchStatus>>({});
  const [partnerProgress, setPartnerProgress] = useState<Record<string, WatchStatus>>({});

  // Control Bar Toggles
  const [order, setOrder] = useState<TimelineOrder>('chronological');
  const [scope, setScope] = useState<ScopeMode>('essential');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPhase, setFilterPhase] = useState<number | null>(null);

  // Modal State
  const [selectedMovie, setSelectedMovie] = useState<MCUItem | null>(null);

  // -----------------------------------------------------------
  // 1. PERSISTENT SESSION LISTENER (Keeps user signed in across refresh)
  // -----------------------------------------------------------
  useEffect(() => {
    async function initSession() {
      if (!isSupabaseConfigured()) {
        const stored = getStoredUserProfile();
        if (stored) {
          setUserProfile(stored);
          setUserRole(stored.roleSelection);
        }
        setUserProgress(getStoredUserProgress());
        setPartnerProgress(getStoredPartnerProgress());
        setHasSessionLoaded(true);
        return;
      }

      // Restore session from Supabase Auth
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const dbProfile = await fetchDbUserProfile(session.user.id);
        const activeProfile: UserProfile = dbProfile || {
          id: session.user.id,
          email: session.user.email || '',
          roleSelection: getStoredUserProfile()?.roleSelection || null,
        };

        setUserProfile(activeProfile);
        setUserRole(activeProfile.roleSelection);
        setStoredUserProfile(activeProfile);

        // Load progress for user
        const dbProg = await fetchDbUserProgress(session.user.id);
        setUserProgress(dbProg);
        setStoredUserProgress(dbProg);

        // Load progress for partner if linked
        if (activeProfile.partnerId || activeProfile.partnerEmail) {
          const target = activeProfile.partnerId || activeProfile.partnerEmail || '';
          const partnerProg = await fetchDbPartnerProgress(target);
          setPartnerProgress(partnerProg);
          setStoredPartnerProgress(partnerProg);
        }

        // Fetch pending requests
        if (activeProfile.email) {
          const reqs = await fetchPendingPartnerRequests(activeProfile.email);
          setPendingRequests(reqs);
        }
      } else {
        const stored = getStoredUserProfile();
        if (stored) {
          setUserProfile(stored);
          setUserRole(stored.roleSelection);
          setUserProgress(getStoredUserProgress());
          setPartnerProgress(getStoredPartnerProgress());
        }
      }
      setHasSessionLoaded(true);
    }

    initSession();

    // Listen for Auth Changes (Sign in, Sign out, Session Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const dbProfile = await fetchDbUserProfile(session.user.id);
        if (dbProfile) {
          setUserProfile(dbProfile);
          setUserRole(dbProfile.roleSelection);
          setStoredUserProfile(dbProfile);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // -----------------------------------------------------------
  // 2. REAL-TIME LIVE WATCH PROGRESS SUBSCRIPTION & AUTO-SYNC
  // -----------------------------------------------------------
  useEffect(() => {
    if (!isSupabaseConfigured() || (!userProfile?.partnerId && !userProfile?.partnerEmail)) return;

    const partnerTarget = userProfile?.partnerId || userProfile?.partnerEmail || '';

    // Interval sync (5s) for live progress overlay updates across devices
    const interval = setInterval(async () => {
      if (partnerTarget) {
        const partnerProg = await fetchDbPartnerProgress(partnerTarget);
        setPartnerProgress(partnerProg);
        setStoredPartnerProgress(partnerProg);
      }
      if (userProfile?.email) {
        const reqs = await fetchPendingPartnerRequests(userProfile.email);
        setPendingRequests(reqs);
      }
    }, 5000);

    // Supabase Realtime channel subscription
    const channel = supabase
      .channel('public:user_progress')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_progress' },
        async (payload) => {
          if (partnerTarget) {
            const updated = await fetchDbPartnerProgress(partnerTarget);
            setPartnerProgress(updated);
            setStoredPartnerProgress(updated);
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [userProfile?.partnerId, userProfile?.partnerEmail, userProfile?.email]);

  // Handle Loader Finish
  const handleLoaderComplete = () => {
    setHasVisualLoaderFinished(true);
  };

  // Handle Role Selection
  const handleSelectRole = (role: RoleType) => {
    setUserRole(role);
    setAppPhase('dashboard');
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  // Handle Auth complete
  const handleAuthenticate = async (profile: UserProfile) => {
    setUserProfile(profile);
    setUserRole(profile.roleSelection);
    setStoredUserProfile(profile);
    setIsAuthModalOpen(false);

    // Fetch user progress from backend
    if (profile.id) {
      const dbProgress = await fetchDbUserProgress(profile.id);
      setUserProgress(dbProgress);
      setStoredUserProgress(dbProgress);
    }

    // Fetch partner progress from backend if linked
    if (profile.partnerId || profile.partnerEmail) {
      const target = profile.partnerId || profile.partnerEmail || '';
      const dbPartnerProgress = await fetchDbPartnerProgress(target);
      setPartnerProgress(dbPartnerProgress);
      setStoredPartnerProgress(dbPartnerProgress);
    }
  };

  // Handle Partner Linking/Accepting
  const handlePartnerLinked = async (partnerIdOrEmail: string) => {
    if (!partnerIdOrEmail.trim()) return;

    if (userProfile?.id && isSupabaseConfigured()) {
      const updatedProfile = await fetchDbUserProfile(userProfile.id);
      if (updatedProfile) {
        setUserProfile(updatedProfile);
        setStoredUserProfile(updatedProfile);
      }
    }

    const dbPartnerProgress = await fetchDbPartnerProgress(partnerIdOrEmail.trim());
    setPartnerProgress(dbPartnerProgress);
    setStoredPartnerProgress(dbPartnerProgress);
  };

  // Handle Partner Unlinking
  const handlePartnerUnlinked = () => {
    if (userProfile) {
      const updated: UserProfile = { ...userProfile, partnerId: undefined, partnerEmail: undefined };
      setUserProfile(updated);
      setStoredUserProfile(updated);
    }
    setPartnerProgress({});
    setStoredPartnerProgress({});
  };

  // Handle Watch Status Toggle for a movie (Saves to Supabase & LocalStorage)
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

  // Explicit User Logout
  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUserProfile(null);
    setUserRole(null);
    setUserProgress({});
    setPartnerProgress({});
    localStorage.clear();
    setAppPhase('onboarding');
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
              onOpenAuth={(mode = 'signin') => {
                setAuthModalMode(mode);
                setIsAuthModalOpen(true);
              }}
              onLogout={handleLogout}
              onRefreshPartnerProgress={async () => {
                if (userProfile?.partnerId || userProfile?.partnerEmail) {
                  const target = userProfile.partnerId || userProfile.partnerEmail || '';
                  const updated = await fetchDbPartnerProgress(target);
                  setPartnerProgress(updated);
                }
              }}
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
        currentUserProfile={userProfile}
        initialMode={authModalMode}
        onAuthenticate={handleAuthenticate}
        onPartnerLinked={handlePartnerLinked}
        onPartnerUnlinked={handlePartnerUnlinked}
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

      {/* Footer Section */}
      <footer className="bg-black text-white py-16 border-t-8 border-neo-red relative flex flex-col items-center justify-center gap-6 z-10 text-center px-4 mt-20">
        <a 
          href="https://www.instagram.com/roith.hhh?igsh=MWdmNHk2NXpmNjZ6Mg==" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:scale-110 transition-transform cursor-pointer shadow-[8px_8px_0px_0px_rgba(250,204,21,1)] rounded-2xl overflow-hidden bg-white border-4 border-neo-yellow p-3 flex items-center justify-center w-40 h-40"
          title="Follow Rohith Das on Instagram"
        >
          <img src="/logo.png" alt="Rohith Das Logo" className="w-full h-full object-contain" />
        </a>
        <div className="flex flex-col gap-1">
          <p className="font-display font-black tracking-widest text-neo-yellow text-lg uppercase drop-shadow-[2px_2px_0_rgba(239,68,68,1)]">
            CREATED BY ROHITH DAS
          </p>
          <p className="font-bold text-xs text-white/70 max-w-sm mx-auto">
            The Ultimate MCU Watch Tracker for the Road to Doomsday.
          </p>
        </div>
      </footer>
    </main>
  );
}
