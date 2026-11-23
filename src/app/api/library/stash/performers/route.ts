import { NextResponse } from 'next/server';
import { stashAdapter } from '@/lib/providers/stash';

export async function GET() {
  try {
    const performers = await stashAdapter.findPerformers();
    return NextResponse.json({
      success: true,
      count: performers.length,
      performers
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
