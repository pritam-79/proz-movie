import { NextRequest, NextResponse } from 'next/server';
import { providerRegistry } from '@/lib/providers/registry';
import { MOCK_CONTENT } from '@/lib/data/mockContent';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const query = searchParams.get('query') || undefined;
    const genre = searchParams.get('genre') || undefined;

    const anilistAdapter = providerRegistry.get('anilist');
    if (anilistAdapter) {
      try {
        const aniResult = await anilistAdapter.discoverCatalog({
          page,
          limit,
          query,
          genre,
          contentType: 'anime'
        });

        if (aniResult.items && aniResult.items.length > 0) {
          return NextResponse.json({
            success: true,
            provider: 'anilist',
            ...aniResult
          });
        }
      } catch (e) {
        console.warn('AniList live query fell back to internal catalog:', e);
      }
    }

    // Fallback to internal catalog
    let pool = MOCK_CONTENT.filter(c => c.category === 'anime' || c.type === 'anime');
    if (genre) {
      pool = pool.filter(c => (c.genres as string[])?.some(g => g.toLowerCase().includes(genre.toLowerCase())));
    }

    const totalResults = pool.length;
    const totalPages = Math.ceil(totalResults / limit) || 1;
    const items = pool.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      provider: 'internal',
      items,
      page,
      totalPages,
      totalResults
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
