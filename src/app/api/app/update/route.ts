import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    latestVersion: '0.01',
    latestVersionCode: 1,
    minVersionCode: 1,
    appName: 'PROZ Entertainment',
    title: 'PROZ Entertainment v0.01 Update',
    releaseDate: '2026-11-19',
    apkUrl: 'https://proz-movie.vercel.app/api/download/apk',
    directGithubUrl: 'https://github.com/pritam-79/proz-movie/releases/download/v0.01/PROZ-ENTERTAINMENT-v0.01.apk',
    fileSize: '652 KB',
    changelog: [
      'Fixed reconnect loop & blank screen issue',
      'Added seamless In-App Updater with background download & auto-installer',
      'Integrated native Liquid Glass splash screen with smooth crossfade',
      'Added multi-frame retry mechanism for mobile network stability',
      'Enhanced 278-channel Live TV circular directory & EPG player'
    ]
  });
}
