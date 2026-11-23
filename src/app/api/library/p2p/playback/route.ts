import { NextRequest, NextResponse } from 'next/server';
import { legalTorrentAdapter } from '@/lib/providers/torrent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceId = 'src-blender-studio', infoHash = 'tears-of-steel-cc' } = body;

    const session = await legalTorrentAdapter.startAuthorizedPlayback(sourceId, infoHash);

    return NextResponse.json({
      success: true,
      session
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
