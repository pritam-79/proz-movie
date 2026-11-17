'use client';

import React from 'react';
import { Bookmark, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { MOCK_CONTENT } from '@/lib/data/mockContent';
import ContentRow from '@/components/content/ContentRow';
import { ContentItem } from '@/types/content';

export const MyListRow: React.FC = () => {
  const { watchlist } = useAuth();

  // If user has saved items in watchlist, map them. Otherwise show curated starter list
  const items: ContentItem[] = React.useMemo(() => {
    if (watchlist && watchlist.length > 0) {
      const saved = watchlist
        .map((id) => MOCK_CONTENT.find((c) => c.id === id))
        .filter(Boolean) as ContentItem[];
      if (saved.length > 0) return saved;
    }
    // Default starter watchlist
    return [MOCK_CONTENT[0], MOCK_CONTENT[1], MOCK_CONTENT[2], MOCK_CONTENT[3]].filter(Boolean);
  }, [watchlist]);

  return (
    <ContentRow
      title="My List"
      subtitle="Your saved movies and series queued for future viewing"
      items={items}
      viewAllHref="/watchlist"
      aspectRatio="poster"
      badge="SAVED"
      icon={<Bookmark className="w-5 h-5 text-proz-purple" />}
    />
  );
};

export default MyListRow;
