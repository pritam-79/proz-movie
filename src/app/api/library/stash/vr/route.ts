import { NextRequest, NextResponse } from 'next/server';
import { stashService } from '@/lib/services/stashService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1);
    const q = sp.get('q')?.trim() || '';
    const format = sp.get('format')?.trim() || 'All';

    const result = await stashService.getVrCatalog({ page, q, format });
    return NextResponse.json({
      success: true,
      page,
      format,
      totalCount: result.count,
      count: result.scenes.length,
      scenes: result.scenes,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load VR & 3D catalog' },
      { status: 500 }
    );
  }
}
