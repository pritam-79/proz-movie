import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient();
    const { id } = params;

    const { data, error } = await supabase
      .from('content')
      .select(`
        *,
        genres:content_genres(genre:genres(*)),
        seasons(*),
        video_assets(*),
        subtitles(*),
        audio_tracks(*),
        licenses(*)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Content [id] route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
