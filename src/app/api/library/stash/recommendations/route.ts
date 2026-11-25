import { NextRequest, NextResponse } from 'next/server';
import { stashService } from '@/lib/services/stashService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const watchedRaw = req.nextUrl.searchParams.get('watched') || '';
    const favRaw = req.nextUrl.searchParams.get('favorites') || '';

    const watchedIds = watchedRaw ? watchedRaw.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const favoriteIds = favRaw ? favRaw.split(',').map((s) => s.trim()).filter(Boolean) : [];

    const recommendations = await stashService.getRecommendations({ watchedIds, favoriteIds });
    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Recommendations lookup failed' },
      { status: 500 }
    );
  }
}
