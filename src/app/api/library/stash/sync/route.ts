import { NextResponse } from 'next/server';
import { stashService } from '@/lib/services/stashService';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const cache = await stashService.syncLibrary(true);
    const status = await stashService.getBackendStatus();

    return NextResponse.json({
      success: true,
      jobId: `sync-${Date.now()}`,
      status: 'completed',
      version: status.personalStash.version || 'v0.09 Backend Sync',
      summary: {
        scenesScanned: status.syncState.totalPlayableScenes,
        scenesUpdated: status.syncState.totalPlayableScenes,
        performersUpdated: status.syncState.totalPerformers,
        studiosUpdated: status.syncState.totalStudios,
        galleriesUpdated: status.syncState.totalGalleries,
        duplicatesResolved: cache.duplicatesRemoved,
        stashDbIndexed: status.stashdb.indexedScenesCount,
      },
      backendStatus: status,
      completedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Backend sync failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const status = await stashService.getBackendStatus();
    return NextResponse.json({
      success: true,
      connected: status.stashdb.connected || status.personalStash.connected,
      status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Status lookup failed' },
      { status: 500 }
    );
  }
}
