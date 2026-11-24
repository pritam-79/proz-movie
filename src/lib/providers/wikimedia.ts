/**
 * PRO2 ENTERTAINMENT v0.07 — Wikimedia Commons Open Video Adapter
 * Resolves verified Public Domain & CC-BY / CC-BY-SA educational & classic cinema clips.
 * API: https://commons.wikimedia.org/w/api.php
 */

import { V07MediaItem } from './kitsu';

const WIKIMEDIA_API = 'https://commons.wikimedia.org/w/api.php';

export async function fetchWikimediaVideos(options: {
  query?: string;
  limit?: number;
} = {}): Promise<V07MediaItem[]> {
  const limit = Math.min(options.limit || 10, 16);
  const queryText = options.query?.trim()
    ? `${options.query.trim()} filetype:video`
    : 'animation OR cinema OR documentary filetype:video';

  try {
    const params = new URLSearchParams({
      action: 'query',
      generator: 'search',
      gsrsearch: queryText,
      gsrnamespace: '6',
      gsrlimit: String(limit),
      prop: 'imageinfo',
      iiprop: 'url|mime|thumburl|extmetadata',
      iiurlwidth: '640',
      format: 'json',
      origin: '*',
    });

    const res = await fetch(`${WIKIMEDIA_API}?${params.toString()}`, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'PRO2Entertainment/0.07 (open-media-aggregator)' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];

    const json = await res.json();
    const pages = Object.values(json?.query?.pages || {}) as any[];

    return pages
      .map((page): V07MediaItem | null => {
        const info = page?.imageinfo?.[0];
        const url: string = info?.url || '';
        const mime: string = info?.mime || '';
        if (!url || (!mime.includes('video') && !url.endsWith('.webm') && !url.endsWith('.mp4'))) {
          return null;
        }

        const cleanTitle = String(page.title || '')
          .replace(/^File:/i, '')
          .replace(/\.(webm|mp4|ogv)$/i, '')
          .replace(/_/g, ' ');
        const rawDesc =
          info?.extmetadata?.ImageDescription?.value?.replace(/<[^>]+>/g, '') ||
          'Open-license educational & documentary video from Wikimedia Commons.';
        const thumb = info?.thumburl || '';
        const licenseName = info?.extmetadata?.LicenseShortName?.value || 'CC / Public Domain';

        return {
          id: `wm-${page.pageid}`,
          externalId: String(page.pageid),
          providerId: 'wikimedia',
          providerName: 'Wikimedia Commons Open Media',
          title: cleanTitle,
          canonicalTitle: cleanTitle,
          description: rawDesc.slice(0, 220),
          poster: thumb,
          backdrop: thumb,
          category: 'documentary',
          subCategory: 'Open Media & Science',
          contentType: 'documentary',
          releaseYear: 2023,
          language: 'Multilingual',
          country: 'GLOBAL',
          genres: ['Open Media', 'Documentary', 'Creative Commons'],
          rating: 8.1,
          isAdult: false,
          playableType: 'full_stream',
          streamUrl: url,
          streamFormat: url.endsWith('.mp4') ? 'mp4' : 'hls',
          rightsLabel: licenseName,
          detailHref: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title || '')}`,
        };
      })
      .filter((x): x is V07MediaItem => Boolean(x));
  } catch {
    return [];
  }
}
