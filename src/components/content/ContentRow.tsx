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
    <section className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-3">
            {icon ? (
              <span className="text-[#8B5CF6]">{icon}</span>
            ) : (
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#8B5CF6] to-[#22D3EE]" />
            )}
            <h2 className="text-lg font-bold text-[#F8FAFC] tracking-tight">{title}</h2>
            {badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-[#94A3B8] ml-4 mt-0.5">{subtitle}</p>
          )}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-xs font-semibold text-[#22D3EE] hover:text-[#F8FAFC] transition-colors"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Horizontal scroll */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
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
