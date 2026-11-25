import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const candidates = [
      path.join(process.cwd(), 'PROZ-MOVIE-v0.08.apk'),
      path.join(process.cwd(), 'public', 'download', 'PROZ-MOVIE-v0.08.apk'),
      path.join(process.cwd(), 'PROZ-MOVIE-v0.07.apk'),
      path.join(process.cwd(), 'public', 'download', 'PROZ-MOVIE-v0.07.apk'),
      path.join(process.cwd(), 'PROZ-MOVIE-v0.06.apk'),
      path.join(process.cwd(), 'public', 'download', 'PROZ-MOVIE-v0.06.apk'),
      path.join(process.cwd(), 'PROZ-MOVIE-v0.02.apk'),
      path.join(process.cwd(), 'public', 'download', 'PROZ-MOVIE-v0.02.apk'),
      path.join(process.cwd(), 'PROZ-ENTERTAINMENT-v0.01.apk'),
      path.join(process.cwd(), 'public', 'download', 'PROZ-ENTERTAINMENT-v0.01.apk'),
      path.join(process.cwd(), 'PROZ-MOVIE-v0.01.apk')
    ];

    let apkPath: string | null = null;
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        apkPath = p;
        break;
      }
    }

    if (!apkPath) {
      return NextResponse.json({ error: 'APK build not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(apkPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="PROZ-MOVIE-v0.08.apk"',
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve APK' }, { status: 500 });
  }
}
