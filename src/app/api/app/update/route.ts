import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    latestVersion: '0.09',
    latestVersionCode: 9,
    minVersionCode: 1,
    appName: 'PROZ ENTERTAINMENT',
    title: 'PROZ Entertainment v0.09 — Player Overlay Repair, Auto Stash Backend, PRO 18+ Ecosystem & Smart Updater',
    releaseDate: '2026-11-26',
    apkUrl: 'https://proz-movie.vercel.app/api/download/apk',
    directGithubUrl: 'https://github.com/pritam-79/proz-movie/releases/tag/v0.09',
    manifestUrl: '/manifest.webmanifest',
    fileSize: '1.64 MB',
    compatiblePlatforms: ['Android', 'iOS (PWA)', 'Windows (PWA)', 'macOS (PWA)', 'Linux (PWA)', 'Web'],
    preservesUserData: true,
    changelog: [
      'Fixed Video Player Upper Overlay Bug: Docked non-overlapping header above player stage, removed colliding top headers/banners on /watch/*, added Picture-in-Picture, real resolution detection, Shaka audio/quality/subtitle tracks, and strict playback state',
      'Repaired Demon Slayer & Catalog Mapping: Stripped mismatched sample Blender streams from unrelated titles so movies/anime never play a wrong demo video and play verified trailers or partner info cleanly inside PROZ',
      'Automatic Stash & StashDB Backend Service: Credentials remain strictly server-side, manual config forms and localStorage key inputs removed, StashDB entries require real matched media files before showing a Play button',
      'Complete PRO 18+ Ecosystem Inside Gallery & Stash Vault: Added Recent Uploads (photos/videos/collections), Studio profiles, Performer profiles with real credits/photos, Tube Hub with limitation notices, 3D VR SBS/360° viewer, Hentai & 3D subcategories, Hot Web Series detail pages, and data-driven Recommendations',
      'Smart v0.09 Update Notification Behaviour: Only notifies automatically when a genuinely newer release is available and persists dismissal across restarts',
    ],
  });
}
