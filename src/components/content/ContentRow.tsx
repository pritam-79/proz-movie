"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { ContentItem } from '@/types/content';
import ContentCard from '@/components/content/ContentCard';

interface ContentRowProps {
  title: string;
  subtitle?: string;
  items: ContentItem[];
  viewAllHref?: string;
  aspectRatio?: 'poster' | 'backdrop';
  icon?: React.ReactNode;
}

export const ContentRow: React.FC<ContentRowProps> = ({
  title,
  subtitle,
  items,
  viewAllHref,
  aspectRatio = 'poster',
  icon,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    const scrollAmount = clientWidth * 0.75;
    scrollContainerRef.current.scrollTo({
      left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative my-8 sm:my-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header Bar */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            {icon && <span className="text-proz-cyan">{icon}</span>}
            <h2 className="text-lg sm:text-xl font-bold text-proz-white tracking-tight">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs text-proz-grey mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs font-semibold text-proz-cyan hover:text-proz-white flex items-center gap-1 transition-colors mr-2"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="hidden sm:flex p-1.5 rounded-full glass-card hover:border-proz-cyan/50 text-proz-grey hover:text-proz-white transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="hidden sm:flex p-1.5 rounded-full glass-card hover:border-proz-cyan/50 text-proz-grey hover:text-proz-white transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex items-start gap-4 overflow-x-auto no-scrollbar pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={`shrink-0 ${
              aspectRatio === 'backdrop'
                ? 'w-64 sm:w-72 md:w-80'
                : 'w-36 sm:w-44 md:w-48 lg:w-52'
            }`}
          >
            <ContentCard item={item} aspectRatio={aspectRatio} />
          </div>
        ))}
      </div>

    </section>
  );
};

export default ContentRow;
