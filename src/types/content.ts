// ============================================================================
// PROZ MOVIE — Content Type Definitions
// Supports both Supabase DB records (snake_case) and legacy mock data
// ============================================================================

import { VideoSource } from './provider';

export interface ContentItem {
  // Core identifiers
  id: string;
  title: string;
  slug: string;

  // DB fields (snake_case from Supabase)
  content_type?: 'movie' | 'series' | 'anime' | 'drama';
  original_title?: string;
  subcategory?: string;
  description?: string;
  overview?: string;
  age_rating?: string;
  is_adult?: boolean;
  is_featured?: boolean;
  is_trending?: boolean;
  view_count?: number;
  rating_avg?: number;
  runtime_minutes?: number;
  release_year?: number;
  language?: string;
  country?: string;
  poster_url?: string;
  backdrop_url?: string;
  thumbnail_url?: string;
  trailer_url?: string;
  youtube_id?: string;
  youtubeId?: string;
  available_qualities?: string[];
  tmdb_id?: number;
  watchmode_id?: number;
  justwatch_id?: string;
  video_sources?: VideoSource[];
  videoSources?: VideoSource[];
  genres?: Array<{ id: string; name: string; slug: string }> | string[];
  tags?: string[];
  cast?: Array<{ name: string; character?: string; profile_url?: string; avatarUrl?: string }>;
  crew?: Array<{ name: string; job?: string; role?: string }>;
  seasons?: Season[];
  video_assets?: VideoAsset[];
  subtitles?: Subtitle[];
  audio_tracks?: AudioTrack[];
  licenses?: License[];
  created_at?: string;
  updated_at?: string;

  // Legacy mock data fields (camelCase)
  type?: 'movie' | 'series' | 'anime' | 'drama';
  category?: string;
  originalTitle?: string;
  synopsis?: string;
  tagline?: string;
  releaseYear?: number;
  runtimeMinutes?: number;
  maturityRating?: string;
  languages?: string[];
  ratingScore?: number;
  ratingCount?: number;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  streamUrl?: string;
  dashUrl?: string;
  fallbackMp4?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  isOriginal?: boolean;
  isRestricted18Plus?: boolean;
  audioTracks?: Array<{ id: string; label: string; lang: string; codec?: string; isDefault?: boolean }>;
  license?: { licensor: string; expiryDate: string; territories: string[] };
  skipIntroSeconds?: number;
  skipCreditsSeconds?: number;
}

export interface Season {
  id: string;
  content_id?: string;
  season_number?: number;
  seasonNumber?: number;
  title?: string;
  description?: string;
  episode_count?: number;
  episodeCount?: number;
  poster_url?: string;
  air_date?: string;
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  season_id?: string;
  content_id?: string;
  episode_number?: number;
  episodeNumber?: number;
  season_number?: number;
  seasonNumber?: number;
  title: string;
  description?: string;
  synopsis?: string;
  thumbnail_url?: string;
  thumbnailUrl?: string;
  duration_seconds?: number;
  runtimeMinutes?: number;
  durationMinutes?: number;
  air_date?: string;
  airDate?: string;
  is_filler?: boolean;
  skip_intro_start?: number;
  skip_intro_end?: number;
  introStartSec?: number;
  introEndSec?: number;
  streamUrl?: string;
  fallbackMp4?: string;
  video_assets?: VideoAsset[];
  subtitles?: Subtitle[];
}

export interface VideoAsset {
  id: string;
  content_id?: string;
  episode_id?: string;
  provider: string;
  provider_asset_id?: string;
  hls_url?: string;
  dash_url?: string;
  drm_config?: Record<string, unknown>;
  available_qualities?: string[];
  duration_seconds?: number;
  is_active: boolean;
}

export interface Subtitle {
  id: string;
  language_code?: string;
  lang?: string;
  label: string;
  format?: 'srt' | 'vtt' | 'ass';
  url: string;
  is_default?: boolean;
  isDefault?: boolean;
}

export type SubtitleTrack = Subtitle;

export interface AudioTrack {
  id: string;
  language_code?: string;
  lang?: string;
  label: string;
  is_default?: boolean;
  isDefault?: boolean;
  is_dubbed?: boolean;
  codec?: string;
}

export type AudioTrackOption = AudioTrack;

export interface License {
  id?: string;
  content_id?: string;
  rights_holder?: string;
  licensor?: string;
  expiry_date?: string;
  expiryDate?: string;
  territories?: string[];
  is_active?: boolean;
  streaming_permitted?: boolean;
}

// User profile type (for mock auth)
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  is18PlusVerified: boolean;
  role: 'user' | 'admin';
  subscription?: UserSubscription;
}

export interface UserSubscription {
  planId: string;
  status: 'active' | 'expired' | 'canceled' | 'past_due';
  renewsAt?: string;
  maxScreens: number;
  videoQuality: string;
}
