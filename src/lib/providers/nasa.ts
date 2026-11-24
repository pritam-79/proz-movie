/**
 * PRO2 ENTERTAINMENT v0.07 — NASA Images & Video Public Domain Library Adapter
 * Official Zero-Auth REST API: https://images-api.nasa.gov
 * Returns direct HTTPS MP4 full documentary & space-cinema streams.
 */

import { V07MediaItem } from './kitsu';

const NASA_SEARCH_URL = 'https://images-api.nasa.gov/search';

const CURATED_NASA_TERMS = ['apollo', 'james webb', 'mars rover', 'earth from orbit', 'voyager'];

export async function fetchNasaOpenVideos(options: {
  query?: string;
  limit?: number;
} = {}): Promise<V07MediaItem[]> {
  const limit = Math.min(options.limit || 10, 20);
  const q = options.query?.trim() || CURATED_NASA_TERMS[0];

  try {
    const params = new URLSearchParams({
      q,
      media_type: 'video',
      page_size: String(limit),
    });

    const res = await fetch(`${NASA_SEARCH_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];

    const json = await res.json();
    const rawItems = Array.isArray(json?.collection?.items) ? json.collection.items : [];

    return rawItems
      .filter((entry: any) => entry?.data?.[0]?.nasa_id && entry?.href)
      .slice(0, limit)
      .map((entry: any): V07MediaItem => {
        const meta = entry.data[0];
        const nasaId = String(meta.nasa_id);
        const thumbLink = (entry.links || []).find((l: any) => l.rel === 'preview')?.href || '';
        const year = meta.date_created
          ? parseInt(String(meta.date_created).slice(0, 4), 10) || 2024
          : 2024;

        return {
          id: `nasa-${nasaId}`,
          externalId: nasaId,
          providerId: 'nasa_media',
          providerName: 'NASA Public Domain Video Archive',
          title: meta.title || nasaId,
          canonicalTitle: meta.title || nasaId,
          description: meta.description || 'Public domain space film & documentary from NASA Archive.',
          poster: thumbLink,
          backdrop: thumbLink,
          category: 'documentary',
          subCategory: 'Space & Science Films',
          contentType: 'documentary',
          releaseYear: year,
          language: 'English',
          country: 'US',
          genres: ['Documentary', 'Space', 'Science', 'Public Domain'],
          rating: 8.7,
          isAdult: false,
          playableType: 'full_stream',
          streamUrl: `/api/v07/resolve-stream?id=${encodeURIComponent(`nasa-${nasaId}`)}`,
          streamFormat: 'mp4',
          rightsLabel: 'Public Domain (NASA)',
          detailHref: `https://images.nasa.gov/details/${encodeURIComponent(nasaId)}`,
        };
      });
  } catch {
    return [];
  }
}

export async function resolveNasaDirectMp4(nasaId: string): Promise<string | null> {
  try {
    const cleanId = nasaId.replace(/^nasa-/, '');
    const res = await fetch(
      `https://images-api.nasa.gov/asset/${encodeURIComponent(cleanId)}`,
      { signal: AbortSignal.timeout(8000), next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const items: any[] = json?.collection?.items || [];
    const urls: string[] = items
      .map((i) => String(i.href || ''))
      .filter((u) => u.toLowerCase().endsWith('.mp4'));

    const preferred =
      urls.find((u) => u.includes('~large.mp4')) ||
      urls.find((u) => u.includes('~medium.mp4')) ||
      urls.find((u) => u.includes('~orig.mp4')) ||
      urls[0];

    if (!preferred) return null;
    const httpsUrl = preferred.replace(/^http:\/\//i, 'https://');
    try {
      return new URL(httpsUrl).href;
    } catch {
      return encodeURI(httpsUrl);
    }
  } catch {
    return null;
  }
}
