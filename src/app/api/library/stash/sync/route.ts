import { NextRequest, NextResponse } from 'next/server';
import { stashAdapter } from '@/lib/providers/stash';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { serverId = 'stash-srv-primary', syncType = 'incremental', serverUrl, apiKey } = body;

    if (serverUrl) {
      stashAdapter.updateServer({
        id: serverId,
        serverUrl,
        apiKey
      });
    }

    const test = await stashAdapter.testConnection(serverId);
    if (!test.success) {
      return NextResponse.json({
        success: false,
        status: 'disconnected',
        error: test.error || 'Stash server is not reachable. Connect a valid private media library to sync.',
        completedAt: new Date().toISOString()
      }, { status: 400 });
    }

    const scenesData = await stashAdapter.findScenes();
    const performers = await stashAdapter.findPerformers();
    const studios = await stashAdapter.findStudios();
    const galleries = await stashAdapter.findGalleries();

    return NextResponse.json({
      success: true,
      jobId: `sync-${Date.now()}`,
      serverId,
      syncType,
      status: 'completed',
      version: test.version,
      summary: {
        scenesScanned: scenesData.count,
        scenesUpdated: scenesData.scenes.length,
        performersUpdated: performers.length,
        studiosUpdated: studios.length,
        galleriesUpdated: galleries.length,
        duplicatesResolved: 0,
        failedRecords: 0
      },
      completedAt: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Sync execution failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const servers = stashAdapter.getServers();
  const test = await stashAdapter.testConnection();
  return NextResponse.json({
    success: true,
    connected: test.success,
    version: test.version,
    error: test.error,
    servers
  });
}
