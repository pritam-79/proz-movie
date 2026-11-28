'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ContentItem } from '@/types/content';
import ContentCard from '@/components/content/ContentCard';

interface ContentRowProps {
  title: string;
  items: ContentItem[];
  loading?: boolean;
  viewAllHref?: string;
  badge?: string;
  subtitle?: string;
  aspectRatio?: 'poster' | 'backdrop' | string;
  icon?: React.ReactNode;
}

export const ContentRow: React.FC<ContentRowProps> = ({
  title,
  items,
  loading = false,
  viewAllHref,
  badge,
  subtitle,
  aspectRatio = 'poster',
  icon,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const safeItems: ContentItem[] = Array.isArray(items)
    ? items
    : Array.isArray((items as any)?.data)
    ? (items as any).data
    : Array.isArray((items as any)?.items)
    ? (items as any).items
    : [];

  if (!loading && safeItems.length === 0) return null;

  const isBackdrop = aspectRatio === 'backdrop';

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5 gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            {icon ? (
              <span className="text-proz-purple shrink-0">{icon}</span>
            ) : (
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-proz-purple to-proz-cyan shrink-0" />
            )}
            <h2 className="text-base sm:text-lg font-extrabold text-proz-white tracking-tight truncate">{title}</h2>
            {badge && (
              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase bg-proz-purple/15 text-proz-purple border border-proz-purple/30 shrink-0">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-proz-grey mt-0.5 line-clamp-1">{subtitle}</p>
          )}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-xs font-semibold text-proz-cyan hover:text-proz-purple transition-colors shrink-0"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Horizontal scroll */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide no-scrollbar snap-x snap-mandatory pb-2"
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`flex-shrink-0 ${
                  isBackdrop
                    ? 'w-[260px] sm:w-[320px] aspect-[16/9]'
                    : 'w-[150px] sm:w-[180px] aspect-[2/3]'
                } animate-pulse bg-[#111827] rounded-xl border border-[#334155]/40 snap-start`}
              />
            ))
          : safeItems.map((item) => (
              <div
                key={item.id}
                className={`flex-shrink-0 ${
                  isBackdrop ? 'w-[260px] sm:w-[320px]' : 'w-[150px] sm:w-[180px]'
                } snap-start`}
              >
                <ContentCard item={item} aspectRatio={aspectRatio} />
              </div>
            ))}
      </div>
    </section>
  );
};

export default ContentRow;
