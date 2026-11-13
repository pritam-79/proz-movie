import React from 'react';
import { MOCK_CONTENT } from '@/lib/data/mockContent';
import CategoryCatalog from '@/components/content/CategoryCatalog';

export const metadata = {
  title: 'Asian & International Dramas — PROZ MOVIE',
  description: 'Stream popular Korean dramas, Chinese Wuxia epics, Japanese mysteries and international dramatic sagas.',
};

export default function DramaPage() {
  const subCategories = [
    { label: 'All Dramas', value: 'all' },
    { label: 'Korean Drama (K-Drama)', value: 'k_drama' },
    { label: 'Chinese Drama (C-Drama)', value: 'c_drama' },
    { label: 'International Drama', value: 'international' },
  ];

  const dramaItems = MOCK_CONTENT.filter(
    c => c.category === 'k_drama' || c.category === 'c_drama' || c.genres.includes('Drama')
  );

  return (
    <CategoryCatalog
      title="Dramas"
      subtitle="Breathtaking Asian and international dramas. From heart-pounding cyber thrillers to transcendent mythical romances."
      baseType="all"
      subCategories={subCategories}
      allItems={dramaItems}
    />
  );
}
