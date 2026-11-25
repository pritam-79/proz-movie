import { NextRequest, NextResponse } from 'next/server';
import { stashService } from '@/lib/services/stashService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const q = sp.get('q') || '';
    const kind = (sp.get('kind') as 'all' | 'video' | 'photo_gallery' | 'collection') || 'all';
    const sort = (sp.get('sort') as 'newest' | 'popular' | 'title') || 'newest';

    const [uploads, status] = await Promise.all([
      stashService.getRecentUploads({ q, kind, sort }),
      stashService.getBackendStatus(),
    ]);

    return NextResponse.json({
      success: true,
      total: uploads.length,
      uploads,
      lastSyncAt: status.syncState.lastSyncAt,
      personalStashConnected: status.personalStash.connected,
      stashDbConnected: status.stashdb.connected,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load recent uploads' },
      { status: 500 }
    );
  }
}
