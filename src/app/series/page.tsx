import React from 'react';
import { MOCK_CONTENT } from '@/lib/data/mockContent';
import CategoryCatalog from '@/components/content/CategoryCatalog';

export const metadata = {
  title: 'Web Series — PROZ MOVIE',
  description: 'Binge the finest OTT shows, PROZ Originals, international series, and captivating multi-part documentaries.',
};

export default function SeriesPage() {
  const subCategories = [
    { label: 'All Series', value: 'all' },
    { label: 'PROZ Originals', value: 'original' },
    { label: 'K-Drama Series', value: 'k_drama' },
    { label: 'International', value: 'international' },
    { label: 'Anime Series', value: 'anime' },
  ];

  const seriesItems = MOCK_CONTENT.filter(c => c.type === 'series');

  return (
    <CategoryCatalog
      title="Web Series"
      subtitle="Immerse yourself in gripping serialized storytelling, bingeable seasons, and critically acclaimed originals."
      baseType="series"
      subCategories={subCategories}
      allItems={seriesItems}
    />
  );
}
