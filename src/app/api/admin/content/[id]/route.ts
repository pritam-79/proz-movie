import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

// GET /api/admin/content/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createSupabaseAdminClient();
  try {
    const { data, error } = await supabase.from('content').select('*, genres:content_genres(genre:genres(*)), seasons(*), video_assets(*), licenses(*)').eq('id', params.id).single();
    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'DB not configured' }, { status: 500 });
  }
}

// PUT /api/admin/content/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createSupabaseAdminClient();
  try {
    const body = await req.json();
    const { data, error } = await supabase.from('content').update({ ...body, updated_at: new Date().toISOString() }).eq('id', params.id).select().single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 });
  }
}

// DELETE /api/admin/content/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createSupabaseAdminClient();
  try {
    const { error } = await supabase.from('content').delete().eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ deleted: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Delete failed' }, { status: 500 });
  }
}
