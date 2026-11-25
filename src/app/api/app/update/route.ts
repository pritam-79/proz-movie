import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    latestVersion: '0.08',
    latestVersionCode: 8,
    minVersionCode: 1,
    appName: 'PRO2 ENTERTAINMENT',
    title: 'PRO2 ENTERTAINMENT v0.08 — Playback Repairs, Channel .ts Support, StashDB Integration & Mobile Redesign',
    releaseDate: '2026-11-26',
    apkUrl: 'https://proz-movie.vercel.app/api/download/apk',
    directGithubUrl: 'https://github.com/pritam-79/proz-movie/releases/tag/v0.08',
    fileSize: '1.7 MB',
    changelog: [
      'Fixed Movie & Anime Single-Trailer Bug: Each title now resolves its own official YouTube trailer & dynamic AniList/Kitsu/TVmaze/TMDB metadata instead of repeating a shared demo clip or Deadpool fallback',
      'Repaired All Channel Streams: Added MPEG-TS (.ts) MSE playback via mpegts.js, CDN URL Unicode/space encoding, range stream proxy, retry caching, and category fallback for unmapped channels',
      'StashDB GraphQL & Complete Stash Section: Live StashDB GraphQL (Scenes, Performers, Studios) integrated into Stash Vault & 18+ Zone, plus repaired Stash proxy streams (eliminated HTTP 403 failures)',
      'Modern Mobile & Desktop Aesthetic Redesign: Fixed sticky Navbar/SubHeader overlap on Android WebView, responsive HeroBanner & channel logos, clean Stash bottom navigation, and removed cluttered Instant Playable Movies block',
      'Automatic v0.08 Update Information Popup: Shows detailed changelog & in-app APK upgrade controls cleanly on release launch'
    ]
  });
}
