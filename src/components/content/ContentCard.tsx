"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, Bookmark, Star, Sparkles, Check, Film, Tv } from 'lucide-react';
import { ContentItem } from '@/types/content';
import { useAuth } from '@/context/AuthContext';

interface ContentCardProps {
  item: ContentItem;
  aspectRatio?: 'poster' | 'backdrop';
  showCategoryBadge?: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  aspectRatio = 'poster',
  showCategoryBadge = true,
}) => {
  const router = useRouter();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const inWatchlist = isInWatchlist(item.id);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(item.id);
    } else {
      addToWatchlist(item.id);
    }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/watch/${item.id}`);
  };

  const imageSrc = aspectRatio === 'backdrop' ? item.backdropUrl : item.posterUrl;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative select-none cursor-pointer flex flex-col"
    >
      <Link href={`/title/${item.id}`} className="block relative w-full overflow-hidden rounded-2xl glass-card transition-all duration-300 group-hover:scale-103 group-hover:shadow-glass-lg group-hover:border-proz-cyan/50">
        
        {/* Poster / Backdrop Image */}
        <div className={`relative w-full ${aspectRatio === 'backdrop' ? 'aspect-video' : 'aspect-[2/3]'} overflow-hidden`}>
          <img
            src={imageSrc}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
            loading="lazy"
          />

          {/* Liquid Glass Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-proz-midnight via-proz-midnight/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 z-10">
            <div className="flex items-center gap-1">
              {item.isOriginal && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-proz-purple/90 text-proz-white shadow-purple-glow flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  PROZ
                </span>
              )}
              {item.isRestricted18Plus && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-600/90 text-white border border-rose-400/50">
                  18+
                </span>
              )}
            </div>

            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold glass-pill text-proz-cyan border border-proz-border/50 uppercase">
              {item.type === 'movie' ? '4K' : 'SERIES'}
            </span>
          </div>

          {/* Hover Play & Action Overlay */}
          <div className={`absolute inset-0 flex items-center justify-center gap-3 bg-proz-midnight/50 backdrop-blur-xs transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
            <button
              onClick={handlePlayClick}
              className="p-3.5 rounded-full glass-button-primary shadow-cyan-glow transform hover:scale-110 active:scale-95 transition-all"
              aria-label={`Play ${item.title}`}
            >
              <Play className="w-4 h-4 fill-white" />
            </button>

            <button
              onClick={handleWatchlistClick}
              className={`p-3 rounded-full glass-button-secondary transform hover:scale-110 active:scale-95 transition-all ${
                inWatchlist ? 'text-proz-cyan border-proz-cyan/60 bg-proz-cyan/20' : ''
              }`}
              aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
            >
              {inWatchlist ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>

          {/* Rating Badge Bottom Right */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md glass-card text-[11px] font-bold text-amber-400 border border-proz-border/40">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{item.ratingScore.toFixed(1)}</span>
          </div>

          {/* Bottom Left Year & Type */}
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 text-[11px] text-proz-grey">
            <span>{item.releaseYear}</span>
            <span>•</span>
            <span className="capitalize">{item.type}</span>
          </div>
        </div>
      </Link>

      {/* Card Info Below */}
      <div className="mt-2.5 px-1 space-y-1">
        <Link href={`/title/${item.id}`}>
          <h3 className="text-xs sm:text-sm font-semibold text-proz-white truncate group-hover:text-proz-cyan transition-colors">
            {item.title}
          </h3>
        </Link>
        <div className="flex items-center justify-between text-[11px] text-proz-grey">
          <span className="truncate max-w-[140px]">{item.genres.slice(0, 2).join(' / ')}</span>
          {showCategoryBadge && (
            <span className="capitalize text-proz-grey/80 text-[10px]">
              {item.category.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
