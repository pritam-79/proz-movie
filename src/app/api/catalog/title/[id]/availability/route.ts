import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CONTENT } from '@/lib/data/mockContent';
import { providerRegistry } from '@/lib/providers/registry';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const searchParams = req.nextUrl.searchParams;
    const country = searchParams.get('country') || 'IN';

    const item = MOCK_CONTENT.find(c => c.id === id || String(c.tmdb_id) === id || c.slug === id);

    if (!item) {
      return NextResponse.json({ success: false, message: 'Title not found' }, { status: 404 });
    }

    const sources = await providerRegistry.resolveAvailability(
      item.title,
      item.tmdb_id,
      country
    );

    return NextResponse.json({
      success: true,
      titleId: item.id,
      title: item.title,
      country,
      sources,
      total: sources.length
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
