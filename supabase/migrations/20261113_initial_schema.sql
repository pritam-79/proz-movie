-- ============================================================================
-- PROZ MOVIE — PRODUCTION DATABASE SCHEMA & ROW LEVEL SECURITY
-- YOUR WORLD. YOUR ENTERTAINMENT.
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS subscription_plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  billing_interval VARCHAR(20) NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly'
  max_screens INTEGER NOT NULL DEFAULT 1,
  video_quality VARCHAR(30) NOT NULL DEFAULT '720p',
  has_downloads BOOLEAN NOT NULL DEFAULT FALSE,
  has_hdr BOOLEAN NOT NULL DEFAULT FALSE,
  has_dolby_atmos BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. USER PROFILES (Account Level)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(100),
  avatar_url TEXT,
  phone VARCHAR(30),
  country_code VARCHAR(5) DEFAULT 'US',
  current_plan_id VARCHAR(50) REFERENCES subscription_plans(id) DEFAULT 'plan_free',
  subscription_status VARCHAR(30) DEFAULT 'active', -- active, past_due, canceled, expired
  subscription_expires_at TIMESTAMPTZ,
  is_email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SUB-PROFILES (Multi-Profile Support)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile_name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  is_kids BOOLEAN NOT NULL DEFAULT FALSE,
  parental_pin VARCHAR(4),
  maturity_rating VARCHAR(10) DEFAULT 'TV-MA', -- 'G', 'PG', 'PG-13', 'TV-MA', '18+'
  preferred_audio_language VARCHAR(10) DEFAULT 'en',
  preferred_subtitle_language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ADMIN USERS & ROLE PERMISSIONS
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(30) NOT NULL DEFAULT 'editor', -- 'superadmin', 'admin', 'editor', 'compliance_officer'
  permissions JSONB NOT NULL DEFAULT '[]'::JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. GENRES
CREATE TABLE IF NOT EXISTS genres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0
);

-- 6. CONTENT (Movies & Series Catalog)
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  original_title VARCHAR(255),
  slug VARCHAR(255) NOT NULL UNIQUE,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('movie', 'series')),
  category VARCHAR(50) NOT NULL, -- 'hollywood', 'bollywood', 'south_indian', 'bengali', 'international', 'anime', 'k_drama', 'original'
  synopsis TEXT NOT NULL,
  tagline VARCHAR(255),
  release_year INTEGER NOT NULL,
  runtime_minutes INTEGER, -- for movies or average episode runtime
  maturity_rating VARCHAR(10) NOT NULL DEFAULT 'PG-13', -- 'G', 'PG', 'PG-13', 'TV-MA', '18+'
  original_language VARCHAR(10) NOT NULL DEFAULT 'en',
  rating_score NUMERIC(3, 1) DEFAULT 8.0,
  poster_url TEXT NOT NULL,
  backdrop_url TEXT NOT NULL,
  trailer_url TEXT,
  cast_list JSONB DEFAULT '[]'::JSONB, -- [{name: string, role: string, avatar: string}]
  crew_list JSONB DEFAULT '[]'::JSONB, -- [{name: string, job: string}]
  is_featured BOOLEAN DEFAULT FALSE,
  is_trending BOOLEAN DEFAULT FALSE,
  is_proz_original BOOLEAN DEFAULT FALSE,
  is_restricted_18_plus BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. CONTENT GENRES JUNCTION
CREATE TABLE IF NOT EXISTS content_genres (
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  genre_id UUID NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, genre_id)
);

-- 8. SEASONS (For Web Series & Dramas)
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  title VARCHAR(100) NOT NULL,
  synopsis TEXT,
  poster_url TEXT,
  release_date DATE,
  total_episodes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (content_id, season_number)
);

-- 9. EPISODES
CREATE TABLE IF NOT EXISTS episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  title VARCHAR(150) NOT NULL,
  synopsis TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  thumbnail_url TEXT,
  air_date DATE,
  intro_start_seconds INTEGER,
  intro_end_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (season_id, episode_number)
);

-- 10. VIDEO ASSETS (Multi-bitrate streams & DRM info)
CREATE TABLE IF NOT EXISTS video_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  stream_type VARCHAR(20) NOT NULL DEFAULT 'HLS', -- 'HLS', 'DASH', 'MP4'
  manifest_url TEXT NOT NULL,
  fallback_mp4_url TEXT,
  drm_system VARCHAR(50), -- 'widevine', 'fairplay', 'clearkey', 'none'
  drm_key_id VARCHAR(100),
  drm_license_server_url TEXT,
  max_resolution VARCHAR(20) DEFAULT '1080p',
  is_live BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT content_or_episode CHECK (
    (content_id IS NOT NULL AND episode_id IS NULL) OR
    (content_id IS NULL AND episode_id IS NOT NULL)
  )
);

-- 11. SUBTITLES
CREATE TABLE IF NOT EXISTS subtitles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_asset_id UUID NOT NULL REFERENCES video_assets(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL,
  label VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  is_closed_captions BOOLEAN DEFAULT FALSE
);

-- 12. AUDIO TRACKS
CREATE TABLE IF NOT EXISTS audio_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_asset_id UUID NOT NULL REFERENCES video_assets(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL,
  label VARCHAR(50) NOT NULL,
  codec VARCHAR(20) DEFAULT 'AAC',
  is_default BOOLEAN DEFAULT FALSE
);

-- 13. CONTENT LICENSES (Rights & Territory Enforcement)
CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  licensor_name VARCHAR(150) NOT NULL,
  license_contract_ref VARCHAR(100),
  licensed_territories TEXT[] NOT NULL DEFAULT ARRAY['GLOBAL'],
  licensed_languages TEXT[] NOT NULL DEFAULT ARRAY['en'],
  license_start TIMESTAMPTZ NOT NULL,
  license_expiry TIMESTAMPTZ NOT NULL,
  allow_downloads BOOLEAN DEFAULT TRUE,
  allow_4k BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. WATCHLIST
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sub_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, content_id)
);

-- 15. WATCH HISTORY & CONTINUE WATCHING
CREATE TABLE IF NOT EXISTS watch_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sub_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE SET NULL,
  progress_seconds INTEGER NOT NULL DEFAULT 0,
  total_duration_seconds INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  last_watched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, content_id, episode_id)
);

-- 16. PLAYBACK SESSIONS (Signed sessions & DRM security)
CREATE TABLE IF NOT EXISTS playback_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token VARCHAR(255) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE SET NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_type VARCHAR(30) DEFAULT 'browser',
  is_valid BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. USER DEVICES (Device Management & Screen Limits)
CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  device_name VARCHAR(100) NOT NULL,
  device_type VARCHAR(50) NOT NULL,
  last_ip VARCHAR(45),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. PAYMENTS & TRANSACTIONS
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL REFERENCES subscription_plans(id),
  provider VARCHAR(30) NOT NULL DEFAULT 'stripe', -- 'stripe', 'razorpay', 'lemonsqueezy'
  provider_payment_id VARCHAR(150) NOT NULL UNIQUE,
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  status VARCHAR(30) NOT NULL DEFAULT 'succeeded', -- 'succeeded', 'failed', 'refunded'
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. 18+ AGE VERIFICATIONS
CREATE TABLE IF NOT EXISTS age_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  date_of_birth DATE NOT NULL,
  verification_method VARCHAR(50) NOT NULL DEFAULT 'dob_declaration', -- 'id_doc', 'credit_card', 'dob_declaration'
  verification_reference VARCHAR(100),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_resource VARCHAR(100),
  details JSONB DEFAULT '{}'::JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR HIGH QUERY PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_content_type_cat ON content(content_type, category);
CREATE INDEX IF NOT EXISTS idx_content_trending ON content(is_trending) WHERE is_trending = TRUE;
CREATE INDEX IF NOT EXISTS idx_content_featured ON content(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_content_restricted ON content(is_restricted_18_plus);
CREATE INDEX IF NOT EXISTS idx_watch_history_user ON watch_history(user_id, last_watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_episodes_season ON episodes(season_id, episode_number);
CREATE INDEX IF NOT EXISTS idx_playback_session_token ON playback_sessions(session_token);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE age_verifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read & update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Watchlist: Users can view and manage their own watchlist
CREATE POLICY "Users can view own watchlist" ON watchlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into own watchlist" ON watchlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own watchlist" ON watchlist
  FOR DELETE USING (auth.uid() = user_id);

-- Watch History: Users can view and update their own viewing progress
CREATE POLICY "Users can view own watch history" ON watch_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update own watch history" ON watch_history
  FOR ALL USING (auth.uid() = user_id);

-- User Devices: Users manage their own devices
CREATE POLICY "Users can view own devices" ON user_devices
  FOR SELECT USING (auth.uid() = user_id);

-- Public Read for Catalog Data
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view non-restricted content" ON content
  FOR SELECT USING (is_restricted_18_plus = FALSE OR auth.uid() IN (SELECT user_id FROM age_verifications WHERE is_verified = TRUE));

ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view genres" ON genres FOR SELECT USING (TRUE);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view subscription plans" ON subscription_plans FOR SELECT USING (is_active = TRUE);
