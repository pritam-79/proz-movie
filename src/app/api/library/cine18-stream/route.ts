import { NextRequest, NextResponse } from 'next/server';
import { cine18Adapter, normalizeCdnStreamUrl } from '@/lib/providers/cine18';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid') || searchParams.get('id');

  if (!uid) {
    return NextResponse.json({ error: 'Missing video uid' }, { status: 400 });
  }

  const cleanUid = uid.replace(/^cine18-/, '');

  try {
    const details = await cine18Adapter.getVideoDetails(cleanUid);

    if (!details) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const videos = details.videos || [];
    const playableVideos = videos
      .map((v) => ({
        ...v,
        video_link: normalizeCdnStreamUrl(v.video_link),
      }))
      .filter((v) => Boolean(v.video_link));

    const firstVideo = playableVideos[0];

    if (!firstVideo?.video_link) {
      return NextResponse.json(
        {
          success: false,
          error: 'Upstream channel did not supply a playable video source URL for this entry.',
          uid: cleanUid,
          title: details.title,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      id: `cine18-${cleanUid}`,
      uid: cleanUid,
      title: details.title,
      description: details.description || details.preview_text || '',
      poster: details.portrait_img,
      backdrop: details.banner_img || details.portrait_img,
      rating: details.rating || 8.0,
      tags: details.tags,
      cast: details.cast,
      language: details.language,
      streamUrl: normalizeCdnStreamUrl(firstVideo?.video_link),
      episodes: playableVideos.map((v, idx) => ({
        id: v.uid,
        episodeNumber: idx + 1,
        title: v.name || `Episode ${idx + 1}`,
        streamUrl: v.video_link,
        thumbnailUrl: v.thumbnail || details.banner_img || details.portrait_img,
      })),
    });
  } catch (err: any) {
    console.error('[Cine18StreamAPI] Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch video stream', details: err.message },
      { status: 500 }
    );
  }
}
