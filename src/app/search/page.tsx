"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Film, Tv, Star, X, Filter, ArrowRight } from 'lucide-react';
import { MOCK_CONTENT } from '@/lib/data/mockContent';
import ContentCard from '@/components/content/ContentCard';
import { ContentItem } from '@/types/content';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [results, setResults] = useState<ContentItem[]>([]);

  useEffect(() => {
    let list = MOCK_CONTENT.filter(c => !c.isRestricted18Plus);

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(item => {
        const titleMatch = item.title?.toLowerCase().includes(q);
        const synopsisMatch = (item.synopsis || item.description || '')?.toLowerCase().includes(q);
        const genresMatch = Array.isArray(item.genres) && item.genres.some(g => (typeof g === 'string' ? g : g.name)?.toLowerCase().includes(q));
        const castMatch = Array.isArray(item.cast) && item.cast.some(c => c.name?.toLowerCase().includes(q) || (c.character && c.character.toLowerCase().includes(q)));
        const crewMatch = Array.isArray(item.crew) && item.crew.some(cr => cr.name?.toLowerCase().includes(q));
        return Boolean(titleMatch || synopsisMatch || genresMatch || castMatch || crewMatch);
      });
    }

    if (selectedType !== 'all') {
      list = list.filter(item => item.type === selectedType);
    }

    if (selectedCategory !== 'all') {
      list = list.filter(item => item.category === selectedCategory);
    }

    setResults(list);
  }, [query, selectedType, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-proz-white tracking-tight">
          Global Entertainment Search
        </h1>

        {/* Search Input */}
        <div className="relative max-w-2xl">
          <Search className="w-5 h-5 text-proz-cyan absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, actor, director, genre, language..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl glass-input text-sm sm:text-base shadow-glass"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-proz-grey hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-proz-grey font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Type:
          </span>
          {['all', 'movie', 'series'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-full capitalize font-semibold transition-all ${
                selectedType === t
                  ? 'bg-proz-cyan text-proz-midnight font-bold'
                  : 'glass-pill text-proz-grey hover:text-white'
              }`}
            >
              {t === 'all' ? 'All Types' : t === 'movie' ? 'Movies' : 'Web Series'}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs text-proz-grey border-b border-proz-border/40 pb-3">
        Found {results.length} results {query && <span>for &quot;{query}&quot;</span>}
      </div>

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {results.map((item) => (
            <ContentCard key={item.id} item={item} aspectRatio="poster" />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center glass-card rounded-3xl border border-proz-border/50 max-w-lg mx-auto p-8 space-y-3">
          <Search className="w-12 h-12 text-proz-grey/40 mx-auto" />
          <h3 className="text-base font-bold text-proz-white">No Results Found</h3>
          <p className="text-xs text-proz-grey">
            We couldn&apos;t find any matches for &quot;{query}&quot;. Try checking for spelling mistakes or explore our trending catalog.
          </p>
          <button
            onClick={() => {
              setQuery('');
              setSelectedType('all');
            }}
            className="mt-2 px-6 py-2.5 rounded-full glass-button-primary text-xs font-bold"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
}

export default function GlobalSearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-proz-grey">
        Loading Search Engine...
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
