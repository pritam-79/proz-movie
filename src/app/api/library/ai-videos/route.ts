import { NextRequest, NextResponse } from 'next/server';
import {
  createAiVideoJob,
  getAiAdultVideosCatalog,
  getAiVideoJob,
} from '@/lib/providers/aiAdultVideos';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const jobId = sp.get('jobId')?.trim();
    if (jobId) {
      const job = getAiVideoJob(jobId);
      if (!job) {
        return NextResponse.json({ success: false, error: 'AI generation job not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, job });
    }

    const category = sp.get('category')?.trim() || 'All';
    const q = sp.get('q')?.trim() || '';
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1);
    const sort = (sp.get('sort')?.trim() || 'newest') as 'newest' | 'popular' | 'rating';

    const result = await getAiAdultVideosCatalog({ category, q, page, sort });
    return NextResponse.json({
      success: true,
      category,
      page,
      totalCount: result.totalCount,
      count: result.items.length,
      hasMore: result.hasMore,
      generationProvider: result.generationProvider,
      items: result.items,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to load AI Adult Videos catalog' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = String(body?.prompt || '').trim();
    const style = String(body?.style || 'AI 3D Animation').trim();
    const durationSeconds = Number(body?.durationSeconds || 8);

    const job = await createAiVideoJob({ prompt, style, durationSeconds });
    const status = job.status === 'failed' ? 400 : 200;
    return NextResponse.json({ success: job.status !== 'failed', job }, { status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to process AI generation request' },
      { status: 500 }
    );
  }
}
