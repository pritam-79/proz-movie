import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = createSupabaseAdminClient();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';
  try {
    let query = supabase.from('content_import_jobs').select('*, provider:provider_id(name, type)').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ data: data || [] });
  } catch {
    return NextResponse.json({ data: [], message: 'DB not configured' });
  }
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseAdminClient();
  try {
    const body = await req.json();
    const { provider_id, external_id, title, raw_data } = body;
    if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 });
    const { data, error } = await supabase.from('content_import_jobs').insert({
      provider_id: provider_id || null,
      external_id: external_id || null,
      title,
      raw_data: raw_data || {},
      status: 'pending',
    }).select().single();
    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Create failed', db_required: true }, { status: 500 });
  }
}
