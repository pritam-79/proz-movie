import { NextRequest, NextResponse } from 'next/server';
import { stashService } from '@/lib/services/stashService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')?.trim();
    const q = req.nextUrl.searchParams.get('q')?.trim() || '';
    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') || '1', 10) || 1);
    const genderParam = (req.nextUrl.searchParams.get('gender') || 'FEMALE').toUpperCase();
    const gender = (
      ['FEMALE', 'MALE', 'TRANSGENDER_FEMALE', 'ALL'].includes(genderParam)
        ? genderParam
        : 'FEMALE'
    ) as 'FEMALE' | 'MALE' | 'TRANSGENDER_FEMALE' | 'ALL';

    if (id) {
      const profile = await stashService.getPerformerProfile(id);
      if (!profile) {
        return NextResponse.json({ success: false, error: 'Performer profile not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, ...profile });
    }

    const performers = await stashService.getPerformersDirectory({ q, page, gender });
    return NextResponse.json({
      success: true,
      page,
      gender,
      count: performers.length,
      performers,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Performer lookup failed' }, { status: 500 });
  }
}
