import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    latestVersion: '0.02',
    latestVersionCode: 2,
    minVersionCode: 1,
    appName: 'PROZ MOVIE',
    title: 'PROZ MOVIE v0.02 Update',
    releaseDate: '2026-11-23',
    apkUrl: 'https://proz-movie.vercel.app/api/download/apk',
    directGithubUrl: 'https://github.com/pritam-79/proz-movie/releases/tag/v0.02',
    fileSize: '1.2 MB',
    changelog: [
      'Private multi-user library with isolated watch history, ratings and favourites',
      'Multiple Stash connections via official GraphQL API without leaking internal credentials',
      'Advanced personal history and resume point synchronization',
      'Playlists and group sharing with permission inheritance',
      'Library restrictions and denied-by-default server-side access control',
      'Direct authorized media playback via encrypted chunk stream proxy (HTTP 206)',
      'Download permissions with offline queue and storage quota manager',
      'Advanced browsing: Grid, Compact Grid, List view, 10-foot TV mode and chronological timeline',
      'Adult-section privacy controls with statutory birth-year verification gate (18+)',
      'Authorized P2P integration framework for Public Domain and Creative Commons archives',
      'Security improvements, Row-Level Security database migration, and rate limiting'
    ]
  });
}
