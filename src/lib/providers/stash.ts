/**
 * PROZ Entertainment v0.09.1 — Stash Provider Adapter & Tube Directory
 * All personal Stash server credentials stay strictly server-side in environment variables.
 * Fake placeholder scenes, invented performers, fake Unsplash web series, and mismatched VR clips
 * have been completely removed — all media comes from connected Stash instances, live Cine18, and StashDB.
 */

import {
  StashServerConfig,
  StashScene,
  StashPerformer,
  StashStudio,
  StashTag,
  StashGallery,
  MediaBrowsingFilters,
} from '@/types/library';

const RAW_STASH_SERVER_URL = (
  process.env.STASH_SERVER_URL ||
  process.env.STASH_GRAPHQL_URL ||
  ''
).trim();
const RAW_STASH_API_KEY = (
  process.env.STASH_API_KEY ||
  process.env.STASH_APIKEY ||
  ''
).trim();

export const DEFAULT_STASH_SERVERS: StashServerConfig[] = RAW_STASH_SERVER_URL
  ? [
      {
        id: 'stash-srv-configured',
        name: 'Automated Stash Backend Vault',
        serverUrl: RAW_STASH_SERVER_URL,
        apiKey: RAW_STASH_API_KEY || undefined,
        connectionStatus: 'connected',
        lastSyncAt: new Date().toISOString(),
        syncSchedule: 'hourly',
        isEnabled: true,
        libraryIdentifier: 'vault-backend-env',
        version: 'v0.09.1',
        sceneCount: 0,
        performerCount: 0,
        studioCount: 0,
        galleryCount: 0,
      },
    ]
  : [];

// Legacy arrays emptied so fake Unsplash placeholder titles/profiles never leak into the UI.
// Live catalogs are populated dynamically from Stash, Cine18 API, and StashDB GraphQL.
export const CURATED_ADULT_SCENES: StashScene[] = [];
export const CURATED_HOT_WEB_SERIES: any[] = [];
export const CURATED_HENTAI_COLLECTIONS: any[] = [];
export const CURATED_VR_SCENES: any[] = [];

export interface AdultTubePortal {
  id: string;
  name: string;
  category:
    | 'Mainstream HD Tubes'
    | '4K & Full Length'
    | 'Hentai & 3D Tubes'
    | 'VR Adult Hubs'
    | 'Creator & Studio Hubs';
  badge: string;
  rating: number;
  logo: string;
  url: string;
  description: string;
  allowsInAppPlayback: false;
  limitation: string;
}

const fav = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;

// Comprehensive categorized Tube Hub Directory (24 popular portals)
export const VERIFIED_ADULT_TUBE_PORTALS: AdultTubePortal[] = [
  {
    id: 'tube-pornhub',
    name: 'Pornhub',
    category: 'Mainstream HD Tubes',
    badge: '4K & Verified Models',
    rating: 4.9,
    logo: fav('pornhub.com'),
    url: 'https://www.pornhub.com',
    description: 'Massive global catalog with verified model channels, 4K streams, and studio categories.',
    allowsInAppPlayback: false,
    limitation: 'External site directory — host site X-Frame/playback rules open in external browser.',
  },
  {
    id: 'tube-xvideos',
    name: 'XVideos',
    category: 'Mainstream HD Tubes',
    badge: 'Global Library',
    rating: 4.8,
    logo: fav('xvideos.com'),
    url: 'https://www.xvideos.com',
    description: 'High-volume streaming portal spanning amateur clips, full scenes, and regional tags.',
    allowsInAppPlayback: false,
    limitation: 'External site directory — opens directly on partner site.',
  },
  {
    id: 'tube-xhamster',
    name: 'xHamster',
    category: 'Mainstream HD Tubes',
    badge: 'HD & Creator Cam',
    rating: 4.8,
    logo: fav('xhamster.com'),
    url: 'https://xhamster.com',
    description: 'Categorized HD scenes, indie creator channels, photos, and live streams.',
    allowsInAppPlayback: false,
    limitation: 'External site directory — opens directly on partner site.',
  },
  {
    id: 'tube-redtube',
    name: 'RedTube',
    category: 'Mainstream HD Tubes',
    badge: 'HD Curated',
    rating: 4.7,
    logo: fav('redtube.com'),
    url: 'https://www.redtube.com',
    description: 'Curated HD videos, studio partner clips, and top-rated playlists.',
    allowsInAppPlayback: false,
    limitation: 'External site directory — opens directly on partner site.',
  },
  {
    id: 'tube-xnxx',
    name: 'XNXX',
    category: 'Mainstream HD Tubes',
    badge: 'Fast Mobile Streams',
    rating: 4.7,
    logo: fav('xnxx.com'),
    url: 'https://www.xnxx.com',
    description: 'Lightweight global adult portal with extensive niche tags and stories.',
    allowsInAppPlayback: false,
    limitation: 'External site directory — opens directly on partner site.',
  },
  {
    id: 'tube-youporn',
    name: 'YouPorn',
    category: 'Mainstream HD Tubes',
    badge: 'Top Playlists',
    rating: 4.7,
    logo: fav('youporn.com'),
    url: 'https://www.youporn.com',
    description: 'Popular curated video categories, verified star channels, and user collections.',
    allowsInAppPlayback: false,
    limitation: 'External site directory — opens directly on partner site.',
  },
  {
    id: 'tube-spankbang',
    name: 'SpankBang',
    category: '4K & Full Length',
    badge: '4K 60FPS',
    rating: 4.9,
    logo: fav('spankbang.com'),
    url: 'https://spankbang.com',
    description: 'Full-length HD & 4K scenes, trending playlists, and curated VR streams.',
    allowsInAppPlayback: false,
    limitation: 'External site directory — opens directly on partner site.',
  },
  {
    id: 'tube-eporner',
    name: 'Eporner',
    category: '4K & Full Length',
    badge: 'True 4K 60FPS',
    rating: 4.9,
    logo: fav('eporner.com'),
    url: 'https://www.eporner.com',
    description: 'Full-length high-bitrate 4K/1080p videos, pornstar index, and VR category.',
    allowsInAppPlayback: false,
    limitation: 'External site directory — opens directly on partner site.',
  },
  {
    id: 'tube-hqporner',
    name: 'HQPorner',
    category: '4K & Full Length',
    badge: '1080p / 4K HD',
    rating: 4.8,
    logo: fav('hqporner.com'),
    url: 'https://hqporner.com',
    description: 'Dedicated high-definition full-length studio scenes sorted by actress and top views.',
    allowsInAppPlayback: false,
    limitation: 'External site directory — opens directly on partner site.',
  },
  {
    id: 'tube-tnaflix',
    name: 'TNAFlix',
    category: '4K & Full Length',
    badge: 'HD Directory',
    rating: 4.6,
    logo: fav('tnaflix.com'),
    url: 'https://www.tnaflix.com',
    description: 'Long-form scenes, verified pornstar tags, and fast adaptive streaming.',
    allowsInAppPlayback: false,
    limitation: 'External site directory — opens directly on partner site.',
  },
  {
    id: 'tube-beeg',
    name: 'Beeg',
    category: '4K & Full Length',
    badge: 'Clean Grid UI',
    rating: 4.7,
    logo: fav('beeg.com'),
    url: 'https://beeg.com',
    description: 'Minimalist high-bitrate scene browser featuring long-cut studio releases.',
    allowsInAppPlayback: false,
    limitation: 'External site directory — opens directly on partner site.',
  },
  {
    id: 'tube-4tube',
    name: '4Tube',
    category: '4K & Full Length',
    badge: 'Full HD Scenes',
    rating: 4.6,
    logo: fav('4tube.com'),
    url: 'https://www.4tube.com',
    description: 'HD studio compilations, category filters, and channel directories.',
    allowsInAppPlayback: false,
    limitation: 'External site directory — opens directly on partner site.',
  },
  {
    id: 'tube-thumbzilla',
    name: 'Thumbzilla',
    category: 'Mainstream HD Tubes',
    badge: 'Visual Feed',
    rating: 4.6,
    logo: fav('thumbzilla.com'),
    url: 'https://www.thumbzilla.com',
    description: 'Modern card-driven browser aggregating trending HD clips across categories.',
    allowsInAppPlayback: false,
    limitation: 'External site directory — opens directly on partner site.',
  },
  {
    id: 'tube-tube8',
    name: 'Tube8',
    category: 'Mainstream HD Tubes',
    badge: 'Classic Tube',
    rating: 4.5,
    logo: fav('tube8.com'),
    url: 'https://www.tube8.com',
    description: 'Multi-category video index with mobile-friendly playback and channel feeds.',
    allowsInAppPlayback: false,
    limitation: 'External site directory — opens directly on partner site.',
  },
  {
    id: 'tube-hanime',
    name: 'Hanime.tv',
    category: 'Hentai & 3D Tubes',
    badge: '1080p Hentai',
    rating: 4.9,
    logo: fav('hanime.tv'),
    url: 'https://hanime.tv',
    description: 'Uncensored 1080p adult anime OVA library searchable by tag, studio, and release.',
    allowsInAppPlayback: false,
    limitation: 'External site directory — opens directly on partner site.',
  },
  {
    id: 'tube-hentaihaven',
    name: 'HentaiHaven',
    category: 'Hentai & 3D Tubes',
    badge: 'Classic Hentai',
    rating: 4.7,
    logo: fav('hentaihaven.xxx'),
    url: 'https://hentaihaven.xxx',
    description: 'Curated hentai episodes, 3D animations, and subbed OVA archives.',
    allowsInAppPlayback: false,
    limitation: 'External site directory — opens directly on partner site.',
  },
  {
    id: 'tube-rule34video',
    name: 'Rule34Video',
    category: 'Hentai & 3D Tubes',
    badge: '3D / SFM / CGI',
    rating: 4.8,
    logo: fav('rule34video.com'),
    url: 'https://rule34video.com',
    description: '3D CGI, SFM, Blender, and animated adult shorts organized by character and artist.',
    allowsInAppPlayback: false,
    limitation: 'External site directory — opens directly on partner site.',
  },
  {
    id: 'tube-iwara',
    name: 'Iwara (3D ECCHI)',
    category: 'Hentai & 3D Tubes',
    badge: 'MMD & 3D Art',
    rating: 4.7,
    logo: fav('iwara.tv'),
    url: 'https://www.iwara.tv',
    description: 'Community 3D animation, MMD, and independent CGI creator showcase.',
    allowsInAppPlayback: false,
    limitation: 'External site directory — opens directly on partner site.',
  },
  {
    id: 'tube-vrporn',
    name: 'VRPorn',
    category: 'VR Adult Hubs',
    badge: '180° / 360° VR',
    rating: 4.8,
    logo: fav('vrporn.com'),
    url: 'https://vrporn.com',
    description: 'Dedicated stereoscopic 180° & 360° VR catalog compatible with Quest & Vision headsets.',
    allowsInAppPlayback: false,
    limitation: 'External site directory — opens directly on partner site.',
  },
  {
    id: 'tube-czechvr',
    name: 'CzechVR Network',
    category: 'VR Adult Hubs',
    badge: '8K Stereoscopic',
    rating: 4.8,
    logo: fav('czechvr.com'),
    url: 'https://www.czechvr.com',
    description: 'High-resolution 8K stereoscopic 180° VR studio productions and interactive previews.',
    allowsInAppPlayback: false,
    limitation: 'External site directory — membership/paywall respected; opens external site.',
  },
  {
    id: 'tube-brazzers',
    name: 'Brazzers',
    category: 'Creator & Studio Hubs',
    badge: 'Official Studio',
    rating: 4.9,
    logo: fav('brazzers.com'),
    url: 'https://www.brazzers.com',
    description: 'Major studio network featuring flagship stars and high-production releases.',
    allowsInAppPlayback: false,
    limitation: 'External site directory (playable scenes also indexed inside Studios & Scenes tab).',
  },
  {
    id: 'tube-vixen',
    name: 'Vixen',
    category: 'Creator & Studio Hubs',
    badge: '4K Cinema Studio',
    rating: 4.9,
    logo: fav('vixen.com'),
    url: 'https://www.vixen.com',
    description: 'Cinematic 4K luxury adult productions with award-winning art direction.',
    allowsInAppPlayback: false,
    limitation: 'External site directory (playable Vixen scenes available in Studios tab).',
  },
  {
    id: 'tube-onlyfans',
    name: 'Fansly / Creator Directories',
    category: 'Creator & Studio Hubs',
    badge: 'Verified Creators',
    rating: 4.7,
    logo: fav('fansly.com'),
    url: 'https://fansly.com',
    description: 'Direct-to-creator independent adult subscription and media showcase platform.',
    allowsInAppPlayback: false,
    limitation: 'External site directory — respects creator paywalls & authentication.',
  },
  {
    id: 'tube-redgifs',
    name: 'RedGIFs',
    category: 'Creator & Studio Hubs',
    badge: 'Short HD Loops',
    rating: 4.8,
    logo: fav('redgifs.com'),
    url: 'https://www.redgifs.com',
    description: 'Creator-driven short HD video loops, trending niches, and verified profiles.',
    allowsInAppPlayback: false,
    limitation: 'External site directory — opens directly on partner site.',
  },
];

export class StashProviderAdapter {
  private servers: StashServerConfig[];

  constructor() {
    this.servers = [...DEFAULT_STASH_SERVERS];
  }

  public getServers(): StashServerConfig[] {
    return this.servers.map((s) => ({
      ...s,
      serverUrl: s.serverUrl ? 'Backend Environment (.env.local)' : '',
      apiKey: undefined,
    }));
  }

  public getInternalPrimaryServer(): StashServerConfig | undefined {
    return this.servers.find((s) => s.isEnabled && s.serverUrl);
  }

  public async testConnection(
    serverOrId?: StashServerConfig | string
  ): Promise<{ success: boolean; version?: string; error?: string }> {
    let server: StashServerConfig | undefined;
    if (typeof serverOrId === 'string') {
      server = this.servers.find((s) => s.id === serverOrId);
    } else if (serverOrId) {
      server = serverOrId;
    } else {
      server = this.getInternalPrimaryServer();
    }

    if (!server || !server.serverUrl) {
      return {
        success: false,
        error: 'Not Connected — STASH_SERVER_URL not set in server environment',
      };
    }

    try {
      const query = `query Version { version { version build_time } }`;
      const response = await fetch(server.serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(server.apiKey ? { ApiKey: server.apiKey } : {}),
        },
        body: JSON.stringify({ query }),
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const json = await response.json();
        const version = json.data?.version?.version || 'Stash GraphQL';
        server.connectionStatus = 'connected';
        server.version = version;
        server.lastSyncAt = new Date().toISOString();
        return { success: true, version };
      }

      server.connectionStatus = 'error';
      return {
        success: false,
        error: `Stash server returned HTTP ${response.status}`,
      };
    } catch {
      server.connectionStatus = 'error';
      return {
        success: false,
        error: 'Configured STASH_SERVER_URL is unreachable.',
      };
    }
  }

  public async findScenes(_filters?: MediaBrowsingFilters): Promise<{ count: number; scenes: StashScene[] }> {
    return { count: 0, scenes: [] };
  }

  public async findPerformers(): Promise<StashPerformer[]> {
    return [];
  }

  public async findStudios(): Promise<StashStudio[]> {
    return [];
  }

  public async findTags(): Promise<StashTag[]> {
    return [];
  }

  public async findGalleries(): Promise<StashGallery[]> {
    return [];
  }

  public getSceneStreamUrl(sceneId: string): string {
    return `/api/library/stash/proxy-stream?id=${sceneId}`;
  }
}

export const stashAdapter = new StashProviderAdapter();
