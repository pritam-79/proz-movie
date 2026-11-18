import { NextResponse } from 'next/server';
import { MOCK_CONTENT } from '@/lib/data/mockContent';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const publicContent = MOCK_CONTENT.filter(c => !c.isRestricted18Plus && !c.is_adult);

    const heroBanner = publicContent.filter(c => c.isFeatured || c.is_featured).slice(0, 5);
    const trendingToday = publicContent.filter(c => c.isTrending || c.is_trending).slice(0, 15);
    const popularMovies = publicContent.filter(c => c.type === 'movie' || c.content_type === 'movie').slice(0, 15);
    const popularSeries = publicContent.filter(c => c.type === 'series' || c.content_type === 'series').slice(0, 15);
    const anime = publicContent.filter(c => c.category === 'anime' || c.type === 'anime').slice(0, 15);
    const asianDramas = publicContent.filter(c => c.category === 'k_drama' || c.country === 'South Korea' || c.type === 'drama').slice(0, 15);
    const indianCinema = publicContent.filter(c => c.category === 'bollywood' || c.category === 'south' || c.country === 'India').slice(0, 15);
    const internationalCinema = publicContent.filter(c => c.category === 'hollywood' || c.country === 'United States').slice(0, 15);
    const topRated = [...publicContent].sort((a, b) => (b.ratingScore || 0) - (a.ratingScore || 0)).slice(0, 15);

    return NextResponse.json({
      success: true,
      data: {
        heroBanner,
        sections: [
          { id: 'trending_today', title: 'Trending Today', items: trendingToday },
          { id: 'popular_movies', title: 'Popular Movies', items: popularMovies },
          { id: 'popular_series', title: 'Popular TV Shows & Web Series', items: popularSeries },
          { id: 'anime_universe', title: 'Trending Anime', items: anime },
          { id: 'asian_dramas', title: 'Asian Dramas', items: asianDramas },
          { id: 'indian_cinema', title: 'Indian Cinema Blockbusters', items: indianCinema },
          { id: 'international', title: 'International Cinema', items: internationalCinema },
          { id: 'top_rated', title: 'Top Rated Masterworks', items: topRated }
        ]
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
