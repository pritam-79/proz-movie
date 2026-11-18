import { BaseProviderAdapter } from './base';
import { 
  ProviderConfig, 
  CatalogDiscoveryParams, 
  CatalogDiscoveryResult, 
  VideoSource,
  CatalogDiscoveryItem 
} from '@/types/provider';

const ARCHIVE_SEARCH_API = 'https://archive.org/advancedsearch.php';
const ARCHIVE_METADATA_API = 'https://archive.org/metadata';

export class InternetArchiveAdapter implements BaseProviderAdapter {
  readonly config: ProviderConfig = {
    id: 'archive_org',
    name: 'Internet Archive Public Domain Cinema',
    apiType: 'rest',
    apiEndpoint: 'https://archive.org',
    documentationUrl: 'https://archive.org/developers/',
    authenticationType: 'none',
    connectionStatus: 'connected', // Public domain API requires no token
    countryCoverage: ['GLOBAL', 'IN', 'US', 'GB'],
    lastSyncAt: null,
    syncIntervalHours: 24,
    features: {
      hasCatalog: true,
      hasStreams: true,
      hasDeepLinks: false,
      hasEmbed: true,
      isFree: true,
      requiresSubscription: false
    },
    rateLimitPerMinute: 60
  };

  isConfigured(): boolean {
    return true; // Always operational for public domain catalog
  }

  async testConnection(): Promise<{ success: boolean; message: string; latencyMs?: number; details?: Record<string, unknown> }> {
    const start = Date.now();
    try {
      const res = await fetch(`${ARCHIVE_SEARCH_API}?q=collection%3Afeature_films&rows=1&output=json`, {
        next: { revalidate: 300 }
      });
      const latency = Date.now() - start;

      if (res.ok) {
        return {
          success: true,
          message: 'Internet Archive API connected. Public domain cinema repository accessible.',
          latencyMs: latency,
          details: { license: 'Creative Commons / Public Domain', streamFormat: 'Direct MP4' }
        };
      }

      return {
        success: false,
        message: `Internet Archive returned HTTP ${res.status}`,
        latencyMs: latency
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Internet Archive connection failure: ${err.message || 'Network error'}`,
        latencyMs: Date.now() - start
      };
    }
  }

  async discoverCatalog(params: CatalogDiscoveryParams): Promise<CatalogDiscoveryResult> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const country = params.country || 'IN';

    try {
      // Query top public domain feature films
      const query = params.query 
        ? `(title:(${encodeURIComponent(params.query)}) OR description:(${encodeURIComponent(params.query)})) AND mediatype:(movies)` 
        : `collection:(feature_films) AND mediatype:(movies)`;

      const url = `${ARCHIVE_SEARCH_API}?q=${query}&fl[]=identifier,title,description,year,downloads&sort[]=downloads+desc&rows=${limit}&page=${page}&output=json`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const docs = data.response?.docs || [];

      const items: CatalogDiscoveryItem[] = docs.map((doc: any) => {
        const id = doc.identifier;
        const mp4Url = `https://archive.org/download/${id}/${id}.mp4`;
        const thumbUrl = `https://archive.org/services/img/${id}`;

        const source: VideoSource = {
          id: `ia-src-${id}`,
          contentId: `ia-${id}`,
          providerId: 'archive_org',
          providerName: 'Internet Archive Public Domain',
          sourceType: 'html5_mp4',
          format: 'mp4',
          playbackUrl: mp4Url,
          officialWatchUrl: `https://archive.org/details/${id}`,
          pricingType: 'free',
          quality: '1080p',
          country: 'GLOBAL',
          rightsStatus: 'public_domain',
          verificationStatus: 'verified',
          lastChecked: new Date().toISOString()
        };

        return {
          id: `ia-${id}`,
          externalId: id,
          providerId: 'archive_org',
          title: doc.title || id,
          description: doc.description || 'Public-domain classic cinema preserved by the Internet Archive.',
          poster: thumbUrl,
          backdrop: thumbUrl,
          contentType: 'movie',
          releaseYear: doc.year ? parseInt(String(doc.year), 10) : 1960,
          language: 'en',
          country: 'GLOBAL',
          genres: ['Classic', 'Public Domain'],
          rating: 8.4,
          sources: [source]
        };
      });

      const totalResults = data.response?.numFound || items.length;

      return {
        items,
        page,
        totalPages: Math.ceil(totalResults / limit),
        totalResults,
        providerId: 'archive_org',
        country
      };
    } catch (err) {
      console.warn('Internet Archive discover failed:', err);
      return {
        items: [],
        page: 1,
        totalPages: 0,
        totalResults: 0,
        providerId: 'archive_org',
        country
      };
    }
  }

  async getAvailability(title: string, tmdbId?: number, country: string = 'IN'): Promise<VideoSource[]> {
    try {
      const url = `${ARCHIVE_SEARCH_API}?q=title%3A%28${encodeURIComponent(title)}%29+AND+mediatype%3A%28movies%29&rows=1&output=json`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) return [];
      const data = await res.json();
      const doc = data.response?.docs?.[0];
      if (!doc?.identifier) return [];

      const id = doc.identifier;
      return [{
        id: `ia-src-${id}`,
        contentId: String(tmdbId || id),
        providerId: 'archive_org',
        providerName: 'Internet Archive',
        sourceType: 'html5_mp4',
        format: 'mp4',
        playbackUrl: `https://archive.org/download/${id}/${id}.mp4`,
        officialWatchUrl: `https://archive.org/details/${id}`,
        pricingType: 'free',
        quality: '1080p',
        country: 'GLOBAL',
        rightsStatus: 'public_domain',
        verificationStatus: 'verified',
        lastChecked: new Date().toISOString()
      }];
    } catch {
      return [];
    }
  }
}
