import { NextResponse } from 'next/server';
import { cine18Adapter } from '@/lib/providers/cine18';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch from high-volume adult channels in parallel
    const [ullu, bharti, newSensations, familyXxx] = await Promise.all([
      cine18Adapter.getChannelDetailsAndVideos('z62v'), // Ullu (263 titles)
      cine18Adapter.getChannelDetailsAndVideos('v35i'), // Bharti Jha (18 titles)
      cine18Adapter.getChannelDetailsAndVideos('m67a'), // New Sensations (76 titles)
      cine18Adapter.getChannelDetailsAndVideos('f94s'), // Family XXX (62 titles)
    ]);

    // Map Ullu & Bharti Jha to web series
    const series = [...(ullu.videos || []), ...(bharti.videos || [])].map((v) => ({
      id: `cine18-${v.uid}`,
      title: v.title.trim(),
      details: v.description || v.preview_text || 'Hot Web Series Episode',
      rating: v.rating || 8.4,
      banner: v.banner_img || v.portrait_img,
      poster: v.portrait_img || v.banner_img,
      type: v.type || 'Web Series',
      channel: v.channel_uid === 'z62v' ? 'Ullu' : 'Bharti Jha',
      streamUrl: `/watch/cine18-${v.uid}`,
    }));

    // Map New Sensations & Family XXX to movies / scenes
    const movies = [...(newSensations.videos || []), ...(familyXxx.videos || [])].map((v) => ({
      id: `cine18-${v.uid}`,
      title: v.title.trim(),
      details: v.description || v.preview_text || 'Adult Feature Film',
      rating: v.rating || 8.6,
      banner: v.banner_img || v.portrait_img,
      poster: v.portrait_img || v.banner_img,
      type: v.type || 'Adult Movie',
      channel: v.channel_uid === 'm67a' ? 'New Sensations' : 'Family XXX',
      streamUrl: `/watch/cine18-${v.uid}`,
    }));

    return NextResponse.json({
      success: true,
      totalCount: series.length + movies.length,
      series: series.slice(0, 36),
      movies: movies.slice(0, 36),
    });
  } catch (err: any) {
    console.error('[AdultContentAPI] Error fetching adult content:', err);
    return NextResponse.json(
      { success: false, error: err.message, series: [], movies: [] },
      { status: 500 }
    );
  }
}
