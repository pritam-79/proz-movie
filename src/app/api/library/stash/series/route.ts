import { NextRequest, NextResponse } from 'next/server';
import { stashService } from '@/lib/services/stashService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const subcat = sp.get('subcat')?.trim() || 'All';
    const q = sp.get('q')?.trim() || '';
    const sort = (sp.get('sort')?.trim() || 'newest') as 'newest' | 'popular' | 'rating' | 'title';
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1);
    const perPage = Math.min(48, Math.max(12, parseInt(sp.get('perPage') || '24', 10) || 24));

    const result = await stashService.getHotWebSeriesCatalog({ subcat, q, sort, page, perPage });
    return NextResponse.json({
      success: true,
      subcat,
      page: result.page,
      totalPages: result.totalPages,
      totalCount: result.totalCount,
      count: result.series.length,
      categories: result.categories,
      series: result.series,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load Hot Web Series & Drama catalog' },
      { status: 500 }
    );
  }
}
