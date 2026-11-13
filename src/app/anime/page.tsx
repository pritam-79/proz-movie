import React from 'react';
import { MOCK_CONTENT } from '@/lib/data/mockContent';
import CategoryCatalog from '@/components/content/CategoryCatalog';

export const metadata = {
  title: 'Anime Universe — PROZ MOVIE',
  description: 'Experience legendary Japanese anime, seasonal releases, feature films, with English subbed & dubbed master audio.',
};

export default function AnimePage() {
  const subCategories = [
    { label: 'All Anime', value: 'all' },
    { label: 'Anime Movies', value: 'anime' },
    { label: 'Seasonal Hits', value: 'anime' },
    { label: 'PROZ Originals', value: 'original' },
  ];

  const animeItems = MOCK_CONTENT.filter(c => c.category === 'anime' || c.genres.includes('Anime'));

  return (
    <CategoryCatalog
      title="Anime Universe"
      subtitle="The ultimate destination for anime enthusiasts. Watch in pristine 1080p / 4K with official dual audio and subtitles."
      baseType="all"
      subCategories={subCategories}
      allItems={animeItems}
    />
  );
}
