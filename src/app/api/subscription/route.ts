import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// GET /api/subscription — get user's current subscription
export async function GET(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*, plan:plan_id(*)') 
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({ subscription: subscription || null });
  } catch {
    return NextResponse.json({ subscription: null, message: 'DB not configured' });
  }
}
