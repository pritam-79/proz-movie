import { BaseProviderAdapter } from './base';
import { WatchmodeAdapter } from './watchmode';
import { JustWatchAdapter } from './justwatch';
import { TmdbAdapter } from './tmdb';
import { AniListAdapter } from './anilist';
import { TVmazeAdapter } from './tvmaze';
import { YouTubeAdapter } from './youtube';
import { InternetArchiveAdapter } from './archive';
import { CloudflareStreamAdapter } from './cloudflareStream';
import { MuxAdapter } from './mux';
import { stashAdapter, StashProviderAdapter } from './stash';
import { legalTorrentAdapter, LegalTorrentAdapter } from './torrent';
import { ProviderConfig, VideoSource, ProviderId } from '@/types/provider';

class ProviderRegistry {
  private adapters: Map<ProviderId, BaseProviderAdapter> = new Map();
  public readonly stash: StashProviderAdapter = stashAdapter;
  public readonly torrent: LegalTorrentAdapter = legalTorrentAdapter;

  constructor() {
    this.register(new TmdbAdapter());
    this.register(new AniListAdapter());
    this.register(new TVmazeAdapter());
    this.register(new WatchmodeAdapter());
    this.register(new JustWatchAdapter());
    this.register(new YouTubeAdapter());
    this.register(new InternetArchiveAdapter());
    this.register(new CloudflareStreamAdapter());
    this.register(new MuxAdapter());
  }

  register(adapter: BaseProviderAdapter) {
    this.adapters.set(adapter.config.id, adapter);
  }

  get(id: ProviderId): BaseProviderAdapter | undefined {
    return this.adapters.get(id);
  }

  getAll(): BaseProviderAdapter[] {
    return Array.from(this.adapters.values());
  }

  getAllConfigs(): ProviderConfig[] {
    return this.getAll().map(a => a.config);
  }

  async testAllConnections(): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    const promises = Array.from(this.adapters.entries()).map(async ([id, adapter]) => {
      const res = await adapter.testConnection();
      results[id] = res;
    });
    await Promise.allSettled(promises);
    return results;
  }

  /**
   * Unified multi-provider availability lookup
   * Resolves sources across Watchmode, TMDB, JustWatch, YouTube, and Internet Archive
   */
  async resolveAvailability(
    title: string, 
    tmdbId?: number, 
    country: string = 'IN'
  ): Promise<VideoSource[]> {
    const allSources: VideoSource[] = [];

    const tasks = this.getAll().map(async (adapter) => {
      try {
        const sources = await adapter.getAvailability(title, tmdbId, country);
        return sources;
      } catch (e) {
        return [];
      }
    });

    const settled = await Promise.allSettled(tasks);
    settled.forEach((res) => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        allSources.push(...res.value);
      }
    });

    // Deduplicate sources
    const seen = new Set<string>();
    return allSources.filter((s) => {
      const key = `${s.providerId}-${s.format}-${s.pricingType}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

// Global Singleton
export const providerRegistry = new ProviderRegistry();
