import { NextRequest, NextResponse } from 'next/server';
import { stashAdapter } from '@/lib/providers/stash';
import { MediaBrowsingFilters } from '@/types/library';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get('q') || undefined;
    const studioId = searchParams.get('studio') || undefined;
    const performerId = searchParams.get('performer') || undefined;
    const sortBy = (searchParams.get('sort') as MediaBrowsingFilters['sortBy']) || 'date';
    const isFavorite = searchParams.has('favorite') ? searchParams.get('favorite') === 'true' : undefined;
    const isWatched = searchParams.has('watched') ? searchParams.get('watched') === 'true' : undefined;

    const filters: MediaBrowsingFilters = {
      searchQuery,
      studioId,
      performerId,
      sortBy,
      isFavorite,
      isWatched
    };

    const data = await stashAdapter.findScenes(filters);

    return NextResponse.json({
      success: true,
      total: data.count,
      scenes: data.scenes,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve scenes' },
      { status: 500 }
    );
  }
}
