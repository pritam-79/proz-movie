/**
 * PRO2 ENTERTAINMENT v0.07 — Multi-Provider Live Aggregation Orchestrator
 * Combines documented public APIs & already-integrated authorized sources,
 * enforces cross-source deduplication, and keeps 18+ gated items isolated unless explicitly enabled.
 */

import { V07MediaItem, fetchKitsuAnime } from '@/lib/providers/kitsu';
import { fetchNasaOpenVideos } from '@/lib/providers/nasa';
import { fetchWikimediaVideos } from '@/lib/providers/wikimedia';
import { fetchIptvLiveStreams } from '@/lib/providers/iptvLive';
import {
  VERIFIED_OPEN_CINEMA_V07,
  fetchArchiveCategoryMovies,
  fetchPeerTubeOpenVideos,
} from '@/lib/providers/archiveExpanded';
import { OFFICIAL_DRM_TEST_STREAMS } from '@/lib/providers/drmConfig';
import { TVmazeAdapter } from '@/lib/providers/tvmaze';
import { cine18Adapter } from '@/lib/providers/cine18';
import { MOCK_CONTENT } from '@/lib/data/mockContent';
import { deduplicateCatalogItems, DeduplicatedCatalogResult } from './catalogDeduplicator';

const tvmazeAdapter = new TVmazeAdapter();

export type V07HubCategory =
  | 'all'
  | 'playable_now'
  | 'movies'
  | 'series_drama'
  | 'anime'
  | 'live_tv'
  | 'channels'
  | 'documentary'
  | 'drm_lab';

/**
 * Fetch trending / searched anime directly from AniList GraphQL with trailer support
 */
async function fetchAniListWithTrailers(queryText?: string, limit = 14): Promise<V07MediaItem[]> {
  try {
    const searchArg = queryText?.trim()
      ? `search: "${queryText.replace(/"/g, '')}",`
      : '';
    const gql = `
      query {
        Page(page: 1, perPage: ${limit}) {
          media(type: ANIME, ${searchArg} isAdult: false, sort: TRENDING_DESC) {
            id
            title { english romaji }
            description(asHtml: false)
            coverImage { extraLarge large }
            bannerImage
            format
            episodes
            genres
            averageScore
            seasonYear
            trailer { id site }
          }
        }
      }
    `;

    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query: gql }),
      signal: AbortSignal.timeout(7000),
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const list: any[] = json?.data?.Page?.media || [];

    return list.map((m): V07MediaItem => {
      const title = m.title?.english || m.title?.romaji || 'Anime';
      const ytId = m.trailer?.site === 'youtube' ? m.trailer.id : undefined;
      return {
        id: `anilist-${m.id}`,
        externalId: String(m.id),
        providerId: 'anilist',
        providerName: 'AniList GraphQL API',
        title,
        canonicalTitle: title,
        description: m.description
          ? String(m.description).replace(/<[^>]+>/g, '').slice(0, 240)
          : 'Official AniList anime database entry.',
        poster: m.coverImage?.extraLarge || m.coverImage?.large || '',
        backdrop: m.bannerImage || m.coverImage?.extraLarge || '',
        category: 'anime',
        subCategory: m.format === 'MOVIE' ? 'Anime Movies' : 'Anime Series',
        contentType: 'anime',
        releaseYear: m.seasonYear || 2024,
        language: 'Japanese / Sub & Dub',
        country: 'JP',
        genres: Array.isArray(m.genres) && m.genres.length > 0 ? m.genres.slice(0, 4) : ['Anime'],
        rating: m.averageScore ? Number((m.averageScore / 10).toFixed(1)) : 8.2,
        isAdult: false,
        playableType: ytId ? 'trailer' : 'channel_hub',
        streamUrl: ytId ? `https://www.youtube.com/watch?v=${ytId}` : `/title/anilist-${m.id}`,
        streamFormat: ytId ? 'youtube' : 'external',
        youtubeId: ytId,
        rightsLabel: ytId ? 'Official Anime Trailer' : 'Official Catalog Info',
        detailHref: `https://anilist.co/anime/${m.id}`,
        episodeCount: m.episodes || undefined,
      };
    });
  } catch {
    return [];
  }
}

function mapLocalMockItems(includeAdult = false): V07MediaItem[] {
  return MOCK_CONTENT.filter((item) => {
    const adult = Boolean(item.isRestricted18Plus || item.is_adult);
    return includeAdult ? true : !adult;
  }).map((item): V07MediaItem => {
    const rawType = item.type || item.content_type || 'movie';
    const isAnime = rawType === 'anime' || item.category === 'anime';
    const isSeries =
      rawType === 'series' || rawType === 'drama' || item.category === 'k_drama';

    const directUrl = item.streamUrl || item.fallbackMp4;
    const isTestDemoStream = Boolean(
      directUrl &&
        (directUrl.includes('unified-streaming.com') ||
          directUrl.includes('test-streams.mux.dev') ||
          directUrl.includes('shaka-demo-assets'))
    );
    const hasArchiveFullStream = Boolean(directUrl && directUrl.includes('archive.org'));
    const ytId = item.youtubeId || item.youtube_id;

    let playableType: V07MediaItem['playableType'] = 'channel_hub';
    let rightsLabel = 'Official Deep Link';
    if (hasArchiveFullStream) {
      playableType = 'full_stream';
      rightsLabel = 'Public Domain (Full Film)';
    } else if (ytId && isTestDemoStream) {
      // Honesty badge: distinguish trailer + demo stream vs full commercial feature
      playableType = 'trailer';
      rightsLabel = 'Official Trailer + Demo Stream';
    } else if (ytId) {
      playableType = 'trailer';
      rightsLabel = 'Official Trailer';
    } else if (directUrl) {
      playableType = 'full_stream';
      rightsLabel = 'Authorized Stream';
    }

    const genres = Array.isArray(item.genres)
      ? item.genres.map((g: any) => (typeof g === 'string' ? g : g.name)).filter(Boolean)
      : [];

    return {
      id: item.id,
      externalId: String(item.tmdb_id || item.id),
      providerId: 'proz_catalog',
      providerName: 'PROZ Core Catalog',
      title: item.title,
      canonicalTitle: item.originalTitle || item.title,
      description: item.synopsis || item.description || '',
      poster: item.posterUrl || item.poster_url || '',
      backdrop: item.backdropUrl || item.backdrop_url || item.posterUrl || '',
      category: isAnime ? 'anime' : isSeries ? 'series_drama' : 'movies',
      subCategory:
        item.category === 'bollywood'
          ? 'Bollywood'
          : item.category === 'hollywood'
          ? 'Hollywood'
          : item.category === 'k_drama'
          ? 'Korean Drama'
          : isAnime
          ? 'Anime Collection'
          : 'Curated Library',
      contentType: isAnime ? 'anime' : isSeries ? 'series' : 'movie',
      releaseYear: item.releaseYear || item.release_year || 2024,
      language: item.language || item.languages?.[0] || 'English',
      country: item.country || 'GLOBAL',
      genres,
      rating: item.ratingScore || item.rating_avg || 8.0,
      isAdult: Boolean(item.isRestricted18Plus || item.is_adult),
      playableType,
      streamUrl: directUrl || (ytId ? `https://www.youtube.com/watch?v=${ytId}` : undefined),
      streamFormat: directUrl?.includes('.m3u8')
        ? 'hls'
        : directUrl?.includes('.mpd')
        ? 'dash'
        : directUrl?.endsWith('.mp4')
        ? 'mp4'
        : ytId
        ? 'youtube'
        : 'external',
      youtubeId: ytId,
      rightsLabel,
      detailHref: `/title/${item.id}`,
      durationLabel: item.runtimeMinutes ? `${item.runtimeMinutes}m` : undefined,
    };
  });
}

function mapOpenCuratedV07(): V07MediaItem[] {
  return VERIFIED_OPEN_CINEMA_V07.map((c): V07MediaItem => ({
    id: c.id,
    externalId: c.archiveId || c.id,
    providerId: 'open_cinema',
    providerName: 'Open Cinema & Blender Foundation',
    title: c.title,
    canonicalTitle: c.title,
    description: c.description,
    poster: c.poster,
    backdrop: c.poster,
    category: c.category,
    subCategory: c.subCategory,
    contentType: c.category === 'anime' ? 'anime' : 'movie',
    releaseYear: c.year,
    language: 'English / Multi',
    country: 'GLOBAL',
    genres: c.genres,
    rating: c.rating,
    isAdult: false,
    playableType: 'full_stream',
    streamUrl: c.streamUrl,
    streamFormat: c.streamFormat,
    rightsLabel: 'Creative Commons / Open Film',
    detailHref: `/ott-hub?highlight=${encodeURIComponent(c.id)}`,
    durationLabel: c.durationLabel,
  }));
}

async function fetchCineWebbyChannelItems(includeAdult: boolean, query?: string): Promise<V07MediaItem[]> {
  try {
    const channels = await cine18Adapter.getAllChannels();
    return channels
      .filter((ch) => (includeAdult ? true : ch.isAdult !== 1))
      .filter((ch) =>
        query?.trim() ? ch.name.toLowerCase().includes(query.trim().toLowerCase()) : true
      )
      .slice(0, 36)
      .map((ch): V07MediaItem => ({
        id: `cine18-ch-${ch.uid}`,
        externalId: ch.uid,
        providerId: 'cine18',
        providerName: 'CineWebby OTT Network',
        title: ch.name,
        canonicalTitle: ch.name,
        description: `${ch.channel_type || 'OTT'} Channel • ${ch.total_views?.toLocaleString() || 'Popular'} views`,
        poster: ch.image || '',
        backdrop: ch.image || '',
        category: 'channels',
        subCategory: ch.isAdult === 1 ? '18+ Exclusive Channels' : 'General OTT Channels',
        contentType: 'series',
        releaseYear: 2026,
        language: 'Hindi / Regional',
        country: 'IN',
        genres: ['OTT Channel', ch.channel_type || 'Series'],
        rating: 8.4,
        isAdult: ch.isAdult === 1,
        playableType: 'channel_hub',
        streamUrl: `/channels/${ch.uid}`,
        streamFormat: 'external',
        rightsLabel: 'Channel Catalog (Playable Episodes)',
        detailHref: `/channels/${ch.uid}`,
      }));
  } catch {
    return [];
  }
}

export async function getUnifiedV07Catalog(options: {
  category?: V07HubCategory;
  query?: string;
  subCategory?: string;
  playableOnly?: boolean;
  includeAdult?: boolean;
  limit?: number;
} = {}): Promise<DeduplicatedCatalogResult> {
  const category = options.category || 'all';
  const query = options.query?.trim() || '';
  const includeAdult = Boolean(options.includeAdult);

  const tasks: Promise<V07MediaItem[]>[] = [];

  // Always include curated verified full-playable open movies
  tasks.push(Promise.resolve(mapOpenCuratedV07()));

  if (category === 'all' || category === 'playable_now' || category === 'movies') {
    tasks.push(fetchArchiveCategoryMovies({ bucket: 'feature_films', query, limit: 12 }));
    tasks.push(fetchArchiveCategoryMovies({ bucket: 'sci_fi_horror', query, limit: 8 }));
    tasks.push(fetchArchiveCategoryMovies({ bucket: 'comedy_films', query, limit: 8 }));
  }

  if (category === 'all' || category === 'playable_now' || category === 'documentary') {
    tasks.push(fetchNasaOpenVideos({ query: query || undefined, limit: 10 }));
    tasks.push(fetchPeerTubeOpenVideos({ instance: 'https://framatube.org', query, limit: 10 }));
    tasks.push(fetchWikimediaVideos({ query, limit: 8 }));
  }

  if (category === 'all' || category === 'anime' || category === 'playable_now') {
    tasks.push(fetchAniListWithTrailers(query, 14));
    tasks.push(fetchKitsuAnime({ query, limit: 14 }));
    tasks.push(fetchArchiveCategoryMovies({ bucket: 'animationandcartoons', query, limit: 10 }));
  }

  if (category === 'all' || category === 'series_drama') {
    tasks.push(
      tvmazeAdapter
        .discoverCatalog({ query: query || 'thriller', limit: 14 })
        .then((res) =>
          (res.items || []).map((item): V07MediaItem => ({
            id: item.id,
            externalId: item.externalId,
            providerId: 'tvmaze',
            providerName: 'TVmaze Official TV API',
            title: item.title,
            canonicalTitle: item.title,
            description: item.description,
            poster: item.poster,
            backdrop: item.backdrop || item.poster,
            category: 'series_drama',
            subCategory: 'Global TV Series',
            contentType: 'series',
            releaseYear: item.releaseYear || 2024,
            language: item.language || 'English',
            country: item.country || 'US',
            genres: item.genres?.length ? item.genres : ['Drama'],
            rating: item.rating || 7.9,
            isAdult: false,
            playableType: 'channel_hub',
            streamUrl: `https://www.tvmaze.com/shows/${item.externalId}`,
            streamFormat: 'external',
            rightsLabel: 'Official Series Guide',
            detailHref: `https://www.tvmaze.com/shows/${item.externalId}`,
          }))
        )
        .catch(() => [])
    );
  }

  if (category === 'all' || category === 'live_tv' || category === 'playable_now') {
    tasks.push(
      fetchIptvLiveStreams({
        query,
        limit: category === 'live_tv' ? 40 : 16,
      })
    );
  }

  if (category === 'all' || category === 'channels') {
    tasks.push(fetchCineWebbyChannelItems(includeAdult, query));
  }

  if (category === 'all' || category === 'drm_lab' || category === 'playable_now') {
    tasks.push(Promise.resolve(OFFICIAL_DRM_TEST_STREAMS));
  }

  if (
    category === 'all' ||
    category === 'movies' ||
    category === 'series_drama' ||
    category === 'anime'
  ) {
    tasks.push(Promise.resolve(mapLocalMockItems(includeAdult)));
  }

  const settled = await Promise.allSettled(tasks);
  let collected: V07MediaItem[] = [];
  for (const res of settled) {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      collected.push(...res.value);
    }
  }

  // Deduplicate across all providers cleanly
  const deduped = deduplicateCatalogItems(collected);
  let items = deduped.items;

  // Apply category focus filtering after dedup
  if (category === 'playable_now') {
    items = items.filter(
      (i) =>
        i.playableType === 'full_stream' ||
        i.playableType === 'live_hls' ||
        i.playableType === 'drm_test'
    );
  } else if (category !== 'all') {
    if (category === 'drm_lab') {
      items = items.filter((i) => i.playableType === 'drm_test');
    } else {
      items = items.filter((i) => i.category === category);
    }
  }

  if (options.playableOnly) {
    items = items.filter(
      (i) =>
        i.playableType === 'full_stream' ||
        i.playableType === 'live_hls' ||
        i.playableType === 'drm_test'
    );
  }

  if (options.subCategory && options.subCategory !== 'All') {
    const subLower = options.subCategory.toLowerCase();
    items = items.filter(
      (i) =>
        i.subCategory.toLowerCase().includes(subLower) ||
        i.genres.some((g) => g.toLowerCase().includes(subLower))
    );
  }

  if (query) {
    const q = query.toLowerCase();
    items = items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.providerName.toLowerCase().includes(q) ||
        i.genres.some((g) => g.toLowerCase().includes(q))
    );
  }

  // Sort: directly playable full/live streams first, then highest rating
  items.sort((a, b) => {
    const aDirect =
      a.playableType === 'full_stream' || a.playableType === 'live_hls' || a.playableType === 'drm_test'
        ? 1
        : 0;
    const bDirect =
      b.playableType === 'full_stream' || b.playableType === 'live_hls' || b.playableType === 'drm_test'
        ? 1
        : 0;
    if (aDirect !== bDirect) return bDirect - aDirect;
    return (b.rating || 0) - (a.rating || 0);
  });

  const limit = Math.min(options.limit || 72, 140);
  return {
    items: items.slice(0, limit),
    stats: deduped.stats,
  };
}
