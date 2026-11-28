import { NextRequest, NextResponse } from 'next/server';
import { stashService } from '@/lib/services/stashService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const id = sp.get('id')?.trim();
    const q = sp.get('q')?.trim() || '';
    const letter = sp.get('letter')?.trim() || '';
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1);
    const genderParam = (sp.get('gender') || 'FEMALE').toUpperCase();
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

    const performers = await stashService.getPerformersDirectory({ q, page, gender, letter });
    return NextResponse.json({
      success: true,
      page,
      gender,
      letter: letter || 'All',
      count: performers.length,
      performers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Performer lookup failed' },
      { status: 500 }
    );
  }
}
