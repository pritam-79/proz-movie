import { NextRequest, NextResponse } from 'next/server';
import { cine18Adapter, normalizeCdnStreamUrl } from '@/lib/providers/cine18';
import { getStashServerEnvConfig, stashAdapter } from '@/lib/providers/stash';

export const dynamic = 'force-dynamic';

/**
 * PROZ MOVIE v0.09.02 — Repaired Personal Stash & Scene Proxy Stream
 * - Fixes srv-<id> scene ID stripping so personal Stash server streams work properly
 * - Passes ApiKey auth header ONLY server-side when streaming from STASH_SERVER_URL
 * - Removes stream-killing 15s timeout during active playback transfer
 * - Never fabricates playable streams for unmatched StashDB metadata records
 */
async function resolvePlayableStashTarget(sceneId: string): Promise<{
  url: string | null;
  isPersonalStash: boolean;
}> {
  const srvCfg = getStashServerEnvConfig();

  if (sceneId.startsWith('stashdb-')) {
    return { url: null, isPersonalStash: false };
  }

  // Personal Stash server item (srv-123 -> <baseUrl>/scene/123/stream)
  if (sceneId.startsWith('srv-') && srvCfg.configured) {
    const cleanId = sceneId.replace(/^srv-/, '');
    return {
      url: `${srvCfg.baseUrl}/scene/${encodeURIComponent(cleanId)}/stream`,
      isPersonalStash: true,
    };
  }

  // Cine18 item mapped inside Stash library (cine18-xxxx)
  if (sceneId.startsWith('cine18-')) {
    const cleanUid = sceneId.replace(/^cine18-/, '');
    const details = await cine18Adapter.getVideoDetails(cleanUid).catch(() => null);
    const link =
      normalizeCdnStreamUrl(details?.videos?.[0]?.video_link) ||
      normalizeCdnStreamUrl(details?.videos?.find((v) => v.video_link)?.video_link);
    if (link) return { url: link, isPersonalStash: false };
  }

  // Generic stash server lookup if configured
  const activeSrv = stashAdapter.getInternalPrimaryServer();
  if (activeSrv?.serverUrl && srvCfg.baseUrl) {
    const cleanId = sceneId.replace(/^(stash-|srv-)+/, '');
    return {
      url: `${srvCfg.baseUrl}/scene/${encodeURIComponent(cleanId)}/stream`,
      isPersonalStash: true,
    };
  }

  return { url: null, isPersonalStash: false };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawId = searchParams.get('id') || '';
    const bare = rawId.replace(/^(stash-)+/i, '').trim();

    if (!bare) {
      return NextResponse.json({ success: false, error: 'Missing stream scene id' }, { status: 400 });
    }

    const resolved = await resolvePlayableStashTarget(bare);
    if (!resolved.url) {
      return NextResponse.json(
        {
          success: false,
          error:
            'No playable media file is linked to this Stash entry. Check STASH_SERVER_URL in Settings or select a verified playable channel.',
        },
        { status: 404 }
      );
    }

    const srvCfg = getStashServerEnvConfig();
    const range = req.headers.get('range');
    const headers: HeadersInit = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    };
    if (range) headers['Range'] = range;
    if (resolved.isPersonalStash && srvCfg.apiKey) {
      headers['ApiKey'] = srvCfg.apiKey;
      headers['Authorization'] = `Bearer ${srvCfg.apiKey}`;
    }

    const connectController = new AbortController();
    const connectTimer = setTimeout(() => connectController.abort(), 14000);
    const videoResponse = await fetch(resolved.url, {
      headers,
      signal: connectController.signal,
    });
    clearTimeout(connectTimer);

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', videoResponse.headers.get('Content-Type') || 'video/mp4');
    responseHeaders.set('Accept-Ranges', videoResponse.headers.get('Accept-Ranges') || 'bytes');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
    if (videoResponse.headers.get('Content-Length')) {
      responseHeaders.set('Content-Length', videoResponse.headers.get('Content-Length')!);
    }
    if (videoResponse.headers.get('Content-Range')) {
      responseHeaders.set('Content-Range', videoResponse.headers.get('Content-Range')!);
    }

    return new NextResponse(videoResponse.body, {
      status: videoResponse.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Stream proxy error' },
      { status: 502 }
    );
  }
}
