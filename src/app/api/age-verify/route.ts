import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// GET /api/age-verify — check current user verification status
export async function GET(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ verified: false, reason: 'not_authenticated' });

    const { data } = await supabase.from('age_verifications').select('is_verified').eq('user_id', user.id).single();
    return NextResponse.json({ verified: data?.is_verified || false });
  } catch {
    return NextResponse.json({ verified: false });
  }
}

// POST /api/age-verify — submit DOB for age verification
export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { dob } = await req.json();
    if (!dob) return NextResponse.json({ error: 'Date of birth required' }, { status: 400 });

    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      return NextResponse.json({ verified: false, error: 'underage', message: 'You must be 18 or older to access this content.' }, { status: 403 });
    }

    await supabase.from('age_verifications').upsert({
      user_id: user.id,
      method: 'dob',
      dob: dob,
      is_verified: true,
      verified_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    // Also update the profile
    await supabase.from('profiles').update({ age_verified: true }).eq('id', user.id);

    return NextResponse.json({ verified: true, age });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Verification failed' }, { status: 500 });
  }
}
