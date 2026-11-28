/**
 * Unified Provider Metadata & Capability Registry (v0.09.03)
 */

export interface ProviderCapabilityEntry {
  providerId: string;
  displayName: string;
  categories: string[];
  requiresAuth: boolean;
  status: 'active' | 'configured' | 'optional_env';
  capabilities: Array<'hls' | 'mp4' | 'dash' | 'metadata' | 'galleries' | 'vr' | 'ai_generation'>;
}

export function getProviderMetadataRegistry(): ProviderCapabilityEntry[] {
  return [
    {
      providerId: 'cine18',
      displayName: 'Cine18 Channels & Series',
      categories: ['Studios', 'Hot Web Series', 'Performers', 'Illustrated Comics'],
      requiresAuth: false,
      status: 'active',
      capabilities: ['hls', 'mp4'],
    },
    {
      providerId: 'redgifs',
      displayName: 'RedGIFs Clips & Image Galleries',
      categories: ['Performers', 'Photo Galleries', '3D CGI Animation', '3D VR Experiences', 'AI Adult Videos'],
      requiresAuth: false,
      status: 'active',
      capabilities: ['mp4', 'galleries', 'vr'],
    },
    {
      providerId: 'iptv_org',
      displayName: 'IPTV-Org Free-to-Air Live HLS',
      categories: ['Live TV'],
      requiresAuth: false,
      status: 'active',
      capabilities: ['hls'],
    },
    {
      providerId: 'anilist_kitsu',
      displayName: 'AniList & Kitsu Anime Metadata',
      categories: ['Anime', 'Hentai Anime (2D)'],
      requiresAuth: false,
      status: 'active',
      capabilities: ['metadata'],
    },
    {
      providerId: 'tvmaze',
      displayName: 'TVmaze Series & Drama Metadata',
      categories: ['TV Shows', 'Asian Dramas'],
      requiresAuth: false,
      status: 'active',
      capabilities: ['metadata'],
    },
    {
      providerId: 'stashdb',
      displayName: 'StashDB GraphQL Metadata',
      categories: ['Performers', 'Studios', 'Photo Galleries', '3D VR Experiences', 'Hentai Anime (2D)'],
      requiresAuth: true,
      status: process.env.STASHDB_API_KEY ? 'configured' : 'optional_env',
      capabilities: ['metadata', 'galleries', 'vr'],
    },
    {
      providerId: 'personal_stash',
      displayName: 'Personal Stash Server',
      categories: ['Vault', 'Performers', 'Studios', 'Photo Galleries'],
      requiresAuth: true,
      status: process.env.STASH_SERVER_URL ? 'configured' : 'optional_env',
      capabilities: ['mp4', 'hls', 'metadata', 'galleries', 'vr'],
    },
    {
      providerId: 'ai_video_pipeline',
      displayName: 'AI Video Generation Pipeline',
      categories: ['AI Adult Videos'],
      requiresAuth: true,
      status:
        process.env.AI_VIDEO_API_URL || process.env.REPLICATE_API_TOKEN || process.env.FAL_KEY
          ? 'configured'
          : 'optional_env',
      capabilities: ['ai_generation', 'mp4'],
    },
    {
      providerId: 'supabase_auth',
      displayName: 'Supabase Auth (OAuth / Email / Phone OTP)',
      categories: ['Authentication'],
      requiresAuth: true,
      status:
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          ? 'configured'
          : 'optional_env',
      capabilities: ['metadata'],
    },
  ];
}
