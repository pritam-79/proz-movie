import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, contentId, episodeId, progressSeconds, totalDurationSeconds } = body;

    if (!token || !contentId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // In production with connected Supabase, update watch_history table.
    // For local dev, acknowledge progress successfully.
    return NextResponse.json({
      success: true,
      saved: {
        contentId,
        episodeId,
        progressSeconds,
        totalDurationSeconds,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record playback progress' }, { status: 500 });
  }
}
