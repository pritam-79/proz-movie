import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(_req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('is_published', true)
      .eq('is_adult', false)
      .order('view_count', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch trending content' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Trending route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
