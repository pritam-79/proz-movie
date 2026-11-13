"use client";

import React, { useState, useMemo } from 'react';
import { ContentItem, CategoryType } from '@/types/content';
import ContentCard from '@/components/content/ContentCard';
import { Search, Filter, SlidersHorizontal, X, Film, Tv, Sparkles } from 'lucide-react';
import { GENRE_LIST } from '@/lib/data/mockContent';

interface SubCategoryOption {
  label: string;
  value: string;
}

interface CategoryCatalogProps {
  title: string;
  subtitle: string;
  baseType?: 'movie' | 'series' | 'all';
  defaultCategory?: string;
  subCategories?: SubCategoryOption[];
  allItems: ContentItem[];
}

export const CategoryCatalog: React.FC<CategoryCatalogProps> = ({
  title,
  subtitle,
  baseType = 'all',
  defaultCategory = 'all',
  subCategories = [],
  allItems,
}) => {
  const [selectedSubCat, setSelectedSubCat] = useState<string>(defaultCategory);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('trending');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = useMemo(() => {
    let result = allItems.filter(item => !item.isRestricted18Plus);

    // Filter by Base Type (movie or series)
    if (baseType !== 'all') {
      result = result.filter(item => item.type === baseType);
    }

    // Filter by SubCategory (e.g., hollywood, bollywood, etc.)
    if (selectedSubCat !== 'all') {
      result = result.filter(item => item.category === selectedSubCat);
    }

    // Filter by Genre
    if (selectedGenre !== 'all') {
      result = result.filter(item => 
        item.genres.some(g => g.toLowerCase().replace(/[^a-z0-9]/g, '') === selectedGenre.toLowerCase().replace(/[^a-z0-9]/g, ''))
      );
    }

    // Filter by Language
    if (selectedLanguage !== 'all') {
      result = result.filter(item => 
        item.languages.some(l => l.toLowerCase() === selectedLanguage.toLowerCase())
      );
    }

    // Filter by Year
    if (selectedYear !== 'all') {
      result = result.filter(item => item.releaseYear.toString() === selectedYear);
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => 
        item.title.toLowerCase().includes(q) ||
        item.synopsis.toLowerCase().includes(q) ||
        item.genres.some(g => g.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'trending') {
      result.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.ratingScore - a.ratingScore);
    } else if (sortBy === 'latest') {
      result.sort((a, b) => b.releaseYear - a.releaseYear);
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [allItems, baseType, selectedSubCat, selectedGenre, selectedLanguage, selectedYear, sortBy, searchQuery]);

  const resetFilters = () => {
    setSelectedSubCat('all');
    setSelectedGenre('all');
    setSelectedLanguage('all');
    setSelectedYear('all');
    setSortBy('trending');
    setSearchQuery('');
  };

  const hasActiveFilters = 
    selectedSubCat !== 'all' || 
    selectedGenre !== 'all' || 
    selectedLanguage !== 'all' || 
    selectedYear !== 'all' || 
    searchQuery !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Title & Subtitle */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-proz-white tracking-tight">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-proz-grey max-w-2xl">
          {subtitle}
        </p>
      </div>

      {/* SubCategory Pills (e.g. Hollywood, Bollywood, Anime, etc.) */}
      {subCategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {subCategories.map((sub) => (
            <button
              key={sub.value}
              onClick={() => setSelectedSubCat(sub.value)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedSubCat === sub.value
                  ? 'bg-gradient-to-r from-proz-purple to-proz-cyan text-proz-white shadow-cyan-glow'
                  : 'glass-pill text-proz-grey hover:text-proz-white hover:bg-proz-navy/70'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}

      {/* Filter and Search Bar Controls */}
      <div className="p-4 rounded-3xl glass-card border border-proz-border/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-proz-cyan absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter titles in ${title.toLowerCase()}...`}
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs sm:text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-proz-grey hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Genre Dropdown */}
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-3 py-2 rounded-xl glass-input text-xs text-proz-white focus:outline-none"
          >
            <option value="all" className="bg-proz-navy text-proz-white">All Genres</option>
            {GENRE_LIST.map((g) => (
              <option key={g.id} value={g.id} className="bg-proz-navy text-proz-white">
                {g.name}
              </option>
            ))}
          </select>

          {/* Language Dropdown */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 rounded-xl glass-input text-xs text-proz-white focus:outline-none"
          >
            <option value="all" className="bg-proz-navy text-proz-white">All Languages</option>
            <option value="English" className="bg-proz-navy text-proz-white">English</option>
            <option value="Hindi" className="bg-proz-navy text-proz-white">Hindi</option>
            <option value="Korean" className="bg-proz-navy text-proz-white">Korean</option>
            <option value="Japanese" className="bg-proz-navy text-proz-white">Japanese</option>
            <option value="Telugu" className="bg-proz-navy text-proz-white">Telugu</option>
            <option value="Bengali" className="bg-proz-navy text-proz-white">Bengali</option>
            <option value="Mandarin" className="bg-proz-navy text-proz-white">Mandarin</option>
          </select>

          {/* Year Dropdown */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 rounded-xl glass-input text-xs text-proz-white focus:outline-none"
          >
            <option value="all" className="bg-proz-navy text-proz-white">All Years</option>
            <option value="2025" className="bg-proz-navy text-proz-white">2025</option>
            <option value="2024" className="bg-proz-navy text-proz-white">2024</option>
            <option value="2023" className="bg-proz-navy text-proz-white">2023</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl glass-input text-xs text-proz-white focus:outline-none"
          >
            <option value="trending" className="bg-proz-navy text-proz-white">Trending First</option>
            <option value="rating" className="bg-proz-navy text-proz-white">Highest Rated</option>
            <option value="latest" className="bg-proz-navy text-proz-white">Newest First</option>
            <option value="title" className="bg-proz-navy text-proz-white">Title (A-Z)</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 rounded-xl glass-button-secondary text-xs text-proz-cyan flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-proz-grey px-1">
        <span>Showing {filteredItems.length} titles</span>
        <span>Ultra HD 4K & Adaptive Streaming</span>
      </div>

      {/* Grid of Content Cards */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <ContentCard key={item.id} item={item} aspectRatio="poster" />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center glass-card rounded-3xl border border-proz-border/50 space-y-3">
          <p className="text-base text-proz-white font-semibold">No titles found</p>
          <p className="text-xs text-proz-grey max-w-sm mx-auto">
            We couldn&apos;t find any content matching your active filters. Try resetting the filters or modifying your search.
          </p>
          <button
            onClick={resetFilters}
            className="mt-2 px-5 py-2 rounded-full glass-button-primary text-xs font-semibold"
          >
            Clear All Filters
          </button>
        </div>
      )}

    </div>
  );
};

export default CategoryCatalog;
