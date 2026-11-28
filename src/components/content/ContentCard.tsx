'use client';

import React from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { ContentItem } from '@/types/content';
import { toImageProxyFallback } from '@/lib/utils/streamUtils';

interface ContentCardProps {
  item: ContentItem;
  className?: string;
  aspectRatio?: 'poster' | 'backdrop' | string;
  showBadge?: boolean;
  updateStatus?: string;
  onClick?: () => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  className = '',
  aspectRatio = 'poster',
  updateStatus,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [fallbackStep, setFallbackStep] = React.useState(0);

  const typeLabel =
    (item.content_type || item.type) === 'movie'
      ? 'Movie'
      : (item.content_type || item.type) === 'anime'
      ? 'Anime'
      : (item.content_type || item.type) === 'drama'
      ? 'Drama'
      : 'Series';

  const isBackdrop = aspectRatio === 'backdrop';
  const primaryUrl = isBackdrop
    ? item.backdrop_url || item.backdropUrl || item.poster_url || item.posterUrl
    : item.poster_url || item.posterUrl || item.backdrop_url || item.backdropUrl;

  const backupUrl = item.backdrop_url || item.backdropUrl || item.poster_url || item.posterUrl;
  const imageUrl =
    fallbackStep === 0
      ? primaryUrl
      : fallbackStep === 1 && backupUrl && backupUrl !== primaryUrl
      ? backupUrl
      : toImageProxyFallback(primaryUrl || backupUrl);

  const score = item.rating_avg ?? item.ratingScore;
  const displayScore = score ? score.toFixed(1) : null;

  const episodesBadge =
    updateStatus ||
    (item as any).updateBadge ||
    (item.type === 'series' && item.seasons && (item.seasons[0] as any)?.episodes?.length
      ? `Update to ${(item.seasons[0] as any).episodes.length}`
      : null);

  return (
    <div className={`flex flex-col group ${className}`}>
      <Link
        href={`/title/${item.id}`}
        className={`relative block ${
          isBackdrop ? 'aspect-video' : 'aspect-[2/3]'
        } rounded-2xl overflow-hidden bg-proz-navy border border-proz-border/55 transition-all duration-300 hover:scale-[1.03] hover:shadow-purple-glow hover:border-proz-purple/70`}
      >
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={item.title}
            referrerPolicy="no-referrer"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => {
              if (fallbackStep < 2) {
                setFallbackStep((s) => s + 1);
              } else {
                setImageError(true);
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-proz-elevated via-proz-navy to-proz-midnight flex flex-col items-center justify-center p-3 text-center relative overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-proz-purple/20 border border-proz-purple/35 flex items-center justify-center mb-2">
              <Play className="w-4 h-4 text-proz-purple fill-proz-purple/40 ml-0.5" />
            </div>
            <span className="text-proz-white text-xs font-semibold line-clamp-2 px-1 leading-snug">
              {item.title}
            </span>
            <span className="text-[10px] text-proz-grey mt-1 uppercase tracking-wider font-mono">
              {typeLabel}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent pointer-events-none" />

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-proz-purple to-orange-600 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>

        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
          {item.is_adult && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-proz-purple text-white keep-white tracking-wider shadow">
              18+
            </span>
          )}
        </div>

        <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between z-10 pointer-events-none">
          {episodesBadge ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-white keep-white border border-white/10 shadow">
              {episodesBadge}
            </span>
          ) : (
            <span />
          )}

          {displayScore && (
            <span className="text-xs font-black text-amber-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] ml-auto">
              ★ {displayScore}
            </span>
          )}
        </div>
      </Link>

      <div className="mt-1.5 px-0.5">
        <Link
          href={`/title/${item.id}`}
          className="text-xs font-semibold text-proz-white hover:text-proz-purple transition-colors line-clamp-1 leading-snug"
          title={item.title}
        >
          {item.title}
        </Link>
        <span className="text-[10px] text-proz-grey block truncate mt-0.5">
          {typeLabel} {item.release_year || item.releaseYear ? `• ${item.release_year || item.releaseYear}` : ''}
        </span>
      </div>
    </div>
  );
};

export default ContentCard;
