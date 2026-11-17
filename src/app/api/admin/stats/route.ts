import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server';

async function checkAdmin(supabaseServer: ReturnType<typeof createSupabaseServerClient>) {
  const { data: { session } } = await supabaseServer.auth.getSession();
  if (!session) return null;

  const adminClient = createSupabaseAdminClient();
  const { data: adminUser } = await adminClient
    .from('admin_users')
    .select('*')
    .eq('id', session.user.id)
    .eq('is_active', true)
    .maybeSingle();

  return adminUser ? session.user : null;
}

export async function GET(_req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const user = await checkAdmin(supabase);
    if (!user) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminClient = createSupabaseAdminClient();

    const [
      { count: totalContent },
      { count: totalMovies },
      { count: totalSeries },
      { count: totalAnime },
      { count: totalUsers },
      { count: activeSubscriptions },
      { count: totalEpisodes },
      { count: pendingImports },
    ] = await Promise.all([
      adminClient.from('content').select('*', { count: 'exact', head: true }),
      adminClient.from('content').select('*', { count: 'exact', head: true }).eq('content_type', 'movie'),
      adminClient.from('content').select('*', { count: 'exact', head: true }).eq('content_type', 'series'),
      adminClient.from('content').select('*', { count: 'exact', head: true }).ilike('category', 'anime%'),
      adminClient.from('profiles').select('*', { count: 'exact', head: true }),
      adminClient.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      adminClient.from('episodes').select('*', { count: 'exact', head: true }),
      adminClient.from('content_import_jobs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    return NextResponse.json({
      totalContent,
      totalMovies,
      totalSeries,
      totalAnime,
      totalUsers,
      activeSubscriptions,
      totalEpisodes,
      pendingImports,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
