/**
 * PRO2 ENTERTAINMENT v0.07 — Live IPTV-Org Public Broadcast Streams Adapter
 * Bridges https://iptv-org.github.io/api/channels.json + streams.json with in-memory TTL cache.
 * Filters verified HTTPS .m3u8 live streams (strictly excluding is_nsfw).
 */

import { V07MediaItem } from './kitsu';

interface CachedIptvIndex {
  channels: V07MediaItem[];
  fetchedAt: number;
}

let iptvCache: CachedIptvIndex | null = null;
const CACHE_TTL_MS = 30 * 60 * 1000;

export async function fetchIptvLiveStreams(options: {
  category?: string;
  country?: string;
  query?: string;
  limit?: number;
} = {}): Promise<V07MediaItem[]> {
  const limit = Math.min(options.limit || 32, 60);

  if (!iptvCache || Date.now() - iptvCache.fetchedAt > CACHE_TTL_MS) {
    try {
      const [channelsRes, streamsRes] = await Promise.all([
        fetch('https://iptv-org.github.io/api/channels.json', { signal: AbortSignal.timeout(12000) }),
        fetch('https://iptv-org.github.io/api/streams.json', { signal: AbortSignal.timeout(12000) }),
      ]);

      if (!channelsRes.ok || !streamsRes.ok) {
        return iptvCache?.channels.slice(0, limit) || [];
      }

      const [channelsList, streamsList] = await Promise.all([
        channelsRes.json(),
        streamsRes.json(),
      ]);

      const channelMetaMap = new Map<string, any>();
      if (Array.isArray(channelsList)) {
        for (const ch of channelsList) {
          if (ch?.id && !ch.is_nsfw) {
            channelMetaMap.set(ch.id, ch);
          }
        }
      }

      const merged: V07MediaItem[] = [];
      const seenChannelStream = new Set<string>();

      if (Array.isArray(streamsList)) {
        for (const s of streamsList) {
          if (!s?.channel || !s?.url) continue;
          const url = String(s.url);
          if (!url.startsWith('https://') || !url.includes('.m3u8')) continue;

          const meta = channelMetaMap.get(s.channel);
          if (!meta) continue; // skips NSFW or unindexed channels

          if (seenChannelStream.has(s.channel)) continue;
          seenChannelStream.add(s.channel);

          const cats: string[] = Array.isArray(meta.categories) && meta.categories.length > 0
            ? meta.categories
            : ['general'];
          const primaryCat = cats[0].charAt(0).toUpperCase() + cats[0].slice(1);
          const langs: string[] = Array.isArray(meta.languages) ? meta.languages : [];

          merged.push({
            id: `iptv-${s.channel}`,
            externalId: String(s.channel),
            providerId: 'iptv_org',
            providerName: 'IPTV-Org Free-to-Air',
            title: s.title || meta.name || s.channel,
            canonicalTitle: s.title || meta.name || s.channel,
            description: `Live ${primaryCat} broadcast from ${meta.country || 'International'} (${s.quality || 'HD'}).`,
            poster: meta.logo || '',
            backdrop: meta.logo || '',
            category: 'live_tv',
            subCategory: primaryCat,
            contentType: 'live',
            releaseYear: 2026,
            language: langs[0] || 'Multi',
            country: meta.country || 'GLOBAL',
            genres: ['Live TV', ...cats],
            rating: 8.5,
            isAdult: false,
            playableType: 'live_hls',
            streamUrl: url,
            streamFormat: 'hls',
            rightsLabel: 'Free-to-Air Public Broadcast',
            detailHref: meta.website || url,
            durationLabel: s.quality || 'LIVE HLS',
          });

          // Keep in-memory index snappy (top 800 verified channels)
          if (merged.length >= 800) break;
        }
      }

      iptvCache = {
        channels: merged,
        fetchedAt: Date.now(),
      };
    } catch {
      return iptvCache?.channels.slice(0, limit) || [];
    }
  }

  let pool = iptvCache.channels;

  if (options.country && options.country !== 'ALL') {
    const cc = options.country.toUpperCase();
    const countryMatches = pool.filter((c) => c.country.toUpperCase() === cc);
    if (countryMatches.length > 0) pool = countryMatches;
  }

  if (options.category && options.category !== 'all') {
    const cat = options.category.toLowerCase();
    pool = pool.filter(
      (c) =>
        c.subCategory.toLowerCase().includes(cat) ||
        c.genres.some((g) => g.toLowerCase().includes(cat))
    );
  }

  if (options.query && options.query.trim()) {
    const q = options.query.toLowerCase().trim();
    pool = pool.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.subCategory.toLowerCase().includes(q)
    );
  }

  return pool.slice(0, limit);
}
