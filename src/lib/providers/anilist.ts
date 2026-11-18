import { BaseProviderAdapter, ProviderHealthResult } from './base';
import { 
  ProviderConfig, 
  CatalogDiscoveryParams, 
  CatalogDiscoveryResult, 
  VideoSource,
  CatalogDiscoveryItem 
} from '@/types/provider';

const ANILIST_GRAPHQL_ENDPOINT = process.env.ANILIST_API_URL || 'https://graphql.anilist.co';

export class AniListAdapter implements BaseProviderAdapter {
  readonly config: ProviderConfig = {
    id: 'anilist',
    name: 'AniList GraphQL Official Anime API',
    apiType: 'graphql',
    apiEndpoint: ANILIST_GRAPHQL_ENDPOINT,
    documentationUrl: 'https://docs.anilist.co/guide/graphql/',
    authenticationType: 'none',
    connectionStatus: 'connected', // Public GraphQL endpoint
    countryCoverage: ['GLOBAL', 'JP', 'IN', 'US'],
    lastSyncAt: null,
    syncIntervalHours: 12,
    features: {
      hasCatalog: true,
      hasStreams: false, // AniList provides metadata only, not video streams
      hasDeepLinks: true,
      hasEmbed: false,
      isFree: true,
      requiresSubscription: false
    },
    rateLimitPerMinute: 90
  };

  isConfigured(): boolean {
    return true; // AniList GraphQL public endpoint requires no auth key
  }

  async testConnection(): Promise<{ success: boolean; message: string; latencyMs?: number; details?: Record<string, unknown> }> {
    const start = Date.now();
    const query = `
      query {
        Page(page: 1, perPage: 1) {
          media(type: ANIME, sort: TRENDING_DESC) {
            id
            title {
              romaji
              english
            }
          }
        }
      }
    `;

    try {
      const res = await fetch(ANILIST_GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ query }),
        next: { revalidate: 300 }
      });
      const latency = Date.now() - start;

      if (res.ok) {
        const data = await res.json();
        const first = data.data?.Page?.media?.[0];
        return {
          success: true,
          message: `AniList GraphQL connection verified. Active sample: ${first?.title?.english || first?.title?.romaji || 'Anime OK'}`,
          latencyMs: latency,
          details: { endpoint: ANILIST_GRAPHQL_ENDPOINT, type: 'GraphQL v2' }
        };
      }

      return {
        success: false,
        message: `AniList responded with HTTP ${res.status}: ${res.statusText}`,
        latencyMs: latency
      };
    } catch (err: any) {
      return {
        success: false,
        message: `AniList connection failed: ${err.message || 'Network error'}`,
        latencyMs: Date.now() - start
      };
    }
  }

  async discoverCatalog(params: CatalogDiscoveryParams): Promise<CatalogDiscoveryResult> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const country = params.country || 'GLOBAL';

    const sortType = params.sortBy === 'latest' ? 'START_DATE_DESC' : 'POPULARITY_DESC';
    const searchQuery = params.query ? `search: "${params.query}",` : '';
    const genreFilter = params.genre ? `genre_in: ["${params.genre}"],` : '';

    const query = `
      query {
        Page(page: ${page}, perPage: ${limit}) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
          }
          media(type: ANIME, ${searchQuery} ${genreFilter} sort: ${sortType}) {
            id
            idMal
            title {
              romaji
              english
              native
            }
            description(asHtml: false)
            coverImage {
              large
              extraLarge
            }
            bannerImage
            format
            status
            episodes
            duration
            genres
            averageScore
            seasonYear
            startDate {
              year
            }
            characters(sort: ROLE, perPage: 6) {
              nodes {
                id
                name {
                  full
                }
                image {
                  medium
                }
              }
            }
          }
        }
      }
    `;

    try {
      const res = await fetch(ANILIST_GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ query }),
        next: { revalidate: 3600 }
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const mediaList = json.data?.Page?.media || [];
      const pageInfo = json.data?.Page?.pageInfo || {};

      const items: CatalogDiscoveryItem[] = mediaList.map((m: any) => {
        const title = m.title?.english || m.title?.romaji || 'Anime';
        return {
          id: `anilist-${m.id}`,
          externalId: String(m.id),
          providerId: 'anilist',
          title,
          description: m.description ? m.description.replace(/<[^>]+>/g, '') : 'Official AniList catalog anime series.',
          poster: m.coverImage?.extraLarge || m.coverImage?.large || '',
          backdrop: m.bannerImage || m.coverImage?.extraLarge || '',
          contentType: m.format === 'MOVIE' ? 'movie' : 'anime',
          releaseYear: m.seasonYear || m.startDate?.year || 2024,
          language: 'ja',
          country: 'JP',
          genres: m.genres || ['Anime'],
          rating: m.averageScore ? Number((m.averageScore / 10).toFixed(1)) : 8.0,
          sources: [] // AniList supplies metadata only
        };
      });

      return {
        items,
        page,
        totalPages: pageInfo.lastPage || 1,
        totalResults: pageInfo.total || items.length,
        providerId: 'anilist',
        country
      };
    } catch (err) {
      console.warn('AniList catalog query error:', err);
      return {
        items: [],
        page,
        totalPages: 0,
        totalResults: 0,
        providerId: 'anilist',
        country
      };
    }
  }

  async getAvailability(title: string, tmdbId?: number, country: string = 'IN'): Promise<VideoSource[]> {
    // AniList is metadata only, so availability is not directly provided
    return [];
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
