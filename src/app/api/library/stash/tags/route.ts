import { NextResponse } from 'next/server';
import { stashAdapter } from '@/lib/providers/stash';

export async function GET() {
  try {
    const tags = await stashAdapter.findTags();
    return NextResponse.json({
      success: true,
      count: tags.length,
      tags
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
