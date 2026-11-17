'use client';

import React from 'react';
import { Film } from 'lucide-react';
import { ContentItem } from '@/types/content';
import ContentCard from '@/components/content/ContentCard';

interface ContentGridProps {
  items: ContentItem[];
  loading?: boolean;
  emptyMessage?: string;
}

export const ContentGrid: React.FC<ContentGridProps> = ({
  items,
  loading = false,
  emptyMessage = 'No content found.',
}) => {
  const safeItems: ContentItem[] = Array.isArray(items)
    ? items
    : Array.isArray((items as any)?.data)
    ? (items as any).data
    : Array.isArray((items as any)?.items)
    ? (items as any).items
    : [];

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-[#111827] rounded-xl aspect-[2/3] border border-[#334155]/40"
          >
            <div className="w-full h-full bg-gradient-to-br from-[#1e293b]/60 to-[#111827]/30 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (safeItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#111827]/80 border border-[#334155]/60 flex items-center justify-center">
          <Film className="w-8 h-8 text-[#334155]" />
        </div>
        <p className="text-[#94A3B8] text-sm max-w-xs">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
      {safeItems.map((item) => (
        <ContentCard key={item.id} item={item} />
      ))}
    </div>
  );
};

export default ContentGrid;
