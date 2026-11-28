/**
 * PROZ MOVIE v0.09.02 — Stream, Resolution & Media Classification Utilities
 * - Recognizes HLS, DASH, MPEG-TS (.ts), MP4, WebM, MOV, MKV cleanly
 * - Strictly rejects unrelated Blender/demo placeholder streams disguised as movies/anime
 * - Reports honest detected playback resolutions (never upscales or fakes 4K)
 */

export type StreamProtocol = 'hls' | 'dash' | 'mpegts' | 'mp4' | 'mkv' | 'unknown';

const PLACEHOLDER_DEMO_PATTERNS = [
  'unified-streaming.com/k8s/features/stable/video/tears-of-steel',
  'test-streams.mux.dev/x36xhzz',
  'archive.org/download/bigbuckbunny_124',
  'commondatastorage.googleapis.com/gtv-videos-bucket/sample/bigbuckbunny',
  'commondatastorage.googleapis.com/gtv-videos-bucket/sample/tearsofsteel',
];

const LEGITIMATE_BLENDER_TITLES = [
  'tears of steel',
  'big buck bunny',
  'elephants dream',
  'sintel',
];

export const RESOLUTION_PRESETS = [
  { id: 'auto', label: 'Auto (ABR)', minHeight: 0 },
  { id: '2160', label: '2160p 4K UHD', minHeight: 2160 },
  { id: '1440', label: '1440p QHD', minHeight: 1440 },
  { id: '1080', label: '1080p Full HD', minHeight: 1080 },
  { id: '720', label: '720p HD', minHeight: 720 },
  { id: '480', label: '480p SD', minHeight: 480 },
  { id: '360', label: '360p', minHeight: 360 },
] as const;

/**
 * Returns true if a URL is one of the shared Blender/test demo streams
 * attached to an unrelated catalog title (e.g. Demon Slayer, Deadpool).
 */
export function isMismatchedPlaceholderStream(url?: string | null, title?: string | null): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  const isDemoUrl = PLACEHOLDER_DEMO_PATTERNS.some((p) => lowerUrl.includes(p));
  if (!isDemoUrl) return false;

  const lowerTitle = (title || '').toLowerCase();
  return !LEGITIMATE_BLENDER_TITLES.some((bt) => lowerTitle.includes(bt));
}

export function normalizeMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('/')) return trimmed;
  try {
    return new URL(trimmed).href;
  } catch {
    return encodeURI(trimmed);
  }
}

export function classifyStreamProtocol(url?: string | null): StreamProtocol {
  if (!url) return 'unknown';
  const lower = url.toLowerCase();
  const pathOnly = lower.split('?')[0];
  if (lower.includes('.m3u8')) return 'hls';
  if (lower.includes('.mpd')) return 'dash';
  if (pathOnly.endsWith('.ts')) return 'mpegts';
  if (pathOnly.endsWith('.mkv')) return 'mkv';
  if (
    pathOnly.endsWith('.mp4') ||
    pathOnly.endsWith('.webm') ||
    pathOnly.endsWith('.mov') ||
    pathOnly.endsWith('.m4v') ||
    lower.startsWith('/api/library/stash/proxy-stream') ||
    lower.startsWith('/api/library/stream-proxy') ||
    lower.includes('media.redgifs.com/')
  ) {
    return 'mp4';
  }
  return 'unknown';
}

export function isPlayableMediaUrl(url?: string | null, title?: string | null): boolean {
  if (!url) return false;
  if (isMismatchedPlaceholderStream(url, title)) return false;
  return classifyStreamProtocol(url) !== 'unknown';
}

export function formatResolutionBadge(width?: number, height?: number): string | null {
  if (!width || !height || width <= 0 || height <= 0) return null;
  const maxDim = Math.max(width, height);
  const minDim = Math.min(width, height);
  if (minDim >= 2160 || maxDim >= 3800) return '2160p 4K UHD';
  if (minDim >= 1440 || maxDim >= 2500) return '1440p QHD';
  if (minDim >= 1080 || maxDim >= 1900) return '1080p Full HD';
  if (minDim >= 720 || maxDim >= 1200) return '720p HD';
  if (minDim >= 480) return '480p SD';
  if (minDim >= 360) return '360p';
  return `${minDim}p`;
}

export function normalizeStashId(id: string): string {
  const clean = (id || '').trim().replace(/^(stash-)+/i, '');
  if (!clean) return 'stash-unknown';
  return `stash-${clean}`;
}

export function toStashWatchPath(id: string): string {
  if (!id) return '/restricted';
  if (id.startsWith('cine18-') || id.startsWith('redgifs-') || id.startsWith('iptv-')) {
    return `/watch/${id}`;
  }
  return `/watch/${normalizeStashId(id)}`;
}

export function toImageProxyFallback(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('/') || url.startsWith('data:')) return url;
  return `/api/library/image-proxy?url=${encodeURIComponent(url)}`;
}
