import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getNormalizedMockContent } from '@/lib/data/mockContent';

export async function GET(
  _req: NextRequest,
  { params }: { params: { contentId: string } }
) {
  const { contentId } = params;

  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .eq('content_id', contentId)
      .order('season_number', { ascending: true });

    if (!error && data && data.length > 0) {
      return NextResponse.json(data);
    }
  } catch (err) {
    console.warn(`Supabase seasons query for ${contentId} fell back:`, err);
  }

  const all = getNormalizedMockContent();
  const match = all.find((c) => c.id === contentId || c.slug === contentId);
  return NextResponse.json(match?.seasons || []);
}
