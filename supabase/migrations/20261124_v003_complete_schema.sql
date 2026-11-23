-- ==============================================================================
-- PROZ ENTERTAINMENT v0.03 — COMPLETE SCHEMA MIGRATION
-- Release: v0.03 (Automated Content Discovery, Multi-Provider & Truthful 18+ Ecosystem)
-- Migration Date: 2026-11-24
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE content_lifecycle_state AS ENUM (
    'discovered',
    'metadata_imported',
    'rights_verified',
    'media_available',
    'playback_ready',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE content_rights_type AS ENUM (
    'public_domain',
    'creative_commons',
    'licensed_partner',
    'free_ad_supported',
    'official_embed',
    'private_vault',
    'unverified'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE provider_health_state AS ENUM (
    'connected',
    'configured',
    'degraded',
    'disconnected',
    'error'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. CONTENT SOURCES TABLE
CREATE TABLE IF NOT EXISTS public.content_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id VARCHAR(100) NOT NULL,
  provider_id VARCHAR(50) NOT NULL,
  provider_name VARCHAR(100) NOT NULL,
  source_type VARCHAR(50) NOT NULL, -- 'html5_mp4', 'hls_stream', 'youtube_embed', 'official_deeplink'
  format VARCHAR(20) NOT NULL, -- 'mp4', 'm3u8', 'youtube', 'web'
  playback_url TEXT,
  official_watch_url TEXT,
  app_deep_link JSONB DEFAULT '{}'::jsonb,
  pricing_type VARCHAR(20) DEFAULT 'free', -- 'free', 'subscription', 'rent', 'buy'
  price_amount NUMERIC(10, 2),
  price_currency VARCHAR(10) DEFAULT 'INR',
  quality VARCHAR(20) DEFAULT '1080p',
  country VARCHAR(10) DEFAULT 'IN',
  rights_status content_rights_type DEFAULT 'unverified',
  verification_status VARCHAR(20) DEFAULT 'verified',
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DISCOVERED CONTENT QUEUE TABLE
CREATE TABLE IF NOT EXISTS public.discovered_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(255) NOT NULL,
  provider_id VARCHAR(50) NOT NULL,
  provider_name VARCHAR(100) NOT NULL,
  title VARCHAR(500) NOT NULL,
  original_title VARCHAR(500),
  description TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  content_type VARCHAR(30) DEFAULT 'movie',
  release_year INT,
  language VARCHAR(20) DEFAULT 'en',
  country VARCHAR(10) DEFAULT 'GLOBAL',
  genres TEXT[] DEFAULT ARRAY[]::TEXT[],
  rating NUMERIC(3, 1) DEFAULT 0.0,
  rights_status content_rights_type DEFAULT 'unverified',
  lifecycle_status content_lifecycle_state DEFAULT 'discovered',
  rights_provenance JSONB DEFAULT '{}'::jsonb,
  raw_payload JSONB DEFAULT '{}'::jsonb,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  imported_at TIMESTAMPTZ,
  reviewed_by UUID,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_provider_external_id UNIQUE(provider_id, external_id)
);

-- 5. CONTENT IMPORT QUEUE TABLE
CREATE TABLE IF NOT EXISTS public.content_import_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discovery_item_id UUID REFERENCES public.discovered_content(id) ON DELETE CASCADE,
  target_collection VARCHAR(100) DEFAULT 'default',
  priority INT DEFAULT 5, -- 1 (highest) to 10 (lowest)
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CONTENT RIGHTS PROVENANCE TABLE
CREATE TABLE IF NOT EXISTS public.content_rights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id VARCHAR(100) NOT NULL,
  license_type content_rights_type NOT NULL,
  license_name VARCHAR(100) NOT NULL,
  license_url TEXT,
  attribution_text TEXT,
  copyright_holder VARCHAR(255),
  jurisdiction VARCHAR(50) DEFAULT 'GLOBAL',
  is_commercial_allowed BOOLEAN DEFAULT FALSE,
  is_drm_protected BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  verified_by VARCHAR(100) DEFAULT 'PROZ_AUTOMATED_AUDITOR',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PROVIDER HEALTH LOGS TABLE
CREATE TABLE IF NOT EXISTS public.provider_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id VARCHAR(50) NOT NULL,
  provider_name VARCHAR(100) NOT NULL,
  status provider_health_state NOT NULL,
  latency_ms INT DEFAULT 0,
  http_code INT,
  error_message TEXT,
  quota_consumed INT DEFAULT 0,
  quota_remaining INT,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ADULT PROVIDERS & PRIVATE VAULTS TABLE
CREATE TABLE IF NOT EXISTS public.adult_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name VARCHAR(100) NOT NULL,
  provider_type VARCHAR(50) DEFAULT 'stash_graphql',
  endpoint_url TEXT NOT NULL,
  api_key_encrypted TEXT,
  connection_status provider_health_state DEFAULT 'configured',
  version VARCHAR(50),
  scene_count INT DEFAULT 0,
  performer_count INT DEFAULT 0,
  studio_count INT DEFAULT 0,
  gallery_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_content_sources_content_id ON public.content_sources(content_id);
CREATE INDEX IF NOT EXISTS idx_content_sources_provider_id ON public.content_sources(provider_id);
CREATE INDEX IF NOT EXISTS idx_discovered_content_lifecycle ON public.discovered_content(lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_discovered_content_provider ON public.discovered_content(provider_id);
CREATE INDEX IF NOT EXISTS idx_discovered_content_rights ON public.discovered_content(rights_status);
CREATE INDEX IF NOT EXISTS idx_import_queue_status ON public.content_import_queue(status, priority);
CREATE INDEX IF NOT EXISTS idx_health_logs_provider_time ON public.provider_health_logs(provider_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_adult_providers_user ON public.adult_providers(user_id);

-- 10. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.content_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovered_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_import_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_rights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adult_providers ENABLE ROW LEVEL SECURITY;

-- Public read policies for active catalog sources & rights
CREATE POLICY "Public read verified sources" ON public.content_sources
  FOR SELECT USING (true);

CREATE POLICY "Public read playback ready content" ON public.discovered_content
  FOR SELECT USING (lifecycle_status = 'playback_ready');

CREATE POLICY "Public read content rights" ON public.content_rights
  FOR SELECT USING (true);

-- Admin full access policies
CREATE POLICY "Admin manage discovered content" ON public.discovered_content
  FOR ALL USING (true);

CREATE POLICY "Admin manage import queue" ON public.content_import_queue
  FOR ALL USING (true);

CREATE POLICY "Admin manage health logs" ON public.provider_health_logs
  FOR ALL USING (true);

CREATE POLICY "Users manage own adult providers" ON public.adult_providers
  FOR ALL USING (true);
