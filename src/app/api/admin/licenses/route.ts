import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = createSupabaseAdminClient();
  try {
    const { data, error } = await supabase
      .from('licenses')
      .select('*, content:content_id(title, content_type)')
      .order('expiry_date', { ascending: true });
    if (error) throw error;

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const withStatus = (data || []).map((lic: any) => ({
      ...lic,
      is_expired: lic.expiry_date && new Date(lic.expiry_date) < now,
      is_expiring_soon: lic.expiry_date && new Date(lic.expiry_date) < thirtyDaysFromNow && new Date(lic.expiry_date) >= now,
    }));

    return NextResponse.json({ data: withStatus });
  } catch {
    return NextResponse.json({ data: [], message: 'DB not configured' });
  }
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseAdminClient();
  try {
    const body = await req.json();
    const { content_id, rights_holder, distributor, licence_ref, start_date, expiry_date, territories, streaming_permitted, age_classification } = body;
    if (!content_id) return NextResponse.json({ error: 'content_id required' }, { status: 400 });
    const { data, error } = await supabase.from('licenses').insert({
      content_id, rights_holder, distributor, licence_ref, start_date, expiry_date,
      territories: territories || ['*'], streaming_permitted: streaming_permitted !== false,
      age_classification, is_active: true,
    }).select().single();
    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Create failed', db_required: true }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const supabase = createSupabaseAdminClient();
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const { data, error } = await supabase.from('licenses').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 });
  }
}
