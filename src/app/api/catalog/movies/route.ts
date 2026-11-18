import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CONTENT } from '@/lib/data/mockContent';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '24', 10);
    const genre = searchParams.get('genre')?.toLowerCase();
    const country = searchParams.get('country')?.toLowerCase();
    const language = searchParams.get('language')?.toLowerCase();
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : undefined;
    const minRating = searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined;
    const sortBy = searchParams.get('sortBy') || 'popularity';

    let pool = MOCK_CONTENT.filter(c => !c.isRestricted18Plus && !c.is_adult && (c.type === 'movie' || c.content_type === 'movie'));

    if (genre) {
      pool = pool.filter(c => {
        const glist = c.genres as string[];
        return glist && glist.some(g => g.toLowerCase().includes(genre));
      });
    }

    if (country) {
      pool = pool.filter(c => c.country?.toLowerCase().includes(country) || c.category?.toLowerCase() === country);
    }

    if (language) {
      pool = pool.filter(c => c.language?.toLowerCase() === language || (c.languages && c.languages.some(l => l.toLowerCase() === language)));
    }

    if (year) {
      pool = pool.filter(c => (c.releaseYear || c.release_year) === year);
    }

    if (minRating) {
      pool = pool.filter(c => (c.ratingScore || c.rating_avg || 0) >= minRating);
    }

    // Sort
    if (sortBy === 'rating') {
      pool = pool.sort((a, b) => (b.ratingScore || 0) - (a.ratingScore || 0));
    } else if (sortBy === 'newest') {
      pool = pool.sort((a, b) => (b.releaseYear || 2024) - (a.releaseYear || 2024));
    } else {
      pool = pool.sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0));
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
