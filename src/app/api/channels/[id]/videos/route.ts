import { NextRequest, NextResponse } from 'next/server';
import { getChannelById } from '@/lib/data/channelsData';
import { cine18Adapter, Cine18RawVideoItem } from '@/lib/providers/cine18';
import { ContentItem } from '@/types/content';

export const dynamic = 'force-dynamic';

function mapVideosToContent(
  videos: Cine18RawVideoItem[],
  channel?: { logo?: string; bannerUrl?: string; category?: string }
): ContentItem[] {
  return videos.map((v) => ({
    id: `cine18-${v.uid}`,
    slug: `cine18-${v.uid}`,
    title: v.title.trim(),
    original_title: v.title.trim(),
    overview: v.description || v.preview_text || `Watch ${v.title} on PROZ MOVIE`,
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
    genres: v.tags ? v.tags.split(',').map((t) => t.trim()).filter(Boolean) : ['Web Series', 'Drama'],
    language: v.language?.trim() || 'Hindi',
    is_adult:
      channel?.category === '18+ Exclusive' ||
      Boolean(v.tags?.toLowerCase().includes('nude') || v.tags?.toLowerCase().includes('18+')),
    isRestricted18Plus:
      channel?.category === '18+ Exclusive' ||
      Boolean(v.tags?.toLowerCase().includes('nude') || v.tags?.toLowerCase().includes('18+')),
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
            streamUrl: `/watch/cine18-${v.uid}`,
          },
        ],
      },
    ],
  }));
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const channelSlug = decodeURIComponent(params.id);
  const channel = getChannelById(channelSlug);

  try {
    let cine18Uid = channel?.channelUid;

    if (!cine18Uid && /^[a-z0-9]{4,8}$/i.test(channelSlug)) {
      cine18Uid = channelSlug;
    }

    if (!cine18Uid && channelSlug.includes('-')) {
      const trailingUid = channelSlug.split('-').pop();
      if (trailingUid && /^[a-z0-9]{4}$/i.test(trailingUid)) {
        cine18Uid = trailingUid;
      }
    }

    if (!cine18Uid) {
      const matched = await cine18Adapter.getChannelByUidOrName(channel?.name || channelSlug);
      if (matched) {
        cine18Uid = matched.uid;
      }
    }

    if (cine18Uid) {
      const { channel: cMeta, videos, totalVideos } = await cine18Adapter.getChannelDetailsAndVideos(
        cine18Uid
      );

      if (videos && videos.length > 0) {
        // Deduplicate & verify first video link if needed; exclude known empty placeholder cards
        const seenV = new Set<string>();
        const uniqueVideos = videos.filter((v) => {
          if (!v?.uid || seenV.has(v.uid)) return false;
          seenV.add(v.uid);
          return true;
        });

        return NextResponse.json({
          success: true,
          channelUid: cine18Uid,
          channelName: cMeta?.name || channel?.name || channelSlug,
          channelLogo: cMeta?.image || channel?.logo,
          totalVideos: totalVideos || uniqueVideos.length,
          videos: mapVideosToContent(uniqueVideos, channel),
        });
      }

      return NextResponse.json({
        success: false,
        channelUid: cine18Uid,
        channelName: cMeta?.name || channel?.name || channelSlug,
        channelLogo: cMeta?.image || channel?.logo,
        totalVideos: 0,
        error: 'Upstream provider currently supplies 0 playable videos for this channel.',
        videos: [],
      });
    }

    return NextResponse.json(
      {
        success: false,
        channelName: channel?.name || channelSlug,
        totalVideos: 0,
        error: 'Channel provider integration could not be matched to an active stream feed.',
        videos: [],
      },
      { status: 404 }
    );
  } catch (err: any) {
    console.error('[ChannelVideosAPI] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch channel videos', details: err.message },
      { status: 500 }
    );
  }
}
