import { NextRequest, NextResponse } from 'next/server';
import { DownloadItem } from '@/types/library';

let DOWNLOAD_QUEUE: DownloadItem[] = [
  {
    id: 'dl-001',
    userId: 'proz-usr-7749',
    mediaId: 'stash-sc-001',
    title: 'Neon Nights & Cyber City Romance',
    fileName: 'Neon_Nights_4K_HDR.mp4',
    fileSizeBytes: 2450000000,
    downloadedBytes: 1850000000,
    status: 'downloading',
    speedBytesPerSec: 15400000,
    estimatedRemainingSec: 38,
    signedDownloadUrl: '/api/library/stash/proxy-stream?id=stash-sc-001',
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    createdAt: new Date().toISOString()
  }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    downloads: DOWNLOAD_QUEUE
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mediaId, title, fileName = `${title || 'media'}.mp4`, fileSizeBytes = 1500000000 } = body;

    const newDownload: DownloadItem = {
      id: `dl-${Date.now()}`,
      userId: 'proz-usr-7749',
      mediaId,
      title: title || 'Authorized Media Download',
      fileName,
      fileSizeBytes,
      downloadedBytes: 0,
      status: 'queued',
      signedDownloadUrl: `/api/library/stash/proxy-stream?id=${mediaId}`,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      createdAt: new Date().toISOString()
    };

    DOWNLOAD_QUEUE.push(newDownload);

    return NextResponse.json({
      success: true,
      download: newDownload
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action } = body; // 'pause' | 'resume' | 'cancel'

    const item = DOWNLOAD_QUEUE.find(d => d.id === id);
    if (!item) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    if (action === 'pause') item.status = 'paused';
    if (action === 'resume') item.status = 'downloading';
    if (action === 'cancel') {
      item.status = 'cancelled';
      DOWNLOAD_QUEUE = DOWNLOAD_QUEUE.filter(d => d.id !== id);
    }

    return NextResponse.json({ success: true, download: item });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
