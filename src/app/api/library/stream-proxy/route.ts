import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function isPrivateOrLocalHostname(host: string): boolean {
  const clean = host.toLowerCase();
  return (
    clean === 'localhost' ||
    clean === '127.0.0.1' ||
    clean === '0.0.0.0' ||
    clean.startsWith('10.') ||
    clean.startsWith('192.168.') ||
    clean.startsWith('169.254.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(clean)
  );
}

/**
 * PRO2 ENTERTAINMENT v0.08 — Safe Stream Range Proxy
 * Handles HTTP range requests, special-character CDN URL encoding, and CORS headers
 * for channel CDN MP4 / MPEG-TS (.ts) / HLS streams.
 */
export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get('url');
  if (!rawUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    try {
      target = new URL(encodeURI(rawUrl));
    } catch {
      return NextResponse.json({ error: 'Invalid target stream URL' }, { status: 400 });
    }
  }

  if (target.protocol !== 'https:' && target.protocol !== 'http:') {
    return NextResponse.json({ error: 'Unsupported protocol' }, { status: 400 });
  }

  if (isPrivateOrLocalHostname(target.hostname)) {
    return NextResponse.json({ error: 'Private hostrooms disallowed' }, { status: 403 });
  }

  try {
    const reqHeaders: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    };
    const range = req.headers.get('range');
    if (range) {
      reqHeaders['Range'] = range;
    }

    const upstream = await fetch(target.href, {
      headers: reqHeaders,
      signal: AbortSignal.timeout(15000),
    });

    const resHeaders = new Headers();
    const pathLower = target.pathname.toLowerCase();
    const defaultMime = pathLower.endsWith('.ts')
      ? 'video/mp2t'
      : pathLower.endsWith('.m3u8')
      ? 'application/vnd.apple.mpegurl'
      : 'video/mp4';

    resHeaders.set('Content-Type', upstream.headers.get('content-type') || defaultMime);
    resHeaders.set('Accept-Ranges', upstream.headers.get('accept-ranges') || 'bytes');
    resHeaders.set('Access-Control-Allow-Origin', '*');

    const contentLength = upstream.headers.get('content-length');
    if (contentLength) resHeaders.set('Content-Length', contentLength);
    const contentRange = upstream.headers.get('content-range');
    if (contentRange) resHeaders.set('Content-Range', contentRange);

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: resHeaders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Upstream stream proxy failed' },
      { status: 502 }
    );
  }
}
