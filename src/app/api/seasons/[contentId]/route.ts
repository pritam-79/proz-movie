import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { contentId: string } }
) {
  try {
    const supabase = createSupabaseServerClient();
    const { contentId } = params;

    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .eq('content_id', contentId)
      .order('season_number', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch seasons' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Seasons route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
