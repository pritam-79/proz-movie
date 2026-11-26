import { NextRequest, NextResponse } from 'next/server';
import { stashService } from '@/lib/services/stashService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')?.trim();
    const q = req.nextUrl.searchParams.get('q')?.trim() || '';
    const includeMetadataOnly =
      req.nextUrl.searchParams.get('includeMetadata') === 'true';

    if (id) {
      const detail = await stashService.getStudioDetail(id);
      if (!detail.studio) {
        return NextResponse.json({ success: false, error: 'Studio not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, ...detail });
    }

    const studios = await stashService.getStudiosDirectory({
      q,
      includeMetadataOnly,
    });
    return NextResponse.json({
      success: true,
      includeMetadataOnly,
      count: studios.length,
      studios,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Studio lookup failed' }, { status: 500 });
  }
}
