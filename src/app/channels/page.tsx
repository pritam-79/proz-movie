"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Tv, 
  Heart, 
  ArrowUpDown, 
  SlidersHorizontal, 
  Sparkles,
  Check,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { getAllChannels } from '@/lib/data/channelsData';
import { Channel } from '@/types/channel';

const CATEGORIES = [
  'All',
  'Popular',
  'Favorites',
  'Indian OTT',
  'Web Series',
  '18+ Exclusive',
  'Regional',
  'Drama',
  'Comedy',
  'International'
];

function ChannelAvatarItem({ channel, initials }: { channel: Channel; initials: string }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div 
      className="w-full h-full rounded-full overflow-hidden flex items-center justify-center relative shadow-inner"
      style={{
        background: `radial-gradient(circle at 30% 30%, ${channel.color || '#991B1B'}dd, #0B0E14 85%)`
      }}
    >
      {channel.logo && !imgErr ? (
        <img
          src={channel.logo}
          alt={channel.name}
          className="w-full h-full object-cover rounded-full"
          loading="lazy"
          onError={() => setImgErr(true)}
        />
      ) : (
        <span className="font-extrabold text-white text-base sm:text-lg tracking-wider drop-shadow-md select-none">
          {initials}
        </span>
      )}

      {/* Subtle channel badge overlay */}
      {channel.featured && (
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#0B0E14]" />
      )}
    </div>
  );
}

export default function ChannelsPage() {
  const allChannels = useMemo(() => getAllChannels(), []);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc' | 'popular'>('default');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(48);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('proz_channel_favorites');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    let updated: string[];
    if (favorites.includes(id)) {
      updated = favorites.filter((favId) => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    try {
      localStorage.setItem('proz_channel_favorites', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Filter and sort channels
  const filteredChannels = useMemo(() => {
    let result = [...allChannels];

    // Category filter
    if (selectedCategory === 'Favorites') {
      result = result.filter((c) => favorites.includes(c.id));
    } else if (selectedCategory === 'Popular') {
      result = result.filter((c) => c.featured || (c.rating && c.rating >= 4.7));
    } else if (selectedCategory !== 'All') {
      result = result.filter(
        (c) => c.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortOrder === 'asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOrder === 'popular') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [allChannels, selectedCategory, searchQuery, sortOrder, favorites]);

  const displayedChannels = useMemo(() => {
    return filteredChannels.slice(0, visibleCount);
  }, [filteredChannels, visibleCount]);

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 48, filteredChannels.length));
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-zinc-100">
      
      {/* Top Ambient Burgundy/Red Glow */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-rose-950/40 via-red-950/10 to-transparent pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-28">
        
        {/* Header & Title */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-1">
                <Tv className="w-3.5 h-3.5" />
                <span>OFFICIAL DIRECTORY</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                All Channels
                <span className="text-xs sm:text-sm font-normal px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {filteredChannels.length}
                </span>
              </h1>
            </div>
            
            {/* Quick action: Favorites toggle */}
            <button
              onClick={() => setSelectedCategory(selectedCategory === 'Favorites' ? 'All' : 'Favorites')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedCategory === 'Favorites'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${selectedCategory === 'Favorites' ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span className="hidden sm:inline">My Favorites</span>
              <span>({favorites.length})</span>
            </button>
          </div>
        </div>

        {/* Search Bar matching screenshot ("Search a title...") */}
        <div className="relative mb-3">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search a title or channel name..."
              className="w-full bg-[#121620] text-zinc-100 placeholder-zinc-500 text-sm pl-10 pr-9 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills & Sorting Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-6">
          {/* Horizontal scrollable category pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar text-xs">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setVisibleCount(48);
                  }}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-all ${
                    isSelected
                      ? 'bg-rose-600 text-white font-semibold shadow-[0_0_12px_rgba(225,29,72,0.4)]'
                      : 'bg-[#131722] text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="text-xs text-zinc-400 hidden sm:inline">Sort:</span>
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="bg-[#131722] text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 border border-zinc-800 focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="default">Default</option>
                <option value="asc">A - Z (Alphabetical)</option>
                <option value="desc">Z - A (Reverse)</option>
                <option value="popular">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3-Column Mobile Circular Avatar Grid matching Screenshots! */}
        {displayedChannels.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-2.5 gap-y-6 sm:gap-x-4 sm:gap-y-8">
            {displayedChannels.map((channel) => {
              const isFav = favorites.includes(channel.id);
              // Initials fallback
              const initials = channel.name
                .split(' ')
                .slice(0, 2)
                .map((w) => w[0])
                .join('')
                .toUpperCase();

              return (
                <Link
                  key={channel.id}
                  href={`/channels/${channel.slug}`}
                  className="group flex flex-col items-center text-center transition-transform duration-200 active:scale-95"
                >
                  {/* Circular Avatar Container */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-b from-zinc-700/40 via-zinc-800/20 to-zinc-900 border border-zinc-800 group-hover:border-rose-500/80 transition-all duration-300 shadow-lg group-hover:shadow-[0_0_15px_rgba(225,29,72,0.3)]">
                    <ChannelAvatarItem channel={channel} initials={initials} />

                    {/* Quick favorite heart button */}
                    <button
                      onClick={(e) => toggleFavorite(e, channel.id)}
                      className={`absolute -top-1 -right-1 p-1 rounded-full backdrop-blur-md border transition-all ${
                        isFav
                          ? 'bg-rose-600/90 text-white border-rose-400 scale-105'
                          : 'bg-black/60 text-zinc-400 border-zinc-700/60 opacity-0 group-hover:opacity-100 hover:text-white'
                      }`}
                      title={isFav ? 'Remove favorite' : 'Add favorite'}
                    >
                      <Heart className={`w-3 h-3 ${isFav ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  {/* Channel Title below circle */}
                  <div className="mt-2 w-full px-1">
                    <p className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-rose-400 transition-colors line-clamp-2 leading-tight">
                      {channel.name}
                    </p>
                    <span className="text-[10px] text-zinc-500 block mt-0.5 font-medium truncate">
                      {channel.category}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-20 px-4 rounded-2xl bg-[#0F131D]/40 border border-zinc-800/60">
            <Tv className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-zinc-300 mb-1">No channels found</h3>
            <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-4">
              We couldn&apos;t find any channel matching &quot;{searchQuery}&quot; in {selectedCategory}.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Load More Button */}
        {visibleCount < filteredChannels.length && (
          <div className="mt-10 text-center">
            <button
              onClick={loadMore}
              className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#161B26] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 transition-all shadow-md active:scale-95"
            >
              Load More Channels ({filteredChannels.length - visibleCount} remaining)
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
