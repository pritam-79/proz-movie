import { 
  ProviderConfig, 
  CatalogDiscoveryParams, 
  CatalogDiscoveryResult, 
  VideoSource, 
  ChannelSyncResult 
} from '@/types/provider';

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
}
