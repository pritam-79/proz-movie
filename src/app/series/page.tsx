'use client';

import React, { useState } from 'react';
import CategoryCatalog from '@/components/content/CategoryCatalog';

const TABS = [
  { label: 'All Series', value: 'all' },
  { label: 'PROZ Originals', value: 'original' },
  { label: 'International Series', value: 'international' },
  { label: 'Korean Dramas', value: 'k_drama' },
  { label: 'Documentaries', value: 'documentary' },
];

export default function SeriesPage() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="min-h-screen bg-proz-midnight text-proz-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-proz-purple to-proz-cyan bg-clip-text text-transparent">
              Web Series
            </span>
          </h1>
          <p className="text-proz-grey text-sm max-w-xl">
            Immerse yourself in gripping serialized storytelling, bingeable seasons, and critically acclaimed originals.
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
          title="Web Series"
          category={activeTab === 'all' ? '' : activeTab}
          type="series"
        />
      </div>
    </div>
  );
}
