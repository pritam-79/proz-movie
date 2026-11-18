import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CONTENT } from '@/lib/data/mockContent';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const subcategory = searchParams.get('subcategory')?.toLowerCase();

    let pool = MOCK_CONTENT.filter(c => 
      c.category === 'k_drama' || 
      c.country === 'South Korea' || 
      c.type === 'drama' ||
      c.subcategory === 'asian_drama'
    );

    if (subcategory) {
      pool = pool.filter(c => c.subcategory?.toLowerCase().includes(subcategory) || c.country?.toLowerCase().includes(subcategory));
    }

    const totalResults = pool.length;
    const totalPages = Math.ceil(totalResults / limit) || 1;
    const items = pool.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      items,
      page,
      totalPages,
      totalResults
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
