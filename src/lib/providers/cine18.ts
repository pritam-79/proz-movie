/**
 * PROZ Entertainment — Cine18 / CineWebby Provider Adapter
 * Integrates live OTT channels, web series, video cards, and direct CDN streams
 */

import {
  BaseProviderAdapter,
  ProviderHealthResult,
  PlaybackAuthorizationResult
} from './base';
import {
  ProviderConfig,
  CatalogDiscoveryParams,
  CatalogDiscoveryResult,
  CatalogDiscoveryItem,
  VideoSource,
  ChannelSyncResult
} from '@/types/provider';

export interface Cine18RawChannel {
  id: number;
  uid: string;
  name: string;
  status: number;
  priority: number;
  updated_at: string;
  image: string;
  channel_type: string;
  isAdult: number;
  total_views: number;
}

export interface Cine18RawVideoItem {
  id: number;
  uid: string;
  portrait_img: string;
  banner_img: string;
  title: string;
  version?: string;
  type?: string;
  catagory_uid?: string;
  sub_catagory_uid?: string;
  channel_uid?: string;
  cast?: string;
  tags?: string;
  rating?: number;
  language?: string;
  preview_text?: string;
  description?: string;
  image_type?: string;
  created_at?: string;
  total_views?: number;
}

export interface Cine18EpisodeStream {
  id: number;
  parent_uid: string;
  parent_type: string;
  uid: string;
  name: string;
  video_link: string;
  thumbnail: string;
  status: string;
}

export interface Cine18VideoDetail extends Cine18RawVideoItem {
  category?: {
    id: number;
    uid: string;
    name: string;
  };
  channel?: {
    id: number;
    uid: string;
    name: string;
    image: string;
  };
  videos?: Cine18EpisodeStream[];
}

export function normalizeCdnStreamUrl(rawUrl?: string | null): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  try {
    return new URL(trimmed).href;
  } catch {
    return encodeURI(trimmed);
  }
}

export class Cine18Adapter implements BaseProviderAdapter {
  private readonly baseUrl = 'https://server.cinewebby.com/api';
  private channelsCache: Cine18RawChannel[] | null = null;
  private cacheTimestamp = 0;
  private readonly CACHE_TTL_MS = 15 * 60 * 1000; // 15 mins
  private channelVideosCache = new Map<string, { data: { channel: Cine18RawChannel | null; videos: Cine18RawVideoItem[]; totalVideos: number }; ts: number }>();
  private videoDetailCache = new Map<string, { data: Cine18VideoDetail; ts: number }>();

  private async fetchJsonWithRetry(url: string, timeoutMs = 12000): Promise<any> {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(url, {
          signal: AbortSignal.timeout(timeoutMs),
          headers: { 'Accept': 'application/json', 'User-Agent': 'PRO2Entertainment/0.08' },
          next: { revalidate: 300 }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) {
        if (attempt === 1) throw err;
        await new Promise((r) => setTimeout(r, 350));
      }
    }
  }

  readonly config: ProviderConfig = {
    id: 'cine18',
    name: 'CineWebby Streaming API',
    apiType: 'rest',
    apiEndpoint: 'https://server.cinewebby.com/api',
    documentationUrl: 'https://server.cinewebby.com',
    authenticationType: 'none',
    connectionStatus: 'connected',
    countryCoverage: ['IN', 'US', 'GLOBAL'],
    lastSyncAt: new Date().toISOString(),
    syncIntervalHours: 6,
    features: {
      hasCatalog: true,
      hasStreams: true,
      hasDeepLinks: false,
      hasEmbed: true,
      isFree: true,
      requiresSubscription: false,
    },
    rateLimitPerMinute: 120,
    errorCount: 0,
  };

  isConfigured(): boolean {
    return true;
  }

  async testConnection(): Promise<{
    success: boolean;
    message: string;
    latencyMs?: number;
    details?: Record<string, unknown>;
  }> {
    const start = Date.now();
    try {
      const res = await fetch(`${this.baseUrl}/user/channel/all`, {
        signal: AbortSignal.timeout(6000),
        headers: { 'Accept': 'application/json' }
      });
      const latencyMs = Date.now() - start;
      if (!res.ok) {
        return {
          success: false,
          message: `API responded with HTTP ${res.status}`,
          latencyMs,
        };
      }
      const data = await res.json();
      const count = Array.isArray(data) ? data.length : 0;
      return {
        success: true,
        message: `Connected: ${count} OTT channels active with direct high-speed CDN stream links`,
        latencyMs,
        details: { channelCount: count, status: 'operational' },
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Connection failed: ${err.message || 'Unknown network error'}`,
        latencyMs: Date.now() - start,
      };
    }
  }

  async getAllChannels(): Promise<Cine18RawChannel[]> {
    if (this.channelsCache && Date.now() - this.cacheTimestamp < this.CACHE_TTL_MS) {
      return this.channelsCache;
    }
    try {
      const list = await this.fetchJsonWithRetry(`${this.baseUrl}/user/channel/all`, 12000);
      if (Array.isArray(list)) {
        this.channelsCache = list;
        this.cacheTimestamp = Date.now();
        return list;
      }
      return [];
    } catch (err) {
      console.warn('[Cine18Adapter] Failed to fetch channels, returning fallback:', err);
      return this.channelsCache || [];
    }
  }

  async getChannelByUidOrName(identifier: string): Promise<Cine18RawChannel | null> {
    const channels = await this.getAllChannels();
    const cleanId = identifier.trim().toLowerCase();
    const stripNorm = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, '');
    const normId = stripNorm(cleanId);

    return (
      channels.find(
        (c) =>
          c.uid.toLowerCase() === cleanId ||
          c.name.trim().toLowerCase() === cleanId
      ) ||
      channels.find(
        (c) =>
          c.name.trim().toLowerCase().includes(cleanId) ||
          cleanId.includes(c.name.trim().toLowerCase()) ||
          (normId.length >= 3 && (stripNorm(c.name) === normId || stripNorm(c.name).includes(normId) || normId.includes(stripNorm(c.name))))
      ) ||
      null
    );
  }

  async getChannelDetailsAndVideos(channelUid: string): Promise<{
    channel: Cine18RawChannel | null;
    videos: Cine18RawVideoItem[];
    totalVideos: number;
  }> {
    const cached = this.channelVideosCache.get(channelUid);
    if (cached && Date.now() - cached.ts < 5 * 60 * 1000) {
      return cached.data;
    }

    try {
      const data = await this.fetchJsonWithRetry(
        `${this.baseUrl}/user/channel/${encodeURIComponent(channelUid)}`,
        12000
      );
      const parsed = {
        channel: data.channel || null,
        videos: Array.isArray(data.videos) ? data.videos : [],
        totalVideos: typeof data.totalVideos === 'number' ? data.totalVideos : (data.videos?.length || 0),
      };
      this.channelVideosCache.set(channelUid, { data: parsed, ts: Date.now() });
      return parsed;
    } catch (err) {
      console.error(`[Cine18Adapter] Failed to fetch channel details for ${channelUid}:`, err);
      return cached?.data || { channel: null, videos: [], totalVideos: 0 };
    }
  }

  async getVideoDetails(videoUid: string): Promise<Cine18VideoDetail | null> {
    const cached = this.videoDetailCache.get(videoUid);
    if (cached && Date.now() - cached.ts < 15 * 60 * 1000) {
      return cached.data;
    }

    try {
      const data = await this.fetchJsonWithRetry(
        `${this.baseUrl}/user/video-card/${encodeURIComponent(videoUid)}`,
        12000
      );
      if (data && Array.isArray(data.videos)) {
        data.videos = data.videos.map((v: Cine18EpisodeStream) => ({
          ...v,
          video_link: normalizeCdnStreamUrl(v.video_link),
        }));
      }
      if (data) {
        this.videoDetailCache.set(videoUid, { data, ts: Date.now() });
      }
      return data;
    } catch (err) {
      console.error(`[Cine18Adapter] Failed to fetch video details for ${videoUid}:`, err);
      return cached?.data || null;
    }
  }

  async getBanners(): Promise<any[]> {
    try {
      const res = await fetch(`${this.baseUrl}/user/banners`, {
        signal: AbortSignal.timeout(6000),
        next: { revalidate: 600 }
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.warn('[Cine18Adapter] Failed to fetch banners:', err);
      return [];
    }
  }

  async getSections(): Promise<any[]> {
    try {
      const res = await fetch(`${this.baseUrl}/user/section`, {
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 600 }
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.warn('[Cine18Adapter] Failed to fetch sections:', err);
      return [];
    }
  }

  async discoverCatalog(params: CatalogDiscoveryParams): Promise<CatalogDiscoveryResult> {
    const channels = await this.getAllChannels();
    const targetChannel = params.query
      ? channels.find((c) => c.name.toLowerCase().includes(params.query!.toLowerCase()))
      : channels[0];

    if (!targetChannel) {
      return {
        items: [],
        page: 1,
        totalPages: 1,
        totalResults: 0,
        providerId: 'cine18',
        country: 'GLOBAL',
      };
    }

    const { videos, totalVideos } = await this.getChannelDetailsAndVideos(targetChannel.uid);
    const items: CatalogDiscoveryItem[] = videos.map((v) => ({
      id: `cine18-${v.uid}`,
      externalId: v.uid,
      providerId: 'cine18',
      title: v.title,
      description: v.description || v.preview_text || `Watch ${v.title} on ${targetChannel.name}`,
      poster: v.portrait_img || targetChannel.image,
      backdrop: v.banner_img || v.portrait_img || targetChannel.image,
      contentType: v.type?.toLowerCase().includes('movie') ? 'movie' : 'series',
      releaseYear: v.created_at ? new Date(v.created_at).getFullYear() : 2026,
      language: v.language?.trim() || 'Hindi',
      country: 'IN',
      genres: v.tags ? v.tags.split(',').map((t) => t.trim()) : ['Drama', 'Romance'],
      rating: v.rating || 8.0,
      sources: [
        {
          id: `src-cine18-${v.uid}`,
          contentId: `cine18-${v.uid}`,
          providerId: 'cine18',
          providerName: 'CineWebby',
          sourceType: 'html5_mp4',
          format: 'mp4',
          officialWatchUrl: `/watch/cine18-${v.uid}`,
          pricingType: 'free',
          quality: '1080p',
          country: 'GLOBAL',
          rightsStatus: 'authorized',
          verificationStatus: 'verified',
          lastChecked: new Date().toISOString(),
        },
      ],
    }));

    return {
      items,
      page: 1,
      totalPages: Math.ceil(totalVideos / 20) || 1,
      totalResults: totalVideos,
      providerId: 'cine18',
      country: 'GLOBAL',
    };
  }

  async getAvailability(title: string): Promise<VideoSource[]> {
    return [];
  }

  async syncChannel(channelId: string): Promise<ChannelSyncResult> {
    const channel = await this.getChannelByUidOrName(channelId);
    if (!channel) {
      return {
        channelId,
        status: 'error',
        discoveredCount: 0,
        updatedCount: 0,
        errors: [`Channel "${channelId}" not found in CineWebby directory`],
        syncedAt: new Date().toISOString(),
      };
    }

    const { videos, totalVideos } = await this.getChannelDetailsAndVideos(channel.uid);
    return {
      channelId: channel.uid,
      status: 'success',
      discoveredCount: totalVideos,
      updatedCount: videos.length,
      errors: [],
      syncedAt: new Date().toISOString(),
    };
  }

  async getPlaybackAuthorization(contentId: string): Promise<PlaybackAuthorizationResult> {
    const uid = contentId.replace(/^cine18-/, '');
    const details = await this.getVideoDetails(uid);
    if (!details || !details.videos || details.videos.length === 0) {
      return {
        authorized: false,
        reason: 'No playable video streams found for this title',
      };
    }

    const firstEpisode = details.videos[0];
    return {
      authorized: true,
      playbackUrl: firstEpisode.video_link,
      sourceType: 'html5_mp4',
    };
  }

  async getProviderHealth(): Promise<ProviderHealthResult> {
    const test = await this.testConnection();
    return {
      healthy: test.success,
      status: test.success ? 'connected' : 'error',
      latencyMs: test.latencyMs,
      message: test.message,
      lastChecked: new Date().toISOString(),
    };
  }
}

export const cine18Adapter = new Cine18Adapter();
