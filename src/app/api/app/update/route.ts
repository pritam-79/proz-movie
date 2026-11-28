import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    latestVersion: '0.09.03',
    latestVersionCode: 12,
    minVersionCode: 1,
    appName: 'PROZ ENTERTAINMENT',
    title:
      'PROZ Entertainment v0.09.03 — Strict Content Classification, AI Adult Videos, Genuine Photo Galleries, Fixed Player Duration & Fullscreen Scroll-Lock, Profile Crop & Supabase Auth',
    releaseDate: '2026-11-29',
    apkUrl: 'https://proz-movie.vercel.app/api/download/apk',
    directGithubUrl: 'https://github.com/pritam-79/proz-movie/releases/tag/v0.09.03',
    manifestUrl: '/manifest.webmanifest',
    fileSize: '1.65 MB',
    compatiblePlatforms: ['Android', 'iOS (PWA)', 'Windows (PWA)', 'macOS (PWA)', 'Linux (PWA)', 'Web'],
    preservesUserData: true,
    changelog: [
      'Strict 4-Category Visual Classification: Separated 2D Japanese Hentai Anime, 3D CGI/SFM Animation, 3D VR Experiences, and 2D Illustrated Comics with deterministic classification rules',
      'New Dedicated AI Adult Videos Section (/ai-videos): Strictly fictional 18+ AI-generated 3D, cinematic, and VR video streams with safety validation and operator generation studio adapter',
      'Genuine Adult Photo Galleries: Removed video screenshot pseudo-galleries, keeping genuine RedGIFs image sets, StashDB & Personal Stash galleries with URL deduplication & infinite scroll',
      'Video Player & Fullscreen Fixes: Fixed 01:05 / Infinity duration display bug, added seekable bounds checking, touch-enabled seekbar, Skip Credits, and fullscreen document body scroll-lock',
      'Profile Photo Upload & Crop + Supabase Auth: Client-side 256x256 square canvas cropping, persistent avatar storage, Email/Password, Google Sign-In, Password Reset & Phone OTP support',
      'Live TV Country & Language Filters + Recently Watched Channels, Expanded Global Cross-Catalog Search, Exponential-Backoff Bug Recovery & Scroll Restoration across navigation',
    ],
  });
}
