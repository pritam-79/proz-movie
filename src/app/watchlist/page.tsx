"use client";

import React from 'react';
import Link from 'next/link';
import { Bookmark, Film, Play, Trash2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { MOCK_CONTENT } from '@/lib/data/mockContent';
import ContentCard from '@/components/content/ContentCard';

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist } = useAuth();

  const watchlistItems = MOCK_CONTENT.filter(c => watchlist.includes(c.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-proz-border/40 pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-proz-white tracking-tight flex items-center gap-3">
            <Bookmark className="w-7 h-7 text-proz-cyan fill-proz-cyan/20" />
            <span>My Watchlist</span>
          </h1>
          <p className="text-xs sm:text-sm text-proz-grey">
            {watchlistItems.length} {watchlistItems.length === 1 ? 'title' : 'titles'} saved for later
          </p>
        </div>

        {watchlistItems.length > 0 && (
          <Link
            href={`/watch/${watchlistItems[0].id}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full glass-button-primary text-xs font-bold shadow-cyan-glow"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Play First</span>
          </Link>
        )}
      </div>

      {/* Grid of Saved Items */}
      {watchlistItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {watchlistItems.map((item) => (
            <div key={item.id} className="relative group">
              <ContentCard item={item} aspectRatio="poster" />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeFromWatchlist(item.id);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-proz-midnight/80 border border-proz-border text-proz-grey hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                title="Remove from Watchlist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center glass-card rounded-3xl border border-proz-border/50 max-w-lg mx-auto p-8 space-y-4">
          <Bookmark className="w-12 h-12 text-proz-grey/40 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-proz-white">Your Watchlist is Empty</h3>
            <p className="text-xs text-proz-grey leading-relaxed">
              Explore trending movies, bingeable web series, and anime. Tap the bookmark icon to queue titles here.
            </p>
          </div>
          <Link
            href="/movies"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-button-primary text-xs font-bold"
          >
            <span>Explore Movies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

    </div>
  );
}
