"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, Tv, Heart, X } from 'lucide-react';
import { getAllChannels } from '@/lib/data/channelsData';
import { Channel } from '@/types/channel';
import { toImageProxyFallback } from '@/lib/utils/streamUtils';

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
  'International',
];

function ChannelAvatarItem({ channel, initials }: { channel: Channel; initials: string }) {
  const [imgStep, setImgStep] = useState(0);
  const src =
    imgStep === 0
      ? channel.logo
      : imgStep === 1 && channel.logo
      ? toImageProxyFallback(channel.logo)
      : '';

  return (
    <div
      className="w-full h-full rounded-full overflow-hidden flex items-center justify-center relative shadow-inner"
      style={{
        background: `radial-gradient(circle at 30% 30%, ${channel.color || '#FF2E54'}dd, #07070A 85%)`,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={channel.name}
          referrerPolicy="no-referrer"
          decoding="async"
          className="w-full h-full object-cover rounded-full"
          loading="lazy"
          onError={() => setImgStep((s) => s + 1)}
        />
      ) : (
        <span className="font-extrabold text-white keep-white text-base sm:text-lg tracking-wider drop-shadow-md select-none">
          {initials}
        </span>
      )}

      {channel.featured && (
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-proz-purple rounded-full border-2 border-proz-midnight" />
      )}
    </div>
  );
}

export default function ChannelsPage() {
  const [allChannels, setAllChannels] = useState<Channel[]>(() => getAllChannels());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc' | 'popular'>('default');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(60);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('proz_channel_favorites');
      if (saved) setFavorites(JSON.parse(saved));
    } catch {}

    // Live sync with merged /api/channels so new upstream channels appear automatically
    fetch('/api/channels')
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && Array.isArray(d.channels) && d.channels.length > 0) {
          setAllChannels(d.channels);
        }
      })
      .catch(() => {});
  }, []);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = favorites.includes(id)
      ? favorites.filter((favId) => favId !== id)
      : [...favorites, id];
    setFavorites(updated);
    try {
      localStorage.setItem('proz_channel_favorites', JSON.stringify(updated));
    } catch {}
  };

  const filteredChannels = useMemo(() => {
    let result = [...allChannels];

    if (selectedCategory === 'Favorites') {
      result = result.filter((c) => favorites.includes(c.id));
    } else if (selectedCategory === 'Popular') {
      result = result.filter((c) => c.featured || (c.rating && c.rating >= 4.7));
    } else if (selectedCategory !== 'All') {
      result = result.filter(
        (c) => c.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    if (sortOrder === 'asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOrder === 'popular') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [allChannels, selectedCategory, searchQuery, sortOrder, favorites]);

  const displayedChannels = useMemo(
    () => filteredChannels.slice(0, visibleCount),
    [filteredChannels, visibleCount]
  );

  return (
    <div className="min-h-screen bg-proz-midnight text-proz-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 pb-28">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-proz-purple/15 border border-proz-purple/30 text-proz-purple text-xs font-bold mb-1.5">
                <Tv className="w-3.5 h-3.5" />
                <span>VERIFIED STREAMING CHANNELS</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight text-proz-white flex items-center gap-2.5">
                <span>All Channels</span>
                <span className="text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-full bg-proz-elevated text-proz-grey border border-proz-border/50">
                  {filteredChannels.length}
                </span>
              </h1>
            </div>

            <button
              onClick={() =>
                setSelectedCategory(selectedCategory === 'Favorites' ? 'All' : 'Favorites')
              }
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedCategory === 'Favorites'
                  ? 'bg-proz-purple text-white keep-white border-proz-purple shadow-purple-glow'
                  : 'glass-button-secondary'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  selectedCategory === 'Favorites' ? 'fill-white text-white' : ''
                }`}
              />
              <span className="hidden sm:inline">Favorites</span>
              <span>({favorites.length})</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-proz-grey pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Naughty America, Ullu, Alt Balaji, Vixen, Brazzers, Dani Daniels..."
              className="w-full glass-input text-sm pl-10 pr-9 py-2.5 rounded-2xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 rounded-full text-proz-grey hover:text-proz-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills & Sorting */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-7">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar text-xs">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setVisibleCount(60);
                  }}
                  className={`px-3.5 py-1.5 rounded-full whitespace-nowrap font-semibold transition-all border ${
                    isSelected
                      ? 'bg-gradient-to-r from-proz-purple to-orange-600 text-white keep-white border-transparent shadow-purple-glow'
                      : 'bg-proz-elevated/60 text-proz-grey hover:text-proz-white border-proz-border/40'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="text-xs text-proz-grey hidden sm:inline">Sort:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="glass-input text-xs rounded-xl px-2.5 py-1.5 cursor-pointer"
            >
              <option value="default">Default</option>
              <option value="asc">A - Z (Alphabetical)</option>
              <option value="desc">Z - A (Reverse)</option>
              <option value="popular">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Circular Avatar Grid */}
        {displayedChannels.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-2.5 gap-y-6 sm:gap-x-4 sm:gap-y-8">
            {displayedChannels.map((channel) => {
              const isFav = favorites.includes(channel.id);
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
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-proz-elevated border border-proz-border/60 group-hover:border-proz-purple transition-all duration-300 shadow-lg group-hover:shadow-purple-glow">
                    <ChannelAvatarItem channel={channel} initials={initials} />

                    <button
                      onClick={(e) => toggleFavorite(e, channel.id)}
                      className={`absolute -top-1 -right-1 p-1 rounded-full backdrop-blur-md border transition-all ${
                        isFav
                          ? 'bg-proz-purple text-white keep-white border-proz-purple scale-105'
                          : 'bg-black/60 text-zinc-400 border-zinc-700/60 opacity-0 group-hover:opacity-100 hover:text-white'
                      }`}
                      title={isFav ? 'Remove favorite' : 'Add favorite'}
                    >
                      <Heart className={`w-3 h-3 ${isFav ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  <div className="mt-2 w-full px-1">
                    <p className="text-xs sm:text-sm font-bold text-proz-white group-hover:text-proz-purple transition-colors line-clamp-2 leading-tight">
                      {channel.name}
                    </p>
                    <span className="text-[10px] text-proz-grey block mt-0.5 font-medium truncate">
                      {channel.category}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 px-4 rounded-3xl cinema-card">
            <Tv className="w-12 h-12 text-proz-grey mx-auto mb-3" />
            <h3 className="text-lg font-bold text-proz-white mb-1">No channels found</h3>
            <p className="text-sm text-proz-grey max-w-sm mx-auto mb-4">
              No channel matched &ldquo;{searchQuery}&rdquo; in {selectedCategory}.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold glass-button-primary"
            >
              Reset Filters
            </button>
          </div>
        )}

        {visibleCount < filteredChannels.length && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setVisibleCount((prev) => Math.min(prev + 60, filteredChannels.length))}
              className="px-6 py-2.5 rounded-full text-xs font-semibold glass-button-secondary"
            >
              Load More Channels ({filteredChannels.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
