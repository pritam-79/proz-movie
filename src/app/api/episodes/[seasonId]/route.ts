import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { seasonId: string } }
) {
  try {
    const supabase = createSupabaseServerClient();
    const { seasonId } = params;

    const { data, error } = await supabase
      .from('episodes')
      .select(`
        *,
        video_assets(*),
        subtitles(*)
      `)
      .eq('season_id', seasonId)
      .order('episode_number', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch episodes' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Episodes route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
