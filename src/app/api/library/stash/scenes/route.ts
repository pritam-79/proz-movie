import { NextRequest, NextResponse } from 'next/server';
import { stashService } from '@/lib/services/stashService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get('q')?.trim().toLowerCase() || '';
    const studioFilter = searchParams.get('studio')?.trim().toLowerCase() || '';
    const performerFilter = searchParams.get('performer')?.trim().toLowerCase() || '';
    const tagFilter = searchParams.get('tag')?.trim().toLowerCase() || '';
    const resolutionFilter = searchParams.get('resolution')?.trim().toLowerCase() || '';
    const sortBy = searchParams.get('sort') || 'date';

    let scenes = await stashService.getAllPlayableScenes();

    if (searchQuery) {
      scenes = scenes.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery) ||
          (s.details || '').toLowerCase().includes(searchQuery) ||
          (s.studio?.name || '').toLowerCase().includes(searchQuery) ||
          (s.performers || []).some((p) => p.name.toLowerCase().includes(searchQuery)) ||
          (s.tags || []).some((t) => t.name.toLowerCase().includes(searchQuery))
      );
    }

    if (studioFilter) {
      scenes = scenes.filter(
        (s) =>
          s.studio?.id.toLowerCase() === studioFilter ||
          (s.studio?.name || '').toLowerCase().includes(studioFilter)
      );
    }

    if (performerFilter) {
      scenes = scenes.filter((s) =>
        (s.performers || []).some(
          (p) => p.id.toLowerCase() === performerFilter || p.name.toLowerCase().includes(performerFilter)
        )
      );
    }

    if (tagFilter) {
      scenes = scenes.filter((s) =>
        (s.tags || []).some((t) => t.name.toLowerCase().includes(tagFilter))
      );
    }

    if (resolutionFilter && resolutionFilter !== 'all') {
      scenes = scenes.filter((s) => {
        const h = s.files?.[0]?.height || 1080;
        if (resolutionFilter === '4k') return h >= 2160;
        if (resolutionFilter === '1080p') return h >= 1080;
        if (resolutionFilter === '720p') return h >= 720 && h < 1080;
        return true;
      });
    }

    if (sortBy === 'popular') {
      scenes.sort((a, b) => (b.oCounter || 0) - (a.oCounter || 0));
    } else if (sortBy === 'rating') {
      scenes.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'title') {
      scenes.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      scenes.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    }

    return NextResponse.json({
      success: true,
      total: scenes.length,
      scenes,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve scenes' },
      { status: 500 }
    );
  }
}
