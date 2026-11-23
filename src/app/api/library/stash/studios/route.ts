import { NextResponse } from 'next/server';
import { stashAdapter } from '@/lib/providers/stash';

export async function GET() {
  try {
    const studios = await stashAdapter.findStudios();
    return NextResponse.json({
      success: true,
      count: studios.length,
      studios
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
