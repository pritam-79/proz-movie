import { NextRequest, NextResponse } from 'next/server';
import { providerRegistry } from '@/lib/providers/registry';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const title = searchParams.get('title') || '';
  const tmdbId = searchParams.get('tmdbId') ? parseInt(searchParams.get('tmdbId')!, 10) : undefined;
  const country = searchParams.get('country') || 'IN';

  if (!title && !tmdbId) {
    return NextResponse.json({ error: 'Title or tmdbId parameter is required' }, { status: 400 });
  }

  try {
    const sources = await providerRegistry.resolveAvailability(title, tmdbId, country);
    return NextResponse.json({
      success: true,
      title,
      tmdbId,
      country,
      sources,
      totalSources: sources.length
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
