'use client';

import React, { useState } from 'react';
import CategoryCatalog from '@/components/content/CategoryCatalog';

const TABS = [
  { label: 'All Dramas', value: 'all' },
  { label: 'Korean Drama (K-Drama)', value: 'k_drama' },
  { label: 'Chinese Drama (C-Drama)', value: 'c_drama' },
  { label: 'Japanese Drama (J-Drama)', value: 'j_drama' },
  { label: 'Thai Drama', value: 'thai_drama' },
  { label: 'International Drama', value: 'international' },
];

export default function DramaPage() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="min-h-screen bg-proz-midnight text-proz-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-proz-purple to-proz-cyan bg-clip-text text-transparent">
              Asian &amp; International Dramas
            </span>
          </h1>
          <p className="text-proz-grey text-sm max-w-xl">
            Breathtaking Asian and international dramas. From heart-pounding cyber thrillers to transcendent mythical romances.
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
          title="Dramas"
          category={activeTab === 'all' ? '' : activeTab}
          type="drama"
        />
      </div>
    </div>
  );
}
