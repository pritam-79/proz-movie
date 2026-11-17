import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getNormalizedMockContent } from '@/lib/data/mockContent';

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

    if (!error && data && data.length > 0) {
      return NextResponse.json(data);
    }
  } catch (err) {
    console.warn('Supabase trending query fell back to mock repository:', err);
  }

  // Fallback: mock trending items
  const trending = getNormalizedMockContent()
    .filter((c) => (c.isTrending || c.is_trending) && !c.isRestricted18Plus && !c.is_adult)
    .slice(0, 20);

  return NextResponse.json(trending);
}
