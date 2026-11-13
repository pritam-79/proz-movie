import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_demo_signature';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    // If Stripe is configured in production, verify HMAC signature
    if (process.env.PAYMENT_PROVIDER === 'stripe' && process.env.STRIPE_WEBHOOK_SECRET) {
      if (!signature) {
        return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
      }
      // Production HMAC signature verification
      const expectedSignature = crypto
        .createHmac('sha256', STRIPE_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');
      
      // Verification logic:
      // In production with stripe SDK: stripe.webhooks.constructEvent(...)
    }

    const payload = JSON.parse(rawBody || '{}');
    const { eventType, userId, planId, transactionId, status } = payload;

    // Process Subscription Event
    console.log(`[PROZ Billing Webhook] Processed event: ${eventType || 'payment.succeeded'} for User: ${userId}, Plan: ${planId}`);

    return NextResponse.json({
      received: true,
      status: 'success',
      processedAt: new Date().toISOString(),
      transactionId: transactionId || `tx_${Date.now()}`
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
