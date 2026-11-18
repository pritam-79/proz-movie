import { NextRequest, NextResponse } from 'next/server';
import { discoveryService } from '@/lib/services/discoveryService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const slug = searchParams.get('slug') || 'trending-today';
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 24;
  const country = searchParams.get('country') || 'IN';
  const genre = searchParams.get('genre') || undefined;
  const sortBy = (searchParams.get('sortBy') as any) || undefined;

  try {
    const result = await discoveryService.getCollection(slug, {
      page,
      limit,
      country,
      genre,
      sortBy
    });

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
