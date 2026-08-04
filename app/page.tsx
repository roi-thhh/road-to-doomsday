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
  const [order, setOrder] = useState<TimelineOrder>('release');
  const [scope, setScope] = useState<ScopeMode>('completionist');
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

            {/* SEO & Knowledge Hub: MCU Watch Guide & FAQ */}
            <section className="max-w-5xl mx-auto px-4 py-8 mt-12 border-t-8 border-black font-sans">
              <div className="bg-neo-yellow border-4 border-black p-6 sm:p-8 rounded-3xl shadow-brutal mb-8">
                <h2 className="font-display text-2xl sm:text-4xl font-black uppercase tracking-tight text-black flex items-center gap-3">
                  <span>📖</span> MCU Watch Order & Avengers: Doomsday Guide
                </h2>
                <p className="font-bold text-sm sm:text-base text-black/90 mt-2 max-w-3xl">
                  Preparing for Robert Downey Jr.’s return as Doctor Doom in <strong>Avengers: Doomsday (2026)</strong>? 
                  Here is everything you need to know about navigating the Marvel Cinematic Universe (MCU) chronological order, theatrical release order, and key multiverse essentials.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {/* FAQ Card 1 */}
                <article className="bg-white border-4 border-black p-6 rounded-2xl shadow-brutal flex flex-col gap-2">
                  <h3 className="font-display font-black text-lg sm:text-xl text-black">
                    ⚡ What is the best order to watch the MCU before Avengers: Doomsday?
                  </h3>
                  <p className="text-sm font-semibold text-gray-700 leading-relaxed">
                    You can track your rewatch using two proven methods on <strong>Road to Doomsday</strong>:
                    <br />• <strong>Theatrical Release Order:</strong> Best for experiencing how post-credits scenes and character arcs unfolded in cinemas worldwide.
                    <br />• <strong>Chronological Order:</strong> Best for following the in-universe timeline from <em>Captain America: The First Avenger</em> (1940s) through the Multiverse Saga.
                  </p>
                </article>

                {/* FAQ Card 2 */}
                <article className="bg-white border-4 border-black p-6 rounded-2xl shadow-brutal flex flex-col gap-2">
                  <h3 className="font-display font-black text-lg sm:text-xl text-black">
                    🔥 What are the "Doomsday Essentials"?
                  </h3>
                  <p className="text-sm font-semibold text-gray-700 leading-relaxed">
                    Short on time? Toggle the <strong>Doomsday Essentials</strong> filter to cut the fat and focus strictly on core Multiverse anchor projects: <em>Avengers: Endgame</em>, <em>Loki</em>, <em>Spider-Man: No Way Home</em>, <em>Doctor Strange in the Multiverse of Madness</em>, <em>Deadpool & Wolverine</em>, and <em>The Fantastic Four: First Steps</em>.
                  </p>
                </article>

                {/* FAQ Card 3 */}
                <article className="bg-white border-4 border-black p-6 rounded-2xl shadow-brutal flex flex-col gap-2">
                  <h3 className="font-display font-black text-lg sm:text-xl text-black">
                    💑 How does Couple Partner Sync work?
                  </h3>
                  <p className="text-sm font-semibold text-gray-700 leading-relaxed">
                    Sign in to get your unique <strong>Sync ID</strong> and send a partner invite to your significant other. Once linked, whenever either person marks a movie as <em>Watched</em> or <em>Watching</em>, both screens update instantly in real-time with dual progress meters.
                  </p>
                </article>

                {/* FAQ Card 4 */}
                <article className="bg-white border-4 border-black p-6 rounded-2xl shadow-brutal flex flex-col gap-2">
                  <h3 className="font-display font-black text-lg sm:text-xl text-black">
                    🕒 When does Avengers: Doomsday release?
                  </h3>
                  <p className="text-sm font-semibold text-gray-700 leading-relaxed">
                    <em>Avengers: Doomsday</em> is scheduled for global theatrical release in <strong>May 2026</strong>. Directed by the Russo Brothers and starring Robert Downey Jr. as Victor Von Doom, it paves the path toward <em>Avengers: Secret Wars</em>.
                  </p>
                </article>
              </div>
            </section>

            {/* Footer */}
            <footer className="bg-black text-white border-t-8 border-black p-8 text-center font-sans mt-8">
              <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
                
                {/* Brand / Tagline */}
                <div className="flex flex-col items-center gap-2">
                  <span className="bg-neo-yellow text-black font-black text-xs px-3 py-1 rounded-full uppercase border-2 border-white shadow-brutal-sm">
                    COUPLING MULTIVERSE ENGINE ⚡
                  </span>
                  <p className="font-bold text-sm text-gray-300">
                    Built for couples to conquer the Marvel Cinematic Universe before <span className="text-neo-yellow font-black">Avengers: Doomsday</span>.
                  </p>
                </div>

                {/* Creator Credits (Brutalist Block) */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-neo-yellow px-6 py-4 border-4 border-white shadow-[6px_6px_0px_0px_rgba(239,68,68,1)] rounded-2xl">
                  <a 
                    href="https://www.instagram.com/roith.hhh?igsh=MWdmNHk2NXpmNjZ6Mg==" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:scale-110 transition-transform cursor-pointer w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0"
                    title="Follow Rohith Das on Instagram"
                  >
                    <img src="/logo-black.png" alt="Rohith Das Logo" className="w-full h-full object-contain drop-shadow-[2px_2px_0_rgba(255,255,255,1)]" />
                  </a>
                  <div className="flex flex-col gap-1 text-center sm:text-left text-black border-t-4 sm:border-t-0 sm:border-l-4 border-black pt-3 sm:pt-0 sm:pl-4">
                    <p className="font-display font-black tracking-widest text-lg sm:text-xl uppercase leading-none drop-shadow-[2px_2px_0_rgba(255,255,255,1)]">
                      CREATED BY ROHITH DAS
                    </p>
                    <p className="font-bold text-[10px] sm:text-xs text-black/80 max-w-[250px]">
                      The Ultimate MCU Watch Tracker for the Road to Doomsday.
                    </p>
                  </div>
                </div>

                {/* Rights Reserved */}
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

    </main>
  );
}
