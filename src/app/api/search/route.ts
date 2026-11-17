import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { searchParams } = new URL(req.url);

    const q = searchParams.get('q')?.trim() || '';
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const year = searchParams.get('year');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 20;
    const offset = (page - 1) * limit;

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [], suggestions: [], total: 0 });
    }

    let query = supabase
      .from('content')
      .select('*', { count: 'exact' })
      .ilike('title', `%${q}%`)
      .eq('is_published', true)
      .eq('is_adult', false);

    if (type) query = query.eq('content_type', type);
    if (category) query = query.eq('category', category);
    if (year) query = query.eq('release_year', parseInt(year, 10));

    query = query.range(offset, offset + limit - 1);

    const { data: results, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    const suggestions = (results || []).slice(0, 5).map((r: any) => r.title);

    return NextResponse.json({
      results: results || [],
      total: count ?? 0,
      suggestions,
    });
  } catch (err) {
    console.error('Search route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
