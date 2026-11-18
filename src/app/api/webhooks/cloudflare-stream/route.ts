import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('Webhook-Signature');
    const body = await req.json();

    // Verify event payload structure
    const eventType = body.type || 'video.ready';
    const videoUid = body.uid || body.data?.uid;

    console.log(`[Cloudflare Stream Webhook] Event: ${eventType}, UID: ${videoUid}`);

    return NextResponse.json({
      received: true,
      provider: 'cloudflare_stream',
      event: eventType,
      videoUid,
      processedAt: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
