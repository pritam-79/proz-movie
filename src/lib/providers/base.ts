import { 
  ProviderConfig, 
  CatalogDiscoveryParams, 
  CatalogDiscoveryResult, 
  VideoSource, 
  ChannelSyncResult,
  CatalogDiscoveryItem 
} from '@/types/provider';

export interface PlaybackAuthorizationResult {
  authorized: boolean;
  playbackUrl?: string;
  token?: string;
  expiresAt?: string;
  drmConfig?: Record<string, unknown>;
  reason?: string;
  sourceType?: string;
}

export interface ProviderHealthResult {
  healthy: boolean;
  status: 'connected' | 'configured' | 'pending' | 'partner_required' | 'error';
  latencyMs?: number;
  message: string;
  lastChecked: string;
}

export interface BaseProviderAdapter {
  readonly config: ProviderConfig;
  
  isConfigured(): boolean;
  
  testConnection(): Promise<{ 
    success: boolean; 
    message: string; 
    latencyMs?: number; 
    details?: Record<string, unknown>;
  }>;
  
  discoverCatalog(params: CatalogDiscoveryParams): Promise<CatalogDiscoveryResult>;
  
  getAvailability(
    title: string, 
    tmdbId?: number, 
    country?: string
  ): Promise<VideoSource[]>;
  
  syncChannel?(
    channelId: string, 
    country?: string
  ): Promise<ChannelSyncResult>;

  // Standardized Content Provider Interface (Section 9)
  searchTitles?(query: string, options?: any): Promise<CatalogDiscoveryItem[]>;
  getTitleDetails?(id: string | number): Promise<CatalogDiscoveryItem | null>;
  getSeasons?(titleId: string | number): Promise<any[]>;
  getEpisodes?(titleId: string | number, seasonNumber?: number): Promise<any[]>;
  getPlaybackAuthorization?(contentId: string, userEntitlements?: any): Promise<PlaybackAuthorizationResult>;
  getProviderHealth?(): Promise<ProviderHealthResult>;
}
