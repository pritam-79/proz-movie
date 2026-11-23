-- ============================================================================
-- PROZ MOVIE v0.02 — COMPLETE DATABASE SCHEMA MIGRATION
-- Multi-User Media Library, Stash Server Federation, Permissions & Compliance
-- Version: 0.02
-- Date: 2026-11-23
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. LIBRARY SERVERS & FEDERATED STASH CONNECTIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS library_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  server_url TEXT NOT NULL,
  api_key_encrypted TEXT,
  connection_status VARCHAR(50) DEFAULT 'pending' CHECK (connection_status IN ('connected', 'disconnected', 'error', 'pending')),
  last_sync_at TIMESTAMPTZ,
  sync_schedule VARCHAR(50) DEFAULT 'manual' CHECK (sync_schedule IN ('hourly', 'daily', 'manual')),
  is_enabled BOOLEAN DEFAULT true,
  library_identifier VARCHAR(255) NOT NULL,
  server_version VARCHAR(100),
  scene_count INTEGER DEFAULT 0,
  performer_count INTEGER DEFAULT 0,
  studio_count INTEGER DEFAULT 0,
  gallery_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_library_servers_status ON library_servers(connection_status, is_enabled);

-- ----------------------------------------------------------------------------
-- 2. MEDIA LIBRARIES (Partitions / Virtual Repositories)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS media_libraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES library_servers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  library_type VARCHAR(50) DEFAULT 'stash' CHECK (library_type IN ('stash', 'local', 's3', 'custom')),
  is_restricted_adult BOOLEAN DEFAULT false,
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_libraries_adult ON media_libraries(is_restricted_adult);

-- ----------------------------------------------------------------------------
-- 3. LIBRARY SYNCHRONIZATION JOBS & LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS library_sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES library_servers(id) ON DELETE CASCADE,
  library_id UUID REFERENCES media_libraries(id) ON DELETE SET NULL,
  job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('full', 'incremental', 'reconciliation', 'metadata_refresh')),
  status VARCHAR(50) DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
  items_synced INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  error_log TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_jobs_server ON library_sync_jobs(server_id, status);

-- ----------------------------------------------------------------------------
-- 4. FEDERATED LIBRARY ITEMS (Scenes, Videos, Galleries)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS library_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID REFERENCES media_libraries(id) ON DELETE CASCADE,
  server_id UUID REFERENCES library_servers(id) ON DELETE CASCADE,
  external_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  details TEXT,
  release_date DATE,
  rating NUMERIC(3, 2),
  duration_seconds INTEGER DEFAULT 0,
  paths JSONB DEFAULT '{}'::jsonb, -- screenshot, preview, stream, webp, vtt, etc.
  studio_id VARCHAR(255),
  studio_name VARCHAR(255),
  performers JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  is_organized BOOLEAN DEFAULT false,
  play_count INTEGER DEFAULT 0,
  o_counter INTEGER DEFAULT 0,
  is_restricted_adult BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(server_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_library_items_lookup ON library_items(library_id, is_restricted_adult);
CREATE INDEX IF NOT EXISTS idx_library_items_studio ON library_items(studio_id);

-- ----------------------------------------------------------------------------
-- 5. EXTERNAL ID MAPPING (Cross-federation)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS library_item_external_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES library_items(id) ON DELETE CASCADE,
  source VARCHAR(100) NOT NULL,
  external_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, source)
);

-- ----------------------------------------------------------------------------
-- 6. USER GROUPS & ROLES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES user_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- ----------------------------------------------------------------------------
-- 7. FINE-GRAINED LIBRARY PERMISSIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS library_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  principal_type VARCHAR(20) NOT NULL CHECK (principal_type IN ('user', 'group')),
  principal_id UUID NOT NULL,
  library_id UUID REFERENCES media_libraries(id) ON DELETE CASCADE,
  can_view BOOLEAN DEFAULT true,
  can_stream BOOLEAN DEFAULT true,
  can_download BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(principal_type, principal_id, library_id)
);

CREATE TABLE IF NOT EXISTS collection_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  principal_type VARCHAR(20) NOT NULL CHECK (principal_type IN ('user', 'group')),
  principal_id UUID NOT NULL,
  studio_id VARCHAR(255),
  tag_id VARCHAR(255),
  is_hidden BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. PERSONAL USER DATA (Isolated Per User)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_id VARCHAR(255) NOT NULL,
  rating NUMERIC(3, 1) NOT NULL CHECK (rating >= 1 AND rating <= 10),
  rated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

CREATE TABLE IF NOT EXISTS user_favourites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_id VARCHAR(255) NOT NULL,
  item_type VARCHAR(50) DEFAULT 'media' CHECK (item_type IN ('media', 'performer', 'studio', 'tag', 'collection')),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id, item_type)
);

CREATE TABLE IF NOT EXISTS user_hidden_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_id VARCHAR(255) NOT NULL,
  hidden_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

CREATE TABLE IF NOT EXISTS user_saved_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  filter_type VARCHAR(50) NOT NULL CHECK (filter_type IN ('scenes', 'performers', 'studios', 'movies', 'general')),
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 9. ADVANCED PLAYLISTS & SHARING
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT true,
  thumbnail_url TEXT,
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS playlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  media_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  source_type VARCHAR(50) DEFAULT 'stash' CHECK (source_type IN ('stash', 'ott', 'p2p')),
  added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_playlist_items_order ON playlist_items(playlist_id, order_index);

CREATE TABLE IF NOT EXISTS playlist_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  principal_type VARCHAR(20) NOT NULL CHECK (principal_type IN ('user', 'group')),
  principal_id UUID NOT NULL,
  can_view BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playlist_id, principal_type, principal_id)
);

-- ----------------------------------------------------------------------------
-- 10. PLAYBACK SESSIONS & RESUME PROGRESS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS playback_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_id VARCHAR(255) NOT NULL,
  resume_time_seconds INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_playback_progress_user ON playback_progress(user_id, updated_at DESC);

-- ----------------------------------------------------------------------------
-- 11. DOWNLOAD MANAGER
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS download_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  media_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  file_size_bytes BIGINT DEFAULT 0,
  downloaded_bytes BIGINT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'queued' CHECK (status IN ('queued', 'downloading', 'paused', 'completed', 'error', 'cancelled')),
  signed_download_url TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_download_jobs_user ON download_jobs(user_id, status);

-- ----------------------------------------------------------------------------
-- 12. AUTHORIZED P2P & LEGAL MEDIA SOURCES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS authorized_media_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name VARCHAR(255) NOT NULL,
  source_url TEXT NOT NULL,
  source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('webtorrent_tracker', 'archive_feed', 'cc_index', 'direct_manifest')),
  licence_type VARCHAR(100) NOT NULL CHECK (licence_type IN ('public_domain', 'creative_commons_cc_by', 'creative_commons_cc_by_sa', 'creative_commons_cc0', 'open_source_media', 'direct_publisher_licence')),
  rights_owner VARCHAR(255) NOT NULL,
  redistribution_permission BOOLEAN DEFAULT true,
  allowed_territories TEXT[] DEFAULT ARRAY['ALL'],
  verification_status VARCHAR(50) DEFAULT 'pending_review' CHECK (verification_status IN ('verified', 'pending_review', 'rejected')),
  verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  verification_evidence TEXT,
  is_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS source_rights_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES authorized_media_sources(id) ON DELETE CASCADE,
  rights_document_url TEXT,
  valid_from DATE NOT NULL,
  valid_to DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_licences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id VARCHAR(255) NOT NULL,
  licence_number VARCHAR(100) NOT NULL,
  licensor VARCHAR(255) NOT NULL,
  licence_type VARCHAR(100) NOT NULL,
  territories TEXT[] DEFAULT ARRAY['ALL'],
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 13. AUDIT LOGGING & COMPLIANCE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(100) NOT NULL,
  target_id VARCHAR(255),
  details JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action, created_at DESC);

-- ----------------------------------------------------------------------------
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE library_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favourites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hidden_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE playback_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorized_media_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Personal data RLS: Users can only read/write their own records
CREATE POLICY "Users access own ratings" ON user_ratings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own favourites" ON user_favourites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own hidden items" ON user_hidden_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own saved filters" ON user_saved_filters FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own playlists" ON playlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own playlist items" ON playlist_items FOR ALL USING (
  EXISTS (SELECT 1 FROM playlists WHERE playlists.id = playlist_items.playlist_id AND playlists.user_id = auth.uid())
);
CREATE POLICY "Users access own progress" ON playback_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own download jobs" ON download_jobs FOR ALL USING (auth.uid() = user_id);

-- Admin read/manage on system tables
CREATE POLICY "Admins manage library servers" ON library_servers FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins manage sync jobs" ON library_sync_jobs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins manage authorized media sources" ON authorized_media_sources FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);
