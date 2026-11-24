/**
 * PRO2 ENTERTAINMENT v0.07 — Cross-Provider Comparison & Deduplication Engine
 * Compares catalog entries across Internet Archive, PeerTube, NASA, Wikimedia, IPTV-Org,
 * AniList, Kitsu, TVmaze, CineWebby, and local catalog — merging metadata and removing duplicates.
 */

import { V07MediaItem } from '@/lib/providers/kitsu';

export interface DeduplicatedCatalogResult {
  items: V07MediaItem[];
  stats: {
    rawTotal: number;
    uniqueTotal: number;
    duplicatesRemoved: number;
    playableNowCount: number;
    byProvider: Record<string, number>;
    byCategory: Record<string, number>;
  };
}

const PLAYABLE_PRIORITY: Record<V07MediaItem['playableType'], number> = {
  full_stream: 5,
  live_hls: 5,
  drm_test: 4,
  trailer: 2,
  channel_hub: 1,
};

/**
 * Strips release tags, edition labels, brackets, punctuation, and extra spaces
 * so duplicate titles from different APIs collapse to one canonical key.
 */
export function normalizeMediaTitle(raw: string): string {
  return String(raw || '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\b(4k|uhd|hd|1080p|720p|full movie|hindi dubbed|dubbed|subbed|season \d+|complete|official)\b/gi, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function getMergeRank(item: V07MediaItem): number {
  const playScore = (PLAYABLE_PRIORITY[item.playableType] || 0) * 100;
  const posterScore = item.poster ? 15 : 0;
  const ratingScore = item.rating || 0;
  return playScore + posterScore + ratingScore;
}

export function deduplicateCatalogItems(rawItems: V07MediaItem[]): DeduplicatedCatalogResult {
  const canonicalMap = new Map<string, V07MediaItem>();
  const streamUrlSeen = new Map<string, string>(); // streamUrl -> canonicalKey
  let duplicatesRemoved = 0;

  for (const item of rawItems) {
    if (!item || !item.title) continue;

    const cleanTitle = normalizeMediaTitle(item.canonicalTitle || item.title);
    if (!cleanTitle) continue;

    // Group movies/anime/docs cleanly while separating Live TV channels by channel key
    const yearPart = item.contentType === 'live' ? 'live' : String(item.releaseYear || '');
    const primaryKey = `${item.contentType}:${cleanTitle}:${yearPart}`;
    const looseKey = `${item.contentType}:${cleanTitle}`;

    // Check exact stream URL match too (prevents identical stream under two names)
    const directUrlKey =
      item.streamUrl && !item.streamUrl.startsWith('/api/')
        ? item.streamUrl.trim().toLowerCase()
        : null;

    let existingKey: string | undefined;
    if (canonicalMap.has(primaryKey)) {
      existingKey = primaryKey;
    } else if (canonicalMap.has(looseKey)) {
      existingKey = looseKey;
    } else if (directUrlKey && streamUrlSeen.has(directUrlKey)) {
      existingKey = streamUrlSeen.get(directUrlKey);
    }

    if (!existingKey) {
      canonicalMap.set(primaryKey, {
        ...item,
        genres: Array.from(new Set(item.genres || [])),
      });
      if (looseKey !== primaryKey && !canonicalMap.has(looseKey)) {
        // Track loose title pointer when year wasn't strictly matched
        streamUrlSeen.set(`loose::${looseKey}`, primaryKey);
      }
      if (directUrlKey) {
        streamUrlSeen.set(directUrlKey, primaryKey);
      }
      continue;
    }

    // Also resolve loose pointer if present
    const existing = canonicalMap.get(existingKey);
    if (!existing) continue;

    duplicatesRemoved++;

    // Keep whichever record has higher playability & richer artwork, while merging genres/tags
    const incomingBetter = getMergeRank(item) > getMergeRank(existing);
    const primary = incomingBetter ? item : existing;
    const secondary = incomingBetter ? existing : item;

    const mergedGenres = Array.from(
      new Set([...(primary.genres || []), ...(secondary.genres || [])])
    ).slice(0, 6);

    const mergedProviderName = primary.providerName.includes(secondary.providerName)
      ? primary.providerName
      : `${primary.providerName} + ${secondary.providerName}`;

    const merged: V07MediaItem = {
      ...primary,
      poster: primary.poster || secondary.poster,
      backdrop: primary.backdrop || secondary.backdrop,
      description:
        primary.description && primary.description.length > (secondary.description?.length || 0)
          ? primary.description
          : secondary.description || primary.description,
      youtubeId: primary.youtubeId || secondary.youtubeId,
      episodeCount: primary.episodeCount || secondary.episodeCount,
      rating: Math.max(primary.rating || 0, secondary.rating || 0),
      genres: mergedGenres,
      providerName: mergedProviderName,
    };

    canonicalMap.set(existingKey, merged);
  }

  const items = Array.from(canonicalMap.values());
  const byProvider: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  let playableNowCount = 0;

  for (const item of items) {
    byProvider[item.providerId] = (byProvider[item.providerId] || 0) + 1;
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    if (
      item.playableType === 'full_stream' ||
      item.playableType === 'live_hls' ||
      item.playableType === 'drm_test'
    ) {
      playableNowCount++;
    }
  }

  return {
    items,
    stats: {
      rawTotal: rawItems.length,
      uniqueTotal: items.length,
      duplicatesRemoved,
      playableNowCount,
      byProvider,
      byCategory,
    },
  };
}
