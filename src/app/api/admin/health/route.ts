import { NextResponse } from 'next/server';
import { providerRegistry } from '@/lib/providers/registry';
import { stashAdapter } from '@/lib/providers/stash';

interface ProviderHealthStatus {
  id: string;
  name: string;
  category: 'metadata' | 'streaming' | 'storage' | 'database' | 'adult';
  status: 'connected' | 'configured' | 'disconnected' | 'error';
  latencyMs: number;
  message: string;
  lastChecked: string;
}

export async function GET() {
  const timestamp = new Date().toISOString();

  // Parallel health checks with timeouts
  const checkEndpoint = async (
    id: string,
    name: string,
    category: ProviderHealthStatus['category'],
    checkFn: () => Promise<{ ok: boolean; message: string }>
  ): Promise<ProviderHealthStatus> => {
    const start = Date.now();
    try {
      const res = await Promise.race([
        checkFn(),
        new Promise<{ ok: boolean; message: string }>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout after 3000ms')), 3000)
        )
      ]);
      const latencyMs = Date.now() - start;
      return {
        id,
        name,
        category,
        status: res.ok ? 'connected' : 'error',
        latencyMs,
        message: res.message,
        lastChecked: timestamp
      };
    } catch (err: any) {
      return {
        id,
        name,
        category,
        status: 'disconnected',
        latencyMs: Date.now() - start,
        message: err?.message || 'Connection check failed',
        lastChecked: timestamp
      };
    }
  };

  const results = await Promise.all([
    // 1. Internet Archive (REST)
    checkEndpoint('archive_org', 'Internet Archive', 'streaming', async () => {
      const res = await fetch('https://archive.org/advancedsearch.php?q=collection%3Afeature_films&rows=1&output=json', {
        signal: AbortSignal.timeout(3000)
      });
      return { ok: res.ok, message: res.ok ? 'Public domain cinema repository operational' : `HTTP ${res.status}` };
    }),

    // 2. PeerTube (Federated REST)
    checkEndpoint('peertube', 'PeerTube Network', 'streaming', async () => {
      const res = await fetch('https://peertube.tv/api/v1/videos?count=1', {
        signal: AbortSignal.timeout(3000)
      });
      return { ok: res.ok, message: res.ok ? 'PeerTube federated nodes responding' : `HTTP ${res.status}` };
    }),

    // 3. Openverse (Creative Commons)
    checkEndpoint('openverse', 'Openverse API', 'streaming', async () => {
      const res = await fetch('https://api.openverse.engineering/v1/audio/?page_size=1', {
        signal: AbortSignal.timeout(3000)
      });
      return { ok: res.ok, message: res.ok ? 'Openverse open-license audio/visual API active' : `HTTP ${res.status}` };
    }),

    // 4. TVmaze (Public REST)
    checkEndpoint('tvmaze', 'TVmaze Schedules', 'metadata', async () => {
      const res = await fetch('https://api.tvmaze.com/shows/1', {
        signal: AbortSignal.timeout(3000)
      });
      return { ok: res.ok, message: res.ok ? 'TVmaze television database active' : `HTTP ${res.status}` };
    }),

    // 5. AniList (GraphQL)
    checkEndpoint('anilist', 'AniList Anime DB', 'metadata', async () => {
      const res = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '{ Page(page: 1, perPage: 1) { media { id } } }' }),
        signal: AbortSignal.timeout(3000)
      });
      return { ok: res.ok, message: res.ok ? 'AniList GraphQL endpoint responding' : `HTTP ${res.status}` };
    }),

    // 6. TMDB (The Movie Database)
    checkEndpoint('tmdb', 'The Movie Database (TMDB)', 'metadata', async () => {
      const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
      if (!apiKey) {
        return { ok: false, message: 'TMDB API key not configured in environment' };
      }
      const res = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${apiKey}`, {
        signal: AbortSignal.timeout(3000)
      });
      return { ok: res.ok, message: res.ok ? 'TMDB metadata API connected' : `HTTP ${res.status}` };
    }),

    // 7. Watchmode (Streaming Availability API)
    checkEndpoint('watchmode', 'Watchmode Deep Links', 'metadata', async () => {
      const apiKey = process.env.WATCHMODE_API_KEY;
      if (!apiKey) {
        return { ok: false, message: 'Watchmode API key not set; regional deep links use direct fallbacks' };
      }
      const res = await fetch(`https://api.watchmode.com/v1/status/?apiKey=${apiKey}`, {
        signal: AbortSignal.timeout(3000)
      });
      return { ok: res.ok, message: res.ok ? 'Watchmode verified' : `HTTP ${res.status}` };
    }),

    // 8. Stash Private Vault (GraphQL)
    checkEndpoint('stash', 'Stash Adult Vault', 'adult', async () => {
      const test = await stashAdapter.testConnection();
      return { ok: test.success, message: test.success ? `Stash connected (${test.version})` : (test.error || 'Stash server not running or unreachable') };
    }),

    // 9. Cloudflare Stream
    checkEndpoint('cloudflare', 'Cloudflare Stream', 'storage', async () => {
      const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
      const token = process.env.CLOUDFLARE_STREAM_TOKEN;
      if (!accountId || !token) {
        return { ok: false, message: 'Cloudflare credentials not set; manual upload workflows disabled in v0.03' };
      }
      return { ok: true, message: 'Cloudflare Stream configured' };
    }),

    // 10. Supabase Database
    checkEndpoint('supabase', 'Supabase DB / Auth', 'database', async () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) {
        return { ok: false, message: 'Supabase credentials not configured; in-memory fallback active' };
      }
      const res = await fetch(`${url}/rest/v1/`, {
        headers: { apikey: key },
        signal: AbortSignal.timeout(3000)
      });
      return { ok: res.ok, message: res.ok ? 'Supabase cloud database responsive' : `HTTP ${res.status}` };
    })
  ]);

  const connectedCount = results.filter(r => r.status === 'connected').length;

  return NextResponse.json({
    success: true,
    timestamp,
    summary: {
      total: results.length,
      connected: connectedCount,
      disconnected: results.length - connectedCount,
      systemHealth: connectedCount >= 4 ? 'healthy' : 'degraded'
    },
    providers: results
  });
}
