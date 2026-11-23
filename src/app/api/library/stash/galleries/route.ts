import { NextResponse } from 'next/server';
import { stashAdapter } from '@/lib/providers/stash';

export async function GET() {
  try {
    const galleries = await stashAdapter.findGalleries();
    return NextResponse.json({
      success: true,
      count: galleries.length,
      galleries
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
