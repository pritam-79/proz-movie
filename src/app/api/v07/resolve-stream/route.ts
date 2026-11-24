import { NextRequest, NextResponse } from 'next/server';
import {
  resolveArchiveDirectMp4,
  resolvePeerTubePlayableUrl,
} from '@/lib/providers/archiveExpanded';
import { resolveNasaDirectMp4 } from '@/lib/providers/nasa';
import { OFFICIAL_DRM_TEST_STREAMS } from '@/lib/providers/drmConfig';

export const dynamic = 'force-dynamic';

/**
 * Resolves verified live direct stream URLs for dynamically discovered public-media items.
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') || '';
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    if (id.startsWith('ia-')) {
      const mp4Url = await resolveArchiveDirectMp4(id);
      if (!mp4Url) {
        return NextResponse.json({ success: false, error: 'No direct MP4 asset found on Internet Archive' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        id,
        playbackUrl: mp4Url,
        format: 'mp4',
        provider: 'Internet Archive Public Domain',
      });
    }

    if (id.startsWith('nasa-')) {
      const mp4Url = await resolveNasaDirectMp4(id);
      if (!mp4Url) {
        return NextResponse.json({ success: false, error: 'No direct MP4 asset found on NASA Archive' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        id,
        playbackUrl: mp4Url,
        format: 'mp4',
        provider: 'NASA Video Library',
      });
    }

    if (id.startsWith('pt-')) {
      const pt = await resolvePeerTubePlayableUrl(id);
      if (!pt) {
        return NextResponse.json({ success: false, error: 'No direct stream resolved for PeerTube item' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        id,
        playbackUrl: pt.url,
        format: pt.format,
        provider: 'PeerTube Open Cinema',
      });
    }

    const drmAsset = OFFICIAL_DRM_TEST_STREAMS.find((d) => d.id === id);
    if (drmAsset) {
      return NextResponse.json({
        success: true,
        id,
        playbackUrl: drmAsset.streamUrl,
        format: drmAsset.streamFormat,
        drmConfig: drmAsset.drmConfig,
        provider: drmAsset.providerName,
      });
    }

    return NextResponse.json({ success: false, error: 'Unsupported dynamic id prefix' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Resolution failed' },
      { status: 500 }
    );
  }
}
