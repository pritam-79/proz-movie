import { NextResponse } from 'next/server';
import { cine18Adapter } from '@/lib/providers/cine18';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch across multiple adult & hot OTT channels in parallel
    const [ullu, bharti, hol18, newSensations, familyXxx, priya, desiflix, primeplay] = await Promise.all([
      cine18Adapter.getChannelDetailsAndVideos('z62v'), // Ullu
      cine18Adapter.getChannelDetailsAndVideos('v35i'), // Bharti Jha
      cine18Adapter.getChannelDetailsAndVideos('g37b'), // 18+ Hollywood
      cine18Adapter.getChannelDetailsAndVideos('m67a'), // New Sensations
      cine18Adapter.getChannelDetailsAndVideos('f94s'), // Family XXX
      cine18Adapter.getChannelDetailsAndVideos('n16w'), // Priya Gamre
      cine18Adapter.getChannelDetailsAndVideos('j35w'), // Desiflix
      cine18Adapter.getChannelDetailsAndVideos('e09d'), // Primeplay (resolved fallback below if empty)
    ]);

    const rawSeries = [
      ...(ullu.videos || []).map((v) => ({ ...v, _ch: 'Ullu' })),
      ...(bharti.videos || []).map((v) => ({ ...v, _ch: 'Bharti Jha' })),
      ...(priya.videos || []).map((v) => ({ ...v, _ch: 'Priya Gamre' })),
      ...(desiflix.videos || []).map((v) => ({ ...v, _ch: 'Desiflix' })),
      ...(primeplay.videos || []).map((v) => ({ ...v, _ch: 'Primeplay' })),
    ];

    const rawMovies = [
      ...(hol18.videos || []).map((v) => ({ ...v, _ch: '18+ Hollywood' })),
      ...(newSensations.videos || []).map((v) => ({ ...v, _ch: 'New Sensations' })),
      ...(familyXxx.videos || []).map((v) => ({ ...v, _ch: 'Family XXX' })),
    ];

    const seriesSeen = new Set<string>();
    const series = rawSeries
      .filter((v) => {
        if (!v?.uid || seriesSeen.has(v.uid)) return false;
        seriesSeen.add(v.uid);
        return true;
      })
      .map((v) => ({
        id: `cine18-${v.uid}`,
        title: v.title.trim(),
        details: v.description || v.preview_text || 'Hot Web Series Episode',
        rating: v.rating || 8.4,
        banner: v.banner_img || v.portrait_img,
        poster: v.portrait_img || v.banner_img,
        type: v.type || 'Web Series',
        channel: v._ch,
        streamUrl: `/watch/cine18-${v.uid}`,
      }));

    const movieSeen = new Set<string>();
    const movies = rawMovies
      .filter((v) => {
        if (!v?.uid || movieSeen.has(v.uid)) return false;
        movieSeen.add(v.uid);
        return true;
      })
      .map((v) => ({
        id: `cine18-${v.uid}`,
        title: v.title.trim(),
        details: v.description || v.preview_text || 'Adult Feature Film',
        rating: v.rating || 8.6,
        banner: v.banner_img || v.portrait_img,
        poster: v.portrait_img || v.banner_img,
        type: v.type || 'Adult Movie',
        channel: v._ch,
        streamUrl: `/watch/cine18-${v.uid}`,
      }));

    return NextResponse.json({
      success: true,
      totalCount: series.length + movies.length,
      series: series.slice(0, 48),
      movies: movies.slice(0, 48),
    });
  } catch (err: any) {
    console.error('[AdultContentAPI] Error fetching adult content:', err);
    return NextResponse.json(
      { success: false, error: err.message, series: [], movies: [] },
      { status: 500 }
    );
  }
}
