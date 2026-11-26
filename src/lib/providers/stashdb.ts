/**
 * PROZ Entertainment v0.09.1 — Server-Side StashDB GraphQL Metadata Adapter
 * Connects automatically using backend environment variables (STASHDB_ENDPOINT & STASHDB_API_KEY).
 * Features:
 *  - In-flight GraphQL request deduplication & TTL cache (prevents rate-limit blanks)
 *  - Tag queries for Virtual Reality (39,407+), 3D Available (15,113+), Hentai (1,639+)
 *  - Performer queries by Gender & Scene Count (Female 70,489+, Male, Trans, All)
 *  - Multi-image Scene & Performer gallery harvesting
 */

export const STASHDB_TAG_IDS = {
  VR: '6458e5cf-4f65-400b-9067-582141e2a329',
  VIRTUAL_DATE: '08840e71-2431-43f1-a565-167e0515c449',
  VIRTUAL_SEX: 'cda17fc6-00a8-4453-9bec-33e6f81499b3',
  THREE_D: '52992c2c-4617-4540-8ca4-291e9c1507c6',
  HENTAI: '440cc311-8fb6-4eab-977b-855d0ebbb3b4',
} as const;

export interface StashDbSceneItem {
  id: string;
  title: string;
  details: string;
  date: string | null;
  durationSeconds: number;
  image: string;
  images: string[];
  studioName: string;
  studioId: string;
  performers: Array<{ id: string; name: string; imageUrl?: string; gender?: string }>;
  tags: string[];
  officialUrls: Array<{ url: string; siteName: string }>;
  isPlayable?: boolean;
  matchedSceneId?: string | null;
}

export interface StashDbPerformerItem {
  id: string;
  name: string;
  disambiguation?: string;
  aliases?: string[];
  gender?: string;
  country?: string;
  ethnicity?: string;
  hairColor?: string;
  eyeColor?: string;
  heightCm?: number;
  measurements?: string;
  careerStartYear?: number;
  careerEndYear?: number;
  tattoos?: string;
  piercings?: string;
  sceneCount?: number;
  imageUrl?: string;
  images?: string[];
  studios?: Array<{ id: string; name: string; sceneCount?: number; imageUrl?: string }>;
}

export interface StashDbStudioItem {
  id: string;
  name: string;
  aliases?: string[];
  parentName?: string;
  parentId?: string;
  urls?: Array<{ url: string; siteName?: string }>;
  sceneCount?: number;
  imageUrl?: string;
  images?: string[];
}

const DEFAULT_STASHDB_ENDPOINT = 'https://stashdb.org/graphql';

interface CacheEntry<T> {
  data: T;
  ts: number;
}

const stashDbCache = new Map<string, CacheEntry<any>>();
const inflightRequests = new Map<string, Promise<any>>();
const CACHE_TTL_MS = 10 * 60 * 1000;

const BLOCKED_SAFETY_TERMS = ['underage', 'minor', 'child', 'loli', 'shota', 'cub', 'preteen'];
export function isConsentingAdultSafe(text?: string | null, tags?: string[]): boolean {
  const combined = `${text || ''} ${(tags || []).join(' ')}`.toLowerCase();
  return !BLOCKED_SAFETY_TERMS.some((term) => combined.includes(term));
}

export function getStashDbEnvConfig() {
  const endpoint = (process.env.STASHDB_ENDPOINT || DEFAULT_STASHDB_ENDPOINT).trim();
  const apiKey = (process.env.STASHDB_API_KEY || '').trim();
  return {
    endpointConfigured: Boolean(process.env.STASHDB_ENDPOINT),
    isConfigured: Boolean(endpoint && apiKey),
    endpoint,
    apiKey,
  };
}

async function runStashDbGraphQL<T = any>(
  query: string,
  variables: Record<string, any> = {}
): Promise<T> {
  const { endpoint, apiKey } = getStashDbEnvConfig();
  if (!apiKey) {
    throw new Error('Backend STASHDB_API_KEY is missing in server environment.');
  }

  let lastErr: Error | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ApiKey: apiKey,
        },
        body: JSON.stringify({ query, variables }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        if (res.status >= 500 && attempt === 0) {
          await new Promise((r) => setTimeout(r, 450));
          continue;
        }
        throw new Error(`StashDB GraphQL returned HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.errors && Array.isArray(json.errors) && json.errors.length > 0) {
        throw new Error(json.errors[0]?.message || 'StashDB GraphQL query error');
      }
      return json.data as T;
    } catch (err: any) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 400));
      }
    }
  }

  throw lastErr || new Error('Unable to reach StashDB GraphQL endpoint');
}

function withCacheAndDedupe<T>(cacheKey: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const hit = stashDbCache.get(cacheKey);
  if (hit && Date.now() - hit.ts < ttlMs) {
    return Promise.resolve(hit.data as T);
  }
  const existing = inflightRequests.get(cacheKey);
  if (existing) return existing as Promise<T>;

  const p = loader()
    .then((data) => {
      stashDbCache.set(cacheKey, { data, ts: Date.now() });
      return data;
    })
    .finally(() => {
      inflightRequests.delete(cacheKey);
    });
  inflightRequests.set(cacheKey, p);
  return p;
}

export async function testStashDbConnection(): Promise<{
  success: boolean;
  configured: boolean;
  count?: number;
  error?: string;
}> {
  const cfg = getStashDbEnvConfig();
  if (!cfg.isConfigured) {
    return {
      success: false,
      configured: false,
      error: 'Missing STASHDB_API_KEY in server environment.',
    };
  }

  try {
    return await withCacheAndDedupe('health:test', 120_000, async () => {
      const data = await runStashDbGraphQL<{ queryScenes: { count: number } }>(
        `query TestStashDB { queryScenes(input: { page: 1, per_page: 1 }) { count } }`
      );
      return {
        success: true,
        configured: true,
        count: data?.queryScenes?.count || 0,
      };
    });
  } catch (err: any) {
    return {
      success: false,
      configured: true,
      error: err?.message || 'Unable to connect to StashDB GraphQL backend.',
    };
  }
}

function mapRawScene(s: any): StashDbSceneItem {
  const images = Array.isArray(s.images) ? s.images.map((i: any) => i.url).filter(Boolean) : [];
  const perfImages = (s.performers || [])
    .map((p: any) => p.performer?.images?.[0]?.url)
    .filter(Boolean);

  return {
    id: `stashdb-${s.id}`,
    title: s.title || 'Untitled StashDB Entry',
    details: s.details || 'Indexed metadata record from StashDB catalog.',
    date: s.release_date || s.date || null,
    durationSeconds: s.duration || 0,
    image: images[0] || perfImages[0] || '',
    images: images.length > 0 ? images : perfImages,
    studioName: s.studio?.name || 'Independent Studio',
    studioId: s.studio?.id || '',
    performers: (s.performers || [])
      .filter((p: any) => p.performer?.name)
      .map((p: any) => ({
        id: p.performer.id,
        name: p.performer.name,
        gender: p.performer.gender,
        imageUrl: p.performer.images?.[0]?.url,
      })),
    tags: (s.tags || []).map((t: any) => t.name).filter(Boolean),
    officialUrls: (s.urls || []).map((u: any) => ({
      url: u.url,
      siteName: u.site?.name || 'Source',
    })),
    isPlayable: false,
    matchedSceneId: null,
  };
}

export async function fetchStashDbScenes(options: {
  page?: number;
  perPage?: number;
  query?: string;
  studioId?: string;
  performerId?: string;
  tagIds?: string[];
  sort?: 'DATE' | 'CREATED_AT' | 'TRENDING';
} = {}): Promise<{ count: number; scenes: StashDbSceneItem[] }> {
  const page = options.page || 1;
  const perPage = Math.min(options.perPage || 24, 48);
  const text = options.query?.trim() || '';
  const sort = options.sort || 'DATE';
  const tagsKey = (options.tagIds || []).join(',');

  const cacheKey = `scenes:${page}:${perPage}:${text}:${options.studioId || ''}:${options.performerId || ''}:${tagsKey}:${sort}`;

  return withCacheAndDedupe(cacheKey, CACHE_TTL_MS, async () => {
    const gql = `
      query QueryScenes($input: SceneQueryInput!) {
        queryScenes(input: $input) {
          count
          scenes {
            id
            title
            details
            release_date
            duration
            urls { url site { name } }
            images { id url width height }
            studio { id name }
            performers { performer { id name gender images { url } } }
            tags { id name }
          }
        }
      }
    `;

    const input: Record<string, any> = {
      page,
      per_page: perPage,
      sort,
      direction: 'DESC',
    };
    if (text) input.text = text;
    if (options.studioId) input.studios = { value: [options.studioId], modifier: 'INCLUDES' };
    if (options.performerId) input.performers = { value: [options.performerId], modifier: 'INCLUDES' };
    if (options.tagIds && options.tagIds.length > 0) {
      input.tags = { value: options.tagIds, modifier: 'INCLUDES' };
    }

    const data = await runStashDbGraphQL(gql, { input });
    const rawScenes: any[] = data?.queryScenes?.scenes || [];
    const scenes = rawScenes
      .map(mapRawScene)
      .filter((sc) => isConsentingAdultSafe(`${sc.title} ${sc.details}`, sc.tags));

    return {
      count: data?.queryScenes?.count || scenes.length,
      scenes,
    };
  });
}

export async function fetchStashDbPerformers(options: {
  page?: number;
  perPage?: number;
  query?: string;
  studioId?: string;
  gender?: 'FEMALE' | 'MALE' | 'TRANSGENDER_FEMALE' | 'TRANSGENDER_MALE' | 'ALL';
} = {}): Promise<{ count: number; performers: StashDbPerformerItem[] }> {
  const page = options.page || 1;
  const perPage = Math.min(options.perPage || 40, 60);
  const q = options.query?.trim() || '';
  const gender = options.gender || 'FEMALE';

  const cacheKey = `performers:${page}:${perPage}:${q}:${options.studioId || ''}:${gender}`;

  return withCacheAndDedupe(cacheKey, CACHE_TTL_MS, async () => {
    const gql = `
      query QueryPerformers($input: PerformerQueryInput!) {
        queryPerformers(input: $input) {
          count
          performers {
            id
            name
            disambiguation
            aliases
            gender
            country
            ethnicity
            hair_color
            eye_color
            height
            career_start_year
            career_end_year
            scene_count
            images { url }
          }
        }
      }
    `;

    const input: Record<string, any> = {
      page,
      per_page: perPage,
      sort: 'SCENE_COUNT',
      direction: 'DESC',
    };
    if (q) input.names = q;
    if (options.studioId) input.studio_id = options.studioId;
    if (gender !== 'ALL') input.gender = gender;

    const data = await runStashDbGraphQL(gql, { input });
    const raw: any[] = data?.queryPerformers?.performers || [];

    const mapped = raw
      .filter((p) => isConsentingAdultSafe(p.name))
      .map((p) => ({
        id: p.id,
        name: p.name,
        disambiguation: p.disambiguation || undefined,
        aliases: Array.isArray(p.aliases) ? p.aliases : [],
        gender: p.gender || undefined,
        country: p.country || undefined,
        ethnicity: p.ethnicity || undefined,
        hairColor: p.hair_color || undefined,
        eyeColor: p.eye_color || undefined,
        heightCm: p.height || undefined,
        careerStartYear: p.career_start_year || undefined,
        careerEndYear: p.career_end_year || undefined,
        sceneCount: p.scene_count || 0,
        imageUrl: p.images?.[0]?.url || '',
        images: (p.images || []).map((img: any) => img.url).filter(Boolean),
      }));

    return {
      count: data?.queryPerformers?.count || mapped.length,
      performers: mapped,
    };
  });
}

export async function fetchStashDbPerformerById(
  id: string
): Promise<{ performer: StashDbPerformerItem | null; scenes: StashDbSceneItem[] }> {
  const cleanId = id.replace(/^stashdb-/, '');
  const cacheKey = `performer:${cleanId}`;

  return withCacheAndDedupe(cacheKey, CACHE_TTL_MS, async () => {
    const gql = `
      query FindPerformer($id: ID!) {
        findPerformer(id: $id) {
          id
          name
          disambiguation
          aliases
          gender
          country
          ethnicity
          hair_color
          eye_color
          height
          career_start_year
          career_end_year
          tattoos { location description }
          piercings { location description }
          scene_count
          images { url }
          studios {
            scene_count
            studio { id name images { url } }
          }
        }
      }
    `;

    const [perfData, scenesData] = await Promise.all([
      runStashDbGraphQL<{ findPerformer: any }>(gql, { id: cleanId }),
      fetchStashDbScenes({ performerId: cleanId, page: 1, perPage: 24 }).catch(() => ({
        count: 0,
        scenes: [],
      })),
    ]);

    const p = perfData?.findPerformer;
    if (!p) return { performer: null, scenes: [] };

    const formatMods = (mods: any) =>
      Array.isArray(mods) && mods.length > 0
        ? mods.map((m: any) => [m.location, m.description].filter(Boolean).join(': ')).join('; ')
        : undefined;

    return {
      performer: {
        id: p.id,
        name: p.name,
        disambiguation: p.disambiguation || undefined,
        aliases: Array.isArray(p.aliases) ? p.aliases : [],
        gender: p.gender || undefined,
        country: p.country || undefined,
        ethnicity: p.ethnicity || undefined,
        hairColor: p.hair_color || undefined,
        eyeColor: p.eye_color || undefined,
        heightCm: p.height || undefined,
        careerStartYear: p.career_start_year || undefined,
        careerEndYear: p.career_end_year || undefined,
        tattoos: formatMods(p.tattoos),
        piercings: formatMods(p.piercings),
        sceneCount: p.scene_count || scenesData.count || 0,
        imageUrl: p.images?.[0]?.url || '',
        images: (p.images || []).map((img: any) => img.url).filter(Boolean),
        studios: (p.studios || [])
          .filter((s: any) => s.studio?.name)
          .map((s: any) => ({
            id: s.studio.id,
            name: s.studio.name,
            sceneCount: s.scene_count || 0,
            imageUrl: s.studio.images?.[0]?.url || '',
          })),
      },
      scenes: scenesData.scenes,
    };
  });
}

export async function fetchStashDbStudios(options: {
  page?: number;
  perPage?: number;
  query?: string;
} = {}): Promise<{ count: number; studios: StashDbStudioItem[] }> {
  const page = options.page || 1;
  const perPage = Math.min(options.perPage || 24, 48);
  const q = options.query?.trim() || '';

  const cacheKey = `studios:${page}:${perPage}:${q}`;
  return withCacheAndDedupe(cacheKey, CACHE_TTL_MS, async () => {
    const gql = `
      query QueryStudios($input: StudioQueryInput!) {
        queryStudios(input: $input) {
          count
          studios {
            id
            name
            aliases
            parent { id name }
            urls { url site { name } }
            images { url }
          }
        }
      }
    `;

    const input: Record<string, any> = {
      page,
      per_page: perPage,
      sort: 'NAME',
      direction: 'ASC',
    };
    if (q) input.name = q;

    const data = await runStashDbGraphQL(gql, { input });
    const raw: any[] = data?.queryStudios?.studios || [];

    return {
      count: data?.queryStudios?.count || raw.length,
      studios: raw.map((s) => ({
        id: s.id,
        name: s.name,
        aliases: Array.isArray(s.aliases) ? s.aliases : [],
        parentName: s.parent?.name,
        parentId: s.parent?.id,
        urls: (s.urls || []).map((u: any) => ({ url: u.url, siteName: u.site?.name })),
        imageUrl: s.images?.[0]?.url || '',
        images: (s.images || []).map((img: any) => img.url).filter(Boolean),
      })),
    };
  });
}

export async function fetchStashDbStudioById(
  id: string
): Promise<{
  studio: StashDbStudioItem | null;
  scenes: StashDbSceneItem[];
  performers: StashDbPerformerItem[];
}> {
  const cleanId = id.replace(/^stashdb-/, '');
  const cacheKey = `studio:${cleanId}`;

  return withCacheAndDedupe(cacheKey, CACHE_TTL_MS, async () => {
    const gql = `
      query FindStudio($id: ID!) {
        findStudio(id: $id) {
          id
          name
          aliases
          parent { id name }
          urls { url site { name } }
          images { url }
        }
      }
    `;

    const [studioData, scenesData, perfData] = await Promise.all([
      runStashDbGraphQL<{ findStudio: any }>(gql, { id: cleanId }),
      fetchStashDbScenes({ studioId: cleanId, page: 1, perPage: 24 }).catch(() => ({
        count: 0,
        scenes: [],
      })),
      fetchStashDbPerformers({ studioId: cleanId, page: 1, perPage: 16, gender: 'ALL' }).catch(() => ({
        count: 0,
        performers: [],
      })),
    ]);

    const s = studioData?.findStudio;
    if (!s) return { studio: null, scenes: [], performers: [] };

    return {
      studio: {
        id: s.id,
        name: s.name,
        aliases: Array.isArray(s.aliases) ? s.aliases : [],
        parentName: s.parent?.name,
        parentId: s.parent?.id,
        urls: (s.urls || []).map((u: any) => ({ url: u.url, siteName: u.site?.name })),
        sceneCount: scenesData.count || scenesData.scenes.length,
        imageUrl: s.images?.[0]?.url || '',
        images: (s.images || []).map((img: any) => img.url).filter(Boolean),
      },
      scenes: scenesData.scenes,
      performers: perfData.performers,
    };
  });
}
