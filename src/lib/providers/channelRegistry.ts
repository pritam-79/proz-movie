import { Channel } from '@/types/channel';
import { ChannelIntegrationStatus, PlaybackMethod, VideoSource } from '@/types/provider';

export interface VerifiedChannelProfile {
  providerId: string;
  officialWebsite: string;
  officialAppUrl?: string;
  androidPackageName?: string;
  iosBundleId?: string;
  deepLinkScheme?: string;
  integrationStatus: ChannelIntegrationStatus;
  supportedPlaybackMethods: PlaybackMethod[];
  hasDirectStream: boolean;
  requiresSubscription: boolean;
  notes?: string;
}

// Verified Knowledge Base of Channel Providers
export const VERIFIED_CHANNEL_MAP: Record<string, Partial<VerifiedChannelProfile>> = {
  'alt-balaji': {
    providerId: 'altbalaji',
    officialWebsite: 'https://altt.co.in',
    officialAppUrl: 'https://play.google.com/store/apps/details?id=com.balaji.alt',
    androidPackageName: 'com.balaji.alt',
    iosBundleId: 'id1223238283',
    deepLinkScheme: 'altbalaji://',
    integrationStatus: 'Official Website Available',
    supportedPlaybackMethods: ['official_web', 'app_deep_link'],
    hasDirectStream: false,
    requiresSubscription: true,
    notes: 'ALTT official streaming platform.'
  },
  'aha': {
    providerId: 'aha',
    officialWebsite: 'https://www.aha.video',
    officialAppUrl: 'https://play.google.com/store/apps/details?id=aha.video',
    androidPackageName: 'aha.video',
    iosBundleId: 'id1498670162',
    deepLinkScheme: 'aha://',
    integrationStatus: 'Partner API Required',
    supportedPlaybackMethods: ['official_web', 'app_deep_link'],
    hasDirectStream: false,
    requiresSubscription: true,
    notes: 'Aha Telugu & Tamil 100% entertainment platform.'
  },
  'chaupal-punjab': {
    providerId: 'chaupal',
    officialWebsite: 'https://chaupal.tv',
    officialAppUrl: 'https://play.google.com/store/apps/details?id=com.chaupal.app',
    androidPackageName: 'com.chaupal.app',
    integrationStatus: 'Official App Available',
    supportedPlaybackMethods: ['official_web', 'app_deep_link'],
    hasDirectStream: false,
    requiresSubscription: true,
    notes: 'Chaupal Punjabi, Haryanvi and Bhojpuri cinema.'
  },
  'shemaroo': {
    providerId: 'shemaroo',
    officialWebsite: 'https://www.shemaroome.com',
    officialAppUrl: 'https://play.google.com/store/apps/details?id=com.shemaroo.me',
    androidPackageName: 'com.shemaroo.me',
    integrationStatus: 'Official Website Available',
    supportedPlaybackMethods: ['official_web', 'app_deep_link'],
    hasDirectStream: false,
    requiresSubscription: true,
  },
  'stage': {
    providerId: 'stage',
    officialWebsite: 'https://stage.in',
    officialAppUrl: 'https://play.google.com/store/apps/details?id=in.stage',
    androidPackageName: 'in.stage',
    integrationStatus: 'Official App Available',
    supportedPlaybackMethods: ['official_web', 'app_deep_link'],
    hasDirectStream: false,
    requiresSubscription: true,
  },
  'hungama': {
    providerId: 'hungama',
    officialWebsite: 'https://www.hungama.com',
    officialAppUrl: 'https://play.google.com/store/apps/details?id=com.hungama.myplay.videodownload',
    integrationStatus: 'Official Website Available',
    supportedPlaybackMethods: ['official_web'],
    hasDirectStream: false,
    requiresSubscription: true,
  },
  'k-drama': {
    providerId: 'viki_k_drama',
    officialWebsite: 'https://www.viki.com',
    officialAppUrl: 'https://play.google.com/store/apps/details?id=com.viki.android',
    androidPackageName: 'com.viki.android',
    integrationStatus: 'Official Website Available',
    supportedPlaybackMethods: ['official_web', 'app_deep_link'],
    hasDirectStream: false,
    requiresSubscription: false,
    notes: 'Rakuten Viki authorized Asian dramas.'
  },
  'bengali-movies': {
    providerId: 'hoichoi',
    officialWebsite: 'https://www.hoichoi.tv',
    officialAppUrl: 'https://play.google.com/store/apps/details?id=com.viewlift.hoichoi',
    androidPackageName: 'com.viewlift.hoichoi',
    integrationStatus: 'Official Website Available',
    supportedPlaybackMethods: ['official_web', 'app_deep_link'],
    hasDirectStream: false,
    requiresSubscription: true,
    notes: 'Hoichoi Bengali movies & web series.'
  },
  'south-movies': {
    providerId: 'youtube',
    officialWebsite: 'https://www.youtube.com/@GoldminesTelefilms',
    integrationStatus: 'API Connected',
    supportedPlaybackMethods: ['youtube_embed', 'official_web'],
    hasDirectStream: true,
    requiresSubscription: false,
    notes: 'Goldmines & Aditya Movies authorized YouTube catalog.'
  },
  'comedy': {
    providerId: 'youtube',
    officialWebsite: 'https://www.youtube.com/@TheViralFever',
    integrationStatus: 'API Connected',
    supportedPlaybackMethods: ['youtube_embed', 'official_web'],
    hasDirectStream: true,
    requiresSubscription: false,
    notes: 'TVF & Pocket Films comedy network.'
  },
  'crime-patrol': {
    providerId: 'sonyliv',
    officialWebsite: 'https://www.sonyliv.com/shows/crime-patrol-1700000049',
    officialAppUrl: 'https://play.google.com/store/apps/details?id=com.msnap',
    integrationStatus: 'Official Website Available',
    supportedPlaybackMethods: ['official_web'],
    hasDirectStream: false,
    requiresSubscription: true,
  },
  'kooku': {
    providerId: 'kooku',
    officialWebsite: 'https://kooku.app',
    integrationStatus: 'Official Website Available',
    supportedPlaybackMethods: ['official_web'],
    hasDirectStream: false,
    requiresSubscription: true,
  },
  'primeplay': {
    providerId: 'primeplay',
    officialWebsite: 'https://primeplay.in',
    integrationStatus: 'Official Website Available',
    supportedPlaybackMethods: ['official_web'],
    hasDirectStream: false,
    requiresSubscription: true,
  },
  'voovi': {
    providerId: 'voovi',
    officialWebsite: 'https://voovi.app',
    integrationStatus: 'Official Website Available',
    supportedPlaybackMethods: ['official_web'],
    hasDirectStream: false,
    requiresSubscription: true,
  },
  'rabbit': {
    providerId: 'rabbit',
    officialWebsite: 'https://rabbitmovies.in',
    integrationStatus: 'Official Website Available',
    supportedPlaybackMethods: ['official_web'],
    hasDirectStream: false,
    requiresSubscription: true,
  },
  'klikk': {
    providerId: 'klikk',
    officialWebsite: 'https://klikk.tv',
    integrationStatus: 'Official Website Available',
    supportedPlaybackMethods: ['official_web'],
    hasDirectStream: false,
    requiresSubscription: true,
  }
};

/**
 * Automatically inspects and resolves channel integration status and official endpoints
 */
export function resolveChannelProfile(channel: Channel): Channel {
  // Preserve verified live API channels (e.g. Cine18 330+ active channels)
  if (channel.providerId === 'cine18' && channel.channelUid) {
    return {
      ...channel,
      integrationStatus: 'API Connected',
      supportedPlaybackMethods: ['html5_mp4', 'direct_hls'],
      syncEnabled: true,
      country: channel.category === '18+ Exclusive' ? 'GLOBAL' : 'IN',
    };
  }

  const slug = channel.slug;
  const verified = VERIFIED_CHANNEL_MAP[slug];

  if (verified) {
    return {
      ...channel,
      providerId: verified.providerId,
      officialWebsite: verified.officialWebsite,
      officialAppUrl: verified.officialAppUrl,
      androidPackageName: verified.androidPackageName,
      iosBundleId: verified.iosBundleId,
      deepLinkScheme: verified.deepLinkScheme,
      integrationStatus: verified.integrationStatus,
      supportedPlaybackMethods: verified.supportedPlaybackMethods,
      syncEnabled: verified.integrationStatus === 'API Connected',
      country: 'IN'
    };
  }

  // Check 18+ restricted channels
  if (channel.category === '18+ Exclusive') {
    return {
      ...channel,
      providerId: 'restricted_adult',
      integrationStatus: 'Playback Restricted',
      supportedPlaybackMethods: ['official_web'],
      syncEnabled: false,
      country: 'GLOBAL'
    };
  }

  // General creator / studio channels
  return {
    ...channel,
    providerId: 'creator_studio',
    integrationStatus: 'Awaiting Verification',
    supportedPlaybackMethods: ['official_web'],
    syncEnabled: false,
    country: 'IN'
  };
}
