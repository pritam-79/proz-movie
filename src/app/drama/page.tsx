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
    <div className="min-h-screen bg-[#080B12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] bg-clip-text text-transparent">
              Asian & International Dramas
            </span>
          </h1>
          <p className="text-[#94A3B8] text-sm max-w-xl">
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
          title="Dramas"
          category={activeTab === 'all' ? '' : activeTab}
          type="drama"
        />
      </div>
    </div>
  );
}
