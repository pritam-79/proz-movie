import { BaseProviderAdapter, ProviderHealthResult } from './base';
import { 
  ProviderConfig, 
  CatalogDiscoveryParams, 
  CatalogDiscoveryResult, 
  VideoSource,
  CatalogDiscoveryItem 
} from '@/types/provider';

const TVMAZE_BASE_URL = 'https://api.tvmaze.com';

export class TVmazeAdapter implements BaseProviderAdapter {
  readonly config: ProviderConfig = {
    id: 'tvmaze',
    name: 'TVmaze Official Television & Episode API',
    apiType: 'rest',
    apiEndpoint: TVMAZE_BASE_URL,
    documentationUrl: 'https://www.tvmaze.com/api',
    authenticationType: 'none',
    connectionStatus: 'connected', // Public REST API with no API key required
    countryCoverage: ['GLOBAL', 'US', 'GB', 'IN'],
    lastSyncAt: null,
    syncIntervalHours: 12,
    features: {
      hasCatalog: true,
      hasStreams: false, // Metadata only
      hasDeepLinks: true,
      hasEmbed: false,
      isFree: true,
      requiresSubscription: false
    },
    rateLimitPerMinute: 120
  };

  isConfigured(): boolean {
    return true; // Public free API
  }

  async testConnection(): Promise<{ success: boolean; message: string; latencyMs?: number; details?: Record<string, unknown> }> {
    const start = Date.now();
    try {
      const res = await fetch(`${TVMAZE_BASE_URL}/shows/1`, {
        next: { revalidate: 300 }
      });
      const latency = Date.now() - start;

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          message: `TVmaze REST API verified. Sample show: ${data.name || 'Under the Dome'}`,
          latencyMs: latency,
          details: { endpoint: TVMAZE_BASE_URL, format: 'JSON REST' }
        };
      }

      return {
        success: false,
        message: `TVmaze responded with HTTP ${res.status}: ${res.statusText}`,
        latencyMs: latency
      };
    } catch (err: any) {
      return {
        success: false,
        message: `TVmaze connection error: ${err.message || 'Network error'}`,
        latencyMs: Date.now() - start
      };
    }
  }

  async discoverCatalog(params: CatalogDiscoveryParams): Promise<CatalogDiscoveryResult> {
    const query = params.query || 'drama';
    const country = params.country || 'GLOBAL';

    try {
      const url = `${TVMAZE_BASE_URL}/search/shows?q=${encodeURIComponent(query)}`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const items: CatalogDiscoveryItem[] = (data || []).map((item: any) => {
        const show = item.show || {};
        return {
          id: `tvmaze-${show.id}`,
          externalId: String(show.id),
          providerId: 'tvmaze',
          title: show.name || 'Untitled Show',
          description: show.summary ? show.summary.replace(/<[^>]+>/g, '') : 'TV series indexed by TVmaze.',
          poster: show.image?.original || show.image?.medium || '',
          backdrop: show.image?.original || '',
          contentType: 'series',
          releaseYear: show.premiered ? parseInt(show.premiered.substring(0, 4), 10) : 2023,
          language: show.language?.toLowerCase() || 'en',
          country: show.network?.country?.code || country,
          genres: show.genres || ['Drama'],
          rating: show.rating?.average ? Number(show.rating.average.toFixed(1)) : 7.8,
          sources: []
        };
      });

      return {
        items,
        page: params.page || 1,
        totalPages: 1,
        totalResults: items.length,
        providerId: 'tvmaze',
        country
      };
    } catch (err) {
      console.warn('TVmaze discovery error:', err);
      return {
        items: [],
        page: 1,
        totalPages: 0,
        totalResults: 0,
        providerId: 'tvmaze',
        country
      };
    }
  }

  async getAvailability(title: string, tmdbId?: number, country: string = 'IN'): Promise<VideoSource[]> {
    return [];
  }

  async getEpisodes(showId: string | number): Promise<any[]> {
    try {
      const res = await fetch(`${TVMAZE_BASE_URL}/shows/${showId}/episodes`, {
        next: { revalidate: 3600 }
      });
      if (!res.ok) return [];
      const eps = await res.json();
      return eps.map((e: any) => ({
        id: `tvm-ep-${e.id}`,
        episode_number: e.number,
        season_number: e.season,
        title: e.name,
        overview: e.summary ? e.summary.replace(/<[^>]+>/g, '') : '',
        runtime: e.runtime,
        still_url: e.image?.original || e.image?.medium,
        air_date: e.airdate
      }));
    } catch {
      return [];
    }
  }

  async getProviderHealth(): Promise<ProviderHealthResult> {
    const test = await this.testConnection();
    return {
      healthy: test.success,
      status: test.success ? 'connected' : 'error',
      latencyMs: test.latencyMs,
      message: test.message,
      lastChecked: new Date().toISOString()
    };
  }
}
