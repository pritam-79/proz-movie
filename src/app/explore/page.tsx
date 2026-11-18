"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Compass, 
  Film, 
  Sparkles, 
  Clapperboard, 
  Globe2, 
  Filter, 
  Search,
  ChevronRight,
  Flame
} from 'lucide-react';
import { MOCK_CONTENT } from '@/lib/data/mockContent';
import ContentCard from '@/components/content/ContentCard';

const STUDIOS = [
  { name: 'Marvel Studios', icon: '⚡', query: 'marvel' },
  { name: 'DC Universe', icon: '🦇', query: 'dc' },
  { name: 'Warner Bros.', icon: '🛡️', query: 'warner' },
  { name: 'Disney', icon: '✨', query: 'disney' },
  { name: 'Studio Ghibli', icon: '🍃', query: 'ghibli' },
  { name: 'A24', icon: '🎨', query: 'a24' },
  { name: 'Sony Pictures', icon: '🎥', query: 'sony' },
  { name: 'Netflix Originals', icon: '🔴', query: 'netflix' },
];

const GENRES = [
  'All',
  'Action',
  'Sci-Fi',
  'Thriller',
  'Horror',
  'Drama',
  'Comedy',
  'Romance',
  'Anime',
  'Fantasy',
  'Crime',
  'Mystery',
  'Adventure',
];

const REGIONS = [
  { label: 'All Regions', val: 'all' },
  { label: 'Bollywood (India)', val: 'bollywood' },
  { label: 'Hollywood (US)', val: 'hollywood' },
  { label: 'South Indian', val: 'south' },
  { label: 'Korean (K-Drama)', val: 'drama' },
  { label: 'Japanese Anime', val: 'anime' },
  { label: 'Bengali Cinema', val: 'bengali' },
];

export default function ExplorePage() {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [activeStudio, setActiveStudio] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    let list = [...MOCK_CONTENT].filter((i) => !i.isRestricted18Plus);

    // Filter by Studio
    if (activeStudio) {
      list = list.filter((i) => 
        i.title.toLowerCase().includes(activeStudio) ||
        (i.synopsis && i.synopsis.toLowerCase().includes(activeStudio)) ||
        (i.tags && i.tags.some(t => t.toLowerCase().includes(activeStudio)))
      );
    }

    // Filter by Genre
    if (selectedGenre !== 'All') {
      list = list.filter((i) => {
        const gList = i.genres as string[];
        return gList && gList.some(g => g.toLowerCase() === selectedGenre.toLowerCase());
      });
    }

    // Filter by Region
    if (selectedRegion !== 'all') {
      list = list.filter((i) => {
        if (selectedRegion === 'anime') return i.type === 'anime' || (i.genres as string[])?.includes('Anime');
        if (selectedRegion === 'drama') return i.type === 'drama' || i.category === 'drama';
        return i.category === selectedRegion;
      });
    }

    // Filter by query
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      list = list.filter((i) => 
        i.title.toLowerCase().includes(q) ||
        (i.synopsis && i.synopsis.toLowerCase().includes(q))
      );
    }

    return list;
  }, [selectedGenre, selectedRegion, searchFilter, activeStudio]);

  return (
    <div className="min-h-screen bg-[#07090E] text-zinc-100 pb-16">
      
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-rose-950/40 via-red-950/10 to-transparent pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>DISCOVERY MATRIX</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Explore Entertainment
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Browse by legendary studios, curated genres, global languages, and cinematic universes.
          </p>
        </div>

        {/* Studios Slider */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Clapperboard className="w-3.5 h-3.5 text-rose-400" />
            Top Studios & Universes
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {STUDIOS.map((studio) => {
              const isActive = activeStudio === studio.query;
              return (
                <button
                  key={studio.name}
                  onClick={() => setActiveStudio(isActive ? null : studio.query)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    isActive
                      ? 'bg-rose-600/20 border-rose-500 text-white shadow-[0_0_12px_rgba(225,29,72,0.3)]'
                      : 'bg-[#121620] border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  <span className="text-xl mb-1">{studio.icon}</span>
                  <span className="text-[11px] font-semibold truncate w-full">{studio.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Region / Category Tabs */}
        <div className="mb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar text-xs">
            {REGIONS.map((reg) => {
              const isSelected = selectedRegion === reg.val;
              return (
                <button
                  key={reg.val}
                  onClick={() => setSelectedRegion(reg.val)}
                  className={`px-3.5 py-1.5 rounded-full whitespace-nowrap font-medium transition-all ${
                    isSelected
                      ? 'bg-rose-600 text-white font-semibold shadow-sm'
                      : 'bg-[#121620] text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {reg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Genre Pill Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar text-xs">
            {GENRES.map((genre) => {
              const isSelected = selectedGenre === genre;
              return (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                    isSelected
                      ? 'bg-zinc-100 text-black font-bold'
                      : 'bg-[#151A26] text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search bar inside Explore */}
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter matching titles..."
            className="w-full bg-[#121620] text-zinc-100 placeholder-zinc-500 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-rose-500 transition-all"
          />
        </div>

        {/* Results Grid */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            Discovered Titles
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
              {filteredItems.length}
            </span>
          </h2>

          {(selectedGenre !== 'All' || selectedRegion !== 'all' || activeStudio || searchFilter) && (
            <button
              onClick={() => {
                setSelectedGenre('All');
                setSelectedRegion('all');
                setActiveStudio(null);
                setSearchFilter('');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium"
            >
              Reset all filters
            </button>
          )}
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {filteredItems.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4 rounded-2xl bg-[#0F131D]/40 border border-zinc-800/60">
            <Film className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-zinc-300 mb-1">No matching titles</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
              Try adjusting your studio, genre, or region criteria.
            </p>
            <button
              onClick={() => {
                setSelectedGenre('All');
                setSelectedRegion('all');
                setActiveStudio(null);
                setSearchFilter('');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
