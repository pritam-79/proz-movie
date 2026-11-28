/**
 * Strict Content Classification Engine (v0.09.03)
 *
 * Enforces deterministic separation between:
 * 1. Hentai Anime (2D) — Japanese 2D adult anime / OVA / ONA
 * 2. 3D CGI Animation — Genuine 3D CGI / SFM / Blender / Unreal renders
 * 3. 3D VR Experiences — Stereoscopic VR180 / VR360 / SBS / Over-Under
 * 4. Illustrated Comics — 2D illustrated adult comic animations (e.g. Savita Bhabhi / Desi comics)
 * 5. AI-Generated Adult Videos — Strictly fictional 18+ AI-generated video streams
 */

export type AnimationType = '2d_anime' | '3d_cgi' | '3d_vr' | '2d_comic' | 'ai_video' | 'live_action';
export type VisualFormat = 'standard_2d' | 'cgi_3d' | 'vr_180' | 'vr_360' | 'sbs_3d' | 'ou_3d';
export type ContentCategoryKey =
  | 'hentai_2d'
  | 'cgi_3d'
  | 'vr_3d'
  | 'illustrated_comics'
  | 'ai_videos';

export type ClassificationMetadata = {
  animation_type: AnimationType;
  visual_format: VisualFormat;
  content_category: ContentCategoryKey;
  production_type: string;
  source_provider: string;
  external_content_id: string;
  playback_url?: string;
  playback_format: 'mp4' | 'hls' | 'dash' | 'external' | 'none';
  verification_status: 'verified_playable' | 'metadata_only' | 'unverified';
};

export interface ClassifiableInput {
  id: string;
  title: string;
  studio?: string;
  tags?: string[];
  details?: string;
  sourceProvider: string;
  playbackUrl?: string;
  isPlayable?: boolean;
}

const COMIC_PATTERNS = /\b(savita|bhabhi|velamma|indian comic|desi comic|2d comic|comic episode|miss rita|kirtu|adult comic)\b/i;
const VR_PATTERNS = /\b(vr180|vr360|180°|360°|stereoscopic|oculus|meta quest|side-by-side|sbs|over-under)\b|\bvr\b/i;
const CGI_3D_PATTERNS = /\b(3d|cgi|sfm|source filmmaker|blender|unreal engine|daz3d|mmd|3d animation|3d render)\b/i;
const HENTAI_2D_PATTERNS = /\b(hentai|ova|ona|anime|ecchi|uncensored anime|2d anime|ahegao)\b/i;
const AI_VIDEO_PATTERNS = /\b(ai generated|ai video|ai 3d|ai animation|stable diffusion|sora|runway|kling|wan2)\b/i;

export function detectPlaybackFormat(url?: string): ClassificationMetadata['playback_format'] {
  if (!url) return 'none';
  const lower = url.toLowerCase();
  if (lower.includes('.m3u8')) return 'hls';
  if (lower.includes('.mpd')) return 'dash';
  if (lower.includes('.mp4') || lower.includes('.webm') || lower.includes('/stream-proxy')) return 'mp4';
  if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('/watch/')) return 'mp4';
  return 'external';
}

export function classifyAdultVisualContent(input: ClassifiableInput): ClassificationMetadata {
  const combined = `${input.title} ${input.studio || ''} ${(input.tags || []).join(' ')} ${input.details || ''}`.toLowerCase();

  let content_category: ContentCategoryKey = 'hentai_2d';
  let animation_type: AnimationType = '2d_anime';
  let visual_format: VisualFormat = 'standard_2d';
  let production_type = 'Japanese 2D Animation';

  // 1. Separate 2D Illustrated Comics (Savita Bhabhi etc.) FIRST so they never leak into Hentai 2D or 3D CGI
  if (COMIC_PATTERNS.test(combined) || input.sourceProvider === 'cine18_comics') {
    content_category = 'illustrated_comics';
    animation_type = '2d_comic';
    visual_format = 'standard_2d';
    production_type = '2D Illustrated Comic Series';
  }
  // 2. VR 180 / 360 / Stereoscopic 3D Experiences
  else if (VR_PATTERNS.test(combined)) {
    content_category = 'vr_3d';
    animation_type = '3d_vr';
    visual_format = combined.includes('360')
      ? 'vr_360'
      : combined.includes('over-under') || combined.includes('top-bottom')
      ? 'ou_3d'
      : combined.includes('sbs') || combined.includes('side-by-side')
      ? 'sbs_3d'
      : 'vr_180';
    production_type = 'Stereoscopic 3D VR';
  }
  // 3. AI-Generated Adult Videos
  else if (AI_VIDEO_PATTERNS.test(combined) || input.sourceProvider === 'ai_videos') {
    content_category = 'ai_videos';
    animation_type = 'ai_video';
    visual_format = CGI_3D_PATTERNS.test(combined) ? 'cgi_3d' : 'standard_2d';
    production_type = 'AI-Generated Fictional Video';
  }
  // 4. Genuine 3D CGI / SFM / Blender Animation
  else if (CGI_3D_PATTERNS.test(combined)) {
    content_category = 'cgi_3d';
    animation_type = '3d_cgi';
    visual_format = 'cgi_3d';
    production_type = '3D CGI / SFM / Blender Render';
  }
  // 5. Japanese 2D Hentai Anime / OVA / ONA
  else if (HENTAI_2D_PATTERNS.test(combined) || input.sourceProvider === 'anilist' || input.sourceProvider === 'kitsu') {
    content_category = 'hentai_2d';
    animation_type = '2d_anime';
    visual_format = 'standard_2d';
    production_type = 'Japanese 2D Hentai / OVA';
  }

  const playback_format = detectPlaybackFormat(input.playbackUrl);
  const verification_status: ClassificationMetadata['verification_status'] =
    input.isPlayable && playback_format !== 'none'
      ? 'verified_playable'
      : input.isPlayable
      ? 'unverified'
      : 'metadata_only';

  return {
    animation_type,
    visual_format,
    content_category,
    production_type,
    source_provider: input.sourceProvider,
    external_content_id: input.id,
    playback_url: input.playbackUrl,
    playback_format,
    verification_status,
  };
}

export function mapCategoryToUiLabel(cat: ContentCategoryKey):
  | 'Hentai Anime (2D)'
  | '3D CGI Animation'
  | '3D VR Experiences'
  | 'Illustrated Comics'
  | 'AI Adult Videos' {
  switch (cat) {
    case 'hentai_2d':
      return 'Hentai Anime (2D)';
    case 'cgi_3d':
      return '3D CGI Animation';
    case 'vr_3d':
      return '3D VR Experiences';
    case 'illustrated_comics':
      return 'Illustrated Comics';
    case 'ai_videos':
      return 'AI Adult Videos';
  }
}
