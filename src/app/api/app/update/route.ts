import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    latestVersion: '0.09.1',
    latestVersionCode: 10,
    minVersionCode: 1,
    appName: 'PROZ ENTERTAINMENT',
    title: 'PROZ Entertainment v0.09.1 — Real Cine18 Catalog, StashDB VR/Hentai/Performers, Dedup Continue Watching, 24 Tube Portals & Gallery Categories',
    releaseDate: '2026-11-26',
    apkUrl: 'https://proz-movie.vercel.app/api/download/apk',
    directGithubUrl: 'https://github.com/pritam-79/proz-movie/releases/tag/v0.09.1',
    manifestUrl: '/manifest.webmanifest',
    fileSize: '1.64 MB',
    compatiblePlatforms: ['Android', 'iOS (PWA)', 'Windows (PWA)', 'macOS (PWA)', 'Linux (PWA)', 'Web'],
    preservesUserData: true,
    changelog: [
      'Real Cine18 OTT Catalog: Hot Web Series now shows live Ullu, Alt Balaji, Kooku, Neon, MxPlayer, Primeshots & more — no more fake placeholder cards',
      'StashDB VR/Hentai/3D Real Data: 3D VR section now pulls real StashDB VR scenes (39k+), no redirect to Ullu; Hentai shows real StashDB hentai (1,639+) & 3D (15k+)',
      'Genuine Performer Profiles: Performers Directory shows real pornstars with gender filter pills (Female/Male/Trans/All) & Load More pagination',
      'Deduplicated Continue Watching: No more duplicate Resume cards for the same scene — highest progress wins',
      'Adult Photo Galleries: Real gallery data with category filter pills (Portrait Sets / Scene Stills / Hentai & Anime CG / VR & 3D Stills)',
      'Tube Hub Expanded: 24 categorized adult portals with filter buttons instead of 5 static links',
      'StashDB Panel Always Visible: Tag chips (All Scenes / VR 39k+ / 3D 15k+ / Hentai 1,639+), gender filter, Retry on error, explicit error messages',
      'Studios Toggle: Metadata-Only toggle to browse community-indexed studios alongside playable ones',
      'Series Detail Modal: Fetches real live Cine18 episodes dynamically instead of showing hardcoded fake episodes',
      'All image referrer policies fixed to no-referrer to prevent hotlink blocking across the UI',
    ],
  });
}
