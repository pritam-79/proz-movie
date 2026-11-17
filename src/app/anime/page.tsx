'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Sparkles, TrendingUp } from 'lucide-react';
import { ContentItem } from '@/types/content';
import ContentRow from '@/components/content/ContentRow';
import CategoryCatalog from '@/components/content/CategoryCatalog';

const TABS = [
  { label: 'All Anime', value: 'all' },
  { label: 'Anime Movies', value: 'anime_movie' },
  { label: 'Dubbed', value: 'dubbed' },
  { label: 'Subbed', value: 'subbed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Ongoing', value: 'ongoing' },
];

export default function AnimePage() {
  const [activeTab, setActiveTab] = useState('all');
  const [trending, setTrending] = useState<ContentItem[]>([]);
  const [newlyAdded, setNewlyAdded] = useState<ContentItem[]>([]);
  const [popularSeason, setPopularSeason] = useState<ContentItem[]>([]);
  const [rowsLoading, setRowsLoading] = useState(true);

  useEffect(() => {
    const fetchRows = async () => {
      setRowsLoading(true);
      try {
        const [t, n, p] = await Promise.all([
          fetch('/api/content?type=anime&sort=trending&limit=12').then((r) => r.json()),
          fetch('/api/content?type=anime&sort=latest&limit=12').then((r) => r.json()),
          fetch('/api/content?type=anime&sort=rating&limit=12').then((r) => r.json()),
        ]);
        setTrending(t.items ?? t ?? []);
        setNewlyAdded(n.items ?? n ?? []);
        setPopularSeason(p.items ?? p ?? []);
      } catch {
        // silent
      } finally {
        setRowsLoading(false);
      }
    };
    fetchRows();
  }, []);

  return (
    <div className="min-h-screen bg-[#080B12]">
      {/* Anime Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a0533] via-[#080B12] to-[#001a2e] border-b border-[#334155]/30">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-72 h-72 bg-[#22D3EE]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 text-[#8B5CF6] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Anime Universe
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-[#8B5CF6] via-[#a78bfa] to-[#22D3EE] bg-clip-text text-transparent">
              Anime
            </span>
          </h1>
          <p className="text-[#94A3B8] text-sm max-w-lg mx-auto">
            Legendary series, seasonal releases, and feature films. Official subs &amp; dubs in pristine quality.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Featured Rows */}
        <ContentRow
          title="Trending Anime"
          items={trending}
          loading={rowsLoading}
          viewAllHref="/anime?sort=trending"
          badge="HOT"
        />
        <ContentRow
          title="Newly Added"
          items={newlyAdded}
          loading={rowsLoading}
          viewAllHref="/anime?sort=latest"
        />
        <ContentRow
          title="Popular This Season"
          items={popularSeason}
          loading={rowsLoading}
          viewAllHref="/anime?sort=rating"
        />

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-[#334155]/40" />
          <span className="text-xs text-[#94A3B8] uppercase tracking-widest font-semibold">Browse All</span>
          <div className="flex-1 h-px bg-[#334155]/40" />
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.value
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-white shadow-[0_0_16px_rgba(139,92,246,0.4)]'
                  : 'bg-[#111827]/80 backdrop-blur-md border border-[#334155]/60 text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#8B5CF6]/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Catalog */}
        <CategoryCatalog
          title="Anime"
          category={activeTab === 'all' ? '' : activeTab}
          type="anime"
        />
      </div>
    </div>
  );
}
