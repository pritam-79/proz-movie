import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    latestVersion: '0.04',
    latestVersionCode: 4,
    minVersionCode: 1,
    appName: 'PROZ MOVIE',
    title: 'PROZ MOVIE v0.04 — Automated Stash Connection & 18+ Ecosystem Upgrade',
    releaseDate: '2026-11-24',
    apkUrl: 'https://proz-movie.vercel.app/api/download/apk',
    directGithubUrl: 'https://github.com/pritam-79/proz-movie/releases/tag/v0.04',
    fileSize: '1.7 MB',
    changelog: [
      'Automatic Stash Connection with built-in PROZ Cloud Vault Engine',
      'Populated 18+ Video Catalog with direct playable streams and zero empty states',
      'Curated Hot Web Series with full episodic breakdowns and stream launchers',
      'Hentai & 2D/3D Animated OVA collections with direct playback',
      '3D VR & 180°/360° Spatial Immersion experiences',
      'Verified Adult Tube Sites directory (Pornhub, RedTube, XVideos, SpankBang, xHamster)',
      'Featured Performer profiles and authorized studio directories',
      'High-Resolution adult photo galleries with fullscreen viewer',
      'Global v0.04 system upgrade across Web PWA and Android host application'
    ]
  });
}
