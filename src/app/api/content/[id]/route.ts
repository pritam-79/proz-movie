import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getNormalizedMockContent } from '@/lib/data/mockContent';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const supabase = createSupabaseServerClient();

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
      .or(`id.eq.${id},slug.eq.${id}`)
      .single();

    if (!error && data) {
      return NextResponse.json(data);
    }
  } catch (err) {
    console.warn(`Supabase query for content ${id} fell back to mock repository:`, err);
  }

  // Fallback: search mock content by id or slug
  const all = getNormalizedMockContent();
  const match = all.find((c) => c.id === id || c.slug === id);

  if (match) {
    return NextResponse.json(match);
  }

  return NextResponse.json({ error: 'Content not found' }, { status: 404 });
}
