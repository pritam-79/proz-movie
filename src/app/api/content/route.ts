import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getNormalizedMockContent } from '@/lib/data/mockContent';
import { ContentItem } from '@/types/content';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const category = searchParams.get('category');
  const type = searchParams.get('type');
  const genre = searchParams.get('genre');
  const sort = searchParams.get('sort') || 'trending';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const search = searchParams.get('search')?.toLowerCase();
  const year = searchParams.get('year');
  const is_adult = searchParams.get('is_adult') === 'true';

  const offset = (page - 1) * limit;

  // Attempt database query first if configured
  try {
    const supabase = createSupabaseServerClient();
    let query = supabase
      .from('content')
      .select('*', { count: 'exact' })
      .eq('is_published', true);

    if (!is_adult) {
      query = query.eq('is_adult', false);
    }

    if (category && category !== 'all') query = query.eq('category', category);
    if (type && type !== 'all') query = query.eq('content_type', type);
    if (year) query = query.eq('release_year', parseInt(year, 10));
    if (search) query = query.ilike('title', `%${search}%`);

    if (genre) {
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

    if (!error && data && data.length > 0) {
      const total = count ?? data.length;
      const totalPages = Math.ceil(total / limit) || 1;
      return NextResponse.json({
        data,
        items: data,
        total,
        page,
        limit,
        totalPages,
        total_pages: totalPages
      });
    }
  } catch (dbErr) {
    // Supabase query failed or not configured; fallback seamlessly to rich mock content
    console.warn('Supabase content query fell back to mock repository:', dbErr);
  }

  // Fallback: in-memory normalized content provider
  let list = getNormalizedMockContent();

  if (!is_adult) {
    list = list.filter((item) => !item.isRestricted18Plus && !item.is_adult);
  }

  if (category && category !== 'all') {
    list = list.filter((item) => item.category === category);
  }

  if (type && type !== 'all') {
    list = list.filter(
      (item) => item.type === type || item.content_type === type
    );
  }

  if (year) {
    const yr = parseInt(year, 10);
    list = list.filter((item) => (item.releaseYear || item.release_year) === yr);
  }

  if (search) {
    list = list.filter((item) =>
      item.title.toLowerCase().includes(search) ||
      (item.synopsis && item.synopsis.toLowerCase().includes(search))
    );
  }

  if (genre) {
    list = list.filter((item) => {
      if (Array.isArray(item.genres)) {
        return item.genres.some((g: any) =>
          typeof g === 'string'
            ? g.toLowerCase().includes(genre.toLowerCase())
            : (g.slug || g.name || '').toLowerCase().includes(genre.toLowerCase())
        );
      }
      return false;
    });
  }

  switch (sort) {
    case 'trending':
      list.sort(
        (a, b) =>
          (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0) ||
          (b.ratingScore || 0) - (a.ratingScore || 0)
      );
      break;
    case 'latest':
      list.sort(
        (a, b) =>
          (b.releaseYear || b.release_year || 0) -
          (a.releaseYear || a.release_year || 0)
      );
      break;
    case 'rating':
      list.sort(
        (a, b) =>
          (b.ratingScore || b.rating_avg || 0) -
          (a.ratingScore || a.rating_avg || 0)
      );
      break;
    case 'az':
      list.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      break;
  }

  const total = list.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginated = list.slice(offset, offset + limit);

  return NextResponse.json({
    data: paginated,
    items: paginated,
    total,
    page,
    limit,
    totalPages,
    total_pages: totalPages,
  });
}
