import { NextRequest, NextResponse } from 'next/server';
import { stashAdapter } from '@/lib/providers/stash';

export async function GET() {
  try {
    const servers = stashAdapter.getServers();
    return NextResponse.json({
      success: true,
      servers,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list servers' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, serverUrl, apiKey, libraryIdentifier } = body;

    if (!name || !serverUrl) {
      return NextResponse.json(
        { success: false, error: 'Name and Server URL are required.' },
        { status: 400 }
      );
    }

    const testResult = await stashAdapter.testConnection({
      id: `stash-${Date.now()}`,
      name,
      serverUrl,
      apiKey,
      connectionStatus: 'pending',
      lastSyncAt: null,
      syncSchedule: 'manual',
      isEnabled: true,
      libraryIdentifier: libraryIdentifier || `lib-${Date.now()}`
    });

    return NextResponse.json({
      success: true,
      message: 'Server configured successfully',
      testResult
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to register server' },
      { status: 500 }
    );
  }
}
