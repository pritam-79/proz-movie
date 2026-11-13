import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CONTENT } from '@/lib/data/mockContent';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.toLowerCase().trim() || '';
  const type = searchParams.get('type'); // 'movie' or 'series'
  const category = searchParams.get('category');
  const genre = searchParams.get('genre')?.toLowerCase();
  const year = searchParams.get('year');
  const sort = searchParams.get('sort') || 'trending';

  let results = [...MOCK_CONTENT];

  // 1. Text Search across Title, Cast, Crew, Synopsis, Genres
  if (q) {
    results = results.filter(item => {
      const matchTitle = item.title.toLowerCase().includes(q) || item.originalTitle?.toLowerCase().includes(q);
      const matchSynopsis = item.synopsis.toLowerCase().includes(q);
      const matchGenres = item.genres.some(g => g.toLowerCase().includes(q));
      const matchCast = item.cast.some(c => c.name.toLowerCase().includes(q) || c.character.toLowerCase().includes(q));
      const matchCrew = item.crew.some(cr => cr.name.toLowerCase().includes(q));
      return matchTitle || matchSynopsis || matchGenres || matchCast || matchCrew;
    });
  }

  // 2. Filter by Type
  if (type && type !== 'all') {
    results = results.filter(item => item.type === type);
  }

  // 3. Filter by Category
  if (category && category !== 'all') {
    results = results.filter(item => item.category === category);
  }

  // 4. Filter by Genre
  if (genre && genre !== 'all') {
    results = results.filter(item => 
      item.genres.some(g => g.toLowerCase().replace(/[^a-z0-9]/g, '') === genre.replace(/[^a-z0-9]/g, ''))
    );
  }

  // 5. Filter by Year
  if (year && year !== 'all') {
    results = results.filter(item => item.releaseYear.toString() === year);
  }

  // 6. Sorting
  if (sort === 'trending') {
    results.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
  } else if (sort === 'rating') {
    results.sort((a, b) => b.ratingScore - a.ratingScore);
  } else if (sort === 'latest') {
    results.sort((a, b) => b.releaseYear - a.releaseYear);
  } else if (sort === 'title') {
    results.sort((a, b) => a.title.localeCompare(b.title));
  }

  return NextResponse.json({
    total: results.length,
    results
  });
}
