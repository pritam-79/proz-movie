/**
 * PROZ MOVIE v0.09.02 — RedGIFs Public v2 API Adapter (Zero Hardcoded Keys Required)
 * Uses temporary anonymous public session tokens from https://api.redgifs.com/v2/auth/temporary
 * Provides genuine, playable MP4 streams (VR, 3D/Hentai, Adult Creators, Photo Galleries, Niches)
 * for consenting adults, ensuring VR/Galleries/Performers/Hentai remain rich across all deployments.
 */

export interface RedGifsMediaItem {
  id: string;
  title: string;
  description: string;
  duration: number;
  tags: string[];
  thumbnail: string;
  poster: string;
  hdUrl: string;
  sdUrl: string;
  username: string;
  displayName: string;
  userAvatar?: string;
  likes: number;
  views: number;
  width: number;
  height: number;
  type: 'video' | 'image';
  createdAt: string;
}

export interface RedGifsCreatorItem {
  username: string;
  name: string;
  description?: string;
  profileImageUrl: string;
  views: number;
  followers: number;
  gifs: number;
  verified: boolean;
  url: string;
}

export interface RedGifsNicheItem {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  subscribers: number;
  gifs: number;
}

const API_BASE = 'https://api.redgifs.com/v2';

let cachedToken: { value: string; expiresAt: number } | null = null;
let inflightToken: Promise<string | null> | null = null;
const responseCache = new Map<string, { data: any; ts: number }>();
const inflightMap = new Map<string, Promise<any>>();
const CACHE_TTL_MS = 10 * 60 * 1000;

async function getTempToken(forceRefresh = false): Promise<string | null> {
  if (!forceRefresh && cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }
  if (!forceRefresh && inflightToken) {
    return inflightToken;
  }

  const p = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/temporary`, {
        headers: { Accept: 'application/json', 'User-Agent': 'PROZMovie/0.09.02' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return null;
      const json = await res.json();
      if (json?.token) {
        cachedToken = {
          value: String(json.token),
          expiresAt: Date.now() + 20 * 60 * 1000,
        };
        return cachedToken.value;
      }
      return null;
    } catch {
      return null;
    } finally {
      inflightToken = null;
    }
  })();

  inflightToken = p;
  return p;
}

async function fetchRedGifsJson<T = any>(pathWithQuery: string): Promise<T | null> {
  const hit = responseCache.get(pathWithQuery);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) {
    return hit.data as T;
  }
  const existing = inflightMap.get(pathWithQuery);
  if (existing) return existing as Promise<T | null>;

  const p = (async (): Promise<T | null> => {
    for (let attempt = 0; attempt < 2; attempt++) {
      const token = await getTempToken(attempt === 1);
      if (!token) return null;

      try {
        const res = await fetch(`${API_BASE}${pathWithQuery}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'User-Agent': 'PROZMovie/0.09.02',
          },
          signal: AbortSignal.timeout(10000),
        });
        if (res.status === 401 && attempt === 0) continue;
        if (!res.ok) return null;
        const data = await res.json();
        responseCache.set(pathWithQuery, { data, ts: Date.now() });
        return data as T;
      } catch {
        if (attempt === 1) return null;
      }
    }
    return null;
  })().finally(() => {
    inflightMap.delete(pathWithQuery);
  });

  inflightMap.set(pathWithQuery, p);
  return p;
}

const SAFETY_TERMS = ['underage', 'minor', 'child', 'loli', 'shota', 'cub', 'preteen'];
function isSafeAdultItem(text: string): boolean {
  const lower = text.toLowerCase();
  return !SAFETY_TERMS.some((term) => lower.includes(term));
}

function mapRawGifs(data: any, defaultKind: 'video' | 'image' = 'video'): {
  items: RedGifsMediaItem[];
  creators: RedGifsCreatorItem[];
  total: number;
} {
  const rawGifs: any[] = Array.isArray(data?.gifs) ? data.gifs : [];
  const rawUsers: Record<string, any> =
    data?.users && typeof data.users === 'object' ? data.users : {};

  const items: RedGifsMediaItem[] = [];
  for (const g of rawGifs) {
    if (!g?.id || !g?.urls) continue;
    const tags: string[] = Array.isArray(g.tags) ? g.tags.map(String) : [];
    const userObj = rawUsers[g.userName] || {};
    const displayName = userObj?.name || g.userName || 'Verified Creator';
    const rawTitle =
      tags.length > 0
        ? `${displayName} — ${tags.slice(0, 3).join(' • ')}`
        : `${displayName} Release #${String(g.id).slice(0, 6)}`;

    if (!isSafeAdultItem(`${rawTitle} ${tags.join(' ')}`)) continue;

    const hd = g.urls.hd || g.urls.sd || g.urls.gif || '';
    const sd = g.urls.sd || hd;
    const thumb = g.urls.thumbnail || g.urls.poster || g.urls.vthumbnail || '';
    const poster = g.urls.poster || g.urls.thumbnail || thumb;
    if (!hd && !thumb) continue;

    items.push({
      id: `redgifs-${g.id}`,
      title: rawTitle,
      description:
        userObj?.description ||
        `Verified ${tags.slice(0, 4).join(', ') || '18+ Adult'} stream by ${displayName}.`,
      duration: Number(g.duration) || 30,
      tags,
      thumbnail: thumb,
      poster,
      hdUrl: hd,
      sdUrl: sd,
      username: g.userName || '',
      displayName,
      userAvatar: userObj?.profileImageUrl || undefined,
      likes: Number(g.likes) || 0,
      views: Number(g.views) || 0,
      width: Number(g.width) || 1280,
      height: Number(g.height) || 720,
      type: defaultKind,
      createdAt: g.createDate
        ? new Date(Number(g.createDate) * 1000).toISOString().slice(0, 10)
        : '2026-11-20',
    });
  }

  const creators: RedGifsCreatorItem[] = Object.values(rawUsers)
    .filter((u: any) => u?.username && (u?.name || u?.username) && isSafeAdultItem(String(u.name || u.username)))
    .map((u: any) => ({
      username: String(u.username),
      name: String(u.name || u.username),
      description: u.description ? String(u.description) : undefined,
      profileImageUrl: String(u.profileImageUrl || ''),
      views: Number(u.views) || 0,
      followers: Number(u.followers) || 0,
      gifs: Number(u.publishedGifs || u.gifs) || 0,
      verified: Boolean(u.verified),
      url: String(u.url || `https://www.redgifs.com/users/${u.username}`),
    }));

  return {
    items,
    creators,
    total: Number(data?.total) || items.length,
  };
}

export async function fetchRedGifsVideos(options: {
  query?: string;
  tags?: string;
  page?: number;
  count?: number;
  order?: 'trending' | 'top28' | 'top7' | 'new';
} = {}) {
  const sp = new URLSearchParams({
    type: 'g',
    page: String(options.page || 1),
    count: String(Math.min(options.count || 24, 40)),
    order: options.order || 'trending',
  });
  if (options.query?.trim()) sp.set('search_text', options.query.trim());
  if (options.tags?.trim()) sp.set('tags', options.tags.trim());

  const data = await fetchRedGifsJson(`/gifs/search?${sp.toString()}`);
  return mapRawGifs(data, 'video');
}

export async function fetchRedGifsImages(options: {
  query?: string;
  tags?: string;
  page?: number;
  count?: number;
  order?: 'trending' | 'top28' | 'top7' | 'new';
} = {}) {
  const sp = new URLSearchParams({
    type: 'i',
    page: String(options.page || 1),
    count: String(Math.min(options.count || 30, 50)),
    order: options.order || 'top28',
  });
  if (options.query?.trim()) sp.set('search_text', options.query.trim());
  if (options.tags?.trim()) sp.set('tags', options.tags.trim());

  const data = await fetchRedGifsJson(`/gifs/search?${sp.toString()}`);
  return mapRawGifs(data, 'image');
}

export async function fetchRedGifsNiches(options: { page?: number; query?: string; count?: number } = {}): Promise<{
  total: number;
  niches: RedGifsNicheItem[];
}> {
  const sp = new URLSearchParams({
    page: String(options.page || 1),
    count: String(Math.min(options.count || 24, 40)),
    order: 'subscribers',
  });
  if (options.query?.trim()) sp.set('query', options.query.trim());

  const data = await fetchRedGifsJson(`/niches/search?${sp.toString()}`);
  const raw: any[] = Array.isArray(data?.niches) ? data.niches : [];
  return {
    total: Number(data?.total) || raw.length,
    niches: raw
      .filter((n) => n?.id && n?.name && isSafeAdultItem(`${n.name} ${n.description || ''}`))
      .map((n) => ({
        id: String(n.id),
        name: String(n.name),
        description: String(n.description || `${n.name} community feed`),
        thumbnail: String(n.thumbnail || ''),
        subscribers: Number(n.subscribers) || 0,
        gifs: Number(n.gifs) || 0,
      })),
  };
}

export async function fetchRedGifsItemById(id: string): Promise<RedGifsMediaItem | null> {
  const cleanId = id.replace(/^redgifs-/, '');
  const data = await fetchRedGifsJson<{ gif?: any; user?: any }>(`/gifs/${encodeURIComponent(cleanId)}`);
  if (!data?.gif) return null;
  const g = data.gif;
  const mapped = mapRawGifs(
    {
      gifs: [g],
      users: data.user ? { [g.userName]: data.user } : {},
      total: 1,
    },
    g.type === 2 ? 'image' : 'video'
  );
  return mapped.items[0] || null;
}

export async function fetchRedGifsCreatorProfile(username: string) {
  const clean = username.replace(/^redgifs-creator-/, '');
  const [userRes, gifsRes] = await Promise.all([
    fetchRedGifsJson(`/users/${encodeURIComponent(clean)}`),
    fetchRedGifsJson(`/users/${encodeURIComponent(clean)}/search?order=top&page=1&count=24&type=g`),
  ]);

  const user = userRes?.user || userRes;
  const media = mapRawGifs(gifsRes, 'video');
  return {
    creator: user?.username
      ? {
          username: String(user.username),
          name: String(user.name || user.username),
          description: user.description ? String(user.description) : undefined,
          profileImageUrl: String(user.profileImageUrl || ''),
          views: Number(user.views) || 0,
          followers: Number(user.followers) || 0,
          gifs: Number(user.publishedGifs || user.gifs) || media.items.length,
          verified: Boolean(user.verified),
          url: String(user.url || `https://www.redgifs.com/users/${user.username}`),
        }
      : null,
    items: media.items,
  };
}
