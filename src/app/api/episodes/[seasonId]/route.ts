import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getNormalizedMockContent } from '@/lib/data/mockContent';

export async function GET(
  _req: NextRequest,
  { params }: { params: { seasonId: string } }
) {
  const { seasonId } = params;

  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from('episodes')
      .select(`
        *,
        video_assets(*),
        subtitles(*)
      `)
      .eq('season_id', seasonId)
      .order('episode_number', { ascending: true });

    if (!error && data && data.length > 0) {
      return NextResponse.json(data);
    }
  } catch (err) {
    console.warn(`Supabase episodes query for ${seasonId} fell back:`, err);
  }

  // Fallback: search in mock content
  const all = getNormalizedMockContent();
  for (const c of all) {
    if (c.seasons) {
      const s = c.seasons.find((season) => season.id === seasonId);
      if (s && s.episodes) {
        return NextResponse.json(s.episodes);
      }
    }
  }

  return NextResponse.json([]);
}
