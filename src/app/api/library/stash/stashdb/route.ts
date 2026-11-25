import { NextRequest, NextResponse } from 'next/server';
import {
  getStashDbConfig,
  testStashDbConnection,
  fetchStashDbScenes,
  fetchStashDbPerformers,
  fetchStashDbStudios,
} from '@/lib/providers/stashdb';

export const dynamic = 'force-dynamic';

/**
 * StashDB GraphQL Bridge (/api/library/stash/stashdb)
 * Uses gitignored .env.local credentials by default or runtime request headers from Vault Settings.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const mode = sp.get('mode') || 'scenes';
  const query = sp.get('q') || '';
  const page = parseInt(sp.get('page') || '1', 10);

  const overrideEndpoint = req.headers.get('x-stashdb-endpoint');
  const overrideKey = req.headers.get('x-stashdb-apikey');
  const cfg = getStashDbConfig(overrideEndpoint, overrideKey);

  if (!cfg.isConfigured) {
    return NextResponse.json({
      success: false,
      configured: false,
      endpoint: cfg.endpoint,
      message: 'StashDB API key not configured. Add your StashDB GraphQL endpoint & API key in Vault Settings.',
      scenes: [],
      performers: [],
      studios: [],
    });
  }

  try {
    if (mode === 'performers') {
      const data = await fetchStashDbPerformers({
        page,
        perPage: 24,
        query,
        endpoint: overrideEndpoint,
        apiKey: overrideKey,
      });
      return NextResponse.json({
        success: true,
        configured: true,
        endpoint: cfg.endpoint,
        mode,
        ...data,
      });
    }

    if (mode === 'studios') {
      const data = await fetchStashDbStudios({
        page,
        perPage: 24,
        query,
        endpoint: overrideEndpoint,
        apiKey: overrideKey,
      });
      return NextResponse.json({
        success: true,
        configured: true,
        endpoint: cfg.endpoint,
        mode,
        ...data,
      });
    }

    const data = await fetchStashDbScenes({
      page,
      perPage: 24,
      query,
      endpoint: overrideEndpoint,
      apiKey: overrideKey,
    });
    return NextResponse.json({
      success: true,
      configured: true,
      endpoint: cfg.endpoint,
      mode: 'scenes',
      ...data,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        configured: true,
        endpoint: cfg.endpoint,
        error: err?.message || 'StashDB query failed',
        scenes: [],
        performers: [],
        studios: [],
      },
      { status: 502 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const endpoint = typeof body.endpoint === 'string' ? body.endpoint.trim() : undefined;
    const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : undefined;

    const test = await testStashDbConnection(endpoint, apiKey);
    if (!test.success) {
      return NextResponse.json(
        { success: false, error: test.error || 'Connection failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      endpoint: endpoint || getStashDbConfig().endpoint,
      totalIndexedScenes: test.count,
      message: `Connected to StashDB (${(test.count || 0).toLocaleString()} indexed scenes)`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Invalid StashDB configuration' },
      { status: 500 }
    );
  }
}
