import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const muxSignature = req.headers.get('mux-signature');
    const body = await req.json();

    const eventType = body.type || 'video.asset.ready';
    const assetId = body.data?.id;

    console.log(`[Mux Webhook] Event: ${eventType}, Asset: ${assetId}`);

    return NextResponse.json({
      received: true,
      provider: 'mux',
      event: eventType,
      assetId,
      processedAt: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
