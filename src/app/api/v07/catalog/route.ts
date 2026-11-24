import { NextRequest, NextResponse } from 'next/server';
import { getUnifiedV07Catalog, V07HubCategory } from '@/lib/services/v07Aggregator';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const category = (sp.get('category') || 'all') as V07HubCategory;
    const query = sp.get('q') || '';
    const subCategory = sp.get('subCategory') || 'All';
    const playableOnly = sp.get('playableOnly') === 'true';
    const includeAdult = sp.get('includeAdult') === 'true';
    const limit = parseInt(sp.get('limit') || '72', 10);

    const result = await getUnifiedV07Catalog({
      category,
      query,
      subCategory,
      playableOnly,
      includeAdult,
      limit,
    });

    return NextResponse.json({
      success: true,
      version: 'v0.07',
      category,
      items: result.items,
      stats: result.stats,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to aggregate catalog' },
      { status: 500 }
    );
  }
}
