import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const ADMIN_EMAIL = process.env.ADMIN_BOOTSTRAP_EMAIL || process.env.ADMIN_MASTER_EMAIL || 'admin@prozmovie.com';
const ADMIN_PASSWORD = process.env.ADMIN_BOOTSTRAP_PASSWORD || process.env.ADMIN_ACCESS_KEY || 'proz-admin-secure-passphrase-2026';
const SECRET = process.env.JWT_PLAYBACK_SECRET || 'proz-admin-session-signing-secret-key-32chars';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const emailMatch = email.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase();
    
    // Constant time comparison for password
    const expectedBuf = Buffer.from(ADMIN_PASSWORD);
    const providedBuf = Buffer.from(password);
    const passwordMatch = expectedBuf.length === providedBuf.length && crypto.timingSafeEqual(expectedBuf, providedBuf);

    if (!emailMatch || !passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid administrator credentials' },
        { status: 401 }
      );
    }

    // Generate signed admin session token: payload.signature
    const timestamp = Date.now();
    const payload = JSON.stringify({ email: ADMIN_EMAIL, role: 'super_admin', timestamp });
    const b64Payload = Buffer.from(payload).toString('base64url');
    const signature = crypto.createHmac('sha256', SECRET).update(b64Payload).digest('base64url');
    const token = `${b64Payload}.${signature}`;

    const res = NextResponse.json({
      success: true,
      user: {
        email: ADMIN_EMAIL,
        role: 'super_admin',
      },
    });

    res.cookies.set('proz_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12, // 12 hours
    });

    return res;
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
