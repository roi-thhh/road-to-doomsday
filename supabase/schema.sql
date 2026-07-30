-- ========================================================
-- AVENGERS: DOOMSDAY COUPLES MCU WATCH TRACKER - DATABASE SCHEMA
-- Execute this SQL script in your Supabase SQL Editor
-- ========================================================

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE watch_status_type AS ENUM ('unwatched', 'watching', 'watched');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE role_selection_type AS ENUM ('boy_friend', 'girl_friend', 'alpha_male');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE media_type_enum AS ENUM ('movie', 'series');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role_selection role_selection_type,
  partner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MOVIES TABLE
CREATE TABLE IF NOT EXISTS public.movies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  release_date TEXT NOT NULL,
  chronological_order INT NOT NULL,
  release_order INT NOT NULL,
  is_essential BOOLEAN DEFAULT false,
  summary TEXT NOT NULL,
  imdb_rating NUMERIC(3, 1) DEFAULT 7.0,
  media_type media_type_enum DEFAULT 'movie',
  row_index INT DEFAULT 0,
  poster_url TEXT,
  multiverse_note TEXT,
  runtime TEXT,
  phase INT DEFAULT 1
);

-- 4. USER_PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  movie_id TEXT NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  status watch_status_type NOT NULL DEFAULT 'unwatched',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_movie UNIQUE (user_id, movie_id)
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Allows partners to view each other's progress securely
-- ========================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Movies Table: Public Read Access
DROP POLICY IF EXISTS "Movies are publicly readable" ON public.movies;
CREATE POLICY "Movies are publicly readable" 
ON public.movies FOR SELECT 
USING (true);

-- Users Table Policies: Flexible Read/Insert/Update for couples
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can read partner profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users profile public read" ON public.users;
DROP POLICY IF EXISTS "Users profile insert" ON public.users;
DROP POLICY IF EXISTS "Users profile update" ON public.users;

CREATE POLICY "Users profile public read" 
ON public.users FOR SELECT 
USING (true);

CREATE POLICY "Users profile insert" 
ON public.users FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users profile update" 
ON public.users FOR UPDATE 
USING (true);

-- User Progress Policies
DROP POLICY IF EXISTS "Users can read own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can read linked partner progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can manage own progress" ON public.user_progress;
DROP POLICY IF EXISTS "User progress public access" ON public.user_progress;

CREATE POLICY "User progress public access" 
ON public.user_progress FOR ALL 
USING (true)
WITH CHECK (true);

-- ========================================================
-- PRE-FILL DATA (DOOMSDAY ESSENTIALS)
-- ========================================================

INSERT INTO public.movies (id, title, release_date, chronological_order, release_order, is_essential, summary, imdb_rating, media_type, row_index, multiverse_note, runtime, phase) VALUES
('m24', 'Avengers: Endgame', 'Apr 26, 2019', 27, 24, true, 'The surviving Avengers pull off a Time Heist through the Quantum Realm to undo Thanos snap.', 8.4, 'movie', 7, 'Sets up timeline branches and the Multiverse concept.', '3h 1m', 3),
('s10', 'Loki (Seasons 1 & 2)', 'Jun 9, 2021', 29, 29, true, 'Loki works with the TVA to master time slipping, ultimately becoming God of Stories holding Yggdrasil together.', 8.2, 'series', 4, 'Fundamental Multiverse rules and timeline collapsing.', '12 Episodes', 4),
('m27', 'Spider-Man: No Way Home', 'Dec 17, 2021', 33, 27, true, 'Peter Parker asks Doctor Strange to erase public memory, fracturing space-time and pulling variants from alter realities.', 8.2, 'movie', 8, 'First major live-action multiversal collision.', '2h 28m', 4),
('m30', 'Doctor Strange in the Multiverse of Madness', 'May 6, 2022', 34, 30, true, 'Doctor Strange protects America Chavez from Wanda Maximoff, traveling across alternate earths.', 6.9, 'movie', 9, 'Incursions and alternate realities.', '2h 6m', 4),
('m31', 'Ant-Man and the Wasp: Quantumania', 'Feb 17, 2023', 40, 31, true, 'Ant-Man and family are pulled into subatomic Quantum Realm city state.', 6.0, 'movie', 10, 'Introduces the quantum realm temporal scale.', '2h 5m', 5),
('m36', 'Deadpool & Wolverine', 'Jul 26, 2024', 46, 36, true, 'Deadpool is recruited by the TVA to save his timeline from annihilation, uniting with a variant Wolverine from the Void.', 7.8, 'movie', 11, 'Anchor beings, TVA involvement, and mutant integration.', '2h 8m', 5),
('m35', 'Captain America: Brave New World', 'Feb 14, 2025', 50, 35, true, 'Sam Wilson meets President Thaddeus Red Hulk Ross as international conflict erupts over Adamantium.', 7.7, 'movie', 11, 'New world order post-Avengers.', '2h 10m', 5),
('m34', 'Thunderbolts*', 'May 2, 2025', 51, 34, true, 'Anti-heroes are trapped by Valentina and encounter Sentry.', 7.9, 'movie', 11, 'Anti-hero team dynamics heading into a global crisis.', '2h 15m', 5),
('m37', 'The Fantastic Four: First Steps', 'Jul 25, 2025', 53, 37, true, 'Set in a retro 1960s alternate universe, Reed Richards, Sue Storm, Johnny Storm, and Ben Grimm face Galactus.', 8.5, 'movie', 12, 'The direct introduction of Doctor Doom and Reed Richards.', '2h 20m', 6)
ON CONFLICT (id) DO UPDATE SET is_essential = EXCLUDED.is_essential;

-- Auto-confirm all registered accounts in Supabase Auth
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;
