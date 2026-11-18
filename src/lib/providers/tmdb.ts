import { BaseProviderAdapter } from './base';
import { 
  ProviderConfig, 
  CatalogDiscoveryParams, 
  CatalogDiscoveryResult, 
  VideoSource,
  CatalogDiscoveryItem 
} from '@/types/provider';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export class TmdbAdapter implements BaseProviderAdapter {
  readonly config: ProviderConfig = {
    id: 'tmdb',
    name: 'The Movie Database (TMDB) Official API',
    apiType: 'rest',
    apiEndpoint: TMDB_BASE_URL,
    documentationUrl: 'https://developer.themoviedb.org/docs/getting-started',
    authenticationType: 'api_key',
    connectionStatus: 'pending',
    countryCoverage: ['IN', 'US', 'GB', 'CA', 'GLOBAL'],
    lastSyncAt: null,
    syncIntervalHours: 6,
    features: {
      hasCatalog: true,
      hasStreams: false,
      hasDeepLinks: false,
      hasEmbed: false,
      isFree: true,
      requiresSubscription: false
    },
    rateLimitPerMinute: 240
  };

  private apiKey: string | null;

  constructor() {
    this.apiKey = process.env.TMDB_API_KEY || null;
    if (this.isConfigured()) {
      this.config.connectionStatus = 'connected';
    }
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey !== 'your_tmdb_api_key_here');
  }

  async testConnection(): Promise<{ success: boolean; message: string; latencyMs?: number; details?: Record<string, unknown> }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'TMDB API key is not configured in environment variables (TMDB_API_KEY).',
        details: { status: 'unconfigured', docs: this.config.documentationUrl }
      };
    }

    const start = Date.now();
    try {
      const res = await fetch(`${TMDB_BASE_URL}/configuration?api_key=${this.apiKey}`, {
        next: { revalidate: 60 }
      });
      const latency = Date.now() - start;

      if (res.ok) {
        this.config.connectionStatus = 'connected';
        return {
          success: true,
          message: 'TMDB API connection verified. Metadata and artwork services operational.',
          latencyMs: latency,
          details: { attribution: 'This product uses the TMDB API but is not endorsed or certified by TMDB.' }
        };
      }

      this.config.connectionStatus = 'error';
      return {
        success: false,
        message: `TMDB API returned HTTP ${res.status}: ${res.statusText}`,
        latencyMs: latency
      };
    } catch (err: any) {
      this.config.connectionStatus = 'error';
      return {
        success: false,
        message: `TMDB connection failed: ${err.message || 'Network error'}`,
        latencyMs: Date.now() - start
      };
    }
  }

  async discoverCatalog(params: CatalogDiscoveryParams): Promise<CatalogDiscoveryResult> {
    const page = params.page || 1;
    const country = params.country || 'IN';

    if (!this.isConfigured()) {
      return {
        items: [],
        page: 1,
        totalPages: 0,
        totalResults: 0,
        providerId: 'tmdb',
        country
      };
    }

    try {
      let endpoint = '/discover/movie';
      const searchParams = new URLSearchParams({
        api_key: this.apiKey as string,
        page: String(page),
        sort_by: params.sortBy === 'latest' ? 'primary_release_date.desc' : 'popularity.desc',
        include_adult: 'false'
      });

      if (params.query) {
        endpoint = '/search/multi';
        searchParams.set('query', params.query);
      } else if (params.contentType === 'series') {
        endpoint = '/discover/tv';
      }

      const res = await fetch(`${TMDB_BASE_URL}${endpoint}?${searchParams.toString()}`, {
        next: { revalidate: 3600 }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const items: CatalogDiscoveryItem[] = (data.results || []).map((r: any) => ({
        id: `tmdb-${r.id}`,
        externalId: String(r.id),
        providerId: 'tmdb',
        tmdbId: r.id,
        title: r.title || r.name || 'Untitled',
        description: r.overview || 'No synopsis available.',
        poster: r.poster_path ? `${TMDB_IMAGE_BASE}/w500${r.poster_path}` : '',
        backdrop: r.backdrop_path ? `${TMDB_IMAGE_BASE}/original${r.backdrop_path}` : '',
        contentType: r.media_type === 'tv' || endpoint.includes('/tv') ? 'series' : 'movie',
        releaseYear: parseInt((r.release_date || r.first_air_date || '2024').substring(0, 4), 10),
        language: r.original_language || 'en',
        country,
        genres: [],
        rating: Number((r.vote_average || 7.5).toFixed(1)),
        sources: []
      }));

      return {
        items,
        page: data.page || page,
        totalPages: data.total_pages || 1,
        totalResults: data.total_results || items.length,
        providerId: 'tmdb',
        country
      };
    } catch (err) {
      console.warn('TMDB discover error:', err);
      return {
        items: [],
        page,
        totalPages: 0,
        totalResults: 0,
        providerId: 'tmdb',
        country
      };
    }
  }

  async getAvailability(title: string, tmdbId?: number, country: string = 'IN'): Promise<VideoSource[]> {
    // TMDB watch/providers endpoint (JustWatch data via TMDB)
    if (!this.isConfigured() || !tmdbId) return [];

    try {
      const res = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}/watch/providers?api_key=${this.apiKey}`, {
        next: { revalidate: 7200 }
      });
      if (!res.ok) return [];
      const data = await res.json();
      const countryData = data.results?.[country] || data.results?.['IN'] || data.results?.['US'];
      if (!countryData) return [];

      const sources: VideoSource[] = [];
      const watchUrl = countryData.link || `https://www.themoviedb.org/movie/${tmdbId}/watch`;

      // Flatrate (Subscription)
      (countryData.flatrate || []).forEach((p: any, idx: number) => {
        sources.push({
          id: `tmdb-src-sub-${tmdbId}-${p.provider_id}-${idx}`,
          contentId: String(tmdbId),
          providerId: p.provider_name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          providerName: p.provider_name,
          sourceType: 'official_web',
          format: 'external',
          officialWatchUrl: watchUrl,
          pricingType: 'subscription',
          quality: '1080p',
          country,
          rightsStatus: 'third_party_subscription',
          verificationStatus: 'verified',
          lastChecked: new Date().toISOString()
        });
      });

      // Free with ads
      (countryData.ads || countryData.free || []).forEach((p: any, idx: number) => {
        sources.push({
          id: `tmdb-src-free-${tmdbId}-${p.provider_id}-${idx}`,
          contentId: String(tmdbId),
          providerId: p.provider_name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          providerName: p.provider_name,
          sourceType: 'official_web',
          format: 'external',
          officialWatchUrl: watchUrl,
          pricingType: 'free',
          quality: '1080p',
          country,
          rightsStatus: 'authorized',
          verificationStatus: 'verified',
          lastChecked: new Date().toISOString()
        });
      });

      return sources;
    } catch {
      return [];
    }
  }
}
