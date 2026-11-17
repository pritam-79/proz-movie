'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Star } from 'lucide-react';
import { ContentItem } from '@/types/content';

interface ContentCardProps {
  item: ContentItem;
  className?: string;
  aspectRatio?: 'poster' | 'backdrop' | string;
  showBadge?: boolean;
  onClick?: () => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({ item, className = '', aspectRatio = 'poster' }) => {
  const typeLabel =
    (item.content_type || item.type) === 'movie'
      ? 'Movie'
      : (item.content_type || item.type) === 'anime'
      ? 'Anime'
      : (item.content_type || item.type) === 'drama'
      ? 'Drama'
      : 'Series';

  const isBackdrop = aspectRatio === 'backdrop';
  const imageUrl = isBackdrop
    ? (item.backdrop_url || item.backdropUrl || item.poster_url || item.posterUrl)
    : (item.poster_url || item.posterUrl || item.backdrop_url || item.backdropUrl);

  return (
    <Link
      href={`/title/${item.id}`}
      className={`group relative block ${isBackdrop ? 'aspect-video' : 'aspect-[2/3]'} rounded-xl overflow-hidden bg-[#111827] border border-[#334155]/60 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:border-[#8B5CF6]/60 ${className}`}
    >
      {/* Poster */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#111827] via-[#1e1b4b] to-[#080B12] flex items-center justify-center">
          <span className="text-[#334155] text-xs font-medium px-2 text-center">{item.title}</span>
        </div>
      )}

      {/* Always-visible bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080B12] via-transparent to-transparent pointer-events-none" />

      {/* Hover overlay with play button */}
      <div className="absolute inset-0 bg-[#080B12]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-[#8B5CF6] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.6)] transition-transform duration-200 group-hover:scale-110">
          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
        </div>
      </div>

      {/* Top badges */}
      <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1 z-10 pointer-events-none">
        <div className="flex flex-col gap-1">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#111827]/80 backdrop-blur-md border border-[#334155]/60 text-[#22D3EE]">
            {typeLabel}
          </span>
          {item.is_adult && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-600/90 text-white border border-rose-400/50">
              18+
            </span>
          )}
          {item.age_rating && item.age_rating !== '18+' && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#111827]/80 backdrop-blur-md border border-[#334155]/60 text-[#94A3B8]">
              {item.age_rating}
            </span>
          )}
        </div>
      </div>

      {/* Bottom info always visible */}
      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
        <p className="text-sm font-semibold text-[#F8FAFC] truncate leading-tight mb-1">
          {item.title}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-[#94A3B8]">
          {(item.rating_avg != null || item.ratingScore != null) && (
            <span className="flex items-center gap-0.5 text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
              {(item.rating_avg ?? item.ratingScore)?.toFixed(1)}
            </span>
          )}
          {(item.release_year || item.releaseYear) && (
            <span>{item.release_year || item.releaseYear}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ContentCard;
