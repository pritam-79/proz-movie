import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getNormalizedMockContent } from '@/lib/data/mockContent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contentId, episodeId, is18PlusVerified } = body;

    if (!contentId) {
      return NextResponse.json({ error: 'contentId is required' }, { status: 400 });
    }

    // Attempt Supabase authorization if available
    try {
      const supabase = createSupabaseServerClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const uid = session.user.id;

        const { data: content } = await supabase
          .from('content')
          .select('*')
          .eq('id', contentId)
          .single();

        if (content) {
          if (content.is_adult) {
            const { data: ageVerification } = await supabase
              .from('age_verifications')
              .select('*')
              .eq('user_id', uid)
              .eq('is_verified', true)
              .maybeSingle();

            if (!ageVerification && !is18PlusVerified) {
              return NextResponse.json({
                error: 'age_verification_required',
                message: 'Age verification required to watch 18+ content.',
                code: 'AGE_RESTRICTED'
              }, { status: 403 });
            }
          }

          let videoAssetQuery = supabase
            .from('video_assets')
            .select('*')
            .eq('content_id', contentId);

          if (episodeId) {
            videoAssetQuery = videoAssetQuery.eq('episode_id', episodeId);
          } else {
            videoAssetQuery = videoAssetQuery.is('episode_id', null);
          }

          const { data: videoAsset } = await videoAssetQuery.maybeSingle();

          if (videoAsset) {
            const sessionToken = crypto.randomUUID();
            const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

            await supabase.from('playback_sessions').insert({
              id: sessionToken,
              user_id: uid,
              content_id: contentId,
              episode_id: episodeId || null,
              video_asset_id: videoAsset.id,
              expires_at: expiresAt,
            });

            return NextResponse.json({
              session: { token: sessionToken },
              sessionToken,
              hlsUrl: videoAsset.hls_url,
              dashUrl: videoAsset.dash_url,
              drmConfig: videoAsset.drm_config,
              subtitles: [],
              audioTracks: [],
              expiresAt,
            });
          }
        }
      }
    } catch (e) {
      console.warn('Supabase playback authorization fell back:', e);
    }

    // Fallback: mock content authorization
    const mockContent = getNormalizedMockContent();
    const match = mockContent.find((c) => c.id === contentId || c.slug === contentId);

    if (!match) {
      return NextResponse.json({
        error: 'Content not found',
        message: 'The requested video title could not be located in our catalog.'
      }, { status: 404 });
    }

    if (match.isRestricted18Plus && !is18PlusVerified) {
      return NextResponse.json({
        error: 'age_verification_required',
        message: 'Adult Zone PIN or Age Verification required to access this title.',
        code: 'AGE_RESTRICTED'
      }, { status: 403 });
    }

    const sessionToken = `proz_demo_session_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();

    return NextResponse.json({
      session: { token: sessionToken },
      sessionToken,
      hlsUrl: match.streamUrl || 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      dashUrl: match.dashUrl || 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd',
      fallbackMp4: match.fallbackMp4 || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      drmConfig: null,
      subtitles: match.subtitles || [],
      audioTracks: match.audioTracks || [],
      expiresAt,
    });
  } catch (err) {
    console.error('Playback authorize error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
