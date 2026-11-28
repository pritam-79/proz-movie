import { NextRequest, NextResponse } from 'next/server';
import { fetchRedGifsItemById } from '@/lib/providers/redgifs';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')?.trim();
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing id parameter' }, { status: 400 });
  }
  try {
    const item = await fetchRedGifsItemById(id);
    if (!item || !item.hdUrl) {
      return NextResponse.json({ success: false, error: 'Stream not found or unavailable' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      item,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to resolve stream' },
      { status: 500 }
    );
  }
}
