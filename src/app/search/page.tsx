"use client";

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, 
  Film, 
  Tv, 
  Star, 
  X, 
  Filter, 
  ArrowRight,
  SlidersHorizontal,
  Sparkles,
  Calendar,
  Globe,
  Award
} from 'lucide-react';
import { MOCK_CONTENT } from '@/lib/data/mockContent';
import ContentCard from '@/components/content/ContentCard';
import { ContentItem } from '@/types/content';

const GENRES = [
  'All Genres',
  'Action',
  'Sci-Fi',
  'Drama',
  'Thriller',
  'Romance',
  'Comedy',
  'Adventure',
  'Crime',
  'Animation',
  'Mystery'
];

const CATEGORIES = [
  { id: 'all', label: 'All Regions' },
  { id: 'bollywood', label: 'Bollywood' },
  { id: 'hollywood', label: 'Hollywood' },
  { id: 'south_indian', label: 'South Indian' },
  { id: 'k_drama', label: 'Korean Drama' },
  { id: 'anime', label: 'Anime' },
];

const LANGUAGES = [
  'All Languages',
  'English',
  'Hindi',
  'Korean',
  'Japanese',
  'Tamil',
  'Telugu',
  'Spanish'
];

const SORT_OPTIONS = [
  { id: 'popular', label: 'Most Popular' },
  { id: 'highest_rated', label: 'Highest Rated' },
  { id: 'latest', label: 'Latest Releases' },
  { id: 'oldest', label: 'Oldest Releases' },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState<'all' | 'movie' | 'series' | 'anime' | 'drama'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [selectedLanguage, setSelectedLanguage] = useState('All Languages');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState('popular');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Helper
  const getYear = (c: any) => c.releaseYear || c.release_year || 0;
  const getScore = (c: any) => c.ratingScore || c.rating_avg || 0;

  // Filter & Search Logic
  const results = useMemo(() => {
    let list = MOCK_CONTENT.filter(c => !c.isRestricted18Plus && !c.is_adult);

    // Text Query search across: Title, Synopsis, Cast (Actors/Actresses), Crew (Directors), Genres, Country, Language
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(item => {
        const titleMatch = item.title?.toLowerCase().includes(q) || (item.originalTitle || '').toLowerCase().includes(q);
        const synopsisMatch = (item.synopsis || item.description || '')?.toLowerCase().includes(q);
        const genresMatch = Array.isArray(item.genres) && item.genres.some((g: any) => 
          (typeof g === 'string' ? g : g.name)?.toLowerCase().includes(q)
        );
        const castMatch = Array.isArray(item.cast) && item.cast.some((c: any) => 
          c.name?.toLowerCase().includes(q) || (c.character && c.character.toLowerCase().includes(q))
        );
        const crewMatch = Array.isArray(item.crew) && item.crew.some((cr: any) => 
          cr.name?.toLowerCase().includes(q) || (cr.role && cr.role.toLowerCase().includes(q))
        );
        const countryMatch = item.country?.toLowerCase().includes(q);
        const langMatch = Array.isArray(item.languages) && item.languages.some((l: string) => l.toLowerCase().includes(q));

        return Boolean(titleMatch || synopsisMatch || genresMatch || castMatch || crewMatch || countryMatch || langMatch);
      });
    }

    // Filter by Type
    if (selectedType !== 'all') {
      list = list.filter(item => {
        if (selectedType === 'movie') return item.type === 'movie' || item.content_type === 'movie';
        if (selectedType === 'series') return item.type === 'series' || item.content_type === 'series';
        if (selectedType === 'anime') return item.category === 'anime' || item.type === 'anime';
        if (selectedType === 'drama') return item.category === 'k_drama' || item.type === 'drama';
        return true;
      });
    }

    // Filter by Category / Region
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'south_indian') {
        list = list.filter(item => 
          item.title?.includes('Kalki') || 
          item.title?.includes('RRR') || 
          item.title?.includes('K.G.F') || 
          item.title?.includes('Pushpa') || 
          item.title?.includes('Baahubali') || 
          item.title?.includes('Leo')
        );
      } else {
        list = list.filter(item => item.category === selectedCategory);
      }
    }

    // Filter by Genre
    if (selectedGenre !== 'All Genres') {
      list = list.filter(item => {
        if (!item.genres || !Array.isArray(item.genres)) return false;
        return item.genres.some((g: any) => {
          const name = typeof g === 'string' ? g : g.name;
          return name?.toLowerCase() === selectedGenre.toLowerCase();
        });
      });
    }

    // Filter by Language
    if (selectedLanguage !== 'All Languages') {
      list = list.filter(item => {
        if (!item.languages || !Array.isArray(item.languages)) return false;
        return item.languages.some((l: string) => l.toLowerCase().includes(selectedLanguage.toLowerCase()));
      });
    }

    // Filter by Rating
    if (minRating > 0) {
      list = list.filter(item => getScore(item) >= minRating);
    }

    // Sort Results
    const sorted = [...list];
    if (sortBy === 'highest_rated') {
      sorted.sort((a, b) => getScore(b) - getScore(a));
    } else if (sortBy === 'latest') {
      sorted.sort((a, b) => getYear(b) - getYear(a));
    } else if (sortBy === 'oldest') {
      sorted.sort((a, b) => getYear(a) - getYear(b));
    } else {
      // most popular
      sorted.sort((a, b) => (b.view_count || getScore(b) * 1000) - (a.view_count || getScore(a) * 1000));
    }

    return sorted;
  }, [query, selectedType, selectedCategory, selectedGenre, selectedLanguage, minRating, sortBy]);

  const resetAllFilters = () => {
    setQuery('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedGenre('All Genres');
    setSelectedLanguage('All Languages');
    setMinRating(0);
    setSortBy('popular');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header & Main Search Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-proz-white tracking-tight flex items-center gap-3">
            <Search className="w-8 h-8 text-proz-cyan" />
            <span>Advanced Search & Discovery</span>
          </h1>
          <p className="text-xs sm:text-sm text-proz-grey mt-1">
            Search by title, actor, actress, director, genre, release year, language, or country.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="relative max-w-3xl">
          <Search className="w-5 h-5 text-proz-cyan absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles (e.g. Deadpool, Dune, Oppenheimer, RRR, Solo Leveling)..."
            className="w-full pl-12 pr-12 py-3.5 rounded-2xl glass-input text-sm sm:text-base shadow-glass focus:ring-2 focus:ring-proz-cyan/50"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-proz-grey hover:text-white hover:bg-white/10"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Primary Type Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-proz-grey font-semibold mr-1 flex items-center gap-1">
              <Film className="w-3.5 h-3.5 text-proz-cyan" /> Type:
            </span>
            {[
              { id: 'all', label: 'All Content' },
              { id: 'movie', label: 'Movies' },
              { id: 'series', label: 'Web Series' },
              { id: 'anime', label: 'Anime' },
              { id: 'drama', label: 'K-Drama' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id as any)}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                  selectedType === t.id
                    ? 'bg-gradient-to-r from-proz-purple to-proz-cyan text-white shadow-cyan-glow font-bold'
                    : 'glass-pill text-proz-grey hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Toggle Advanced Filters Button */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              showAdvancedFilters
                ? 'bg-proz-cyan/15 border-proz-cyan text-proz-cyan'
                : 'glass-card border-proz-border/50 text-proz-grey hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showAdvancedFilters ? 'Hide Advanced Filters' : 'More Filters'}</span>
          </button>
        </div>

        {/* Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="p-5 rounded-3xl glass-card border border-proz-border/60 shadow-glass-lg space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              
              {/* Region / Category Filter */}
              <div className="space-y-1.5">
                <label className="font-bold text-proz-grey uppercase tracking-wider text-[10px]">
                  Region / Collection
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-proz-white bg-[#080B12]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Genre Filter */}
              <div className="space-y-1.5">
                <label className="font-bold text-proz-grey uppercase tracking-wider text-[10px]">
                  Genre
                </label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-proz-white bg-[#080B12]"
                >
                  {GENRES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Language Filter */}
              <div className="space-y-1.5">
                <label className="font-bold text-proz-grey uppercase tracking-wider text-[10px]">
                  Audio Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-proz-white bg-[#080B12]"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Sort Order */}
              <div className="space-y-1.5">
                <label className="font-bold text-proz-grey uppercase tracking-wider text-[10px]">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-proz-white bg-[#080B12]"
                >
                  {SORT_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Minimum Rating Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-proz-border/30">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-proz-grey uppercase tracking-wider">
                  Minimum Score:
                </span>
                {[0, 7.0, 8.0, 8.5, 9.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setMinRating(rate)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      minRating === rate
                        ? 'bg-amber-400 text-black'
                        : 'glass-card border border-proz-border/40 text-proz-grey hover:text-white'
                    }`}
                  >
                    {rate === 0 ? 'Any' : `${rate}+ ★`}
                  </button>
                ))}
              </div>

              <button
                onClick={resetAllFilters}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Count & Meta */}
      <div className="flex items-center justify-between text-xs text-proz-grey border-b border-proz-border/40 pb-3">
        <span>
          Showing <strong>{results.length}</strong> matching titles
          {query && <span> for &quot;<span className="text-proz-cyan font-bold">{query}</span>&quot;</span>}
        </span>
        <span className="font-mono text-[11px]">PROZ ENGINES ACTIVE</span>
      </div>

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {results.map((item) => (
            <ContentCard key={item.id} item={item} aspectRatio="poster" />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center glass-card rounded-3xl border border-proz-border/50 max-w-lg mx-auto p-8 space-y-4">
          <Search className="w-12 h-12 text-proz-grey/40 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-proz-white">No Matching Titles Found</h3>
            <p className="text-xs text-proz-grey">
              We couldn&apos;t find any content matching your current filter criteria.
            </p>
          </div>
          <button
            onClick={resetAllFilters}
            className="px-6 py-2.5 rounded-full glass-button-primary text-xs font-bold shadow-cyan-glow"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function GlobalSearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-proz-grey">
        Initializing PROZ Search Engine...
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
