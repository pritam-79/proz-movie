/**
 * PRO2 ENTERTAINMENT v0.07 — Kitsu Public Anime API Adapter
 * Official Open JSON:API endpoint (no authentication required)
 * Source: https://kitsu.io/api/edge
 */

export interface V07MediaItem {
  id: string;
  externalId: string;
  providerId: string;
  providerName: string;
  title: string;
  canonicalTitle: string;
  description: string;
  poster: string;
  backdrop: string;
  category: 'movies' | 'series_drama' | 'anime' | 'live_tv' | 'documentary' | 'channels';
  subCategory: string;
  contentType: 'movie' | 'series' | 'anime' | 'live' | 'documentary';
  releaseYear: number;
  language: string;
  country: string;
  genres: string[];
  rating: number;
  isAdult: boolean;
  playableType: 'full_stream' | 'live_hls' | 'trailer' | 'channel_hub' | 'drm_test';
  streamUrl?: string;
  streamFormat?: 'mp4' | 'hls' | 'dash' | 'youtube' | 'external';
  youtubeId?: string;
  drmConfig?: {
    type: 'widevine' | 'clearkey' | 'fairplay' | 'playready' | 'none';
    licenseServerUrl?: string;
    clearKeys?: Record<string, string>;
    note?: string;
  };
  rightsLabel: string;
  detailHref: string;
  episodeCount?: number;
  durationLabel?: string;
}

const KITSU_API_BASE = 'https://kitsu.io/api/edge';

export async function fetchKitsuAnime(options: {
  query?: string;
  subtype?: 'TV' | 'movie' | 'OVA' | 'ONA' | 'all';
  limit?: number;
} = {}): Promise<V07MediaItem[]> {
  const limit = Math.min(options.limit || 16, 20);
  try {
    const params = new URLSearchParams({
      'page[limit]': String(limit),
      'filter[nsfw]': 'false',
    });

    if (options.query && options.query.trim()) {
      params.set('filter[text]', options.query.trim());
    } else {
      params.set('sort', '-userCount');
    }

    if (options.subtype && options.subtype !== 'all') {
      params.set('filter[subtype]', options.subtype);
    }

    const res = await fetch(`${KITSU_API_BASE}/anime?${params.toString()}`, {
      signal: AbortSignal.timeout(8000),
      headers: { Accept: 'application/vnd.api+json' },
      next: { revalidate: 1800 },
    });

    if (!res.ok) return [];
    const json = await res.json();
    const list = Array.isArray(json?.data) ? json.data : [];

    return list.map((row: any): V07MediaItem => {
      const attrs = row.attributes || {};
      const title =
        attrs.titles?.en ||
        attrs.titles?.en_jp ||
        attrs.canonicalTitle ||
        'Anime Title';
      const ytId = attrs.youtubeVideoId || undefined;
      const year = attrs.startDate
        ? parseInt(String(attrs.startDate).slice(0, 4), 10) || 2024
        : 2024;
      const subtype = String(attrs.subtype || 'TV').toUpperCase();
      const ratingRaw = attrs.averageRating ? parseFloat(attrs.averageRating) / 10 : 8.1;

      return {
        id: `kitsu-${row.id}`,
        externalId: String(row.id),
        providerId: 'kitsu',
        providerName: 'Kitsu Anime Directory',
        title,
        canonicalTitle: title,
        description: attrs.synopsis || 'Indexed via Kitsu official open anime catalog.',
        poster:
          attrs.posterImage?.large ||
          attrs.posterImage?.medium ||
          attrs.posterImage?.original ||
          '',
        backdrop:
          attrs.coverImage?.large ||
          attrs.coverImage?.original ||
          attrs.posterImage?.large ||
          '',
        category: 'anime',
        subCategory: subtype === 'MOVIE' ? 'Anime Movies' : subtype === 'OVA' || subtype === 'ONA' ? 'OVA / ONA' : 'Anime Series',
        contentType: 'anime',
        releaseYear: year,
        language: 'Japanese / Sub & Dub',
        country: 'JP',
        genres: ['Anime', subtype],
        rating: Number(Math.min(10, Math.max(5, ratingRaw)).toFixed(1)),
        isAdult: Boolean(attrs.nsfw),
        playableType: ytId ? 'trailer' : 'channel_hub',
        streamUrl: ytId ? `https://www.youtube.com/watch?v=${ytId}` : `https://kitsu.io/anime/${attrs.slug || row.id}`,
        streamFormat: ytId ? 'youtube' : 'external',
        youtubeId: ytId,
        rightsLabel: ytId ? 'Official Anime Trailer' : 'Official Catalog Info',
        detailHref: `https://kitsu.io/anime/${attrs.slug || row.id}`,
        episodeCount: attrs.episodeCount || undefined,
        durationLabel: attrs.episodeLength ? `${attrs.episodeLength}m` : undefined,
      };
    });
  } catch {
    return [];
  }
}
