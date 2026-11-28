import { NextRequest, NextResponse } from 'next/server';
import { stashService } from '@/lib/services/stashService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const subcat = sp.get('subcat')?.trim() || 'All';
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1);
    const q = sp.get('q')?.trim() || '';
    const sort = (sp.get('sort')?.trim() || 'newest') as 'newest' | 'popular' | 'rating' | 'title';

    const result = await stashService.getHentaiCatalog({ subcat, page, q, sort });
    return NextResponse.json({
      success: true,
      subcat,
      page,
      totalCount: result.totalCount,
      count: result.items.length,
      items: result.items,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load Hentai & 3D CGI catalog' },
      { status: 500 }
    );
  }
}
