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
      return NextResponse.json({ success: false, message: 'Title not found' }, { status: 404 });
    }

    // Similar titles
    const similar = MOCK_CONTENT.filter(c => 
      c.id !== item.id && 
      !c.isRestricted18Plus &&
      (c.category === item.category || c.type === item.type)
    ).slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        ...item,
        similar
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
