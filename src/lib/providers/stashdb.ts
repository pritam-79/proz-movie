/**
 * PRO2 ENTERTAINMENT v0.08 — StashDB GraphQL Metadata Adapter
 * Connects securely to https://stashdb.org/graphql (via .env.local or runtime user config).
 * Never hardcodes or exposes API keys to browser clients.
 */

export interface StashDbSceneItem {
  id: string;
  title: string;
  details: string;
  date: string | null;
  durationSeconds: number;
  posterUrl: string;
  studioName: string;
  studioId: string;
  performers: Array<{ id: string; name: string; imageUrl?: string }>;
  tags: string[];
  officialUrls: Array<{ url: string; siteName: string }>;
}

export interface StashDbPerformerItem {
  id: string;
  name: string;
  country?: string;
  sceneCount?: number;
  imageUrl?: string;
}

export interface StashDbStudioItem {
  id: string;
  name: string;
  sceneCount?: number;
  imageUrl?: string;
}

const DEFAULT_STASHDB_ENDPOINT = 'https://stashdb.org/graphql';

interface CacheEntry<T> {
  data: T;
  ts: number;
}

const stashDbCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 10 * 60 * 1000;

export function getStashDbConfig(overrideEndpoint?: string | null, overrideKey?: string | null) {
  const endpoint = (overrideEndpoint || process.env.STASHDB_ENDPOINT || DEFAULT_STASHDB_ENDPOINT).trim();
  const apiKey = (overrideKey || process.env.STASHDB_API_KEY || '').trim();
  return {
    endpoint,
    apiKey,
    isConfigured: Boolean(endpoint && apiKey),
  };
}

async function runStashDbGraphQL<T = any>(
  query: string,
  variables: Record<string, any> = {},
  overrideEndpoint?: string | null,
  overrideKey?: string | null
): Promise<T> {
  const { endpoint, apiKey } = getStashDbConfig(overrideEndpoint, overrideKey);
  if (!apiKey) {
    throw new Error('StashDB API key is not configured. Provide one in STASHDB_API_KEY or Vault Settings.');
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ApiKey': apiKey,
      'User-Agent': 'PRO2Entertainment/0.08',
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`StashDB GraphQL returned HTTP ${res.status}`);
  }

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0]?.message || 'StashDB GraphQL error');
  }
  return json.data;
}

export async function testStashDbConnection(
  overrideEndpoint?: string | null,
  overrideKey?: string | null
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const data = await runStashDbGraphQL(
      `query TestStashDB { queryScenes(input: { page: 1, per_page: 1 }) { count } }`,
      {},
      overrideEndpoint,
      overrideKey
    );
    return {
      success: true,
      count: data?.queryScenes?.count || 0,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Unable to connect to StashDB GraphQL endpoint',
    };
  }
}

export async function fetchStashDbScenes(options: {
  page?: number;
  perPage?: number;
  query?: string;
  endpoint?: string | null;
  apiKey?: string | null;
} = {}): Promise<{ count: number; scenes: StashDbSceneItem[] }> {
  const page = options.page || 1;
  const perPage = Math.min(options.perPage || 24, 40);
  const text = options.query?.trim() || '';

  const cacheKey = `scenes:${page}:${perPage}:${text}:${options.endpoint || 'default'}`;
  const hit = stashDbCache.get(cacheKey);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS && !options.apiKey) {
    return hit.data;
  }

  const gql = `
    query QueryScenes($input: SceneQueryInput!) {
      queryScenes(input: $input) {
        count
        scenes {
          id
          title
          details
          date
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
    sort: 'TRENDING',
    direction: 'DESC',
  };
  if (text) {
    input.text = text;
    input.sort = 'DATE';
  }

  const data = await runStashDbGraphQL(gql, { input }, options.endpoint, options.apiKey);
  const rawScenes: any[] = data?.queryScenes?.scenes || [];

  const scenes: StashDbSceneItem[] = rawScenes.map((s) => ({
    id: `stashdb-${s.id}`,
    title: s.title || 'Untitled StashDB Scene',
    details: s.details || 'Indexed via StashDB GraphQL community catalog.',
    date: s.date || null,
    durationSeconds: s.duration || 0,
    posterUrl:
      s.images?.[0]?.url ||
      s.performers?.[0]?.performer?.images?.[0]?.url ||
      '',
    studioName: s.studio?.name || 'Independent Studio',
    studioId: s.studio?.id || '',
    performers: (s.performers || []).map((p: any) => ({
      id: p?.performer?.id || '',
      name: p?.performer?.name || 'Performer',
      imageUrl: p?.performer?.images?.[0]?.url || '',
    })),
    tags: (s.tags || []).slice(0, 6).map((t: any) => t.name).filter(Boolean),
    officialUrls: (s.urls || []).map((u: any) => ({
      url: u.url,
      siteName: u.site?.name || 'Official Site',
    })),
  }));

  const payload = {
    count: data?.queryScenes?.count || scenes.length,
    scenes,
  };
  if (!options.apiKey) {
    stashDbCache.set(cacheKey, { data: payload, ts: Date.now() });
  }
  return payload;
}

export async function fetchStashDbPerformers(options: {
  page?: number;
  perPage?: number;
  query?: string;
  endpoint?: string | null;
  apiKey?: string | null;
} = {}): Promise<{ count: number; performers: StashDbPerformerItem[] }> {
  const page = options.page || 1;
  const perPage = Math.min(options.perPage || 24, 40);
  const text = options.query?.trim() || '';

  const gql = `
    query QueryPerformers($input: PerformerQueryInput!) {
      queryPerformers(input: $input) {
        count
        performers {
          id
          name
          country
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
  if (text) input.names = text;

  const data = await runStashDbGraphQL(gql, { input }, options.endpoint, options.apiKey);
  const raw: any[] = data?.queryPerformers?.performers || [];

  return {
    count: data?.queryPerformers?.count || raw.length,
    performers: raw.map((p) => ({
      id: p.id,
      name: p.name,
      country: p.country || 'GLOBAL',
      sceneCount: p.scene_count || 0,
      imageUrl: p.images?.[0]?.url || '',
    })),
  };
}

export async function fetchStashDbStudios(options: {
  page?: number;
  perPage?: number;
  query?: string;
  endpoint?: string | null;
  apiKey?: string | null;
} = {}): Promise<{ count: number; studios: StashDbStudioItem[] }> {
  const page = options.page || 1;
  const perPage = Math.min(options.perPage || 24, 40);

  const gql = `
    query QueryStudios($input: StudioQueryInput!) {
      queryStudios(input: $input) {
        count
        studios {
          id
          name
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
  if (options.query?.trim()) input.name = options.query.trim();

  const data = await runStashDbGraphQL(gql, { input }, options.endpoint, options.apiKey);
  const raw: any[] = data?.queryStudios?.studios || [];

  return {
    count: data?.queryStudios?.count || raw.length,
    studios: raw.map((s) => ({
      id: s.id,
      name: s.name,
      imageUrl: s.images?.[0]?.url || '',
    })),
  };
}
