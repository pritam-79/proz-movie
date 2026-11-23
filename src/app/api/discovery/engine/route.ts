import { NextRequest, NextResponse } from 'next/server';
import { discoveryEngine, IngestionLifecycleStatus } from '@/lib/services/discoveryEngine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as IngestionLifecycleStatus | null;
    const statsOnly = searchParams.get('stats') === 'true';

    const stats = discoveryEngine.getStats();
    if (statsOnly) {
      return NextResponse.json({ success: true, stats });
    }

    const queue = discoveryEngine.getQueue(status || undefined);
    return NextResponse.json({
      success: true,
      stats,
      count: queue.length,
      items: queue
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Discovery engine query failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { providers, query, limitPerProvider = 10, autoPromoteToReady = false } = body;

    const result = await discoveryEngine.runDiscovery({
      providers,
      query,
      limitPerProvider,
      autoPromoteToReady
    });

    const stats = discoveryEngine.getStats();

    return NextResponse.json({
      success: true,
      discoveredCount: result.discoveredCount,
      newItems: result.newItems,
      errors: result.errors,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Discovery run failed' },
      { status: 500 }
    );
  }
}
