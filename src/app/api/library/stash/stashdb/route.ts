import { NextRequest, NextResponse } from 'next/server';
import {
  getStashDbEnvConfig,
  testStashDbConnection,
  fetchStashDbScenes,
  fetchStashDbPerformers,
  fetchStashDbStudios,
} from '@/lib/providers/stashdb';
import { stashService } from '@/lib/services/stashService';

export const dynamic = 'force-dynamic';

/**
 * StashDB GraphQL Bridge (/api/library/stash/stashdb)
 * Strictly server-side authentication via backend .env.local credentials.
 * Never accepts client key overrides or exposes secret keys/endpoints.
 * Matches StashDB metadata against actual playable Stash media files.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const mode = sp.get('mode') || 'scenes';
  const query = sp.get('q') || '';
  const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1);

  const cfg = getStashDbEnvConfig();

  if (!cfg.isConfigured) {
    return NextResponse.json({
      success: false,
      configured: false,
      message: 'Backend StashDB credentials (STASHDB_API_KEY) are missing in server environment.',
      scenes: [],
      performers: [],
      studios: [],
    });
  }

  try {
    if (mode === 'performers') {
      const data = await fetchStashDbPerformers({ page, perPage: 24, query });
      return NextResponse.json({
        success: true,
        configured: true,
        mode,
        ...data,
      });
    }

    if (mode === 'studios') {
      const data = await fetchStashDbStudios({ page, perPage: 24, query });
      return NextResponse.json({
        success: true,
        configured: true,
        mode,
        ...data,
      });
    }

    const data = await fetchStashDbScenes({ page, perPage: 24, query });
    const matchedScenes = await stashService.matchStashDbScenes(data.scenes);

    return NextResponse.json({
      success: true,
      configured: true,
      mode: 'scenes',
      count: data.count,
      scenes: matchedScenes,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        configured: true,
        error: err?.message || 'StashDB query failed',
        scenes: [],
        performers: [],
        studios: [],
      },
      { status: 502 }
    );
  }
}

export async function POST() {
  try {
    const test = await testStashDbConnection();
    if (!test.success) {
      return NextResponse.json(
        { success: false, error: test.error || 'StashDB connection failed' },
        { status: test.configured ? 502 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      totalIndexedScenes: test.count,
      message: `Connected automatically via backend credentials (${(test.count || 0).toLocaleString()} indexed scenes)`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'StashDB connection check failed' },
      { status: 500 }
    );
  }
}
