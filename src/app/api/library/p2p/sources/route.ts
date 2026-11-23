import { NextResponse } from 'next/server';
import { legalTorrentAdapter } from '@/lib/providers/torrent';

export async function GET() {
  return NextResponse.json({
    success: true,
    sources: legalTorrentAdapter.getApprovedSources(),
    config: legalTorrentAdapter.getConfig()
  });
}
