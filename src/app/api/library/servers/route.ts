import { NextResponse } from 'next/server';
import { stashAdapter } from '@/lib/providers/stash';
import { stashService } from '@/lib/services/stashService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [servers, backendStatus] = await Promise.all([
      Promise.resolve(stashAdapter.getServers()),
      stashService.getBackendStatus(),
    ]);
    return NextResponse.json({
      success: true,
      servers,
      backendStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to inspect backend status' },
      { status: 500 }
    );
  }
}
