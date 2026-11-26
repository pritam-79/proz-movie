import { NextRequest, NextResponse } from 'next/server';
import { stashService } from '@/lib/services/stashService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get('category')?.trim() || 'All';
    const q = req.nextUrl.searchParams.get('q')?.trim().toLowerCase() || '';
    let galleries = await stashService.getPhotoGalleries(category);

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
      count: galleries.length,
      galleries,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load photo galleries' },
      { status: 500 }
    );
  }
}
