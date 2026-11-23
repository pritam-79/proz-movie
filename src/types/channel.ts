import { ChannelIntegrationStatus, PlaybackMethod } from './provider';

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

  // Automated Integration & Provider Discovery Fields (V3 Architecture)
  channelUid?: string;
  providerId?: string;
  officialWebsite?: string;
  officialAppUrl?: string;
  androidPackageName?: string;
  iosBundleId?: string;
  deepLinkScheme?: string;
  country?: string;
  integrationStatus?: ChannelIntegrationStatus;
  syncEnabled?: boolean;
  lastSyncedAt?: string;
  supportedPlaybackMethods?: PlaybackMethod[];
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
