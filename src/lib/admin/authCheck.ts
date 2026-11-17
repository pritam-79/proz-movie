import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';

const SECRET = process.env.JWT_PLAYBACK_SECRET || 'proz-admin-session-signing-secret-key-32chars';

export async function validateAdminRequest(req: NextRequest): Promise<boolean> {
  // 1. Check signed proz_admin_session cookie
  const token = req.cookies.get('proz_admin_session')?.value;
  if (token) {
    const [b64Payload, signature] = token.split('.');
    if (b64Payload && signature) {
      const expectedSig = crypto.createHmac('sha256', SECRET).update(b64Payload).digest('base64url');
      if (signature === expectedSig) {
        try {
          const payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf8'));
          if (Date.now() - payload.timestamp < 12 * 60 * 60 * 1000) {
            return true;
          }
        } catch {
          // ignore parsing error
        }
      }
    }
  }

  // 2. Check Supabase session if configured
  try {
    const supabase = createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const adminClient = createSupabaseAdminClient();
      const { data: adminUser } = await adminClient
        .from('admin_users')
        .select('*')
        .eq('id', session.user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (adminUser) return true;
    }
  } catch {
    // Supabase unconfigured or offline
  }

  return false;
}
