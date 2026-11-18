import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CONTENT } from '@/lib/data/mockContent';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const episodeId = params.id;
    let foundEpisode: any = null;
    let parentTitle: any = null;

    for (const title of MOCK_CONTENT) {
      if (title.seasons) {
        for (const season of title.seasons) {
          const ep = (season.episodes || []).find(e => e.id === episodeId);
          if (ep) {
            foundEpisode = ep;
            parentTitle = { id: title.id, title: title.title, posterUrl: title.posterUrl };
            break;
          }
        }
      }
      if (foundEpisode) break;
    }

    if (!foundEpisode) {
      return NextResponse.json({ success: false, message: 'Episode not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      episode: foundEpisode,
      series: parentTitle
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
