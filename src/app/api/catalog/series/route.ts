import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CONTENT } from '@/lib/data/mockContent';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '24', 10);
    const genre = searchParams.get('genre')?.toLowerCase();
    const sortBy = searchParams.get('sortBy') || 'popularity';

    let pool = MOCK_CONTENT.filter(c => !c.isRestricted18Plus && !c.is_adult && (c.type === 'series' || c.content_type === 'series'));

    if (genre) {
      pool = pool.filter(c => {
        const glist = c.genres as string[];
        return glist && glist.some(g => g.toLowerCase().includes(genre));
      });
    }

    if (sortBy === 'rating') {
      pool = pool.sort((a, b) => (b.ratingScore || 0) - (a.ratingScore || 0));
    } else if (sortBy === 'newest') {
      pool = pool.sort((a, b) => (b.releaseYear || 2024) - (a.releaseYear || 2024));
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
