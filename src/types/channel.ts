export interface Channel {
  id: string;
  name: string;
  slug: string;
  category: string;
  logo: string;
  bannerUrl?: string;
  description: string;
  contentCount: number;
  subscribers?: string;
  rating?: number;
  isFavorite?: boolean;
  tags?: string[];
  featured?: boolean;
  color?: string;
}

export type ChannelCategoryFilter = 
  | 'All'
  | 'Popular'
  | 'Indian OTT'
  | 'Web Series'
  | '18+ Exclusive'
  | 'Regional'
  | 'International'
  | 'Drama'
  | 'Comedy';
