import { NextRequest, NextResponse } from 'next/server';
import { getChannelById } from '@/lib/data/channelsData';
import { cine18Adapter } from '@/lib/providers/cine18';
import { ContentItem } from '@/types/content';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const channelSlug = params.id;
  const channel = getChannelById(channelSlug);

  try {
    // 1. Try to match with Cine18
    let cine18Uid = channel?.channelUid;
    
    if (!cine18Uid) {
      const matched = await cine18Adapter.getChannelByUidOrName(channel?.name || channelSlug);
      if (matched) {
        cine18Uid = matched.uid;
      }
    }

    if (cine18Uid) {
      const { channel: cMeta, videos, totalVideos } = await cine18Adapter.getChannelDetailsAndVideos(cine18Uid);
      
      if (videos && videos.length > 0) {
        const items: ContentItem[] = videos.map((v) => ({
          id: `cine18-${v.uid}`,
          slug: `cine18-${v.uid}`,
          title: v.title.trim(),
          original_title: v.title.trim(),
          overview: v.description || v.preview_text || `Watch ${v.title} on PRO2 ENTERTAINMENT`,
          poster_url: v.portrait_img || channel?.logo || '',
          backdrop_url: v.banner_img || v.portrait_img || channel?.bannerUrl || channel?.logo || '',
          posterUrl: v.portrait_img || channel?.logo || '',
          backdropUrl: v.banner_img || v.portrait_img || channel?.bannerUrl || channel?.logo || '',
          content_type: (v.type?.toLowerCase().includes('movie') ? 'movie' : 'series') as any,
          type: (v.type?.toLowerCase().includes('movie') ? 'movie' : 'series') as any,
          release_date: v.created_at || '2026-01-01',
          release_year: v.created_at ? new Date(v.created_at).getFullYear() : 2026,
          rating_avg: v.rating || 8.0,
          vote_average: v.rating || 8.0,
          ratingScore: v.rating || 8.0,
          genres: v.tags ? v.tags.split(',').map((t) => t.trim()) : ['Web Series', 'Drama'],
          language: v.language?.trim() || 'Hindi',
          is_adult: channel?.category === '18+ Exclusive' || Boolean(v.tags?.toLowerCase().includes('nude') || v.tags?.toLowerCase().includes('18+')),
          isRestricted18Plus: channel?.category === '18+ Exclusive' || Boolean(v.tags?.toLowerCase().includes('nude') || v.tags?.toLowerCase().includes('18+')),
          available_qualities: ['1080p', '720p', '480p'],
          is_featured: false,
          is_trending: true,
          seasons: [
            {
              id: `season-1-${v.uid}`,
              seasonNumber: 1,
              title: 'Season 1',
              episodes: [
                {
                  id: `ep-${v.uid}`,
                  episodeNumber: 1,
                  title: v.title,
                  duration: 25,
                  thumbnailUrl: v.banner_img || v.portrait_img,
                  streamUrl: `/watch/cine18-${v.uid}`
                }
              ]
            }
          ]
        }));

        return NextResponse.json({
          channelUid: cine18Uid,
          channelName: cMeta?.name || channel?.name,
          channelLogo: cMeta?.image || channel?.logo,
          totalVideos,
          videos: items,
        });
      }
    }

    // 2. Fallback to empty if not found
    return NextResponse.json({
      channelUid: null,
      channelName: channel?.name || channelSlug,
      totalVideos: 0,
      videos: [],
    });
  } catch (err: any) {
    console.error('[ChannelVideosAPI] Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch channel videos', details: err.message },
      { status: 500 }
    );
  }
}
