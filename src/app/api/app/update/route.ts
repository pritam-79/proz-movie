import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    latestVersion: '0.06',
    latestVersionCode: 6,
    minVersionCode: 1,
    appName: 'PRO2 ENTERTAINMENT',
    title: 'PRO2 ENTERTAINMENT v0.06 — Complete Reference Analysis, Playback Engine Repair & API/DRM Integration',
    releaseDate: '2026-11-24',
    apkUrl: 'https://proz-movie.vercel.app/api/download/apk',
    directGithubUrl: 'https://github.com/pritam-79/proz-movie/releases/tag/v0.06',
    fileSize: '1.7 MB',
    changelog: [
      'Centralized Video Player Repair: Eliminated infinite buffering and 00:00 duration freeze; added instant playback with automatic autoplay recovery',
      'Fixed Movie & Channel Playback: Replaced dead cloud-storage endpoints with high-bitrate Mux adaptive HLS, Unified Streaming, and Internet Archive MP4 streams',
      'Dynamic Channel Video Integration: Clicking any channel item loads actual episode streams and metadata instead of fallback titles',
      'Authorized DRM Architecture: Integrated Google Shaka Player with Widevine Modular (com.widevine.alpha), Apple FairPlay (com.apple.fps), and W3C ClearKey EME key systems',
      'Suppressed Intrusive Update Banners: Version checker now accurately recognizes installed v0.06 without persistent banner intrusion',
      'Full Android Manifest Specification: Configured foreground service, media audio/video/images permissions, and wake-lock for uninterrupted playback',
      'Enhanced Image Fallback & Aspect Ratios: Channel video cards and posters adapt gracefully without dark/broken states',
      'Updated to official v0.06 across Web PWA, Android build, and central brand configurations'
    ]
  });
}
