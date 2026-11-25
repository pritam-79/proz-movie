/**
 * PROZ Entertainment v0.09 — Stream & Media Classification Utilities
 * Ensures catalog titles never disguise unrelated demo clips as full movies/anime,
 * and strictly distinguishes direct playable media from embeds or metadata-only items.
 */

export type StreamProtocol = 'hls' | 'dash' | 'mpegts' | 'mp4' | 'unknown';

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
  if (
    pathOnly.endsWith('.mp4') ||
    pathOnly.endsWith('.webm') ||
    pathOnly.endsWith('.mov') ||
    pathOnly.endsWith('.m4v') ||
    lower.startsWith('/api/library/stash/proxy-stream') ||
    lower.startsWith('/api/library/stream-proxy')
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
  const minDim = Math.min(width, height);
  if (minDim >= 2160 || width >= 3800) return '4K UHD';
  if (minDim >= 1440 || width >= 2500) return '1440p QHD';
  if (minDim >= 1080 || width >= 1900) return '1080p HD';
  if (minDim >= 720 || width >= 1200) return '720p HD';
  if (minDim >= 480) return '480p SD';
  return `${height}p`;
}

export function normalizeStashId(id: string): string {
  const clean = (id || '').trim().replace(/^(stash-)+/i, '');
  if (!clean) return 'stash-sc-001';
  return `stash-${clean}`;
}

export function toStashWatchPath(id: string): string {
  if (!id) return '/restricted';
  if (id.startsWith('cine18-')) return `/watch/${id}`;
  return `/watch/${normalizeStashId(id)}`;
}
