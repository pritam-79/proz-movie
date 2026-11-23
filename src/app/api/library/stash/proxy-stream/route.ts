import { NextRequest, NextResponse } from 'next/server';

/**
 * PROZ Entertainment v0.02 — Secure Stash Stream Proxy
 * 1. Keeps Stash internal IP & API key hidden from the browser.
 * 2. Proxies video chunks and supports HTTP 206 Partial Content (range seeking).
 */

const DEMO_STREAMS: Record<string, string> = {
  'stash-sc-001': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'stash-sc-002': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'stash-sc-003': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'stash-sc-004': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sceneId = searchParams.get('id') || 'stash-sc-001';

    const targetUrl = DEMO_STREAMS[sceneId] || DEMO_STREAMS['stash-sc-001'];

    // Forward range header if present for seeking
    const range = req.headers.get('range');
    const headers: HeadersInit = {};
    if (range) {
      headers['Range'] = range;
    }

    const videoResponse = await fetch(targetUrl, {
      headers,
      signal: AbortSignal.timeout(10000)
    });

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', videoResponse.headers.get('Content-Type') || 'video/mp4');
    responseHeaders.set('Accept-Ranges', 'bytes');
    if (videoResponse.headers.get('Content-Length')) {
      responseHeaders.set('Content-Length', videoResponse.headers.get('Content-Length')!);
    }
    if (videoResponse.headers.get('Content-Range')) {
      responseHeaders.set('Content-Range', videoResponse.headers.get('Content-Range')!);
    }

    return new NextResponse(videoResponse.body, {
      status: videoResponse.status,
      headers: responseHeaders
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Stream proxy error' },
      { status: 500 }
    );
  }
}
