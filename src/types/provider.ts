/**
 * PROZ Entertainment — Universal Provider & Streaming Integration Type Definitions
 * Phase 1 & 2 Provider Architecture
 */

export type ProviderId = 
  | 'watchmode'
  | 'justwatch'
  | 'tmdb'
  | 'anilist'
  | 'tvmaze'
  | 'youtube'
  | 'archive_org'
  | 'cloudflare_stream'
  | 'mux'
  | 'netflix'
  | 'prime_video'
  | 'disney_hotstar'
  | 'jiocinema'
  | 'zee5'
  | 'sonyliv'
  | 'aha'
  | 'chaupal'
  | 'shemaroo'
  | 'altbalaji'
  | 'hoichoi'
  | 'custom_feed';

export type ProviderApiType = 
  | 'rest'
  | 'graphql'
  | 'catalog_feed'
  | 'rss'
  | 'embed_api'
  | 'deep_link';

export type ProviderConnectionStatus = 
  | 'connected'
  | 'partner_required'
  | 'configured'
  | 'pending'
  | 'error'
  | 'disconnected';

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  apiType: ProviderApiType;
  apiEndpoint: string;
  documentationUrl: string;
  authenticationType: 'api_key' | 'bearer' | 'oauth2' | 'partner_key' | 'none';
  connectionStatus: ProviderConnectionStatus;
  countryCoverage: string[];
  lastSyncAt: string | null;
  syncIntervalHours: number;
  features: {
    hasCatalog: boolean;
    hasStreams: boolean;
    hasDeepLinks: boolean;
    hasEmbed: boolean;
    isFree: boolean;
    requiresSubscription: boolean;
  };
  rateLimitPerMinute?: number;
  errorCount?: number;
  lastErrorMessage?: string;
}

export type ChannelIntegrationStatus = 
  | 'API Connected'
  | 'Partner API Required'
  | 'Official Website Available'
  | 'Official App Available'
  | 'Catalog Available'
  | 'Playback Available'
  | 'Playback Restricted'
  | 'Integration Unavailable'
  | 'Awaiting Verification';

export type PlaybackMethod = 
  | 'direct_hls'
  | 'direct_dash'
  | 'html5_mp4'
  | 'youtube_embed'
  | 'official_web'
  | 'app_deep_link';

export interface VideoSource {
  id: string;
  contentId: string;
  providerId: string;
  providerName: string;
  sourceType: PlaybackMethod;
  format: 'hls' | 'dash' | 'mp4' | 'youtube' | 'external';
  playbackUrl?: string;
  officialWatchUrl: string;
  appDeepLink?: {
    android?: string;
    ios?: string;
    androidTv?: string;
    web?: string;
  };
  pricingType: 'free' | 'subscription' | 'rent' | 'buy';
  price?: string;
  quality: '4K' | '1080p' | '720p' | 'SD';
  country: string;
  rightsStatus: 'authorized' | 'public_domain' | 'official_embed' | 'licensed_partner' | 'third_party_subscription';
  verificationStatus: 'verified' | 'unverified' | 'failed';
  lastChecked: string;
}

export interface CatalogDiscoveryParams {
  query?: string;
  genre?: string;
  page?: number;
  limit?: number;
  country?: string;
  contentType?: 'movie' | 'series' | 'anime' | 'all';
  sortBy?: 'popularity' | 'latest' | 'rating';
}

export interface CatalogDiscoveryItem {
  id: string;
  externalId: string;
  providerId: string;
  tmdbId?: number;
  watchmodeId?: number;
  title: string;
  description: string;
  poster: string;
  backdrop: string;
  contentType: 'movie' | 'series' | 'anime';
  releaseYear: number;
  language: string;
  country: string;
  genres: string[];
  rating: number;
  sources: VideoSource[];
}

export interface CatalogDiscoveryResult {
  items: CatalogDiscoveryItem[];
  page: number;
  totalPages: number;
  totalResults: number;
  providerId: string;
  country: string;
}

export interface ChannelSyncResult {
  channelId: string;
  status: 'success' | 'partial' | 'error';
  discoveredCount: number;
  updatedCount: number;
  errors: string[];
  syncedAt: string;
}

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  providerId: string;
  action: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  itemsProcessed?: number;
  durationMs?: number;
}
