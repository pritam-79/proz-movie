import { NextRequest, NextResponse } from 'next/server';
import { stashService } from '@/lib/services/stashService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const subcat = sp.get('subcat')?.trim() || 'All';
    const q = sp.get('q')?.trim() || '';

    const series = await stashService.getHotWebSeriesCatalog({ subcat, q });
    return NextResponse.json({
      success: true,
      subcat,
      count: series.length,
      series,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load Hot Web Series & Drama catalog' },
      { status: 500 }
    );
  }
}
