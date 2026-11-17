import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();

    // 1. Get session user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uid = session.user.id;
    const body = await req.json();
    const { contentId, episodeId } = body;

    if (!contentId) {
      return NextResponse.json({ error: 'contentId is required' }, { status: 400 });
    }

    // 2. Fetch content
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('*')
      .eq('id', contentId)
      .single();

    if (contentError || !content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // 3. Check license
    const { data: license, error: licenseError } = await supabase
      .from('licenses')
      .select('*')
      .eq('content_id', contentId)
      .eq('is_active', true)
      .or('expiry_date.is.null,expiry_date.gt.' + new Date().toISOString())
      .maybeSingle();

    if (licenseError || !license) {
      return NextResponse.json({ error: 'no_valid_license', message: 'No valid license for this content.' }, { status: 403 });
    }

    // 4. If content is adult, check age verification
    if (content.is_adult) {
      const { data: ageVerification } = await supabase
        .from('age_verifications')
        .select('*')
        .eq('user_id', uid)
        .eq('is_verified', true)
        .maybeSingle();

      if (!ageVerification) {
        return NextResponse.json({ error: 'age_verification_required', message: 'Age verification required to watch this content.' }, { status: 403 });
      }
    }

    // 5. Fetch video_asset
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

    // 6. No video asset
    if (!videoAsset) {
      return NextResponse.json(
        { error: 'no_video_configured', message: 'Video infrastructure not yet configured for this title. Please contact support.' },
        { status: 404 }
      );
    }

    // 7. Create playback session
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

    // 8. Return playback info
    return NextResponse.json({
      sessionToken,
      hlsUrl: videoAsset.hls_url,
      dashUrl: videoAsset.dash_url,
      drmConfig: videoAsset.drm_config,
      subtitles: [],
      audioTracks: [],
      expiresAt,
    });
  } catch (err) {
    console.error('Playback authorize error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
