import React from 'react';
import { MOCK_CONTENT } from '@/lib/data/mockContent';
import HeroBanner from '@/components/home/HeroBanner';
import ContentRow from '@/components/content/ContentRow';
import ContinueWatchingRow from '@/components/content/ContinueWatchingRow';
import GenreGrid from '@/components/home/GenreGrid';
import { 
  Flame, 
  TrendingUp, 
  Sparkles, 
  Tv, 
  Globe, 
  Heart, 
  Clock, 
  Compass, 
  Star 
} from 'lucide-react';

export default function HomePage() {
  // 1. Featured items for Hero Banner
  const featuredItems = MOCK_CONTENT.filter(c => c.isFeatured && !c.isRestricted18Plus);

  // 2. Trending Movies
  const trendingMovies = MOCK_CONTENT.filter(c => c.type === 'movie' && c.isTrending && !c.isRestricted18Plus);

  // 3. Popular Movies
  const popularMovies = MOCK_CONTENT.filter(c => c.type === 'movie' && !c.isRestricted18Plus);

  // 4. Latest Releases
  const latestReleases = [...MOCK_CONTENT]
    .filter(c => !c.isRestricted18Plus)
    .sort((a, b) => (b.releaseYear || b.release_year || 0) - (a.releaseYear || a.release_year || 0));

  // 5. Popular Web Series
  const webSeries = MOCK_CONTENT.filter(c => c.type === 'series' && !c.isRestricted18Plus);

  // 6. Anime Collection
  const animeCollection = MOCK_CONTENT.filter(c => c.category === 'anime');

  // 7. Korean Dramas & Asian Drama
  const kdramas = MOCK_CONTENT.filter(c => c.category === 'k_drama' || c.category === 'c_drama');

  // 8. International Entertainment
  const international = MOCK_CONTENT.filter(c => c.category === 'international');

  // 9. PROZ Originals
  const originals = MOCK_CONTENT.filter(c => c.isOriginal && !c.isRestricted18Plus);

  // 10. Recommended for you
  const recommended = [...MOCK_CONTENT]
    .filter(c => !c.isRestricted18Plus)
    .sort((a, b) => (b.ratingScore || b.rating_avg || 0) - (a.ratingScore || a.rating_avg || 0));

  return (
    <div className="pb-16 space-y-4">
      {/* 2. Featured Cinematic Hero Banner */}
      <HeroBanner featuredItems={featuredItems} />

      {/* 6. Continue Watching (Appears if user has history) */}
      <ContinueWatchingRow />

      {/* 3. Trending Movies */}
      <ContentRow
        title="Trending Movies"
        subtitle="The most-watched blockbusters across the globe right now"
        items={trendingMovies}
        viewAllHref="/movies?sort=trending"
        aspectRatio="poster"
        icon={<TrendingUp className="w-5 h-5 text-proz-cyan" />}
      />

      {/* 12. Featured Originals (Backdrop Aspect Ratio for cinematic emphasis) */}
      <ContentRow
        title="PROZ Originals"
        subtitle="Exclusive ground-breaking productions in ultra-high fidelity"
        items={originals}
        viewAllHref="/movies?filter=original"
        aspectRatio="backdrop"
        icon={<Sparkles className="w-5 h-5 text-proz-purple" />}
      />

      {/* 7. Popular Web Series */}
      <ContentRow
        title="Popular Web Series"
        subtitle="Binge-worthy drama, thriller and cyberpunk multi-episode sagas"
        items={webSeries}
        viewAllHref="/series"
        aspectRatio="poster"
        icon={<Tv className="w-5 h-5 text-emerald-400" />}
      />

      {/* 8. Anime Collection */}
      <ContentRow
        title="Anime Universe"
        subtitle="Epic adventures, subbed & dubbed masterworks"
        items={animeCollection}
        viewAllHref="/anime"
        aspectRatio="poster"
        icon={<Sparkles className="w-5 h-5 text-amber-400" />}
      />

      {/* 9. Korean & Asian Dramas */}
      <ContentRow
        title="Korean & Asian Dramas"
        subtitle="Romantic intrigues, gripping revenge mysteries and high-stakes thrillers"
        items={kdramas}
        viewAllHref="/drama"
        aspectRatio="poster"
        icon={<Heart className="w-5 h-5 text-rose-400" />}
      />

      {/* 4. Popular Movies */}
      <ContentRow
        title="Popular Movies"
        subtitle="Critically acclaimed cinema rated highest by stream fans"
        items={popularMovies}
        viewAllHref="/movies"
        aspectRatio="poster"
        icon={<Flame className="w-5 h-5 text-orange-400" />}
      />

      {/* 10. International Entertainment */}
      <ContentRow
        title="International Entertainment"
        subtitle="Award-winning global cinema from Europe, Asia and beyond"
        items={international}
        viewAllHref="/movies?category=international"
        aspectRatio="backdrop"
        icon={<Globe className="w-5 h-5 text-sky-400" />}
      />

      {/* 11. Recommended For You */}
      <ContentRow
        title="Recommended For You"
        subtitle="Curated picks personalized for your cinematic taste"
        items={recommended}
        viewAllHref="/movies?sort=rating"
        aspectRatio="poster"
        icon={<Star className="w-5 h-5 text-amber-400" />}
      />

      {/* 5. Latest Releases */}
      <ContentRow
        title="Latest Releases"
        subtitle="Fresh cinema and new seasons added this month"
        items={latestReleases}
        viewAllHref="/movies?sort=latest"
        aspectRatio="poster"
        icon={<Clock className="w-5 h-5 text-indigo-400" />}
      />

      {/* 13. Popular Genres Grid */}
      <GenreGrid />
    </div>
  );
}
