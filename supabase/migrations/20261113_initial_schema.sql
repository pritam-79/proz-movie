-- ============================================================================
-- PROZ MOVIE — PRODUCTION DATABASE SCHEMA & ROW LEVEL SECURITY
-- YOUR WORLD. YOUR ENTERTAINMENT.
-- v2.0 — Comprehensive OTT Platform Schema
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. SUBSCRIPTION PLANS
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id                VARCHAR(50)   PRIMARY KEY,
  name              VARCHAR(50)   NOT NULL,
  price             NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  billing_interval  VARCHAR(20)   NOT NULL DEFAULT 'monthly',
  max_screens       INTEGER       NOT NULL DEFAULT 1,
  video_quality     VARCHAR(30)   NOT NULL DEFAULT '720p',
  has_downloads     BOOLEAN       NOT NULL DEFAULT FALSE,
  has_hdr           BOOLEAN       NOT NULL DEFAULT FALSE,
  has_dolby_atmos   BOOLEAN       NOT NULL DEFAULT FALSE,
  is_active         BOOLEAN       NOT NULL DEFAULT TRUE,
  features          JSONB         NOT NULL DEFAULT '[]',
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. PROFILES (Account Level — mirrors auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id                      UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                   VARCHAR(255)  NOT NULL UNIQUE,
  full_name               VARCHAR(100),
  avatar_url              TEXT,
  phone                   VARCHAR(30),
  country_code            VARCHAR(5)    DEFAULT 'IN',
  current_plan_id         VARCHAR(50)   REFERENCES subscription_plans(id) DEFAULT 'plan_free',
  subscription_status     VARCHAR(30)   DEFAULT 'active',
  subscription_expires_at TIMESTAMPTZ,
  is_email_verified       BOOLEAN       DEFAULT FALSE,
  age_verified            BOOLEAN       DEFAULT FALSE,
  created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. USER PROFILES (Multi-Profile / Sub-Profile Support)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id                          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile_name                VARCHAR(50) NOT NULL,
  avatar_url                  TEXT,
  is_kids                     BOOLEAN     NOT NULL DEFAULT FALSE,
  parental_pin                VARCHAR(4),
  maturity_rating             VARCHAR(10) DEFAULT 'TV-MA',
  preferred_audio_language    VARCHAR(10) DEFAULT 'en',
  preferred_subtitle_language VARCHAR(10) DEFAULT 'en',
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. ADMIN USERS & ROLE PERMISSIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id          UUID        PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  role        VARCHAR(30) NOT NULL DEFAULT 'editor'
                CHECK (role IN ('superadmin','admin','editor','compliance_officer','content_manager')),
  permissions JSONB       NOT NULL DEFAULT '[]',
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. GENRES
-- ============================================================================
CREATE TABLE IF NOT EXISTS genres (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(50) NOT NULL UNIQUE,
  slug          VARCHAR(50) NOT NULL UNIQUE,
  icon          VARCHAR(50),
  color         VARCHAR(20),
  display_order INTEGER     DEFAULT 0
);

-- ============================================================================
-- 6. CONTENT (Movies, Series, Anime, Drama Catalog)
-- ============================================================================
CREATE TABLE IF NOT EXISTS content (
  id                  UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  title               VARCHAR(255)  NOT NULL,
  original_title      VARCHAR(255),
  slug                VARCHAR(255)  NOT NULL UNIQUE,
  content_type        VARCHAR(20)   NOT NULL
                        CHECK (content_type IN ('movie','series','anime','drama')),
  category            VARCHAR(50)   NOT NULL
                        CHECK (category IN (
                          'hollywood','bollywood','south_indian','bengali','international',
                          'k_drama','c_drama','j_drama','thai_drama',
                          'anime_series','anime_movie','documentary','animation',
                          'family','kids','short_drama'
                        )),
  subcategory         VARCHAR(50),
  description         TEXT,
  age_rating          VARCHAR(10)   DEFAULT 'PG-13'
                        CHECK (age_rating IN ('G','PG','PG-13','R','TV-14','TV-MA','18+','U/A')),
  is_adult            BOOLEAN       NOT NULL DEFAULT FALSE,
  is_featured         BOOLEAN       NOT NULL DEFAULT FALSE,
  is_trending         BOOLEAN       NOT NULL DEFAULT FALSE,
  is_published        BOOLEAN       NOT NULL DEFAULT FALSE,
  view_count          BIGINT        NOT NULL DEFAULT 0,
  rating_avg          NUMERIC(3,1),
  rating_count        INTEGER       NOT NULL DEFAULT 0,
  runtime_minutes     INTEGER,
  release_year        INTEGER,
  language            VARCHAR(10),
  country             VARCHAR(100),
  poster_url          TEXT,
  backdrop_url        TEXT,
  thumbnail_url       TEXT,
  trailer_url         TEXT,
  cast                JSONB         NOT NULL DEFAULT '[]',
  crew                JSONB         NOT NULL DEFAULT '[]',
  tags                JSONB         NOT NULL DEFAULT '[]',
  available_qualities JSONB         NOT NULL DEFAULT '[]',
  tmdb_id             INTEGER,
  imdb_id             VARCHAR(20),
  provider_id         UUID,
  ingestion_status    VARCHAR(30)   NOT NULL DEFAULT 'manual',
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. CONTENT GENRES JUNCTION
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_genres (
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  genre_id   UUID NOT NULL REFERENCES genres(id)  ON DELETE CASCADE,
  PRIMARY KEY (content_id, genre_id)
);

-- ============================================================================
-- 8. SEASONS (For Series, Anime & Dramas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS seasons (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id     UUID        NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  season_number  INTEGER     NOT NULL,
  title          VARCHAR(100),
  description    TEXT,
  poster_url     TEXT,
  episode_count  INTEGER     NOT NULL DEFAULT 0,
  air_date       DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (content_id, season_number)
);

-- ============================================================================
-- 9. EPISODES
-- ============================================================================
CREATE TABLE IF NOT EXISTS episodes (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id        UUID        NOT NULL REFERENCES seasons(id)  ON DELETE CASCADE,
  content_id       UUID        NOT NULL REFERENCES content(id)  ON DELETE CASCADE,
  episode_number   INTEGER     NOT NULL,
  title            VARCHAR(150) NOT NULL,
  description      TEXT,
  thumbnail_url    TEXT,
  duration_seconds INTEGER,
  air_date         DATE,
  is_filler        BOOLEAN     NOT NULL DEFAULT FALSE,
  skip_intro_start INTEGER,
  skip_intro_end   INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (season_id, episode_number)
);

-- ============================================================================
-- 10. METADATA PROVIDERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS metadata_providers (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(100) NOT NULL UNIQUE,
  type            VARCHAR(30)  NOT NULL
                    CHECK (type IN ('tmdb','manual','studio_feed','distributor','anime_db')),
  base_url        TEXT,
  is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
  config          JSONB        NOT NULL DEFAULT '{}',
  supported_types JSONB,
  last_sync_at    TIMESTAMPTZ,
  sync_status     VARCHAR(30)  NOT NULL DEFAULT 'idle',
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 11. CONTENT SOURCES
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_sources (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id   UUID        NOT NULL REFERENCES content(id)           ON DELETE CASCADE,
  provider_id  UUID        NOT NULL REFERENCES metadata_providers(id) ON DELETE CASCADE,
  external_id  VARCHAR(100),
  source_type  VARCHAR(50),
  raw_metadata JSONB,
  imported_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 12. PROVIDER SYNC LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS provider_sync_logs (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id      UUID        NOT NULL REFERENCES metadata_providers(id) ON DELETE CASCADE,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,
  records_found    INTEGER     NOT NULL DEFAULT 0,
  records_imported INTEGER     NOT NULL DEFAULT 0,
  records_failed   INTEGER     NOT NULL DEFAULT 0,
  errors           JSONB       NOT NULL DEFAULT '[]',
  status           VARCHAR(30) NOT NULL DEFAULT 'running'
);

-- ============================================================================
-- 13. CONTENT IMPORT JOBS
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_import_jobs (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id   UUID        REFERENCES metadata_providers(id) ON DELETE SET NULL,
  external_id   VARCHAR(100),
  title         VARCHAR(255),
  status        VARCHAR(30) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','processing','approved','rejected','failed')),
  raw_data      JSONB,
  error_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by   UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at   TIMESTAMPTZ
);

-- ============================================================================
-- 14. LICENSES (Rights & Territory Enforcement)
-- ============================================================================
CREATE TABLE IF NOT EXISTS licenses (
  id                     UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id             UUID          NOT NULL UNIQUE REFERENCES content(id) ON DELETE CASCADE,
  rights_holder          VARCHAR(150),
  distributor            VARCHAR(150),
  licence_ref            VARCHAR(100)  UNIQUE,
  start_date             DATE,
  expiry_date            DATE,
  territories            JSONB         NOT NULL DEFAULT '["*"]',
  languages              JSONB         NOT NULL DEFAULT '["*"]',
  streaming_permitted    BOOLEAN       NOT NULL DEFAULT TRUE,
  download_permitted     BOOLEAN       NOT NULL DEFAULT FALSE,
  subscription_permitted BOOLEAN       NOT NULL DEFAULT TRUE,
  age_classification     VARCHAR(20),
  platform_restrictions  JSONB         NOT NULL DEFAULT '{}',
  is_active              BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 15. VIDEO ASSETS (Multi-bitrate Streams & DRM)
-- ============================================================================
CREATE TABLE IF NOT EXISTS video_assets (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id        UUID        REFERENCES content(id)  ON DELETE CASCADE,
  episode_id        UUID        REFERENCES episodes(id) ON DELETE CASCADE,
  provider          VARCHAR(50),
  provider_asset_id VARCHAR(150),
  hls_url           TEXT,
  dash_url          TEXT,
  drm_config        JSONB       NOT NULL DEFAULT '{}',
  available_qualities JSONB     NOT NULL DEFAULT '["auto"]',
  duration_seconds  INTEGER,
  is_active         BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 16. SUBTITLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS subtitles (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id    UUID        REFERENCES content(id)  ON DELETE CASCADE,
  episode_id    UUID        REFERENCES episodes(id) ON DELETE CASCADE,
  language_code VARCHAR(10),
  label         VARCHAR(50),
  format        VARCHAR(10) NOT NULL DEFAULT 'vtt'
                  CHECK (format IN ('srt','vtt','ass')),
  url           TEXT        NOT NULL,
  is_default    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 17. AUDIO TRACKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS audio_tracks (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id    UUID        REFERENCES content(id)  ON DELETE CASCADE,
  episode_id    UUID        REFERENCES episodes(id) ON DELETE CASCADE,
  language_code VARCHAR(10),
  label         VARCHAR(50),
  is_default    BOOLEAN     NOT NULL DEFAULT FALSE,
  is_dubbed     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 18. PLAYBACK SESSIONS (DRM Security & Concurrency Control)
-- ============================================================================
CREATE TABLE IF NOT EXISTS playback_sessions (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID        NOT NULL REFERENCES profiles(id)  ON DELETE CASCADE,
  content_id     UUID        NOT NULL REFERENCES content(id)   ON DELETE CASCADE,
  episode_id     UUID        REFERENCES episodes(id) ON DELETE SET NULL,
  session_token  VARCHAR(255) NOT NULL UNIQUE,
  provider       VARCHAR(50),
  started_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at     TIMESTAMPTZ NOT NULL,
  ip_address     INET,
  user_agent     TEXT,
  territory      VARCHAR(10),
  is_valid       BOOLEAN     NOT NULL DEFAULT TRUE
);

-- ============================================================================
-- 19. WATCH HISTORY & CONTINUE WATCHING
-- ============================================================================
CREATE TABLE IF NOT EXISTS watch_history (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID        NOT NULL REFERENCES profiles(id)      ON DELETE CASCADE,
  profile_id       UUID        REFERENCES user_profiles(id) ON DELETE SET NULL,
  content_id       UUID        NOT NULL REFERENCES content(id)       ON DELETE CASCADE,
  episode_id       UUID        REFERENCES episodes(id)   ON DELETE SET NULL,
  progress_seconds INTEGER     NOT NULL DEFAULT 0,
  duration_seconds INTEGER     NOT NULL DEFAULT 0,
  completed        BOOLEAN     NOT NULL DEFAULT FALSE,
  last_watched_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, content_id, episode_id)
);

-- ============================================================================
-- 20. WATCHLIST
-- ============================================================================
CREATE TABLE IF NOT EXISTS watchlist (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES profiles(id)      ON DELETE CASCADE,
  profile_id UUID        REFERENCES user_profiles(id) ON DELETE SET NULL,
  content_id UUID        NOT NULL REFERENCES content(id)       ON DELETE CASCADE,
  added_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, content_id)
);

-- ============================================================================
-- 21. SUBSCRIPTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID        NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id                 VARCHAR(50) NOT NULL REFERENCES subscription_plans(id),
  status                  VARCHAR(30) NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active','past_due','canceled','expired','trialing')),
  starts_at               TIMESTAMPTZ,
  expires_at              TIMESTAMPTZ,
  payment_provider        VARCHAR(50),
  payment_subscription_id VARCHAR(150),
  cancel_at_period_end    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 22. PAYMENTS & TRANSACTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id                  UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID          NOT NULL REFERENCES profiles(id)      ON DELETE CASCADE,
  subscription_id     UUID          REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount              NUMERIC(10,2) NOT NULL,
  currency            VARCHAR(3)    NOT NULL DEFAULT 'INR',
  provider            VARCHAR(30)   NOT NULL DEFAULT 'razorpay',
  provider_payment_id VARCHAR(150)  NOT NULL UNIQUE,
  status              VARCHAR(30)   NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','succeeded','failed','refunded')),
  metadata            JSONB         NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 23. USER DEVICES (Device Management & Screen Limits)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_devices (
  id                 UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  device_name        VARCHAR(100),
  device_type        VARCHAR(30) NOT NULL DEFAULT 'other'
                       CHECK (device_type IN ('mobile','tablet','desktop','tv','other')),
  device_fingerprint VARCHAR(255),
  last_active_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_trusted         BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 24. AGE VERIFICATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS age_verifications (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  method      VARCHAR(30) NOT NULL DEFAULT 'dob'
                CHECK (method IN ('dob','id_check','payment_verify')),
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dob         DATE,
  is_verified BOOLEAN     NOT NULL DEFAULT FALSE,
  territory   VARCHAR(10)
);

-- ============================================================================
-- 25. AUDIT LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  action        VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id   VARCHAR(100),
  ip_address    INET,
  metadata      JSONB       NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 26. TRENDING CACHE
-- ============================================================================
CREATE TABLE IF NOT EXISTS trending_cache (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id    UUID          NOT NULL UNIQUE REFERENCES content(id) ON DELETE CASCADE,
  score         NUMERIC(10,4) NOT NULL DEFAULT 0,
  trending_rank INTEGER,
  calculated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  territory     VARCHAR(10)   NOT NULL DEFAULT 'GLOBAL'
);

-- ============================================================================
-- INDEXES FOR HIGH QUERY PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_content_category       ON content(category);
CREATE INDEX IF NOT EXISTS idx_content_type           ON content(content_type);
CREATE INDEX IF NOT EXISTS idx_content_adult          ON content(is_adult)     WHERE is_adult = TRUE;
CREATE INDEX IF NOT EXISTS idx_content_featured       ON content(is_featured)  WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_content_trending       ON content(is_trending)  WHERE is_trending = TRUE;
CREATE INDEX IF NOT EXISTS idx_content_published      ON content(is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_content_year           ON content(release_year);
CREATE INDEX IF NOT EXISTS idx_content_rating         ON content(rating_avg DESC);

CREATE INDEX IF NOT EXISTS idx_episodes_season        ON episodes(season_id);
CREATE INDEX IF NOT EXISTS idx_episodes_content       ON episodes(content_id);

CREATE INDEX IF NOT EXISTS idx_watchlist_user         ON watchlist(user_id);

CREATE INDEX IF NOT EXISTS idx_history_user           ON watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_user_content   ON watch_history(user_id, content_id);
CREATE INDEX IF NOT EXISTS idx_history_time           ON watch_history(last_watched_at DESC);

CREATE INDEX IF NOT EXISTS idx_sessions_user          ON playback_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_valid         ON playback_sessions(is_valid, expires_at);

CREATE INDEX IF NOT EXISTS idx_licenses_content       ON licenses(content_id);
CREATE INDEX IF NOT EXISTS idx_licenses_expiry        ON licenses(expiry_date);

CREATE INDEX IF NOT EXISTS idx_trending_rank          ON trending_cache(trending_rank);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) — ENABLE ON USER-OWNED TABLES
-- ============================================================================
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist          ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history      ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices       ENABLE ROW LEVEL SECURITY;
ALTER TABLE age_verifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE playback_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE content            ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres             ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons            ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtitles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_tracks       ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES — USER-SCOPED DATA
-- ============================================================================
CREATE POLICY "Users own profile"
  ON profiles           FOR ALL  USING (auth.uid() = id);

CREATE POLICY "Users own profiles"
  ON user_profiles      FOR ALL  USING (auth.uid() = user_id);

CREATE POLICY "Users own watchlist"
  ON watchlist          FOR ALL  USING (auth.uid() = user_id);

CREATE POLICY "Users own history"
  ON watch_history      FOR ALL  USING (auth.uid() = user_id);

CREATE POLICY "Users own subscriptions"
  ON subscriptions      FOR ALL  USING (auth.uid() = user_id);

CREATE POLICY "Users own payments"
  ON payments           FOR ALL  USING (auth.uid() = user_id);

CREATE POLICY "Users own devices"
  ON user_devices       FOR ALL  USING (auth.uid() = user_id);

CREATE POLICY "Users own age verifications"
  ON age_verifications  FOR ALL  USING (auth.uid() = user_id);

CREATE POLICY "Users own sessions"
  ON playback_sessions  FOR ALL  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES — PUBLIC CATALOG READ
-- ============================================================================
CREATE POLICY "Content public read"
  ON content       FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Genres public read"
  ON genres        FOR SELECT USING (TRUE);

CREATE POLICY "Seasons public read"
  ON seasons       FOR SELECT USING (TRUE);

CREATE POLICY "Episodes public read"
  ON episodes      FOR SELECT USING (TRUE);

CREATE POLICY "Subtitles public read"
  ON subtitles     FOR SELECT USING (TRUE);

CREATE POLICY "Audio tracks public read"
  ON audio_tracks  FOR SELECT USING (TRUE);
