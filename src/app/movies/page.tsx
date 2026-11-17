'use client';

import React, { useState } from 'react';
import CategoryCatalog from '@/components/content/CategoryCatalog';

const TABS = [
  { label: 'All Movies', value: 'all' },
  { label: 'Hollywood', value: 'hollywood' },
  { label: 'Bollywood', value: 'bollywood' },
  { label: 'South Indian', value: 'south_indian' },
  { label: 'Bengali', value: 'bengali' },
  { label: 'International', value: 'international' },
];

export default function MoviesPage() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="min-h-screen bg-[#080B12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] bg-clip-text text-transparent">
              Movies
            </span>
          </h1>
          <p className="text-[#94A3B8] text-sm max-w-xl">
            Discover world-class cinema across Hollywood, Bollywood, regional epics, and international award-winners.
          </p>
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
          title="Movies"
          category={activeTab === 'all' ? '' : activeTab}
          type="movie"
        />
      </div>
    </div>
  );
}
