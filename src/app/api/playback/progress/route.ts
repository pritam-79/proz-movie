import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uid = session.user.id;
    const body = await req.json();
    const { contentId, episodeId, progressSeconds, durationSeconds } = body;

    if (!contentId) {
      return NextResponse.json({ error: 'contentId is required' }, { status: 400 });
    }

    const completed = durationSeconds > 0 ? (progressSeconds / durationSeconds > 0.9) : false;

    const { error } = await supabase
      .from('watch_history')
      .upsert(
        {
          user_id: uid,
          content_id: contentId,
          episode_id: episodeId || null,
          progress_seconds: progressSeconds,
          duration_seconds: durationSeconds,
          last_watched_at: new Date().toISOString(),
          completed,
        },
        { onConflict: 'user_id,content_id,episode_id' }
      );

    if (error) {
      return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
    }

    return NextResponse.json({ saved: true });
  } catch (err) {
    console.error('Playback progress error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
