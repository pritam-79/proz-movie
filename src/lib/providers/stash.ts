/**
 * PROZ MOVIE v0.09.02 — Repaired Stash GraphQL Server Adapter & Expanded Tube Hub
 * Fixes:
 *  - Auto-normalizes GraphQL endpoint (/graphql appended automatically when needed)
 *  - Replaces all empty stub methods with real GraphQL queries (findScenes, findPerformers, findStudios, findGalleries, findTags)
 *  - Adds health-check caching + circuit-breaker backoff to eliminate repeated failing connection loops
 *  - Keeps STASH_SERVER_URL & STASH_API_KEY strictly server-side (env + encrypted runtime vault)
 *  - Expands VERIFIED_ADULT_TUBE_PORTALS to 30 categorized, non-duplicate hubs
 */

import {
  StashServerConfig,
  StashScene,
  StashPerformer,
  StashStudio,
  StashTag,
  StashGallery,
  MediaBrowsingFilters,
} from '@/types/library';
import { getResolvedServerEnv } from '@/lib/diagnostics/vaultConfig';
import { AdultTubePortal, VERIFIED_ADULT_TUBE_PORTALS } from '@/lib/data/adultTubesData';

export { VERIFIED_ADULT_TUBE_PORTALS, type AdultTubePortal };

export const CURATED_ADULT_SCENES: StashScene[] = [];
export const CURATED_HOT_WEB_SERIES: any[] = [];
export const CURATED_HENTAI_COLLECTIONS: any[] = [];
export const CURATED_VR_SCENES: any[] = [];

export function ensureStashGraphqlEndpoint(rawUrl?: string | null): string {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) return '';
  if (trimmed.endsWith('/graphql') || trimmed.endsWith('/graphql/')) {
    return trimmed.replace(/\/+$/, '');
  }
  return `${trimmed.replace(/\/+$/, '')}/graphql`;
}

export function getStashServerEnvConfig(): {
  configured: boolean;
  graphqlUrl: string;
  baseUrl: string;
  apiKey: string;
} {
  const env = getResolvedServerEnv();
  const graphqlUrl = ensureStashGraphqlEndpoint(env.stashServerUrl);
  const baseUrl = graphqlUrl.replace(/\/graphql\/?$/, '');
  return {
    configured: Boolean(graphqlUrl),
    graphqlUrl,
    baseUrl,
    apiKey: env.stashApiKey || '',
  };
}

export const DEFAULT_STASH_SERVERS: StashServerConfig[] = (() => {
  const cfg = getStashServerEnvConfig();
  if (!cfg.configured) return [];
  return [
    {
      id: 'stash-srv-configured',
      name: 'Automated Stash Backend Vault',
      serverUrl: cfg.graphqlUrl,
      apiKey: cfg.apiKey || undefined,
      connectionStatus: 'connected',
      lastSyncAt: new Date().toISOString(),
      syncSchedule: 'hourly',
      isEnabled: true,
      libraryIdentifier: 'vault-backend-env',
      version: 'v0.09.02',
      sceneCount: 0,
      performerCount: 0,
      studioCount: 0,
      galleryCount: 0,
    },
  ];
})();

interface HealthCheckCache {
  res: { success: boolean; version?: string; error?: string; latencyMs?: number };
  ts: number;
}

export class StashProviderAdapter {
  private lastHealthCache: HealthCheckCache | null = null;
  private consecutiveFailures = 0;
  private circuitOpenUntil = 0;

  public getServers(): StashServerConfig[] {
    const cfg = getStashServerEnvConfig();
    if (!cfg.configured) return [];
    return [
      {
        id: 'stash-srv-configured',
        name: 'Automated Stash Backend Vault',
        serverUrl: 'Backend Environment / Encrypted Vault',
        apiKey: undefined,
        connectionStatus: this.consecutiveFailures > 0 ? 'error' : 'connected',
        lastSyncAt: this.lastHealthCache ? new Date(this.lastHealthCache.ts).toISOString() : new Date().toISOString(),
        syncSchedule: 'hourly',
        isEnabled: true,
        libraryIdentifier: 'vault-backend-env',
        version: this.lastHealthCache?.res.version || 'v0.09.02',
        sceneCount: 0,
        performerCount: 0,
        studioCount: 0,
        galleryCount: 0,
      },
    ];
  }

  public getInternalPrimaryServer(): StashServerConfig | undefined {
    const cfg = getStashServerEnvConfig();
    if (!cfg.configured) return undefined;
    return {
      id: 'stash-srv-configured',
      name: 'Automated Stash Backend Vault',
      serverUrl: cfg.graphqlUrl,
      apiKey: cfg.apiKey || undefined,
      connectionStatus: this.consecutiveFailures > 0 ? 'error' : 'connected',
      lastSyncAt: new Date().toISOString(),
      syncSchedule: 'hourly',
      isEnabled: true,
      libraryIdentifier: 'vault-backend-env',
      version: this.lastHealthCache?.res.version || 'Stash GraphQL',
      sceneCount: 0,
      performerCount: 0,
      studioCount: 0,
      galleryCount: 0,
    };
  }

  private async runGraphQL<T = any>(
    query: string,
    variables: Record<string, any> = {},
    timeoutMs = 10000
  ): Promise<T | null> {
    const cfg = getStashServerEnvConfig();
    if (!cfg.configured) return null;

    if (Date.now() < this.circuitOpenUntil) {
      return null;
    }

    let lastErr: any = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        };
        if (cfg.apiKey) {
          headers['ApiKey'] = cfg.apiKey;
          headers['Authorization'] = `Bearer ${cfg.apiKey}`;
        }
        const res = await fetch(cfg.graphqlUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ query, variables }),
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (!res.ok) {
          throw new Error(`Stash GraphQL HTTP ${res.status}`);
        }
        const json = await res.json();
        if (json?.errors?.length) {
          throw new Error(json.errors[0]?.message || 'Stash GraphQL query error');
        }
        this.consecutiveFailures = 0;
        this.circuitOpenUntil = 0;
        return (json.data as T) || null;
      } catch (err) {
        lastErr = err;
        if (attempt === 0) await new Promise((r) => setTimeout(r, 350));
      }
    }

    this.consecutiveFailures++;
    if (this.consecutiveFailures >= 3) {
      this.circuitOpenUntil = Date.now() + 30_000;
    }
    throw lastErr || new Error('Stash server request failed');
  }

  public async testConnection(
    _serverOrId?: StashServerConfig | string,
    force = false
  ): Promise<{ success: boolean; version?: string; error?: string; latencyMs?: number }> {
    const cfg = getStashServerEnvConfig();
    if (!cfg.configured) {
      return {
        success: false,
        error: 'Not Configured — Set STASH_SERVER_URL in server environment or encrypted Vault Settings.',
      };
    }

    if (!force && this.lastHealthCache && Date.now() - this.lastHealthCache.ts < 30_000) {
      return this.lastHealthCache.res;
    }

    const start = Date.now();
    try {
      this.circuitOpenUntil = 0; // Allow manual / fresh health check
      const data = await this.runGraphQL<{ version?: { version?: string; hash?: string } }>(
        `query Version { version { version hash } }`,
        {},
        7000
      );
      const latencyMs = Date.now() - start;
      const version = data?.version?.version || 'Stash GraphQL';
      const out = { success: true, version, latencyMs };
      this.lastHealthCache = { res: out, ts: Date.now() };
      return out;
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      const out = {
        success: false,
        error: err?.message || 'Configured STASH_SERVER_URL is unreachable.',
        latencyMs,
      };
      this.lastHealthCache = { res: out, ts: Date.now() };
      return out;
    }
  }

  public async findScenes(filters?: MediaBrowsingFilters): Promise<{ count: number; scenes: StashScene[] }> {
    const cfg = getStashServerEnvConfig();
    if (!cfg.configured) return { count: 0, scenes: [] };
    try {
      const page = filters?.page || 1;
      const perPage = filters?.perPage || 40;
      const data = await this.runGraphQL<{ findScenes: { count: number; scenes: any[] } }>(
        `query FindScenes($filter: FindFilterType) {
          findScenes(filter: $filter) {
            count
            scenes {
              id title details date rating100 o_counter created_at
              files { id path width height duration video_codec audio_codec frame_rate bit_rate size }
              paths { screenshot stream preview }
              studio { id name }
              performers { id name gender country ethnicity hair_color measurements aliases image_path }
              tags { id name }
            }
          }
        }`,
        { filter: { page, per_page: perPage, q: filters?.query || '', sort: 'created_at', direction: 'DESC' } }
      );
      const raw = data?.findScenes?.scenes || [];
      const scenes: StashScene[] = raw.map((s: any) => {
        const f = s.files?.[0] || {};
        return {
          id: `srv-${s.id}`,
          title: s.title || `Stash Scene #${s.id}`,
          details: s.details || '',
          date: s.date || s.created_at?.slice(0, 10) || '',
          rating: s.rating100 ? Number((s.rating100 / 20).toFixed(1)) : 4.5,
          oCounter: s.o_counter || 0,
          organized: true,
          files: (s.files || [f]).map((file: any) => ({
            id: file.id || `file-${s.id}`,
            path: file.path || '',
            size: file.size || 0,
            duration: file.duration || 0,
            videoCodec: file.video_codec || 'h264',
            audioCodec: file.audio_codec || 'aac',
            width: file.width || 1920,
            height: file.height || 1080,
            frameRate: file.frame_rate || 30,
            bitRate: file.bit_rate || 5000000,
          })),
          paths: {
            screenshot: s.paths?.screenshot ? `${cfg.baseUrl}${s.paths.screenshot}` : '',
            preview: `/api/library/stash/proxy-stream?id=srv-${encodeURIComponent(s.id)}`,
            stream: `/api/library/stash/proxy-stream?id=srv-${encodeURIComponent(s.id)}`,
          },
          studio: s.studio ? { id: `srv-studio-${s.studio.id}`, name: s.studio.name, sceneCount: 1 } : undefined,
          performers: (s.performers || []).map((p: any) => ({
            id: `srv-perf-${p.id}`,
            name: p.name,
            gender: p.gender,
            country: p.country,
            ethnicity: p.ethnicity,
            hairColor: p.hair_color,
            measurements: p.measurements,
            aliases: Array.isArray(p.aliases) ? p.aliases.join(', ') : p.aliases,
            imagePath: p.image_path ? `${cfg.baseUrl}${p.image_path}` : undefined,
            sceneCount: 1,
          })),
          tags: (s.tags || []).map((t: any) => ({ id: t.id, name: t.name })),
        };
      });
      return { count: data?.findScenes?.count || scenes.length, scenes };
    } catch {
      return { count: 0, scenes: [] };
    }
  }

  public async findPerformers(): Promise<StashPerformer[]> {
    const cfg = getStashServerEnvConfig();
    if (!cfg.configured) return [];
    try {
      const data = await this.runGraphQL<{ findPerformers: { performers: any[] } }>(
        `query FindPerformers {
          findPerformers(filter: { per_page: 60, sort: "scene_count", direction: DESC }) {
            performers {
              id name gender country ethnicity hair_color measurements aliases image_path scene_count
            }
          }
        }`
      );
      return (data?.findPerformers?.performers || []).map((p: any) => ({
        id: `srv-perf-${p.id}`,
        name: p.name,
        gender: p.gender,
        country: p.country,
        ethnicity: p.ethnicity,
        hairColor: p.hair_color,
        measurements: p.measurements,
        aliases: Array.isArray(p.aliases) ? p.aliases.join(', ') : p.aliases,
        imagePath: p.image_path ? `${cfg.baseUrl}${p.image_path}` : undefined,
        sceneCount: p.scene_count || 0,
      }));
    } catch {
      return [];
    }
  }

  public async findStudios(): Promise<StashStudio[]> {
    const cfg = getStashServerEnvConfig();
    if (!cfg.configured) return [];
    try {
      const data = await this.runGraphQL<{ findStudios: { studios: any[] } }>(
        `query FindStudios {
          findStudios(filter: { per_page: 60, sort: "name", direction: ASC }) {
            studios { id name image_path scene_count }
          }
        }`
      );
      return (data?.findStudios?.studios || []).map((s: any) => ({
        id: `srv-studio-${s.id}`,
        name: s.name,
        imagePath: s.image_path ? `${cfg.baseUrl}${s.image_path}` : undefined,
        sceneCount: s.scene_count || 0,
      }));
    } catch {
      return [];
    }
  }

  public async findTags(): Promise<StashTag[]> {
    const cfg = getStashServerEnvConfig();
    if (!cfg.configured) return [];
    try {
      const data = await this.runGraphQL<{ findTags: { tags: any[] } }>(
        `query FindTags {
          findTags(filter: { per_page: 80 }) {
            tags { id name scene_count }
          }
        }`
      );
      return (data?.findTags?.tags || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        sceneCount: t.scene_count || 0,
      }));
    } catch {
      return [];
    }
  }

  public async findGalleries(): Promise<StashGallery[]> {
    const cfg = getStashServerEnvConfig();
    if (!cfg.configured) return [];
    try {
      const data = await this.runGraphQL<{ findGalleries: { galleries: any[] } }>(
        `query FindGalleries {
          findGalleries(filter: { per_page: 40, sort: "created_at", direction: DESC }) {
            galleries {
              id title details date image_count
              studio { id name }
              performers { id name }
              tags { id name }
              images { id paths { thumbnail image } }
            }
          }
        }`
      );
      return (data?.findGalleries?.galleries || []).map((g: any) => {
        const imgs = (g.images || [])
          .map((img: any) => img?.paths?.image || img?.paths?.thumbnail)
          .filter(Boolean)
          .map((p: string) => (p.startsWith('http') ? p : `${cfg.baseUrl}${p}`));
        return {
          id: `srv-gal-${g.id}`,
          title: g.title || `Stash Gallery #${g.id}`,
          details: g.details || 'Personal Stash Gallery',
          date: g.date || '',
          imageCount: g.image_count || imgs.length,
          rating: 4.8,
          coverPath: imgs[0] || '',
          images: imgs,
          studio: g.studio ? { id: `srv-studio-${g.studio.id}`, name: g.studio.name } : undefined,
          performers: (g.performers || []).map((p: any) => ({ id: `srv-perf-${p.id}`, name: p.name })),
          tags: (g.tags || []).map((t: any) => ({ id: t.id, name: t.name })),
        };
      });
    } catch {
      return [];
    }
  }

  public getSceneStreamUrl(sceneId: string): string {
    return `/api/library/stash/proxy-stream?id=${encodeURIComponent(sceneId)}`;
  }
}

export const stashAdapter = new StashProviderAdapter();
