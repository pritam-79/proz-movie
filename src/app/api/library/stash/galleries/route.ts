import { NextRequest, NextResponse } from 'next/server';
import { stashService } from '@/lib/services/stashService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const category = sp.get('category')?.trim() || 'All';
    const q = sp.get('q')?.trim().toLowerCase() || '';
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1);

    const res = await stashService.getPhotoGalleries(category, page);
    let galleries = res.galleries;

    if (q) {
      galleries = galleries.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          (g.details || '').toLowerCase().includes(q) ||
          (g.studio?.name || '').toLowerCase().includes(q) ||
          (g.tags || []).some((t) => t.name.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({
      success: true,
      category,
      page,
      count: galleries.length,
      totalCount: res.totalCount,
      hasMore: res.hasMore,
      galleries,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load photo galleries' },
      { status: 500 }
    );
  }
}
