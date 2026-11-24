import React from 'react';
import { MOCK_CONTENT } from '@/lib/data/mockContent';
import HeroBanner from '@/components/home/HeroBanner';
import ContentRow from '@/components/content/ContentRow';
import ContinueWatchingRow from '@/components/content/ContinueWatchingRow';
import MyListRow from '@/components/content/MyListRow';
import GenreGrid from '@/components/home/GenreGrid';
import SubHeaderNav from '@/components/navigation/SubHeaderNav';
import PopularChannelsRow from '@/components/content/PopularChannelsRow';
import ActionButtonPair from '@/components/common/ActionButtonPair';
import NewCatalogShowcase from '@/components/v07/NewCatalogShowcase';
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
  // Safe helper to extract release year and rating
  const getYear = (c: any) => c.releaseYear || c.release_year || 0;
  const getScore = (c: any) => c.ratingScore || c.rating_avg || 0;
  const matchGenre = (c: any, g: string) => {
    if (!c.genres || !Array.isArray(c.genres)) return false;
    return c.genres.some((genre: any) => {
      const name = typeof genre === 'string' ? genre : (genre?.name || '');
      return name.toLowerCase().includes(g.toLowerCase());
    });
  };

  // Base permitted public content (Strictly Exclude 18+ Restricted Adult Vault from Homepage)
  const publicContent = MOCK_CONTENT.filter(c => !c.isRestricted18Plus && !c.is_adult);

  // 1. Featured items for Hero Banner & Slider
  const featuredItems = publicContent.filter(c => c.isFeatured || c.is_featured);

  // 2. Trending Today (Top daily velocity blockbusters)
  const trendingToday = publicContent.filter(c => (c.isTrending || c.is_trending) && getScore(c) >= 8.5);

  // 3. Trending This Week (Broad weekly popularity)
  const trendingThisWeek = publicContent.filter(c => c.isTrending || c.is_trending);

  // 4. Recently Added
  const recentlyAdded = [...publicContent].sort((a, b) => getYear(b) - getYear(a));

  // 5. Popular Movies
  const popularMovies = publicContent.filter(
    c => c.type === 'movie' || c.content_type === 'movie'
  ).sort((a, b) => getScore(b) - getScore(a));

  // 6. Popular Web Series
  const popularWebSeries = publicContent.filter(
    c => c.type === 'series' || c.content_type === 'series'
  ).sort((a, b) => getScore(b) - getScore(a));

  // 7. Bollywood Collection
  const bollywoodCollection = publicContent.filter(
    c => c.category === 'bollywood' && !(
      c.title?.includes('Kalki') || 
      c.title?.includes('RRR') || 
      c.title?.includes('K.G.F') || 
      c.title?.includes('Pushpa') || 
      c.title?.includes('Baahubali') || 
      c.title?.includes('Leo')
    )
  );

  // 8. Hollywood Collection
  const hollywoodCollection = publicContent.filter(
    c => c.category === 'hollywood' || c.country === 'United States'
  ).sort((a, b) => getScore(b) - getScore(a));

  // 9. South Indian Mega-Hits Collection (Tollywood, Sandalwood, Kollywood & Mollywood)
  const southIndianCollection = publicContent.filter(
    c => c.title?.includes('Kalki') || 
         c.title?.includes('RRR') || 
         c.title?.includes('K.G.F') || 
         c.title?.includes('Pushpa') || 
         c.title?.includes('Baahubali') || 
         c.title?.includes('Leo')
  );

  // 10. Korean Drama Collection
  const koreanDramaCollection = publicContent.filter(
    c => c.category === 'k_drama' || c.country === 'South Korea'
  );

  // 11. Anime Mega-Hits Collection
  const animeCollection = publicContent.filter(
    c => c.category === 'anime' || c.type === 'anime' || c.content_type === 'anime'
  ).sort((a, b) => getScore(b) - getScore(a));

  // 12. Marvel & DC Universe
  const marvelDcUniverse = publicContent.filter(
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

  // 13. Sci-Fi & Mind-Benders
  const sciFiMindBenders = publicContent.filter(
    c => matchGenre(c, 'Sci-Fi') || matchGenre(c, 'Science Fiction') || matchGenre(c, 'Mystery')
  );

  // 14. Action & Adrenaline Thrillers
  const actionThrillers = publicContent.filter(
    c => matchGenre(c, 'Action') || matchGenre(c, 'Thriller') || matchGenre(c, 'Adventure')
  );

  // 15. Top Rated Masterworks
  const topRated = [...publicContent].sort((a, b) => getScore(b) - getScore(a));

  // 16. Upcoming Releases
  const upcomingReleases = publicContent.filter(c => getYear(c) >= 2026);

  // 17. Recommended For You (Curated high-engagement mix)
  const recommendedForYou = [...popularMovies].reverse().slice(0, 10);

  return (
    <div className="pb-16 space-y-8">
      {/* 0. Sub-Header Horizontal Navigation (Recommend, Movies, TV Shows, 18+, Anime, Channels) */}
      <SubHeaderNav />

      {/* 1. Cinematic Hero Banner & Featured Slider */}
      <HeroBanner featuredItems={featuredItems} />

      {/* 2. Popular Channels & Networks Grid Row */}
      <PopularChannelsRow />

      {/* 2b. v0.07 Unified Playable & Deduplicated OTT Showcase */}
      <NewCatalogShowcase />

      {/* 3. Continue Watching (Interactive Client Row) */}
      <ContinueWatchingRow />

      {/* 3. Trending Today */}
      <ContentRow
        title="Trending Today"
        subtitle="The hottest titles captivating audiences worldwide right now"
        items={trendingToday}
        viewAllHref="/movies?sort=trending"
        aspectRatio="poster"
        badge="HOT TODAY"
        icon={<TrendingUp className="w-5 h-5 text-proz-cyan" />}
      />

      {/* 4. Trending This Week */}
      <ContentRow
        title="Trending This Week"
        subtitle="Most-streamed masterworks across global leaderboards this week"
        items={trendingThisWeek}
        viewAllHref="/movies?sort=trending"
        aspectRatio="poster"
        badge="TOP THIS WEEK"
        icon={<Flame className="w-5 h-5 text-orange-400" />}
      />

      {/* 5. Recently Added */}
      <ContentRow
        title="Recently Added"
        subtitle="Fresh cinema and current simulcast releases added to the catalogue"
        items={recentlyAdded}
        viewAllHref="/movies?sort=latest"
        aspectRatio="poster"
        icon={<Clock className="w-5 h-5 text-teal-400" />}
      />

      {/* 6. Popular Movies */}
      <ContentRow
        title="Popular Movies"
        subtitle="Critically acclaimed cinema rated highest by stream fans"
        items={popularMovies}
        viewAllHref="/movies"
        aspectRatio="poster"
        badge="POPULAR"
        icon={<Star className="w-5 h-5 text-amber-400" />}
      />

      {/* 7. Popular Web Series */}
      <ContentRow
        title="Popular Web Series"
        subtitle="Binge-worthy drama, thriller and multi-episode prestige sagas"
        items={popularWebSeries}
        viewAllHref="/series"
        aspectRatio="poster"
        badge="BINGE WORTHY"
        icon={<Tv className="w-5 h-5 text-emerald-400" />}
      />

      {/* 8. Bollywood Collection */}
      {bollywoodCollection.length > 0 && (
        <ContentRow
          title="Bollywood Collection"
          subtitle="Star-studded Hindi cinema, sensational drama and musical spectacles"
          items={bollywoodCollection}
          viewAllHref="/movies?category=bollywood"
          aspectRatio="poster"
          badge="BOLLYWOOD"
          icon={<Film className="w-5 h-5 text-yellow-400" />}
        />
      )}

      {/* 9. Hollywood Collection */}
      {hollywoodCollection.length > 0 && (
        <ContentRow
          title="Hollywood Collection"
          subtitle="Global blockbuster franchises, award-winning epics and cinematic milestones"
          items={hollywoodCollection}
          viewAllHref="/movies?category=hollywood"
          aspectRatio="poster"
          badge="HOLLYWOOD"
          icon={<Globe className="w-5 h-5 text-indigo-400" />}
        />
      )}

      {/* 10. South Indian Mega-Hits */}
      {southIndianCollection.length > 0 && (
        <ContentRow
          title="South Indian Collection"
          subtitle="Record-breaking pan-Indian blockbusters, thrilling sagas, and mega spectacles"
          items={southIndianCollection}
          viewAllHref="/movies?category=south_indian"
          aspectRatio="poster"
          badge="MEGA HITS"
          icon={<Flame className="w-5 h-5 text-red-500" />}
        />
      )}

      {/* 11. Korean Drama Collection */}
      {koreanDramaCollection.length > 0 && (
        <ContentRow
          title="Korean Drama Collection"
          subtitle="Captivating romantic hits, psychological thrillers, and award-winning K-Dramas"
          items={koreanDramaCollection}
          viewAllHref="/drama"
          aspectRatio="poster"
          badge="K-DRAMA"
          icon={<Heart className="w-5 h-5 text-rose-400" />}
        />
      )}

      {/* 12. Anime Mega-Hits Collection */}
      {animeCollection.length > 0 && (
        <ContentRow
          title="Anime Collection"
          subtitle="Sensational seasonal simulcasts, all-time shonen epics, and dark fantasy masterworks"
          items={animeCollection}
          viewAllHref="/anime"
          aspectRatio="poster"
          badge="ANIME"
          icon={<Sparkles className="w-5 h-5 text-proz-cyan" />}
        />
      )}

      {/* 13. Marvel & DC Universe */}
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

      {/* 14. Sci-Fi & Mind-Benders */}
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

      {/* 15. Action & Adrenaline Thrillers */}
      {actionThrillers.length > 0 && (
        <ContentRow
          title="Action & Adrenaline Thrillers"
          subtitle="High-octane shootouts, martial arts, and relentless thrill rides"
          items={actionThrillers}
          viewAllHref="/movies?genre=action"
          aspectRatio="poster"
          badge="ADRENALINE"
          icon={<Zap className="w-5 h-5 text-amber-400" />}
        />
      )}

      {/* 16. Top Rated Masterworks */}
      <ContentRow
        title="Top Rated Masterworks"
        subtitle="Unmatched cinematic masterworks boasting the highest critic and audience scores"
        items={topRated}
        viewAllHref="/movies?sort=rating"
        aspectRatio="poster"
        badge="TOP RATED"
        icon={<Award className="w-5 h-5 text-yellow-400" />}
      />

      {/* 17. Upcoming Releases */}
      {upcomingReleases.length > 0 && (
        <ContentRow
          title="Upcoming Releases"
          subtitle="Highly anticipated premieres slated for 2026 release"
          items={upcomingReleases}
          viewAllHref="/movies?sort=latest"
          aspectRatio="backdrop"
          badge="COMING SOON"
          icon={<Calendar className="w-5 h-5 text-purple-400" />}
        />
      )}

      {/* 18. Recommended For You */}
      <ContentRow
        title="Recommended For You"
        subtitle="Curated picks personalized for your cinematic taste"
        items={recommendedForYou}
        viewAllHref="/movies?sort=rating"
        aspectRatio="backdrop"
        badge="FOR YOU"
        icon={<Star className="w-5 h-5 text-amber-400" />}
      />

      {/* Action Button Pair: [More Wonderful] and [Change] (Reference Cinema HD Feature) */}
      <ActionButtonPair moreHref="/explore" />

      {/* 19. My List / Recently Watched */}
      <MyListRow />

      {/* 20. Popular Genres & Collections Grid */}
      <GenreGrid />
    </div>
  );
}
