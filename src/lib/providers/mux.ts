import { BaseProviderAdapter, PlaybackAuthorizationResult, ProviderHealthResult } from './base';
import { 
  ProviderConfig, 
  CatalogDiscoveryParams, 
  CatalogDiscoveryResult, 
  VideoSource 
} from '@/types/provider';

export class MuxAdapter implements BaseProviderAdapter {
  readonly config: ProviderConfig = {
    id: 'mux',
    name: 'Mux Video Provider Adapter',
    apiType: 'rest',
    apiEndpoint: 'https://api.mux.com/video/v1',
    documentationUrl: 'https://www.mux.com/docs',
    authenticationType: 'bearer',
    connectionStatus: 'pending',
    countryCoverage: ['GLOBAL', 'IN'],
    lastSyncAt: null,
    syncIntervalHours: 24,
    features: {
      hasCatalog: false,
      hasStreams: true,
      hasDeepLinks: false,
      hasEmbed: true,
      isFree: false,
      requiresSubscription: true
    },
    rateLimitPerMinute: 600
  };

  private tokenId: string | null;
  private tokenSecret: string | null;

  constructor() {
    this.tokenId = process.env.MUX_TOKEN_ID || null;
    this.tokenSecret = process.env.MUX_TOKEN_SECRET || null;

    if (this.isConfigured()) {
      this.config.connectionStatus = 'configured';
    } else {
      this.config.connectionStatus = 'pending';
    }
  }

  isConfigured(): boolean {
    return Boolean(this.tokenId && this.tokenSecret && this.tokenId !== 'your_mux_token_id');
  }

  async testConnection(): Promise<{ success: boolean; message: string; latencyMs?: number; details?: Record<string, unknown> }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Mux Video is awaiting credentials. Set MUX_TOKEN_ID and MUX_TOKEN_SECRET in environment variables.',
        details: { status: 'awaiting_credentials', docs: this.config.documentationUrl }
      };
    }

    const start = Date.now();
    try {
      const auth = Buffer.from(`${this.tokenId}:${this.tokenSecret}`).toString('base64');
      const res = await fetch('https://api.mux.com/video/v1/assets?limit=1', {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });
      const latency = Date.now() - start;

      if (res.ok) {
        this.config.connectionStatus = 'connected';
        return {
          success: true,
          message: 'Mux Video API connection verified. Adaptive HLS streaming ready.',
          latencyMs: latency,
          details: { status: 'healthy' }
        };
      }

      this.config.connectionStatus = 'error';
      return {
        success: false,
        message: `Mux API returned HTTP ${res.status}: ${res.statusText}`,
        latencyMs: latency
      };
    } catch (err: any) {
      this.config.connectionStatus = 'error';
      return {
        success: false,
        message: `Mux connection failed: ${err.message || 'Network error'}`,
        latencyMs: Date.now() - start
      };
    }
  }

  async discoverCatalog(params: CatalogDiscoveryParams): Promise<CatalogDiscoveryResult> {
    return {
      items: [],
      page: 1,
      totalPages: 0,
      totalResults: 0,
      providerId: 'mux',
      country: params.country || 'GLOBAL'
    };
  }

  async getAvailability(title: string, tmdbId?: number, country: string = 'IN'): Promise<VideoSource[]> {
    return [];
  }

  async getPlaybackAuthorization(playbackId: string): Promise<PlaybackAuthorizationResult> {
    if (!this.isConfigured()) {
      return {
        authorized: false,
        reason: 'Mux Video provider is not active.'
      };
    }

    return {
      authorized: true,
      playbackUrl: `https://stream.mux.com/${playbackId}.m3u8`,
      expiresAt: new Date(Date.now() + 14400000).toISOString(),
      sourceType: 'direct_hls'
    };
  }

  async getProviderHealth(): Promise<ProviderHealthResult> {
    const test = await this.testConnection();
    return {
      healthy: test.success,
      status: test.success ? 'connected' : 'pending',
      latencyMs: test.latencyMs,
      message: test.message,
      lastChecked: new Date().toISOString()
    };
  }
}
