import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    latestVersion: '0.03',
    latestVersionCode: 3,
    minVersionCode: 1,
    appName: 'PROZ MOVIE',
    title: 'PROZ MOVIE v0.03 — Automated Discovery & Streaming Upgrade',
    releaseDate: '2026-11-24',
    apkUrl: 'https://proz-movie.vercel.app/api/download/apk',
    directGithubUrl: 'https://github.com/pritam-79/proz-movie/releases/tag/v0.03',
    fileSize: '1.2 MB',
    changelog: [
      'Automated Content Discovery Engine orchestrating Internet Archive, PeerTube, Openverse, TVmaze, and TMDB',
      'Verified Internet Archive Public Domain Cinema with direct, playable HTML5 MP4 streams',
      'Decentralized PeerTube federated node integration for Creative Commons open films (Sintel, Tears of Steel)',
      'Rebuilt 18+ Adult Ecosystem with honest disconnected states, zero mock scenes, and Stash server onboarding',
      'Eliminated parental control PIN; statutory age verification confirmed once via birth-year gate (18+)',
      'Live Multi-Provider API Health Monitor tracking 10 providers in real-time with response latencies',
      'User profile editing enhancements with persistent display name and email updates',
      'Admin portal isolation from standard user navigation',
      'Android WebView error handling optimizations preventing false offline reconnect loops'
    ]
  });
}
