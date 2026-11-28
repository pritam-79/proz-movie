import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    latestVersion: '0.09.02',
    latestVersionCode: 11,
    minVersionCode: 1,
    appName: 'PROZ ENTERTAINMENT',
    title:
      'PROZ Entertainment v0.09.02 — Complete Obsidian Ember UI Redesign, Light/Dark Themes, Repaired Naughty America & .ts Range Streaming, Stash/StashDB Health & Bug Detector',
    releaseDate: '2026-11-27',
    apkUrl: 'https://proz-movie.vercel.app/api/download/apk',
    directGithubUrl: 'https://github.com/pritam-79/proz-movie/releases/tag/v0.09.02',
    manifestUrl: '/manifest.webmanifest',
    fileSize: '1.64 MB',
    compatiblePlatforms: ['Android', 'iOS (PWA)', 'Windows (PWA)', 'macOS (PWA)', 'Linux (PWA)', 'Web'],
    preservesUserData: true,
    changelog: [
      'Complete Obsidian Onyx & Ember Crimson UI Redesign across every page, card, modal, navigation bar, and player with Light/Dark/System theme switching',
      'Repaired Naughty America & all 116 MPEG-TS + 212 MP4 Cine18 channels using Chunked HTTP 206 Range Loader & fixed unmapped/typo channel UIDs (330 unique verified channels)',
      'Repaired Personal Stash GraphQL Server adapter with real GraphQL queries, /graphql endpoint normalization, ApiKey header forwarding, and circuit-breaker health checks',
      'Honest Resolution Selector & Non-Restarting Manual Track Switch: Real 4K UHD (2160p), QHD (1440p), 1080p Full HD, 720p HD, 480p SD, 360p & Auto (ABR) without fake upscaling',
      'Advanced Video Player Gestures & VR HUD: Configurable double-tap left/right seeking with ripple animations, auto-hiding fullscreen controls, and 180°/360° VR tilt/zoom controls',
      'Expanded PRO 18+ Ecosystem: Multi-source RedGIFs v2 + StashDB + Cine18 Photo Galleries, A–Z Performer directory (>33), sorted/paginated Hot Webseries, Hentai & 3D, VR & 30 Tube Portals',
      'Automatic Bug Detector & Diagnostics Dashboard (/settings): Real-time API, Stash, StashDB, Database & playback engine telemetry, bounded auto-retries & cache eviction recovery',
      'Live TV (.m3u8) IPTV-Org in-app playback via unified VideoPlayer without forced external redirects',
    ],
  });
}
