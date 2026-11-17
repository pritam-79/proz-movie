'use client';

import React from 'react';
import { X } from 'lucide-react';

export interface FilterState {
  category?: string;
  sort: string;
  year?: string;
  language?: string;
}

interface FilterBarProps {
  onFiltersChange: (filters: FilterState) => void;
  activeFilters: FilterState;
}

const SORT_OPTIONS = [
  { label: 'Trending', value: 'trending' },
  { label: 'Latest', value: 'latest' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'A-Z', value: 'title' },
];

const YEARS = Array.from({ length: 15 }, (_, i) => String(2024 - i));
const LANGUAGES = [
  { label: 'All Languages', value: '' },
  { label: 'English', value: 'English' },
  { label: 'Hindi', value: 'Hindi' },
  { label: 'Korean', value: 'Korean' },
  { label: 'Japanese', value: 'Japanese' },
  { label: 'Chinese', value: 'Chinese' },
  { label: 'Tamil', value: 'Tamil' },
  { label: 'Telugu', value: 'Telugu' },
  { label: 'Bengali', value: 'Bengali' },
];

export const FilterBar: React.FC<FilterBarProps> = ({ onFiltersChange, activeFilters }) => {
  const hasActiveFilters =
    !!activeFilters.year || !!activeFilters.language || activeFilters.sort !== 'trending';

  const update = (patch: Partial<FilterState>) => {
    onFiltersChange({ ...activeFilters, ...patch });
  };

  return (
    <div className="flex flex-wrap md:flex-nowrap items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
      {/* Sort Pills */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => update({ sort: opt.value })}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              activeFilters.sort === opt.value
                ? 'bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                : 'bg-[#111827]/80 backdrop-blur-md border border-[#334155]/60 text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#8B5CF6]/40'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px h-5 bg-[#334155]/60 mx-1 flex-shrink-0" />

      {/* Year Dropdown */}
      <select
        value={activeFilters.year ?? ''}
        onChange={(e) => update({ year: e.target.value || undefined })}
        className="px-3 py-1.5 rounded-full text-xs text-[#F8FAFC] bg-[#111827]/80 backdrop-blur-md border border-[#334155]/60 focus:outline-none focus:border-[#8B5CF6]/60 hover:border-[#8B5CF6]/40 transition-all flex-shrink-0"
      >
        <option value="" className="bg-[#111827]">All Years</option>
        {YEARS.map((y) => (
          <option key={y} value={y} className="bg-[#111827]">
            {y}
          </option>
        ))}
      </select>

      {/* Language Dropdown */}
      <select
        value={activeFilters.language ?? ''}
        onChange={(e) => update({ language: e.target.value || undefined })}
        className="px-3 py-1.5 rounded-full text-xs text-[#F8FAFC] bg-[#111827]/80 backdrop-blur-md border border-[#334155]/60 focus:outline-none focus:border-[#8B5CF6]/60 hover:border-[#8B5CF6]/40 transition-all flex-shrink-0"
      >
        {LANGUAGES.map((l) => (
          <option key={l.value} value={l.value} className="bg-[#111827]">
            {l.label}
          </option>
        ))}
      </select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={() => onFiltersChange({ sort: 'trending' })}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-[#22D3EE] bg-[#111827]/80 border border-[#22D3EE]/30 hover:border-[#22D3EE]/60 transition-all flex-shrink-0"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}
    </div>
  );
};

export default FilterBar;
