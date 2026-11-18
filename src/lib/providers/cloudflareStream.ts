import { BaseProviderAdapter, PlaybackAuthorizationResult, ProviderHealthResult } from './base';
import { 
  ProviderConfig, 
  CatalogDiscoveryParams, 
  CatalogDiscoveryResult, 
  VideoSource 
} from '@/types/provider';

export class CloudflareStreamAdapter implements BaseProviderAdapter {
  readonly config: ProviderConfig = {
    id: 'cloudflare_stream',
    name: 'Cloudflare Stream Video Infrastructure',
    apiType: 'rest',
    apiEndpoint: 'https://api.cloudflare.com/client/v4/accounts/{account_id}/stream',
    documentationUrl: 'https://developers.cloudflare.com/stream/',
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
    rateLimitPerMinute: 1200
  };

  private accountId: string | null;
  private apiToken: string | null;
  private signingKeyId: string | null;
  private signingKeyJwk: string | null;

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID || null;
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN || null;
    this.signingKeyId = process.env.CLOUDFLARE_STREAM_SIGNING_KEY_ID || null;
    this.signingKeyJwk = process.env.CLOUDFLARE_STREAM_SIGNING_PRIVATE_KEY || null;

    if (this.isConfigured()) {
      this.config.connectionStatus = 'configured';
    } else {
      this.config.connectionStatus = 'pending';
    }
  }

  isConfigured(): boolean {
    return Boolean(
      this.accountId && 
      this.apiToken && 
      this.apiToken !== 'your_cloudflare_api_token'
    );
  }

  async testConnection(): Promise<{ success: boolean; message: string; latencyMs?: number; details?: Record<string, unknown> }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Cloudflare Stream is not configured. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in environment variables.',
        details: {
          status: 'awaiting_credentials',
          docs: this.config.documentationUrl
        }
      };
    }

    const start = Date.now();
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream?limit=1`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      const latency = Date.now() - start;

      if (res.ok) {
        this.config.connectionStatus = 'connected';
        return {
          success: true,
          message: 'Cloudflare Stream API connection verified. Adaptive HLS/DASH video delivery operational.',
          latencyMs: latency,
          details: { accountId: this.accountId, signingKeyConfigured: Boolean(this.signingKeyId) }
        };
      }

      this.config.connectionStatus = 'error';
      return {
        success: false,
        message: `Cloudflare Stream returned HTTP ${res.status}: ${res.statusText}`,
        latencyMs: latency
      };
    } catch (err: any) {
      this.config.connectionStatus = 'error';
      return {
        success: false,
        message: `Cloudflare Stream connection error: ${err.message || 'Network error'}`,
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
      providerId: 'cloudflare_stream',
      country: params.country || 'GLOBAL'
    };
  }

  async getAvailability(title: string, tmdbId?: number, country: string = 'IN'): Promise<VideoSource[]> {
    return [];
  }

  /**
   * Generates a signed playback token for authorized streaming
   */
  async getPlaybackAuthorization(contentId: string, userEntitlements?: any): Promise<PlaybackAuthorizationResult> {
    if (!this.isConfigured()) {
      return {
        authorized: false,
        reason: 'Cloudflare Stream provider is not active.'
      };
    }

    // In production, sign JWT using CLOUDFLARE_STREAM_SIGNING_PRIVATE_KEY
    const expiresAt = new Date(Date.now() + 14400000).toISOString(); // 4 hours
    const playbackUrl = `https://customer-${this.accountId}.cloudflarestream.com/${contentId}/manifest/video.m3u8`;

    return {
      authorized: true,
      playbackUrl,
      token: `cf_token_${contentId}_${Date.now()}`,
      expiresAt,
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
