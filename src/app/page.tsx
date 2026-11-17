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
  Bookmark,
  Shield,
  Film,
  Rocket
} from 'lucide-react';

export default function HomePage() {
  // Safe helper to extract release year
  const getYear = (c: any) => c.releaseYear || c.release_year || 0;
  const getScore = (c: any) => c.ratingScore || c.rating_avg || 0;
  const matchGenre = (c: any, g: string) => {
    if (!c.genres || !Array.isArray(c.genres)) return false;
    return c.genres.some((genre: any) => {
      const name = typeof genre === 'string' ? genre : (genre?.name || '');
      return name.toLowerCase().includes(g.toLowerCase());
    });
  };

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

  // 3. Marvel & DC Universe
  const marvelDcUniverse = MOCK_CONTENT.filter(
    c => {
      const title = (c.title || '').toLowerCase();
      const overview = ((c as any).overview || c.synopsis || c.description || '').toLowerCase();
      return (
        title.includes('deadpool') ||
        title.includes('spider-man') ||
        title.includes('batman') ||
        title.includes('avengers') ||
        title.includes('dark knight') ||
        title.includes('the boys') ||
        overview.includes('marvel') ||
        overview.includes('superhero') ||
        overview.includes('dc comics') ||
        overview.includes('gotham')
      );
    }
  );

  // 4. Indian Cinema Mega-Hits (Bollywood, Tollywood, Sandalwood & Kollywood)
  const indianCinema = MOCK_CONTENT.filter(
    c => c.category === 'bollywood' || (c.country && (c.country === 'India' || c.country === 'IN'))
  );

  // 5. Sci-Fi & Mind-Benders
  const sciFiMindBenders = MOCK_CONTENT.filter(
    c => (matchGenre(c, 'Sci-Fi') || matchGenre(c, 'Science Fiction') || matchGenre(c, 'Mystery')) && !c.isRestricted18Plus && !c.is_adult
  );

  // 6. Action & Adrenaline Thrillers
  const actionThrillers = MOCK_CONTENT.filter(
    c => (matchGenre(c, 'Action') || matchGenre(c, 'Thriller') || matchGenre(c, 'Adventure')) && !c.isRestricted18Plus && !c.is_adult
  );

  // 7. Latest Movies
  const latestMovies = MOCK_CONTENT.filter(
    c => (c.type === 'movie' || c.content_type === 'movie') && !c.isRestricted18Plus && !c.is_adult
  ).sort((a, b) => getYear(b) - getYear(a));

  // 8. Top Rated Movies
  const topRatedMovies = [...popularMovies].sort((a, b) => getScore(b) - getScore(a));

  // 9. Upcoming Movies
  const upcomingMovies = MOCK_CONTENT.filter(
    c => (c.type === 'movie' || c.content_type === 'movie') && getYear(c) >= 2026 && !c.isRestricted18Plus && !c.is_adult
  );

  // 10. Popular TV Series
  const popularTVSeries = MOCK_CONTENT.filter(
    c => (c.type === 'series' || c.content_type === 'series') && !c.isRestricted18Plus && !c.is_adult
  );

  // 11. Trending Anime
  const trendingAnime = MOCK_CONTENT.filter(
    c => (c.category === 'anime' || c.type === 'anime' || c.content_type === 'anime') && (c.isTrending || c.is_trending) && !c.isRestricted18Plus && !c.is_adult
  );

  // 12. Popular Anime
  const popularAnime = MOCK_CONTENT.filter(
    c => (c.category === 'anime' || c.type === 'anime' || c.content_type === 'anime') && !c.isRestricted18Plus && !c.is_adult
  ).sort((a, b) => getScore(b) - getScore(a));

  // 13. Latest Anime
  const latestAnime = MOCK_CONTENT.filter(
    c => (c.category === 'anime' || c.type === 'anime' || c.content_type === 'anime') && !c.isRestricted18Plus && !c.is_adult
  ).sort((a, b) => getYear(b) - getYear(a));

  // 14. Popular Dramas (K-Drama, C-Drama, Asian Drama)
  const popularDramas = MOCK_CONTENT.filter(
    c => (c.category === 'k_drama' || c.category === 'c_drama' || c.type === 'drama' || c.content_type === 'drama') && !c.isRestricted18Plus && !c.is_adult
  );

  // 15. Recommended For You
  const recommendedForYou = [...MOCK_CONTENT]
    .filter(c => !c.isRestricted18Plus && !c.is_adult)
    .sort((a, b) => getScore(b) - getScore(a));

  // 16. Recently Added
  const recentlyAdded = [...MOCK_CONTENT]
    .filter(c => !c.isRestricted18Plus && !c.is_adult)
    .sort((a, b) => getYear(b) - getYear(a));

  return (
    <div className="pb-16 space-y-6">
      {/* Featured Cinematic Hero Banner */}
      <HeroBanner featuredItems={featuredItems} />

      {/* Continue Watching */}
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

      {/* 2. Marvel & DC Universe */}
      {marvelDcUniverse.length > 0 && (
        <ContentRow
          title="Marvel & DC Universe"
          subtitle="Iconic superheroes, cosmic battles, and multiverse sagas"
          items={marvelDcUniverse}
          viewAllHref="/movies?genre=action"
          aspectRatio="poster"
          badge="SUPERHERO"
          icon={<Shield className="w-5 h-5 text-red-400" />}
        />
      )}

      {/* 3. Indian Cinema Mega-Hits */}
      {indianCinema.length > 0 && (
        <ContentRow
          title="Indian Cinema Mega-Hits"
          subtitle="Record-breaking pan-Indian blockbusters, thrilling sagas, and mega spectacles"
          items={indianCinema}
          viewAllHref="/movies?genre=action"
          aspectRatio="poster"
          badge="MEGA-HITS"
          icon={<Film className="w-5 h-5 text-amber-400" />}
        />
      )}

      {/* 4. Sci-Fi & Mind-Benders */}
      {sciFiMindBenders.length > 0 && (
        <ContentRow
          title="Sci-Fi & Mind-Benders"
          subtitle="Cosmic wormholes, deep space epics, and reality-altering masterpieces"
          items={sciFiMindBenders}
          viewAllHref="/movies?genre=scifi"
          aspectRatio="backdrop"
          badge="MIND BENDING"
          icon={<Rocket className="w-5 h-5 text-cyan-400" />}
        />
      )}

      {/* 5. Popular Movies */}
      <ContentRow
        title="Popular Movies"
        subtitle="Critically acclaimed cinema rated highest by stream fans"
        items={popularMovies}
        viewAllHref="/movies"
        aspectRatio="poster"
        badge="POPULAR"
        icon={<Flame className="w-5 h-5 text-orange-400" />}
      />

      {/* 6. Action & Adrenaline Thrillers */}
      {actionThrillers.length > 0 && (
        <ContentRow
          title="Action & Adrenaline Thrillers"
          subtitle="High-octane shootouts, martial arts, and relentless thrill rides"
          items={actionThrillers}
          viewAllHref="/movies?genre=action"
          aspectRatio="poster"
          badge="ADRENALINE"
          icon={<Flame className="w-5 h-5 text-red-500" />}
        />
      )}

      {/* 7. Latest Movies */}
      <ContentRow
        title="Latest Movies"
        subtitle="Fresh cinema released this season"
        items={latestMovies}
        viewAllHref="/movies?sort=latest"
        aspectRatio="poster"
        icon={<Clock className="w-5 h-5 text-indigo-400" />}
      />

      {/* 8. Top Rated Movies */}
      <ContentRow
        title="Top Rated Movies"
        subtitle="Masterworks with the highest audience and critic scores"
        items={topRatedMovies}
        viewAllHref="/movies?sort=rating"
        aspectRatio="poster"
        badge="TOP RATED"
        icon={<Award className="w-5 h-5 text-yellow-400" />}
      />

      {/* 9. Upcoming Movies */}
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

      {/* 10. Popular TV Series */}
      <ContentRow
        title="Popular TV Series"
        subtitle="Binge-worthy drama, thriller and multi-episode sagas"
        items={popularTVSeries}
        viewAllHref="/series"
        aspectRatio="poster"
        icon={<Tv className="w-5 h-5 text-emerald-400" />}
      />

      {/* 11. Trending Anime */}
      <ContentRow
        title="Trending Anime"
        subtitle="Sensational anime series captivating global audiences"
        items={trendingAnime}
        viewAllHref="/anime?sort=trending"
        aspectRatio="poster"
        badge="HOT"
        icon={<Zap className="w-5 h-5 text-amber-400" />}
      />

      {/* 12. Popular Anime */}
      <ContentRow
        title="Popular Anime"
        subtitle="All-time fan-favorite anime sagas and masterworks"
        items={popularAnime}
        viewAllHref="/anime?sort=rating"
        aspectRatio="poster"
        icon={<Sparkles className="w-5 h-5 text-proz-cyan" />}
      />

      {/* 13. Latest Anime */}
      <ContentRow
        title="Latest Anime"
        subtitle="Brand new seasonal simulcasts and current chapters"
        items={latestAnime}
        viewAllHref="/anime?sort=latest"
        aspectRatio="poster"
        icon={<Clock className="w-5 h-5 text-pink-400" />}
      />

      {/* 14. Popular Dramas */}
      <ContentRow
        title="Popular Dramas"
        subtitle="Captivating Korean, Chinese and Asian drama hits"
        items={popularDramas}
        viewAllHref="/drama"
        aspectRatio="poster"
        icon={<Heart className="w-5 h-5 text-rose-400" />}
      />

      {/* 15. Recommended For You */}
      <ContentRow
        title="Recommended For You"
        subtitle="Curated picks personalized for your cinematic taste"
        items={recommendedForYou}
        viewAllHref="/movies?sort=rating"
        aspectRatio="backdrop"
        badge="FOR YOU"
        icon={<Star className="w-5 h-5 text-amber-400" />}
      />

      {/* 16. Recently Added */}
      <ContentRow
        title="Recently Added"
        subtitle="Fresh cinema and new episodes added to the catalogue"
        items={recentlyAdded}
        viewAllHref="/movies?sort=latest"
        aspectRatio="poster"
        icon={<Clock className="w-5 h-5 text-teal-400" />}
      />

      {/* 17. My List */}
      <MyListRow />

      {/* Popular Genres Grid */}
      <GenreGrid />
    </div>
  );
}
