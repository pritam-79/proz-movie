import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getNormalizedMockContent } from '@/lib/data/mockContent';
import { cine18Adapter } from '@/lib/providers/cine18';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contentId, episodeId, is18PlusVerified } = body;

    if (!contentId) {
      return NextResponse.json({ error: 'contentId is required' }, { status: 400 });
    }

    // Handle Cine18 direct streaming playback
    if (contentId.startsWith('cine18-')) {
      const cleanUid = contentId.replace('cine18-', '');
      const details = await cine18Adapter.getVideoDetails(cleanUid);
      let streamUrl = details?.videos?.[0]?.video_link || '';
      
      if (episodeId && details?.videos) {
        const found = details.videos.find((v: any) => v.uid === episodeId);
        if (found) streamUrl = found.video_link;
      }

      const sessionToken = `proz_cine18_sess_${Date.now()}`;
      const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();

      return NextResponse.json({
        session: { token: sessionToken },
        sessionToken,
        hlsUrl: null,
        dashUrl: null,
        fallbackMp4: streamUrl,
        drmConfig: null,
        subtitles: [],
        audioTracks: [],
        expiresAt
      });
    }

    // Handle v0.02 Stash Private Vault & P2P Stream Authorization
    if (contentId.startsWith('stash-')) {
      if (!is18PlusVerified) {
        return NextResponse.json({
          error: 'age_verification_required',
          message: 'Adult Zone PIN or Age Verification required to access this title.',
          code: 'AGE_VERIFICATION_REQUIRED'
        }, { status: 403 });
      }

      const sessionToken = `proz_stash_sess_${Date.now()}`;
      const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

      return NextResponse.json({
        session: { token: sessionToken },
        sessionToken,
        hlsUrl: null,
        dashUrl: null,
        fallbackMp4: `/api/library/stash/proxy-stream?id=${contentId.replace('stash-', '')}`,
        drmConfig: null,
        subtitles: [],
        audioTracks: [],
        expiresAt
      });
    }

    if (contentId.startsWith('p2p-')) {
      const sessionToken = `proz_p2p_sess_${Date.now()}`;
      const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

      return NextResponse.json({
        session: { token: sessionToken },
        sessionToken,
        hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        dashUrl: 'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd',
        fallbackMp4: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4',
        drmConfig: {
          keySystems: {
            'org.w3.clearkey': {
              clearKeys: {
                'nrQFDeRLSAKTLAvxUFRUiA': 'K8D899RhTJL6zpdMGHeTurnA'
              }
            }
          }
        },
        subtitles: [],
        audioTracks: [],
        expiresAt
      });
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

    // Dynamic remote metadata IDs (AniList, Kitsu, TVmaze, TMDB) authorize directly
    if (
      contentId.startsWith('anilist-') ||
      contentId.startsWith('kitsu-') ||
      contentId.startsWith('tvmaze-') ||
      contentId.startsWith('tmdb-')
    ) {
      const sessionToken = `proz_dynamic_sess_${Date.now()}`;
      return NextResponse.json({
        session: { token: sessionToken },
        sessionToken,
        hlsUrl: null,
        dashUrl: null,
        fallbackMp4: null,
        drmConfig: null,
        subtitles: [],
        audioTracks: [],
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Fallback: mock content authorization
    const mockContent = getNormalizedMockContent();
    const match = mockContent.find((c) => c.id === contentId || String(c.tmdb_id) === contentId || c.slug === contentId);

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

    const isDash = match.dashUrl || 'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd';
    const isHls = match.streamUrl?.includes('.m3u8')
      ? match.streamUrl
      : 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8';
    const isMp4 = match.fallbackMp4?.endsWith('.mp4')
      ? match.fallbackMp4
      : 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4';

    return NextResponse.json({
      session: { token: sessionToken },
      sessionToken,
      hlsUrl: isHls,
      dashUrl: isDash,
      fallbackMp4: isMp4,
      drmConfig: {
        keySystems: {
          'com.widevine.alpha': {
            licenseServerUri: process.env.WIDEVINE_LICENSE_URL || 'https://cwip-shaka-drm.appspot.com/no_auth'
          },
          'org.w3.clearkey': {
            clearKeys: {
              'nrQFDeRLSAKTLAvxUFRUiA': 'K8D899RhTJL6zpdMGHeTurnA'
            }
          }
        }
      },
      subtitles: match.subtitles || [
        { label: 'English', language: 'en', src: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel-en.vtt' }
      ],
      audioTracks: match.audioTracks || [
        { label: 'English [Original]', language: 'en' },
        { label: 'Hindi [Dubbed]', language: 'hi' }
      ],
      expiresAt,
    });
  } catch (err) {
    console.error('Playback authorize error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
