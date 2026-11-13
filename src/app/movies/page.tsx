import React from 'react';
import { MOCK_CONTENT } from '@/lib/data/mockContent';
import CategoryCatalog from '@/components/content/CategoryCatalog';

export const metadata = {
  title: 'Movies — PROZ MOVIE',
  description: 'Stream Hollywood, Bollywood, South Indian, Bengali and International blockbusters in 4K UHD.',
};

export default function MoviesPage() {
  const subCategories = [
    { label: 'All Movies', value: 'all' },
    { label: 'Hollywood', value: 'hollywood' },
    { label: 'Bollywood', value: 'bollywood' },
    { label: 'South Indian', value: 'south_indian' },
    { label: 'Bengali', value: 'bengali' },
    { label: 'International', value: 'international' },
  ];

  const movieItems = MOCK_CONTENT.filter(c => c.type === 'movie');

  return (
    <CategoryCatalog
      title="Movies"
      subtitle="Discover world-class cinema across Hollywood, Bollywood, regional epics, and international award-winners."
      baseType="movie"
      subCategories={subCategories}
      allItems={movieItems}
    />
  );
}
