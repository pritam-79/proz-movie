import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const genre = searchParams.get('genre');
    const sort = searchParams.get('sort') || 'trending';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search');
    const year = searchParams.get('year');
    const is_adult = searchParams.get('is_adult') === 'true';

    const offset = (page - 1) * limit;

    let query = supabase
      .from('content')
      .select('*', { count: 'exact' })
      .eq('is_published', true);

    if (!is_adult) {
      query = query.eq('is_adult', false);
    }

    if (category) query = query.eq('category', category);
    if (type) query = query.eq('content_type', type);
    if (year) query = query.eq('release_year', parseInt(year, 10));
    if (search) query = query.ilike('title', `%${search}%`);
    if (genre) {
      // Filter via content_genres join - use a subquery approach
      const { data: genreData } = await supabase
        .from('genres')
        .select('id')
        .ilike('slug', genre)
        .single();
      if (genreData) {
        const { data: contentIds } = await supabase
          .from('content_genres')
          .select('content_id')
          .eq('genre_id', genreData.id);
        if (contentIds && contentIds.length > 0) {
          query = query.in('id', contentIds.map((r: any) => r.content_id));
        }
      }
    }

    switch (sort) {
      case 'trending':
        query = query.order('view_count', { ascending: false });
        break;
      case 'latest':
        query = query.order('release_year', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating_avg', { ascending: false });
        break;
      case 'az':
        query = query.order('title', { ascending: true });
        break;
      default:
        query = query.order('view_count', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Content fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ data, total, page, limit, totalPages });
  } catch (err) {
    console.error('Content route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
