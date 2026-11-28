import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getNormalizedMockContent } from '@/lib/data/mockContent';
import { getAllChannels } from '@/lib/data/channelsData';
import { stashService } from '@/lib/services/stashService';
import { getAiAdultVideosCatalog } from '@/lib/providers/aiAdultVideos';

export async function GET(req: NextRequest) {
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

  try {
    const supabase = createSupabaseServerClient();
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

    if (!error && results && results.length > 0) {
      const suggestions = results.slice(0, 5).map((r: any) => r.title);
      return NextResponse.json({
        results,
        total: count ?? results.length,
        suggestions,
      });
    }
  } catch (err) {
    console.warn('Supabase search fell back to mock repository:', err);
  }

  // Fallback: search mock content repository
  const lowerQ = q.toLowerCase();
  let list = getNormalizedMockContent().filter((item) => {
    if (item.isRestricted18Plus || item.is_adult) return false;
    const matchTitle = item.title.toLowerCase().includes(lowerQ);
    const matchSynopsis = item.synopsis?.toLowerCase().includes(lowerQ);
    const matchCast = item.cast?.some((c) => c.name.toLowerCase().includes(lowerQ));
    const matchGenre = Array.isArray(item.genres) && item.genres.some((g: any) =>
      typeof g === 'string' ? g.toLowerCase().includes(lowerQ) : g.name?.toLowerCase().includes(lowerQ)
    );
    return matchTitle || matchSynopsis || matchCast || matchGenre;
  });

  if (type) {
    list = list.filter((item) => item.type === type || item.content_type === type);
  }

  if (category) {
    list = list.filter((item) => item.category === category);
  }

  if (year) {
    const yr = parseInt(year, 10);
    list = list.filter((item) => (item.releaseYear || item.release_year) === yr);
  }

  const total = list.length;
  const paginated = list.slice(offset, offset + limit);
  const suggestions = paginated.slice(0, 5).map((r) => r.title);

  // Extended cross-catalog search (Channels + optional 18+ Performers / Studios / Galleries / VR / AI Videos)
  const matchingChannels = getAllChannels()
    .filter((ch) => ch.name.toLowerCase().includes(lowerQ) || ch.category.toLowerCase().includes(lowerQ))
    .slice(0, 6)
    .map((ch) => ({ id: ch.id, name: ch.name, category: ch.category, href: `/live` }));

  const includeRestricted = searchParams.get('include18') === '1';
  let extended: Record<string, any[]> = { channels: matchingChannels };
  if (includeRestricted) {
    const [performers, vrRes, aiRes, galRes] = await Promise.all([
      stashService.getPerformersDirectory({ q, page: 1 }).catch(() => []),
      stashService.getVrCatalog({ q, page: 1 }).catch(() => ({ scenes: [] })),
      getAiAdultVideosCatalog({ q, page: 1 }).catch(() => ({ items: [] })),
      stashService.getPhotoGalleries('All', 1).catch(() => ({ galleries: [] })),
    ]);
    extended = {
      channels: matchingChannels,
      performers: performers.slice(0, 6).map((p) => ({ id: p.id, name: p.name, image: p.image, href: '/restricted' })),
      vr: vrRes.scenes.slice(0, 6).map((v) => ({ id: v.id, title: v.title, href: v.watchHref || '/restricted' })),
      aiVideos: aiRes.items.slice(0, 6).map((a) => ({ id: a.id, title: a.title, href: a.watchHref })),
      galleries: galRes.galleries
        .filter((g) => g.title.toLowerCase().includes(lowerQ))
        .slice(0, 6)
        .map((g) => ({ id: g.id, title: g.title, href: '/restricted' })),
    };
  }

  return NextResponse.json({
    results: paginated,
    total,
    suggestions,
    extended,
  });
}
