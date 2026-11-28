import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MAX_RANGE_CHUNK_BYTES = 2 * 1024 * 1024; // 2 MB safe chunk for Vercel & Mobile WebViews

function isPrivateOrLocalHostname(host: string): boolean {
  const clean = host.toLowerCase();
  return (
    clean === 'localhost' ||
    clean === '127.0.0.1' ||
    clean === '0.0.0.0' ||
    clean === '::1' ||
    clean.startsWith('10.') ||
    clean.startsWith('192.168.') ||
    clean.startsWith('169.254.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(clean)
  );
}

function parseTargetUrl(rawUrl: string | null): URL | null {
  if (!rawUrl) return null;
  try {
    return new URL(rawUrl);
  } catch {
    try {
      return new URL(encodeURI(rawUrl));
    } catch {
      return null;
    }
  }
}

function buildNormalizedRangeHeader(rangeHeader: string | null, clampForServerless = false): string | null {
  if (!rangeHeader && !clampForServerless) return null;
  if (!rangeHeader) return `bytes=0-${MAX_RANGE_CHUNK_BYTES - 1}`;

  const match = rangeHeader.match(/bytes=(\d+)-(\d*)/i);
  if (!match) return rangeHeader;
  const start = parseInt(match[1], 10);
  if (isNaN(start) || start < 0) return rangeHeader;

  if (!match[2]) {
    if (!clampForServerless) return `bytes=${start}-`;
    return `bytes=${start}-${start + MAX_RANGE_CHUNK_BYTES - 1}`;
  }

  const end = parseInt(match[2], 10);
  if (isNaN(end) || end < start) return `bytes=${start}-${start + MAX_RANGE_CHUNK_BYTES - 1}`;
  if (clampForServerless && end - start + 1 > MAX_RANGE_CHUNK_BYTES) {
    return `bytes=${start}-${start + MAX_RANGE_CHUNK_BYTES - 1}`;
  }
  return `bytes=${start}-${end}`;
}

async function fetchUpstreamWithRetry(
  url: string,
  method: 'GET' | 'HEAD',
  headers: HeadersInit
): Promise<Response> {
  let lastErr: any = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const connectTimer = setTimeout(() => controller.abort(), 14000);
    try {
      const upstream = await fetch(url, {
        method,
        headers,
        signal: controller.signal,
      });
      clearTimeout(connectTimer);
      if (upstream.status >= 500 && attempt === 0) {
        await new Promise((r) => setTimeout(r, 300));
        continue;
      }
      return upstream;
    } catch (err) {
      clearTimeout(connectTimer);
      lastErr = err;
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 350));
      }
    }
  }
  throw lastErr || new Error('Upstream stream fetch failed');
}

function makeResponseHeaders(target: URL, upstream: Response): Headers {
  const resHeaders = new Headers();
  const pathLower = target.pathname.toLowerCase();
  const defaultMime = pathLower.endsWith('.ts')
    ? 'video/mp2t'
    : pathLower.endsWith('.m3u8')
    ? 'application/vnd.apple.mpegurl'
    : pathLower.endsWith('.mpd')
    ? 'application/dash+xml'
    : pathLower.endsWith('.mkv')
    ? 'video/x-matroska'
    : 'video/mp4';

  const upstreamType = upstream.headers.get('content-type');
  resHeaders.set(
    'Content-Type',
    upstreamType && upstreamType !== 'application/octet-stream' ? upstreamType : defaultMime
  );
  resHeaders.set('Accept-Ranges', upstream.headers.get('accept-ranges') || 'bytes');
  resHeaders.set('Access-Control-Allow-Origin', '*');
  resHeaders.set(
    'Access-Control-Expose-Headers',
    'Content-Length, Content-Range, Accept-Ranges, Content-Type'
  );
  resHeaders.set('Cache-Control', 'no-store');

  const contentLength = upstream.headers.get('content-length');
  if (contentLength) resHeaders.set('Content-Length', contentLength);
  const contentRange = upstream.headers.get('content-range');
  if (contentRange) resHeaders.set('Content-Range', contentRange);

  return resHeaders;
}

export async function HEAD(req: NextRequest) {
  const target = parseTargetUrl(req.nextUrl.searchParams.get('url'));
  if (!target || (target.protocol !== 'https:' && target.protocol !== 'http:')) {
    return new NextResponse(null, { status: 400 });
  }
  if (isPrivateOrLocalHostname(target.hostname)) {
    return new NextResponse(null, { status: 403 });
  }

  try {
    const upstream = await fetchUpstreamWithRetry(target.href, 'HEAD', {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    });
    return new NextResponse(null, {
      status: upstream.status,
      headers: makeResponseHeaders(target, upstream),
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}

/**
 * PROZ MOVIE v0.09.02 — Chunked HTTP Range Stream Proxy
 * Fixes:
 *  - No body-killing AbortSignal timeout once streaming headers succeed
 *  - Supports HEAD metadata inspection + 2MB capped chunk ranges (?chunk=1) for Naughty America & all 116 .ts channels
 *  - Automatic retry on transient CDN resets + clean CORS headers
 */
export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get('url');
  const clampChunk = req.nextUrl.searchParams.get('chunk') === '1';

  const target = parseTargetUrl(rawUrl);
  if (!target) {
    return NextResponse.json({ error: 'Invalid or missing target stream URL' }, { status: 400 });
  }
  if (target.protocol !== 'https:' && target.protocol !== 'http:') {
    return NextResponse.json({ error: 'Unsupported protocol' }, { status: 400 });
  }
  if (isPrivateOrLocalHostname(target.hostname)) {
    return NextResponse.json({ error: 'Private hostnames disallowed' }, { status: 403 });
  }

  try {
    const reqHeaders: HeadersInit = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    };
    const effectiveRange = buildNormalizedRangeHeader(req.headers.get('range'), clampChunk);
    if (effectiveRange) {
      reqHeaders['Range'] = effectiveRange;
    }

    const upstream = await fetchUpstreamWithRetry(target.href, 'GET', reqHeaders);
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: makeResponseHeaders(target, upstream),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Upstream stream proxy failed' },
      { status: 502 }
    );
  }
}
