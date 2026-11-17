import React from 'react';
import { MOCK_CONTENT } from '@/lib/data/mockContent';
import HeroBanner from '@/components/home/HeroBanner';
import ContentRow from '@/components/content/ContentRow';
import ContinueWatchingRow from '@/components/content/ContinueWatchingRow';
import MyListRow from '@/components/content/MyListRow';
import GenreGrid from '@/components/home/GenreGrid';
import { 
  Flame, 
  TrendingUp, 
  Sparkles, 
  Tv, 
  Globe, 
  Heart, 
  Clock, 
  Star,
  Calendar,
  Award,
  Zap,
  Bookmark
} from 'lucide-react';

export default function HomePage() {
  // Safe helper to extract release year
  const getYear = (c: any) => c.releaseYear || c.release_year || 0;
  const getScore = (c: any) => c.ratingScore || c.rating_avg || 0;

  // 0. Featured items for Hero Banner
  const featuredItems = MOCK_CONTENT.filter(c => (c.isFeatured || c.is_featured) && !c.isRestricted18Plus && !c.is_adult);

  // 1. Trending Movies
  const trendingMovies = MOCK_CONTENT.filter(
    c => (c.type === 'movie' || c.content_type === 'movie') && (c.isTrending || c.is_trending) && !c.isRestricted18Plus && !c.is_adult
  );

  // 2. Popular Movies
  const popularMovies = MOCK_CONTENT.filter(
    c => (c.type === 'movie' || c.content_type === 'movie') && !c.isRestricted18Plus && !c.is_adult
  ).sort((a, b) => getScore(b) - getScore(a));

  // 3. Latest Movies
  const latestMovies = MOCK_CONTENT.filter(
    c => (c.type === 'movie' || c.content_type === 'movie') && !c.isRestricted18Plus && !c.is_adult
  ).sort((a, b) => getYear(b) - getYear(a));

  // 4. Top Rated Movies
  const topRatedMovies = [...popularMovies].sort((a, b) => getScore(b) - getScore(a));

  // 5. Upcoming Movies
  const upcomingMovies = MOCK_CONTENT.filter(
    c => (c.type === 'movie' || c.content_type === 'movie') && getYear(c) >= 2026 && !c.isRestricted18Plus && !c.is_adult
  );

  // 6. Popular TV Series
  const popularTVSeries = MOCK_CONTENT.filter(
    c => (c.type === 'series' || c.content_type === 'series') && !c.isRestricted18Plus && !c.is_adult
  );

  // 7. Trending Anime
  const trendingAnime = MOCK_CONTENT.filter(
    c => (c.category === 'anime' || c.type === 'anime' || c.content_type === 'anime') && (c.isTrending || c.is_trending) && !c.isRestricted18Plus && !c.is_adult
  );

  // 8. Popular Anime
  const popularAnime = MOCK_CONTENT.filter(
    c => (c.category === 'anime' || c.type === 'anime' || c.content_type === 'anime') && !c.isRestricted18Plus && !c.is_adult
  ).sort((a, b) => getScore(b) - getScore(a));

  // 9. Latest Anime
  const latestAnime = MOCK_CONTENT.filter(
    c => (c.category === 'anime' || c.type === 'anime' || c.content_type === 'anime') && !c.isRestricted18Plus && !c.is_adult
  ).sort((a, b) => getYear(b) - getYear(a));

  // 10. Popular Dramas (K-Drama, C-Drama, Asian Drama)
  const popularDramas = MOCK_CONTENT.filter(
    c => (c.category === 'k_drama' || c.category === 'c_drama' || c.type === 'drama' || c.content_type === 'drama') && !c.isRestricted18Plus && !c.is_adult
  );

  // 12. Recommended For You
  const recommendedForYou = [...MOCK_CONTENT]
    .filter(c => !c.isRestricted18Plus && !c.is_adult)
    .sort((a, b) => getScore(b) - getScore(a));

  // 13. Recently Added
  const recentlyAdded = [...MOCK_CONTENT]
    .filter(c => !c.isRestricted18Plus && !c.is_adult)
    .sort((a, b) => getYear(b) - getYear(a));

  return (
    <div className="pb-16 space-y-6">
      {/* Featured Cinematic Hero Banner */}
      <HeroBanner featuredItems={featuredItems} />

      {/* 11. Continue Watching */}
      <ContinueWatchingRow />

      {/* 1. Trending Movies */}
      <ContentRow
        title="Trending Movies"
        subtitle="The most-watched blockbusters across the globe right now"
        items={trendingMovies}
        viewAllHref="/movies?sort=trending"
        aspectRatio="poster"
        badge="TRENDING"
        icon={<TrendingUp className="w-5 h-5 text-proz-cyan" />}
      />

      {/* 2. Popular Movies */}
      <ContentRow
        title="Popular Movies"
        subtitle="Critically acclaimed cinema rated highest by stream fans"
        items={popularMovies}
        viewAllHref="/movies"
        aspectRatio="poster"
        badge="POPULAR"
        icon={<Flame className="w-5 h-5 text-orange-400" />}
      />

      {/* 3. Latest Movies */}
      <ContentRow
        title="Latest Movies"
        subtitle="Fresh cinema released this season"
        items={latestMovies}
        viewAllHref="/movies?sort=latest"
        aspectRatio="poster"
        icon={<Clock className="w-5 h-5 text-indigo-400" />}
      />

      {/* 4. Top Rated Movies */}
      <ContentRow
        title="Top Rated Movies"
        subtitle="Masterworks with the highest audience and critic scores"
        items={topRatedMovies}
        viewAllHref="/movies?sort=rating"
        aspectRatio="poster"
        badge="TOP RATED"
        icon={<Award className="w-5 h-5 text-yellow-400" />}
      />

      {/* 5. Upcoming Movies */}
      {upcomingMovies.length > 0 && (
        <ContentRow
          title="Upcoming Movies"
          subtitle="Anticipated cinema premiering in 2026"
          items={upcomingMovies}
          viewAllHref="/movies?sort=latest"
          aspectRatio="backdrop"
          badge="COMING SOON"
          icon={<Calendar className="w-5 h-5 text-purple-400" />}
        />
      )}

      {/* 6. Popular TV Series */}
      <ContentRow
        title="Popular TV Series"
        subtitle="Binge-worthy drama, thriller and multi-episode sagas"
        items={popularTVSeries}
        viewAllHref="/series"
        aspectRatio="poster"
        icon={<Tv className="w-5 h-5 text-emerald-400" />}
      />

      {/* 7. Trending Anime */}
      <ContentRow
        title="Trending Anime"
        subtitle="Sensational anime series captivating global audiences"
        items={trendingAnime}
        viewAllHref="/anime?sort=trending"
        aspectRatio="poster"
        badge="HOT"
        icon={<Zap className="w-5 h-5 text-amber-400" />}
      />

      {/* 8. Popular Anime */}
      <ContentRow
        title="Popular Anime"
        subtitle="All-time fan-favorite anime sagas and masterworks"
        items={popularAnime}
        viewAllHref="/anime?sort=rating"
        aspectRatio="poster"
        icon={<Sparkles className="w-5 h-5 text-proz-cyan" />}
      />

      {/* 9. Latest Anime */}
      <ContentRow
        title="Latest Anime"
        subtitle="Brand new seasonal simulcasts and current chapters"
        items={latestAnime}
        viewAllHref="/anime?sort=latest"
        aspectRatio="poster"
        icon={<Clock className="w-5 h-5 text-pink-400" />}
      />

      {/* 10. Popular Dramas */}
      <ContentRow
        title="Popular Dramas"
        subtitle="Captivating Korean, Chinese and Asian drama hits"
        items={popularDramas}
        viewAllHref="/drama"
        aspectRatio="poster"
        icon={<Heart className="w-5 h-5 text-rose-400" />}
      />

      {/* 12. Recommended For You */}
      <ContentRow
        title="Recommended For You"
        subtitle="Curated picks personalized for your cinematic taste"
        items={recommendedForYou}
        viewAllHref="/movies?sort=rating"
        aspectRatio="backdrop"
        badge="FOR YOU"
        icon={<Star className="w-5 h-5 text-amber-400" />}
      />

      {/* 13. Recently Added */}
      <ContentRow
        title="Recently Added"
        subtitle="Fresh cinema and new episodes added to the catalogue"
        items={recentlyAdded}
        viewAllHref="/movies?sort=latest"
        aspectRatio="poster"
        icon={<Clock className="w-5 h-5 text-teal-400" />}
      />

      {/* 14. My List */}
      <MyListRow />

      {/* Popular Genres Grid */}
      <GenreGrid />
    </div>
  );
}
