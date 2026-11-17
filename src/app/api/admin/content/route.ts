import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

async function checkAdmin(req: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient();
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return null;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    const { data: admin } = await supabase.from('admin_users').select('role').eq('id', user.id).single();
    return admin ? user : null;
  } catch {
    return null;
  }
}

// GET /api/admin/content — list all content (admin)
export async function GET(req: NextRequest) {
  const supabase = createSupabaseAdminClient();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const search = searchParams.get('search') || '';
  const type = searchParams.get('type') || '';
  const offset = (page - 1) * limit;

  try {
    let query = supabase.from('content').select('*', { count: 'exact' });
    if (search) query = query.ilike('title', `%${search}%`);
    if (type) query = query.eq('content_type', type);
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ data: data || [], total: count || 0, page, limit });
  } catch (err) {
    // Return empty when DB not configured
    return NextResponse.json({ data: [], total: 0, page: 1, limit, message: 'Database not configured' });
  }
}

// POST /api/admin/content — create new content (admin)
export async function POST(req: NextRequest) {
  const supabase = createSupabaseAdminClient();
  try {
    const body = await req.json();
    const { title, content_type, category, description, release_year, age_rating,
            poster_url, backdrop_url, is_featured, is_adult, language } = body;

    if (!title || !content_type) {
      return NextResponse.json({ error: 'title and content_type are required' }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { data, error } = await supabase.from('content').insert({
      title, content_type, category, description, release_year, age_rating,
      poster_url, backdrop_url, is_featured: is_featured || false,
      is_adult: is_adult || false, language,
      slug: `${slug}-${Date.now()}`,
      is_published: false,
      ingestion_status: 'manual',
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create content', db_required: true }, { status: 500 });
  }
}
