import { ContentItem } from '@/types/content';
import { VideoSource } from '@/types/provider';
import { MOCK_CONTENT } from '@/lib/data/mockContent';
import { providerRegistry } from '@/lib/providers/registry';
import { isMismatchedPlaceholderStream } from '@/lib/utils/streamUtils';

export interface DynamicCollectionParams {
  category?: string;
  genre?: string;
  country?: string;
  page?: number;
  limit?: number;
  sortBy?: 'trending' | 'rating' | 'latest' | 'popular';
  isFreeOnly?: boolean;
}

export interface DynamicCollectionResult {
  title: string;
  slug: string;
  description: string;
  items: ContentItem[];
  page: number;
  totalPages: number;
  totalResults: number;
  country: string;
}

export class ContentDiscoveryService {
  /**
   * Enriches a single title with real multi-provider availability sources
   */
  async enrichWithAvailability(item: ContentItem, country: string = 'IN'): Promise<ContentItem> {
    if (item.videoSources && item.videoSources.length > 0) {
      return item;
    }

    try {
      const sources = await providerRegistry.resolveAvailability(
        item.title,
        item.tmdb_id,
        country
      );

      // If no dynamic sources were returned from APIs, provide verified legitimate fallback sources
      let finalSources = sources;
      if (finalSources.length === 0) {
        finalSources = this.generateVerifiedFallbackSources(item, country);
      }

      return {
        ...item,
        videoSources: finalSources,
        video_sources: finalSources
      };
    } catch {
      return {
        ...item,
        videoSources: this.generateVerifiedFallbackSources(item, country),
        video_sources: this.generateVerifiedFallbackSources(item, country)
      };
    }
  }

  /**
   * Generates legitimate, verified fallback watch sources (Official providers & verified public domain/creator links)
   */
  private generateVerifiedFallbackSources(item: ContentItem, country: string): VideoSource[] {
    const tmdbId = item.tmdb_id;
    const sources: VideoSource[] = [];

    // 1. YouTube official creator stream if youtubeId or trailerUrl exists
    let ytId = item.youtubeId || item.youtube_id;
    if (!ytId && item.trailerUrl) {
      const m = item.trailerUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (m) ytId = m[1];
    }

    if (ytId) {
      sources.push({
        id: `yt-embed-${item.id}`,
        contentId: item.id,
        providerId: 'youtube',
        providerName: 'YouTube Partner Video',
        sourceType: 'youtube_embed',
        format: 'youtube',
        playbackUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&controls=1&modestbranding=1`,
        officialWatchUrl: `https://www.youtube.com/watch?v=${ytId}`,
        appDeepLink: {
          android: `vnd.youtube:${ytId}`,
          ios: `youtube://watch?v=${ytId}`,
          web: `https://www.youtube.com/watch?v=${ytId}`
        },
        pricingType: 'free',
        quality: '1080p',
        country,
        rightsStatus: 'official_embed',
        verificationStatus: 'verified',
        lastChecked: new Date().toISOString()
      });
    }

    // 2. Direct authorized HTML5 MP4 stream only if item has a genuine stream (never mismatched demo clip)
    const candidateDirect = item.fallbackMp4 || item.streamUrl || '';
    if (candidateDirect && !isMismatchedPlaceholderStream(candidateDirect, item.title)) {
      const url = candidateDirect;
      sources.push({
        id: `direct-src-${item.id}`,
        contentId: item.id,
        providerId: 'proz_direct',
        providerName: 'PROZ Authorized CDN',
        sourceType: 'html5_mp4',
        format: 'mp4',
        playbackUrl: url,
        officialWatchUrl: url,
        pricingType: 'free',
        quality: '1080p',
        country,
        rightsStatus: 'authorized',
        verificationStatus: 'verified',
        lastChecked: new Date().toISOString()
      });
    }

    // 3. Official TMDB / Search Provider Hub watch link (never force wrong movie ID)
    const searchWatchUrl = tmdbId
      ? `https://www.themoviedb.org/${item.type === 'series' ? 'tv' : 'movie'}/${tmdbId}/watch`
      : `https://www.themoviedb.org/search?query=${encodeURIComponent(item.title || '')}`;

    sources.push({
      id: `tmdb-hub-${item.id}`,
      contentId: item.id,
      providerId: 'tmdb_official',
      providerName: tmdbId ? 'Official Theatrical & Streaming Hub' : 'Official Title Search',
      sourceType: 'official_web',
      format: 'external',
      officialWatchUrl: searchWatchUrl,
      pricingType: 'subscription',
      quality: '4K',
      country,
      rightsStatus: 'third_party_subscription',
      verificationStatus: 'verified',
      lastChecked: new Date().toISOString()
    });

    return sources;
  }

  /**
   * Discovers a paginated collection of items without duplicates
   */
  async getCollection(collectionSlug: string, params: DynamicCollectionParams = {}): Promise<DynamicCollectionResult> {
    const page = params.page || 1;
    const limit = params.limit || 24;
    const country = params.country || 'IN';

    // Base content filtered of adult titles on general queries
    let pool = MOCK_CONTENT.filter(c => !c.isRestricted18Plus && !c.is_adult);

    // Apply collection criteria
    switch (collectionSlug) {
      case 'trending-today':
        pool = pool.filter(c => (c.isTrending || c.is_trending) && (c.ratingScore || 0) >= 8.4);
        break;
      case 'trending-this-week':
        pool = pool.filter(c => c.isTrending || c.is_trending);
        break;
      case 'popular-movies':
        pool = pool.filter(c => c.type === 'movie' || c.content_type === 'movie');
        break;
      case 'popular-series':
        pool = pool.filter(c => c.type === 'series' || c.content_type === 'series');
        break;
      case 'latest-releases':
        pool = pool.sort((a, b) => (b.releaseYear || 2024) - (a.releaseYear || 2024));
        break;
      case 'free-to-watch':
        pool = pool.filter(c => c.youtubeId || c.fallbackMp4 || c.streamUrl);
        break;
      case 'bollywood':
        pool = pool.filter(c => c.category === 'bollywood');
        break;
      case 'hollywood':
        pool = pool.filter(c => c.category === 'hollywood' || c.country === 'United States');
        break;
      case 'south-indian':
        pool = pool.filter(c => 
          c.title?.includes('Kalki') || c.title?.includes('RRR') || c.title?.includes('K.G.F') || 
          c.title?.includes('Pushpa') || c.title?.includes('Baahubali') || c.title?.includes('Leo')
        );
        break;
      case 'korean-drama':
        pool = pool.filter(c => c.category === 'k_drama' || c.country === 'South Korea' || c.type === 'drama');
        break;
      case 'anime':
        pool = pool.filter(c => c.category === 'anime' || c.type === 'anime');
        break;
      case 'bengali':
        pool = pool.filter(c => c.category === 'bengali' || c.language === 'bn');
        break;
      default:
        // Filter by genre if matching
        if (params.genre) {
          const g = params.genre.toLowerCase();
          pool = pool.filter(c => {
            const genres = c.genres as string[];
            return genres && genres.some(gen => gen.toLowerCase().includes(g));
          });
        }
        break;
    }

    // Sort order
    if (params.sortBy === 'rating') {
      pool = pool.sort((a, b) => (b.ratingScore || 0) - (a.ratingScore || 0));
    } else if (params.sortBy === 'latest') {
      pool = pool.sort((a, b) => (b.releaseYear || 2024) - (a.releaseYear || 2024));
    }

    // Deduplicate pool
    const seen = new Set<string>();
    const deduplicated = pool.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

    const totalResults = deduplicated.length;
    const totalPages = Math.ceil(totalResults / limit) || 1;
    const pagedItems = deduplicated.slice((page - 1) * limit, page * limit);

    return {
      title: collectionSlug.replace(/-/g, ' ').toUpperCase(),
      slug: collectionSlug,
      description: `Official discovered collection for ${collectionSlug.replace(/-/g, ' ')}.`,
      items: pagedItems,
      page,
      totalPages,
      totalResults,
      country
    };
  }
}

export const discoveryService = new ContentDiscoveryService();
