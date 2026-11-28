import { NextRequest, NextResponse } from 'next/server';
import { getAllChannels } from '@/lib/data/channelsData';
import { cine18Adapter } from '@/lib/providers/cine18';

export const dynamic = 'force-dynamic';

/**
 * GET /api/channels
 * Merges static verified directory with live Cine18 channels (zero duplicates)
 */
export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q')?.trim().toLowerCase() || '';
    const category = req.nextUrl.searchParams.get('category')?.trim() || 'All';

    const staticChannels = getAllChannels();
    const byUid = new Map(staticChannels.map((c) => [c.channelUid || c.id, c]));

    const remote = await cine18Adapter.getAllChannels().catch(() => []);
    for (const r of remote) {
      if (!r?.uid || !r?.name || r.uid === 'l23h') continue;
      if (!byUid.has(r.uid)) {
        const slug =
          r.name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') +
          '-' +
          r.uid;
        byUid.set(r.uid, {
          id: slug,
          name: r.name.trim(),
          slug,
          category: r.isAdult === 0 || r.isAdult === 2 ? '18+ Exclusive' : 'Web Series',
          logo: r.image || '',
          bannerUrl: r.image || '',
          description: `Official streaming catalog for ${r.name.trim()}.`,
          contentCount: Math.max(10, Math.round((r.total_views || 15000) / 1500)),
          subscribers: `${Math.max(25, Math.round((r.total_views || 10000) / 140))}K`,
          rating: 4.6,
          featured: false,
          color: '#E11D48',
          channelUid: r.uid,
          providerId: 'cine18',
          integrationStatus: 'API Connected',
          syncEnabled: true,
        });
      }
    }

    let list = Array.from(byUid.values());
    if (category && category !== 'All') {
      if (category === 'Popular') {
        list = list.filter((c) => c.featured || (c.rating && c.rating >= 4.7));
      } else {
        list = list.filter((c) => c.category.toLowerCase() === category.toLowerCase());
      }
    }
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      count: list.length,
      channels: list,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch channels directory' },
      { status: 500 }
    );
  }
}
