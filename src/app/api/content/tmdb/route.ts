import { NextRequest, NextResponse } from 'next/server';
import { getNormalizedMockContent } from '@/lib/data/mockContent';

const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'trending';
  const query = searchParams.get('query') || '';
  const type = searchParams.get('type') || 'movie';
  const id = searchParams.get('id');

  // If TMDB API Key is configured in environment, attempt live TMDB API query
  if (TMDB_API_KEY && TMDB_API_KEY !== 'your_tmdb_api_key_here') {
    try {
      let endpoint = '';
      if (action === 'search' && query) {
        endpoint = `${TMDB_BASE_URL}/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`;
      } else if (action === 'popular') {
        endpoint = `${TMDB_BASE_URL}/${type}/popular?api_key=${TMDB_API_KEY}&page=1`;
      } else if (action === 'details' && id) {
        endpoint = `${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`;
      } else {
        endpoint = `${TMDB_BASE_URL}/trending/${type}/day?api_key=${TMDB_API_KEY}`;
      }

      const res = await fetch(endpoint, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (err) {
      console.warn('Live TMDB API fetch fell back to curated repository:', err);
    }
  }

  // Curated Fallback with high-res TMDB poster URLs
  const all = getNormalizedMockContent();

  if (action === 'search' && query) {
    const q = query.toLowerCase();
    const results = all.filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.synopsis?.toLowerCase().includes(q) ||
      (Array.isArray(c.genres) && c.genres.some((g: any) => (typeof g === 'string' ? g : g.name).toLowerCase().includes(q)))
    );
    return NextResponse.json({ results, total_results: results.length });
  }

  if (action === 'popular') {
    const results = all.slice(0, 15);
    return NextResponse.json({ results, total_results: results.length });
  }

  if (action === 'details' && id) {
    const match = all.find(c => c.id === id || String(c.tmdb_id) === id || c.slug === id);
    if (match) return NextResponse.json(match);
    return NextResponse.json({ error: 'Title not found' }, { status: 404 });
  }

  // Default: trending
  const trending = all.filter(c => c.isTrending);
  return NextResponse.json({ results: trending, total_results: trending.length });
}
