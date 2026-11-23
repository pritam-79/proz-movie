import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    latestVersion: '0.05',
    latestVersionCode: 5,
    minVersionCode: 1,
    appName: 'PRO2 ENTERTAINMENT',
    title: 'PRO2 ENTERTAINMENT v0.05 — Complete System Bug Fix & Cine18 Live Integration',
    releaseDate: '2026-11-24',
    apkUrl: 'https://proz-movie.vercel.app/api/download/apk',
    directGithubUrl: 'https://github.com/pritam-79/proz-movie/releases/tag/v0.05',
    fileSize: '1.7 MB',
    changelog: [
      'Live Cine18 / CineWebby API Provider Adapter with 329+ OTT channels and CDN streams',
      'Fixed Channel pages: Alt Balaji, Bharti Jha, New Sensations, Family XXX now show genuine videos instead of unrelated Hollywood titles',
      'Fixed broken images: Implemented graceful fallback error handling across ContentCard, channel covers, and logos',
      'Truthful Stash Vault: Accurate disconnected state with custom server configuration',
      'Enhanced 18+ Section: Populated with real Cine18 adult series, movies, and scenes with direct playable links',
      'Realistic 3D VR: Stereoscopic 180° / 360° Side-by-Side playback with WebXR and headset support',
      'Fixed UI overlapping: Removed intrusive floating version pill that covered navigation and channel cards',
      'Applied safe viewport padding (pb-28) across mobile and desktop layouts',
      'Live Admin Provider verification and genuine catalog sync execution'
    ]
  });
}
