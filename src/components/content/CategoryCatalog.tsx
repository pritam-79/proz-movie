'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentItem } from '@/types/content';
import FilterBar, { FilterState } from '@/components/content/FilterBar';
import ContentGrid from '@/components/content/ContentGrid';
import { MOCK_CONTENT } from '@/lib/data/mockContent';

interface CategoryCatalogProps {
  title: string;
  category: string;
  type?: string;
}

export const CategoryCatalog: React.FC<CategoryCatalogProps> = ({ title, category, type }) => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<FilterState>({ sort: 'trending' });

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.set('category', category);
      if (type && type !== 'all') params.set('type', type);
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.year) params.set('year', filters.year);
      if (filters.language) params.set('language', filters.language);
      params.set('page', String(page));
      params.set('limit', '24');

      const res = await fetch(`/api/content?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.items)
          ? data.items
          : [];
        setItems(list);
        setTotalPages(data.total_pages ?? data.totalPages ?? 1);
        return;
      }
      throw new Error(`Fetch response not ok: ${res.status}`);
    } catch (err) {
      console.warn('CategoryCatalog fetch failed, using fallback:', err);
      // Direct fallback from MOCK_CONTENT
      let fallbackList = MOCK_CONTENT.filter(c => !c.isRestricted18Plus && !c.is_adult);
      if (category && category !== 'all') {
        fallbackList = fallbackList.filter(c => c.category === category);
      }
      if (type && type !== 'all') {
        fallbackList = fallbackList.filter(c => c.type === type || c.content_type === type);
      }
      setItems(fallbackList);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [category, type, filters, page]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <FilterBar activeFilters={filters} onFiltersChange={handleFiltersChange} />

      {/* Grid */}
      <ContentGrid
        items={items}
        loading={loading}
        emptyMessage={`No ${title.toLowerCase()} found matching your filters.`}
      />

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-proz-navy border border-proz-border/70 text-sm text-proz-grey hover:text-proz-white hover:border-proz-purple/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          <span className="text-sm text-proz-grey">
            Page{' '}
            <span className="text-proz-white font-semibold">{page}</span>
            {' '}of{' '}
            <span className="text-proz-white font-semibold">{totalPages}</span>
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-proz-navy border border-proz-border/70 text-sm text-proz-grey hover:text-proz-white hover:border-proz-purple/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryCatalog;
