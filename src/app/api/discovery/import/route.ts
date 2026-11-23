import { NextRequest, NextResponse } from 'next/server';
import { discoveryEngine, IngestionLifecycleStatus } from '@/lib/services/discoveryEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, targetStatus } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing required field: id' }, { status: 400 });
    }

    let newStatus: IngestionLifecycleStatus = 'playback_ready';
    if (action === 'approve') newStatus = 'playback_ready';
    else if (action === 'reject') newStatus = 'rejected';
    else if (action === 'verify_rights') newStatus = 'rights_verified';
    else if (targetStatus) newStatus = targetStatus;

    const updated = discoveryEngine.updateStatus(id, newStatus);
    if (!updated) {
      return NextResponse.json({ success: false, error: `Item with id '${id}' not found in discovery queue` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Item status updated to ${newStatus}`,
      item: updated,
      stats: discoveryEngine.getStats()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Import action failed' },
      { status: 500 }
    );
  }
}
