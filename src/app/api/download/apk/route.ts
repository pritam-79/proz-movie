import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const apkPath = path.join(process.cwd(), 'PROZ-MOVIE-v1.0.0.apk');
    if (!fs.existsSync(apkPath)) {
      return NextResponse.json({ error: 'APK build not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(apkPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="PROZ-MOVIE-v1.0.0.apk"',
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve APK' }, { status: 500 });
  }
}
