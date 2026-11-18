/**
 * PROZ Entertainment v0.01
 * Modular Provider Adapter Base Interface
 */

export interface PlaybackStream {
  url: string;
  format: 'hls' | 'dash' | 'mp4' | 'webm' | 'iframe';
  quality?: string;
  bitrate?: number;
  isDrm?: boolean;
  drmScheme?: string;
  subtitles?: Array<{ language: string; url: string; label: string }>;
  audioTracks?: Array<{ language: string; label: string }>;
  isValid: boolean;
}

export interface ProviderItem {
  id: string;
  title: string;
  originalTitle?: string;
  type: 'movie' | 'series' | 'anime' | 'channel' | 'video';
  overview?: string;
  posterUrl?: string;
  backdropUrl?: string;
  rating?: number;
  releaseYear?: number;
  genres?: string[];
  categories?: string[];
  episodesCount?: number;
  seasonsCount?: number;
  externalIds?: Record<string, string | number>;
  isAdult?: boolean;
}

export interface SeasonInfo {
  seasonNumber: number;
  title: string;
  overview?: string;
  episodesCount: number;
  episodes?: EpisodeInfo[];
}

export interface EpisodeInfo {
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  overview?: string;
  thumbnailUrl?: string;
  durationMinutes?: number;
  streamUrl?: string;
  airDate?: string;
}

export interface ChannelInfo {
  id: string;
  name: string;
  category: string;
  logo: string;
  streamUrl?: string;
  backupStreamUrl?: string;
  streamFormat?: 'hls' | 'dash' | 'mp4';
  country?: string;
  language?: string;
  isOnline: boolean;
}

export interface ProviderAvailability {
  available: boolean;
  pricingType: 'free' | 'subscription' | 'rent' | 'buy';
  providerName: string;
  watchUrl: string;
  androidAppPackage?: string;
}

export interface ProviderAdapter {
  id: string;
  name: string;
  category: 'metadata' | 'movies' | 'series' | 'anime' | 'livetv' | 'video' | 'community' | 'user-configured';
  priority: number; // 1 = highest
  isEnabled: boolean;

  // Standard Lifecycle Methods
  initialize(): Promise<boolean>;
  authenticate(): Promise<boolean>;

  // Standard Catalog & Discovery Methods
  getCatalog(page?: number, filter?: Record<string, any>): Promise<ProviderItem[]>;
  getCategories(): Promise<string[]>;
  search(query: string, options?: Record<string, any>): Promise<ProviderItem[]>;
  getDetails(id: string): Promise<ProviderItem | null>;
  getSeasons(seriesId: string): Promise<SeasonInfo[]>;
  getEpisodes(seriesId: string, seasonNumber: number): Promise<EpisodeInfo[]>;
  getChannels(category?: string, country?: string): Promise<ChannelInfo[]>;

  // Standard Playback & Stream Validation
  resolvePlayback(contentId: string, episodeId?: string): Promise<PlaybackStream | null>;
  validateStream(streamUrl: string): Promise<boolean>;
  getAvailability(title: string, externalId?: string): Promise<ProviderAvailability[]>;
  handleErrors(error: any): { code: string; message: string; retryable: boolean };
}

export abstract class BaseAdapter implements ProviderAdapter {
  abstract id: string;
  abstract name: string;
  abstract category: 'metadata' | 'movies' | 'series' | 'anime' | 'livetv' | 'video' | 'community' | 'user-configured';
  priority: number = 10;
  isEnabled: boolean = true;

  async initialize(): Promise<boolean> {
    return true;
  }

  async authenticate(): Promise<boolean> {
    return true;
  }

  async getCatalog(page: number = 1, filter?: Record<string, any>): Promise<ProviderItem[]> {
    return [];
  }

  async getCategories(): Promise<string[]> {
    return [];
  }

  async search(query: string, options?: Record<string, any>): Promise<ProviderItem[]> {
    return [];
  }

  async getDetails(id: string): Promise<ProviderItem | null> {
    return null;
  }

  async getSeasons(seriesId: string): Promise<SeasonInfo[]> {
    return [];
  }

  async getEpisodes(seriesId: string, seasonNumber: number): Promise<EpisodeInfo[]> {
    return [];
  }

  async getChannels(category?: string, country?: string): Promise<ChannelInfo[]> {
    return [];
  }

  async resolvePlayback(contentId: string, episodeId?: string): Promise<PlaybackStream | null> {
    return null;
  }

  async validateStream(streamUrl: string): Promise<boolean> {
    if (!streamUrl) return false;
    try {
      if (typeof window === 'undefined') {
        const res = await fetch(streamUrl, { method: 'HEAD', signal: AbortSignal.timeout(3500) });
        return res.ok || res.status === 200 || res.status === 206;
      }
      return true;
    } catch {
      return false;
    }
  }

  async getAvailability(title: string, externalId?: string): Promise<ProviderAvailability[]> {
    return [];
  }

  handleErrors(error: any) {
    console.error(`[Provider:${this.name}] Error:`, error?.message || error);
    return {
      code: error?.code || 'PROVIDER_ERROR',
      message: error?.message || 'Unknown provider error occurred',
      retryable: error?.code === 'NETWORK_TIMEOUT' || error?.status >= 500
    };
  }
}
