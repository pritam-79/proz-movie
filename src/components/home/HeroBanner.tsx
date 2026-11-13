"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, Info, Bookmark, Star, Volume2, VolumeX, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentItem } from '@/types/content';
import { useAuth } from '@/context/AuthContext';

interface HeroBannerProps {
  featuredItems: ContentItem[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ featuredItems }) => {
  const router = useRouter();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const currentItem = featuredItems[currentIndex] || featuredItems[0];

  useEffect(() => {
    if (featuredItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [featuredItems.length]);

  if (!currentItem) return null;

  const inWatchlist = isInWatchlist(currentItem.id);

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWatchlist) {
      removeFromWatchlist(currentItem.id);
    } else {
      addToWatchlist(currentItem.id);
    }
  };

  return (
    <div className="relative w-full h-[75vh] min-h-[550px] max-h-[820px] overflow-hidden select-none">
      
      {/* Background Backdrop Image with cinematic gradients */}
      <div className="absolute inset-0 z-0">
        <img
          src={currentItem.backdropUrl}
          alt={currentItem.title}
          className="w-full h-full object-cover object-center filter brightness-90 transform scale-102 transition-all duration-1000 ease-out"
        />
        
        {/* Cinematic Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-proz-midnight via-proz-midnight/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-proz-midnight via-proz-midnight/70 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-proz-midnight/80 to-transparent" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 sm:pb-24">
        
        <div className="max-w-2xl space-y-4">
          
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
            {currentItem.isOriginal && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-proz-purple to-proz-cyan text-proz-white shadow-purple-glow uppercase tracking-wider text-[10px]">
                <Sparkles className="w-3 h-3" />
                PROZ Original
              </span>
            )}
            
            <span className="px-2 py-0.5 rounded-md glass-card text-proz-white text-xs border border-proz-border/50">
              {currentItem.maturityRating}
            </span>

            <span className="flex items-center gap-1 text-amber-400 font-bold px-2 py-0.5 rounded-md glass-card border border-proz-border/50">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {currentItem.ratingScore}
            </span>

            <span className="text-proz-grey">{currentItem.releaseYear}</span>
            <span className="text-proz-grey">•</span>
            <span className="text-proz-grey">
              {currentItem.runtimeMinutes ? `${currentItem.runtimeMinutes} min` : 'Series'}
            </span>
            <span className="text-proz-grey">•</span>
            <span className="text-proz-cyan capitalize font-medium">
              {currentItem.category.replace('_', ' ')}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-proz-white tracking-tight leading-none drop-shadow-md">
            {currentItem.title}
          </h1>

          {/* Tagline / Synopsis */}
          {currentItem.tagline && (
            <p className="text-sm sm:text-base font-medium text-proz-cyan/90 italic">
              &quot;{currentItem.tagline}&quot;
            </p>
          )}

          <p className="text-xs sm:text-sm text-proz-white/80 line-clamp-3 leading-relaxed max-w-xl">
            {currentItem.synopsis}
          </p>

          {/* Genre Badges */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {currentItem.genres.map((g) => (
              <span key={g} className="px-2.5 py-1 rounded-full text-[11px] glass-pill text-proz-white/90">
                {g}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            
            {/* Watch Now */}
            <Link
              href={`/watch/${currentItem.id}`}
              className="flex items-center gap-2.5 px-6 py-3 rounded-full glass-button-primary text-sm font-bold shadow-cyan-glow group"
            >
              <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
              <span>Watch Now</span>
            </Link>

            {/* More Info */}
            <Link
              href={`/title/${currentItem.id}`}
              className="flex items-center gap-2 px-5 py-3 rounded-full glass-button-secondary text-sm font-semibold hover:border-proz-cyan/40"
            >
              <Info className="w-4 h-4 text-proz-cyan" />
              <span>Details</span>
            </Link>

            {/* Watchlist Toggle */}
            <button
              onClick={toggleWatchlist}
              className={`flex items-center gap-2 px-4 py-3 rounded-full glass-button-secondary text-sm font-semibold transition-all ${
                inWatchlist ? 'text-proz-cyan border-proz-cyan/50 bg-proz-cyan/10' : ''
              }`}
              aria-label="Add to Watchlist"
            >
              <Bookmark className={`w-4 h-4 ${inWatchlist ? 'fill-proz-cyan text-proz-cyan' : ''}`} />
              <span className="hidden sm:inline">
                {inWatchlist ? 'In Watchlist' : 'Watchlist'}
              </span>
            </button>
          </div>

        </div>

      </div>

      {/* Carousel Switcher Dots & Arrows */}
      {featuredItems.length > 1 && (
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
          <div className="flex items-center gap-1.5 mr-2">
            {featuredItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-6 bg-proz-cyan shadow-cyan-glow' : 'w-2 bg-proz-border/70 hover:bg-proz-grey'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentIndex((prev) => (prev === 0 ? featuredItems.length - 1 : prev - 1))}
            className="p-2 rounded-full glass-card hover:border-proz-cyan/50 text-proz-white transition-all"
            aria-label="Previous featured"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredItems.length)}
            className="p-2 rounded-full glass-card hover:border-proz-cyan/50 text-proz-white transition-all"
            aria-label="Next featured"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};

export default HeroBanner;
