import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getNormalizedMockContent } from '@/lib/data/mockContent';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('is_featured', true)
      .eq('is_published', true)
      .eq('is_adult', false)
      .limit(10);

    if (!error && data && data.length > 0) {
      return NextResponse.json(data);
    }
  } catch (err) {
    console.warn('Supabase featured query fell back to mock repository:', err);
  }

  // Fallback: mock featured items
  const featured = getNormalizedMockContent()
    .filter((c) => (c.isFeatured || c.is_featured) && !c.isRestricted18Plus && !c.is_adult)
    .slice(0, 10);

  return NextResponse.json(featured);
}
