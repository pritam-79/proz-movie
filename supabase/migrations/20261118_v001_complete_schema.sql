-- ============================================================================
-- PROZ MOVIE v0.01 — ULTIMATE OTT PLATFORM DATABASE MIGRATION
-- Standardized schema with RLS, indexes, and full relational integrity
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'en',
  country TEXT DEFAULT 'IN',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Titles
CREATE TABLE IF NOT EXISTS public.titles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  original_title TEXT,
  overview TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('movie', 'series', 'anime', 'drama', 'documentary', 'short')),
  release_date DATE,
  release_year INTEGER,
  runtime INTEGER,
  poster_url TEXT,
  backdrop_url TEXT,
  trailer_url TEXT,
  original_language TEXT DEFAULT 'en',
  country TEXT DEFAULT 'IN',
  rating NUMERIC(3, 1) DEFAULT 0.0,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'restricted')),
  is_adult BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. External Title IDs
CREATE TABLE IF NOT EXISTS public.external_title_ids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_id UUID NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('tmdb', 'anilist', 'tvmaze', 'watchmode', 'justwatch', 'youtube', 'archive_org')),
  external_id TEXT NOT NULL,
  external_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, external_id)
);

-- 4. Genres
CREATE TABLE IF NOT EXISTS public.genres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Title Genres
CREATE TABLE IF NOT EXISTS public.title_genres (
  title_id UUID NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  genre_id UUID NOT NULL REFERENCES public.genres(id) ON DELETE CASCADE,
  PRIMARY KEY (title_id, genre_id)
);

-- 6. People (Actors, Directors, Creators)
CREATE TABLE IF NOT EXISTS public.people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  profile_image TEXT,
  biography TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Title Credits
CREATE TABLE IF NOT EXISTS public.title_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_id UUID NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  character_name TEXT,
  department TEXT DEFAULT 'Acting',
  display_order INTEGER DEFAULT 0
);

-- 8. Seasons
CREATE TABLE IF NOT EXISTS public.seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_id UUID NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  name TEXT,
  overview TEXT,
  poster_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(title_id, season_number)
);

-- 9. Episodes
CREATE TABLE IF NOT EXISTS public.episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  overview TEXT,
  runtime INTEGER,
  still_url TEXT,
  air_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(season_id, episode_number)
);

-- 10. Content Providers
CREATE TABLE IF NOT EXISTS public.content_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('metadata', 'availability', 'playback', 'iptv')),
  enabled BOOLEAN DEFAULT TRUE,
  configuration JSONB DEFAULT '{}'::jsonb,
  last_sync_at TIMESTAMPTZ,
  health_status TEXT DEFAULT 'healthy',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Content Rights
CREATE TABLE IF NOT EXISTS public.content_rights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_id UUID NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.content_providers(id) ON DELETE SET NULL,
  rights_owner TEXT NOT NULL,
  licence_reference TEXT,
  permitted_countries TEXT[] DEFAULT ARRAY['IN'],
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  permitted_platforms TEXT[] DEFAULT ARRAY['web', 'android', 'ios'],
  permitted_content_types TEXT[] DEFAULT ARRAY['svod', 'avod'],
  verification_status TEXT DEFAULT 'verified' CHECK (verification_status IN ('pending', 'verified', 'revoked', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Playback Assets
CREATE TABLE IF NOT EXISTS public.playback_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_id UUID NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL, -- e.g. cloudflare_stream, mux, youtube, archive_org
  external_asset_id TEXT NOT NULL,
  playback_type TEXT NOT NULL CHECK (playback_type IN ('hls', 'dash', 'mp4', 'youtube_embed', 'external_link')),
  playback_status TEXT DEFAULT 'ready' CHECK (playback_status IN ('processing', 'ready', 'failed', 'restricted')),
  territory_rules TEXT[] DEFAULT ARRAY['IN', 'GLOBAL'],
  requires_auth BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Watchlist
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title_id UUID NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, title_id)
);

-- 14. Watch History
CREATE TABLE IF NOT EXISTS public.watch_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title_id UUID NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE SET NULL,
  progress_seconds INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, title_id, episode_id)
);

-- 15. Playback Sessions
CREATE TABLE IF NOT EXISTS public.playback_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title_id UUID NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE SET NULL,
  provider_id TEXT NOT NULL,
  session_status TEXT DEFAULT 'active' CHECK (session_status IN ('active', 'expired', 'terminated')),
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'basic', 'standard', 'premium')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'expired')),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  payment_provider TEXT DEFAULT 'razorpay',
  external_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Age Verifications
CREATE TABLE IF NOT EXISTS public.age_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_provider TEXT DEFAULT 'self_attestation_over18',
  verification_status TEXT DEFAULT 'verified' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Sync Jobs
CREATE TABLE IF NOT EXISTS public.sync_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id TEXT NOT NULL,
  job_type TEXT NOT NULL,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  records_processed INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_summary TEXT
);

-- ─── Indexes for High-Velocity Queries ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_titles_content_type ON public.titles(content_type);
CREATE INDEX IF NOT EXISTS idx_titles_release_year ON public.titles(release_year);
CREATE INDEX IF NOT EXISTS idx_titles_rating ON public.titles(rating);
CREATE INDEX IF NOT EXISTS idx_external_title_ids_lookup ON public.external_title_ids(provider, external_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_user ON public.watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON public.watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_playback_assets_title ON public.playback_assets(title_id);
CREATE INDEX IF NOT EXISTS idx_playback_sessions_user ON public.playback_sessions(user_id);

-- ─── Row Level Security (RLS) Policies ─────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playback_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.age_verifications ENABLE ROW LEVEL SECURITY;

-- Public can read published titles
ALTER TABLE public.titles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published titles" ON public.titles FOR SELECT USING (status = 'published');

-- Users can read/write their own profiles
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Users can manage their own watchlist
CREATE POLICY "Users read own watchlist" ON public.watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own watchlist" ON public.watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own watchlist" ON public.watchlist FOR DELETE USING (auth.uid() = user_id);

-- Users can manage their own watch history
CREATE POLICY "Users read own watch history" ON public.watch_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users write own watch history" ON public.watch_history FOR ALL USING (auth.uid() = user_id);
