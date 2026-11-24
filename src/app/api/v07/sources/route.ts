import { NextResponse } from 'next/server';
import { AUTHORIZED_DRM_PROFILES } from '@/lib/providers/drmConfig';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    version: 'v0.07',
    publicApis: [
      {
        id: 'archive_org',
        name: 'Internet Archive Cinema',
        scope: 'Full Public Domain Movies, Sci-Fi/Horror, Comedy & Classic Animation',
        auth: 'None (Open REST)',
        playback: 'Direct MP4',
      },
      {
        id: 'peertube',
        name: 'PeerTube Federated Open Video',
        scope: 'Creative Commons Films, Documentaries & Tech Talks (Framatube, Tilvids, PeerTube.tv)',
        auth: 'None (ActivityPub / Open REST v1)',
        playback: 'Direct Adaptive HLS (.m3u8) & MP4',
      },
      {
        id: 'nasa_media',
        name: 'NASA Images & Video Library',
        scope: '4K Space Documentaries & Historic Mission Films',
        auth: 'None (Official Open API)',
        playback: 'Direct HTTPS MP4',
      },
      {
        id: 'wikimedia',
        name: 'Wikimedia Commons Video',
        scope: 'Public Domain & CC Educational/Historical Video Archive',
        auth: 'None (MediaWiki Open API)',
        playback: 'Direct WebM / MP4',
      },
      {
        id: 'iptv_org',
        name: 'IPTV-Org Free-to-Air Directory',
        scope: '13,000+ Live Public Broadcast Channels',
        auth: 'None (Community Open Index)',
        playback: 'Live HTTPS HLS (.m3u8)',
      },
      {
        id: 'kitsu',
        name: 'Kitsu Anime Directory',
        scope: 'Anime Movies, TV Series, OVAs & Trailers',
        auth: 'None (JSON:API)',
        playback: 'Official Trailers & Deep Links',
      },
      {
        id: 'anilist',
        name: 'AniList GraphQL API',
        scope: 'Trending Anime Catalog & Studio Metadata',
        auth: 'None (GraphQL v2)',
        playback: 'Official Trailers & Catalog',
      },
      {
        id: 'tvmaze',
        name: 'TVmaze Official Television API',
        scope: 'Global TV Series, Dramas & Episode Guides',
        auth: 'None (Public REST)',
        playback: 'Catalog & Episode Guide',
      },
      {
        id: 'cine18',
        name: 'CineWebby OTT Channels',
        scope: 'Categorized Regional & Studio Channels (Adult channels isolated behind 18+ gate)',
        auth: 'Integrated API',
        playback: 'Direct Channel Streams',
      },
    ],
    drmProfiles: AUTHORIZED_DRM_PROFILES,
  });
}
