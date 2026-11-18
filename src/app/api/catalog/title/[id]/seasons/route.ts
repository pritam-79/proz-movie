import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CONTENT } from '@/lib/data/mockContent';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const item = MOCK_CONTENT.find(c => c.id === id || String(c.tmdb_id) === id || c.slug === id);

    if (!item) {
      return NextResponse.json({ success: false, message: 'Series not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      titleId: item.id,
      title: item.title,
      seasons: item.seasons || []
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
