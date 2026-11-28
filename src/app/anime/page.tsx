'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Sparkles, TrendingUp } from 'lucide-react';
import { ContentItem } from '@/types/content';
import ContentRow from '@/components/content/ContentRow';
import CategoryCatalog from '@/components/content/CategoryCatalog';

import { MOCK_CONTENT } from '@/lib/data/mockContent';

const TABS = [
  { label: 'All Anime', value: 'all' },
  { label: 'Anime Movies', value: 'anime_movie' },
  { label: 'Dubbed', value: 'dubbed' },
  { label: 'Subbed', value: 'subbed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Ongoing', value: 'ongoing' },
];

function extractList(val: any): ContentItem[] {
  if (Array.isArray(val)) return val;
  if (Array.isArray(val?.data)) return val.data;
  if (Array.isArray(val?.items)) return val.items;
  return [];
}

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
          fetch('/api/content?type=anime&sort=trending&limit=12').then((r) => r.json()).catch(() => null),
          fetch('/api/content?type=anime&sort=latest&limit=12').then((r) => r.json()).catch(() => null),
          fetch('/api/content?type=anime&sort=rating&limit=12').then((r) => r.json()).catch(() => null),
        ]);

        const trendingList = extractList(t);
        const newlyAddedList = extractList(n);
        const popularSeasonList = extractList(p);

        const animeMock = MOCK_CONTENT.filter(c => c.category === 'anime' || c.type === 'anime');

        setTrending(trendingList.length > 0 ? trendingList : animeMock.filter(c => c.isTrending));
        setNewlyAdded(newlyAddedList.length > 0 ? newlyAddedList : animeMock);
        setPopularSeason(popularSeasonList.length > 0 ? popularSeasonList : animeMock);
      } catch {
        const animeMock = MOCK_CONTENT.filter(c => c.category === 'anime' || c.type === 'anime');
        setTrending(animeMock);
        setNewlyAdded(animeMock);
        setPopularSeason(animeMock);
      } finally {
        setRowsLoading(false);
      }
    };
    fetchRows();
  }, []);

  return (
    <div className="min-h-screen bg-proz-midnight text-proz-white">
      {/* Anime Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-proz-purple/15 via-proz-midnight to-proz-cyan/10 border-b border-proz-border/40">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-proz-purple/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-72 h-72 bg-proz-cyan/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-proz-purple/20 border border-proz-purple/30 text-proz-purple text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Anime Universe
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-proz-purple via-orange-400 to-proz-cyan bg-clip-text text-transparent">
              Anime
            </span>
          </h1>
          <p className="text-proz-grey text-sm max-w-lg mx-auto">
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
          <div className="flex-1 h-px bg-proz-border/50" />
          <span className="text-xs text-proz-grey uppercase tracking-widest font-semibold">Browse All</span>
          <div className="flex-1 h-px bg-proz-border/50" />
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.value
                  ? 'glass-button-primary shadow-purple-glow'
                  : 'bg-proz-navy/85 backdrop-blur-md border border-proz-border/70 text-proz-grey hover:text-proz-white hover:border-proz-purple/50'
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
