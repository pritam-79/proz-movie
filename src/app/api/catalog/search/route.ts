import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CONTENT } from '@/lib/data/mockContent';
import { getAllChannels } from '@/lib/data/channelsData';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const q = (searchParams.get('q') || '').trim().toLowerCase();
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '30', 10);

    if (!q) {
      return NextResponse.json({
        success: true,
        results: { movies: [], series: [], anime: [], channels: [] },
        total: 0
      });
    }

    const publicContent = MOCK_CONTENT.filter(c => !c.isRestricted18Plus && !c.is_adult);

    // Filter content
    const matchedContent = publicContent.filter(c => {
      const titleMatch = c.title?.toLowerCase().includes(q) || c.originalTitle?.toLowerCase().includes(q);
      const synopsisMatch = c.synopsis?.toLowerCase().includes(q) || (c.overview && c.overview.toLowerCase().includes(q));
      const genreMatch = (c.genres as string[])?.some(g => g.toLowerCase().includes(q));
      const castMatch = (c.cast as any[])?.some(act => act.name?.toLowerCase().includes(q));
      return titleMatch || synopsisMatch || genreMatch || castMatch;
    });

    // Filter channels
    const channels = getAllChannels().filter(ch => 
      ch.name.toLowerCase().includes(q) || 
      ch.category.toLowerCase().includes(q) ||
      ch.description.toLowerCase().includes(q)
    );

    const movies = matchedContent.filter(c => c.type === 'movie' || c.content_type === 'movie');
    const series = matchedContent.filter(c => c.type === 'series' || c.content_type === 'series');
    const anime = matchedContent.filter(c => c.category === 'anime' || c.type === 'anime');

    return NextResponse.json({
      success: true,
      query: q,
      total: matchedContent.length + channels.length,
      results: {
        movies: movies.slice(0, limit),
        series: series.slice(0, limit),
        anime: anime.slice(0, limit),
        channels: channels.slice(0, 12)
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
