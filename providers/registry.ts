import { ProviderAdapter, PlaybackStream, ProviderItem } from './base';
import { TmdbMetadataAdapter } from './metadata/tmdb';
import { TvmazeAdapter } from './series/tvmazeSeries';
import { AnilistAnimeAdapter } from './anime/anilistAnime';
import { ArchiveMoviesAdapter } from './movies/archiveMovies';
import { IptvOrgAdapter } from './livetv/iptvOrg';
import { YoutubeVideoAdapter } from './video/youtubeVideo';
import { UserCustomM3uAdapter } from './user-configured/userCustomM3u';

export class ProviderRegistry {
  private adapters: Map<string, ProviderAdapter> = new Map();

  constructor() {
    this.register(new TmdbMetadataAdapter());
    this.register(new TvmazeAdapter());
    this.register(new AnilistAnimeAdapter());
    this.register(new ArchiveMoviesAdapter());
    this.register(new IptvOrgAdapter());
    this.register(new YoutubeVideoAdapter());
    this.register(new UserCustomM3uAdapter());
  }

  register(adapter: ProviderAdapter) {
    this.adapters.set(adapter.id, adapter);
  }

  getAdapter(id: string): ProviderAdapter | undefined {
    return this.adapters.get(id);
  }

  getAllAdapters(): ProviderAdapter[] {
    return Array.from(this.adapters.values()).sort((a, b) => a.priority - b.priority);
  }

  getEnabledAdapters(category?: string): ProviderAdapter[] {
    return this.getAllAdapters().filter(a => a.isEnabled && (!category || a.category === category));
  }

  /**
   * Unified Multi-Provider Search with deduplication
   */
  async search(query: string): Promise<ProviderItem[]> {
    const results: ProviderItem[] = [];
    const seenTitles = new Set<string>();

    const active = this.getEnabledAdapters();
    for (const adapter of active) {
      try {
        const items = await adapter.search(query);
        for (const item of items) {
          const key = item.title.toLowerCase().trim();
          if (!seenTitles.has(key)) {
            seenTitles.add(key);
            results.push(item);
          }
        }
      } catch (err) {
        console.warn(`[Registry] Search failed on ${adapter.name}:`, err);
      }
    }

    return results;
  }

  /**
   * Robust Playback Resolution with Fallback Pipeline
   */
  async resolvePlayback(contentId: string, episodeId?: string): Promise<PlaybackStream | null> {
    const active = this.getEnabledAdapters();

    // Check each provider in priority order
    for (const adapter of active) {
      try {
        const stream = await adapter.resolvePlayback(contentId, episodeId);
        if (stream && stream.isValid) {
          return stream;
        }
      } catch (err) {
        console.warn(`[Registry] Fallback triggered from ${adapter.name}:`, err);
      }
    }

    return null;
  }
}

export const providerRegistry = new ProviderRegistry();
