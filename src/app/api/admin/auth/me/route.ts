import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const SECRET = process.env.JWT_PLAYBACK_SECRET || 'proz-admin-session-signing-secret-key-32chars';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('proz_admin_session')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const [b64Payload, signature] = token.split('.');
    if (!b64Payload || !signature) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const expectedSig = crypto.createHmac('sha256', SECRET).update(b64Payload).digest('base64url');
    if (signature !== expectedSig) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf8'));

    // Check expiration (12 hours)
    if (Date.now() - payload.timestamp > 12 * 60 * 60 * 1000) {
      return NextResponse.json({ authenticated: false, message: 'Session expired' }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        email: payload.email,
        role: payload.role,
      },
    });
  } catch (err) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
