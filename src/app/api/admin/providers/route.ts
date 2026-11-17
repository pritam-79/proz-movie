import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = createSupabaseAdminClient();
  try {
    const { data, error } = await supabase.from('metadata_providers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ data: data || [] });
  } catch {
    return NextResponse.json({ data: [], message: 'DB not configured — connect Supabase to manage providers' });
  }
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseAdminClient();
  try {
    const body = await req.json();
    const { name, type, base_url, is_active, supported_types } = body;
    if (!name || !type) return NextResponse.json({ error: 'name and type required' }, { status: 400 });
    const { data, error } = await supabase.from('metadata_providers').insert({ name, type, base_url, is_active: is_active !== false, supported_types: supported_types || [] }).select().single();
    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Create failed', db_required: true }, { status: 500 });
  }
}
