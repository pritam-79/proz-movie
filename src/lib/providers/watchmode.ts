import { BaseProviderAdapter } from './base';
import { 
  ProviderConfig, 
  CatalogDiscoveryParams, 
  CatalogDiscoveryResult, 
  VideoSource,
  CatalogDiscoveryItem
} from '@/types/provider';

const WATCHMODE_BASE_URL = 'https://api.watchmode.com/v1';

export class WatchmodeAdapter implements BaseProviderAdapter {
  readonly config: ProviderConfig = {
    id: 'watchmode',
    name: 'Watchmode Official API',
    apiType: 'rest',
    apiEndpoint: WATCHMODE_BASE_URL,
    documentationUrl: 'https://api.watchmode.com/docs',
    authenticationType: 'api_key',
    connectionStatus: 'pending',
    countryCoverage: ['IN', 'US', 'GB', 'CA', 'AU'],
    lastSyncAt: null,
    syncIntervalHours: 12,
    features: {
      hasCatalog: true,
      hasStreams: false,
      hasDeepLinks: true,
      hasEmbed: false,
      isFree: false,
      requiresSubscription: true
    },
    rateLimitPerMinute: 60
  };

  private apiKey: string | null;

  constructor() {
    this.apiKey = process.env.WATCHMODE_API_KEY || null;
    if (this.isConfigured()) {
      this.config.connectionStatus = 'connected';
    }
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey !== 'your_watchmode_api_key_here');
  }

  async testConnection(): Promise<{ success: boolean; message: string; latencyMs?: number; details?: Record<string, unknown> }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Watchmode API key is not configured in environment variables (WATCHMODE_API_KEY).',
        details: { status: 'unconfigured', docs: this.config.documentationUrl }
      };
    }

    const start = Date.now();
    try {
      const res = await fetch(`${WATCHMODE_BASE_URL}/status/?apiKey=${this.apiKey}`, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 60 }
      });
      const latency = Date.now() - start;

      if (res.ok) {
        this.config.connectionStatus = 'connected';
        return {
          success: true,
          message: 'Watchmode API connection verified successfully.',
          latencyMs: latency,
          details: { status: 'healthy', regionCoverage: this.config.countryCoverage }
        };
      }

      this.config.connectionStatus = 'error';
      return {
        success: false,
        message: `Watchmode API responded with HTTP ${res.status}: ${res.statusText}`,
        latencyMs: latency
      };
    } catch (err: any) {
      this.config.connectionStatus = 'error';
      return {
        success: false,
        message: `Watchmode connection failed: ${err.message || 'Network error'}`,
        latencyMs: Date.now() - start
      };
    }
  }

  async discoverCatalog(params: CatalogDiscoveryParams): Promise<CatalogDiscoveryResult> {
    const country = params.country || 'IN';
    const query = params.query || 'cinema';

    if (!this.isConfigured()) {
      return {
        items: [],
        page: 1,
        totalPages: 0,
        totalResults: 0,
        providerId: 'watchmode',
        country
      };
    }

    try {
      const searchUrl = `${WATCHMODE_BASE_URL}/search/?apiKey=${this.apiKey}&search_field=name&search_value=${encodeURIComponent(query)}&types=movie,tv`;
      const res = await fetch(searchUrl, { next: { revalidate: 3600 } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const results = data.title_results || [];

      const items: CatalogDiscoveryItem[] = results.map((r: any) => ({
        id: `wm-${r.id}`,
        externalId: String(r.id),
        providerId: 'watchmode',
        watchmodeId: r.id,
        tmdbId: r.tmdb_id,
        title: r.name,
        description: `Official Watchmode catalog listing for ${r.name}.`,
        poster: r.image_url || '',
        backdrop: '',
        contentType: r.type === 'tv_series' ? 'series' : 'movie',
        releaseYear: r.year || 2024,
        language: 'en',
        country,
        genres: [],
        rating: 8.0,
        sources: []
      }));

      return {
        items,
        page: params.page || 1,
        totalPages: Math.ceil(items.length / (params.limit || 20)),
        totalResults: items.length,
        providerId: 'watchmode',
        country
      };
    } catch (err) {
      console.warn('Watchmode catalog discovery error:', err);
      return {
        items: [],
        page: 1,
        totalPages: 0,
        totalResults: 0,
        providerId: 'watchmode',
        country
      };
    }
  }

  async getAvailability(title: string, tmdbId?: number, country: string = 'IN'): Promise<VideoSource[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      // 1. Search title ID if tmdbId is not resolved
      let watchmodeTitleId: number | null = null;
      const searchRes = await fetch(
        `${WATCHMODE_BASE_URL}/search/?apiKey=${this.apiKey}&search_field=name&search_value=${encodeURIComponent(title)}`,
        { next: { revalidate: 7200 } }
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const match = searchData.title_results?.[0];
        if (match) watchmodeTitleId = match.id;
      }

      if (!watchmodeTitleId) return [];

      // 2. Query title sources for the country region
      const sourcesRes = await fetch(
        `${WATCHMODE_BASE_URL}/title/${watchmodeTitleId}/sources/?apiKey=${this.apiKey}&regions=${country}`,
        { next: { revalidate: 7200 } }
      );
      if (!sourcesRes.ok) return [];
      const sourcesData = await sourcesRes.json();

      return (sourcesData || []).map((s: any, idx: number): VideoSource => {
        const pricingType: VideoSource['pricingType'] = 
          s.type === 'sub' ? 'subscription' :
          s.type === 'free' ? 'free' :
          s.type === 'rent' ? 'rent' : 'buy';

        return {
          id: `wm-src-${watchmodeTitleId}-${s.source_id}-${idx}`,
          contentId: String(tmdbId || watchmodeTitleId),
          providerId: s.name?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'watchmode_partner',
          providerName: s.name || 'Official Provider',
          sourceType: 'official_web',
          format: 'external',
          officialWatchUrl: s.web_url,
          appDeepLink: {
            android: s.android_url,
            ios: s.ios_url,
            web: s.web_url
          },
          pricingType,
          price: s.price ? `$${s.price}` : undefined,
          quality: s.format === '4K' ? '4K' : s.format === 'HD' ? '1080p' : 'SD',
          country: s.region || country,
          rightsStatus: pricingType === 'free' ? 'authorized' : 'third_party_subscription',
          verificationStatus: 'verified',
          lastChecked: new Date().toISOString()
        };
      });
    } catch (err) {
      console.warn('Watchmode availability lookup failed:', err);
      return [];
    }
  }
}
