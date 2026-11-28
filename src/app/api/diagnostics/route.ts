import { NextRequest, NextResponse } from 'next/server';
import { getResolvedServerEnv, writeServerVault } from '@/lib/diagnostics/vaultConfig';
import { stashAdapter } from '@/lib/providers/stash';
import { testStashDbConnection } from '@/lib/providers/stashdb';
import { stashService } from '@/lib/services/stashService';
import { cine18Adapter } from '@/lib/providers/cine18';

export const dynamic = 'force-dynamic';

/**
 * GET /api/diagnostics
 * Comprehensive system health, API status, Stash connection, StashDB status, DB status, missing env vars.
 * Never exposes actual API keys, tokens, or secrets in responses.
 */
export async function GET() {
  const start = Date.now();
  try {
    const env = getResolvedServerEnv();
    const [backendStatus, cineTest, stashTest, stashDbTest] = await Promise.all([
      stashService.getBackendStatus(),
      cine18Adapter.testConnection(),
      stashAdapter.testConnection(),
      testStashDbConnection(),
    ]);

    const missingEnvVars: string[] = [];
    if (!env.stashDbConfigured) missingEnvVars.push('STASHDB_API_KEY');
    if (!env.stashServerConfigured) missingEnvVars.push('STASH_SERVER_URL');
    if (!env.hasSupabaseUrl) missingEnvVars.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!env.hasTmdbKey) missingEnvVars.push('TMDB_API_KEY');

    return NextResponse.json({
      success: true,
      checkedAt: new Date().toISOString(),
      latencyMs: Date.now() - start,
      version: '0.09.02',
      systemHealth: cineTest.success ? 'healthy' : 'degraded',
      services: {
        apiGateway: { ok: true, status: 'operational', latencyMs: Date.now() - start },
        cine18: {
          ok: cineTest.success,
          status: cineTest.success ? 'connected' : 'error',
          channelCount: backendStatus.cine18.channelCount,
          message: cineTest.message,
          latencyMs: cineTest.latencyMs,
        },
        redgifs: {
          ok: backendStatus.redgifs.connected,
          status: backendStatus.redgifs.connected ? 'connected' : 'degraded',
          message: backendStatus.redgifs.message,
        },
        stashServer: {
          configured: env.stashServerConfigured,
          ok: stashTest.success,
          status: !env.stashServerConfigured
            ? 'unconfigured'
            : stashTest.success
            ? 'connected'
            : 'error',
          version: stashTest.version,
          latencyMs: stashTest.latencyMs,
          message: stashTest.error || backendStatus.personalStash.message,
        },
        stashDb: {
          configured: env.stashDbConfigured,
          ok: stashDbTest.success,
          status: !env.stashDbConfigured
            ? 'unconfigured'
            : stashDbTest.success
            ? 'connected'
            : 'error',
          indexedScenesCount: stashDbTest.count || 0,
          message: backendStatus.stashdb.message,
        },
        database: {
          configured: env.hasSupabaseUrl,
          status: env.hasSupabaseUrl ? 'connected' : 'fallback_store',
          message: env.hasSupabaseUrl
            ? 'Supabase PostgreSQL active'
            : 'Using local in-memory/browser fallback store (NEXT_PUBLIC_SUPABASE_URL unset or demo)',
        },
        playbackEngine: {
          hlsDash: 'Shaka Player v4.x + Native HLS',
          mpegTs: 'mpegts.js Chunked HTTP Range Loader',
          mp4Direct: 'Native Range + Proxy Recovery',
        },
      },
      syncState: backendStatus.syncState,
      missingEnvVars,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Diagnostics probe failed' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/diagnostics
 * Executes safe recovery actions (reconnect Stash, sync library, test StashDB, save encrypted admin vault config).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || '');

    if (action === 'reconnect_stash') {
      const test = await stashAdapter.testConnection(undefined, true);
      return NextResponse.json({
        success: test.success,
        action,
        message: test.success ? `Reconnected Stash (${test.version})` : test.error,
        latencyMs: test.latencyMs,
      });
    }

    if (action === 'sync_library') {
      const cache = await stashService.syncLibrary(true);
      return NextResponse.json({
        success: true,
        action,
        lastSyncAt: cache.lastSyncAt,
        channelCount: cache.cineChannels.length,
        duplicatesRemoved: cache.duplicatesRemoved,
      });
    }

    if (action === 'test_stashdb') {
      const test = await testStashDbConnection();
      return NextResponse.json({
        success: test.success,
        action,
        configured: test.configured,
        count: test.count || 0,
        message: test.success ? 'StashDB GraphQL connection verified.' : test.error,
      });
    }

    if (action === 'configure_vault') {
      // Optional encrypted runtime backend configuration (never echoed back!)
      const updates: Record<string, string> = {};
      if (typeof body.stashServerUrl === 'string' && body.stashServerUrl.trim()) {
        updates.stashServerUrl = body.stashServerUrl.trim();
      }
      if (typeof body.stashApiKey === 'string' && body.stashApiKey.trim()) {
        updates.stashApiKey = body.stashApiKey.trim();
      }
      if (typeof body.stashDbEndpoint === 'string' && body.stashDbEndpoint.trim()) {
        updates.stashDbEndpoint = body.stashDbEndpoint.trim();
      }
      if (typeof body.stashDbApiKey === 'string' && body.stashDbApiKey.trim()) {
        updates.stashDbApiKey = body.stashDbApiKey.trim();
      }

      if (Object.keys(updates).length === 0) {
        return NextResponse.json({ success: false, error: 'No configuration fields supplied' }, { status: 400 });
      }

      const persisted = writeServerVault(updates);
      return NextResponse.json({
        success: true,
        action,
        persistedToDisk: persisted.persistedToDisk,
        message: 'Encrypted backend configuration saved securely server-side.',
      });
    }

    return NextResponse.json({ success: false, error: 'Unsupported diagnostic action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Diagnostic action failed' },
      { status: 500 }
    );
  }
}
