import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    latestVersion: '0.07',
    latestVersionCode: 7,
    minVersionCode: 1,
    appName: 'PRO2 ENTERTAINMENT',
    title: 'PRO2 ENTERTAINMENT v0.07 — Modern OTT Hub, Multi-API Deduplication & Direct Open Cinema',
    releaseDate: '2026-11-24',
    apkUrl: 'https://proz-movie.vercel.app/api/download/apk',
    directGithubUrl: 'https://github.com/pritam-79/proz-movie/releases/tag/v0.07',
    fileSize: '1.7 MB',
    changelog: [
      'New v0.07 Modern Categorized OTT Hub (/ott-hub) with live multi-provider discovery and Playable-Only filtering',
      'Cross-Provider Comparison & Deduplication Engine merging entries across Internet Archive, PeerTube, NASA, Wikimedia, IPTV-Org, Kitsu, AniList, TVmaze, CineWebby, and core catalog',
      'Expanded Directly Playable Streams: Real resolved Internet Archive full MP4 films, PeerTube HLS/MP4 videos, NASA space films, Wikimedia Commons open cinema, and IPTV-Org live .m3u8 channels',
      'Kitsu + AniList + Open Animation categorization with clear badges separating Full Playable Streams from Official Trailers',
      'Authorized EME DRM Lab supporting Shaka Widevine/ClearKey/FairPlay/PlayReady test profiles and operator BYO license/manifest testing',
      'All previous v0.01–v0.06 playback repairs, Cine18 channels, and Stash vault functionality preserved cleanly'
    ]
  });
}
