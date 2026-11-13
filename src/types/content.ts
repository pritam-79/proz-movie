export type ContentType = 'movie' | 'series';

export type CategoryType = 
  | 'hollywood' 
  | 'bollywood' 
  | 'south_indian' 
  | 'bengali' 
  | 'international' 
  | 'anime' 
  | 'k_drama' 
  | 'c_drama' 
  | 'j_drama' 
  | 'documentary' 
  | 'original';

export type MaturityRating = 'G' | 'PG' | 'PG-13' | 'TV-14' | 'TV-MA' | '18+';

export interface CastMember {
  name: string;
  character: string;
  avatarUrl?: string;
}

export interface CrewMember {
  name: string;
  role: string;
}

export interface VideoQualityOption {
  label: string;
  resolution: string;
  bitrateKbps: number;
}

export interface SubtitleTrack {
  id: string;
  label: string;
  lang: string;
  url: string;
  isDefault?: boolean;
}

export interface AudioTrackOption {
  id: string;
  label: string;
  lang: string;
  codec: string;
  isDefault?: boolean;
}

export interface Episode {
  id: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  synopsis: string;
  durationMinutes: number;
  thumbnailUrl: string;
  streamUrl: string;
  dashUrl?: string;
  fallbackMp4?: string;
  introStartSec?: number;
  introEndSec?: number;
  subtitles?: SubtitleTrack[];
  audioTracks?: AudioTrackOption[];
}

export interface Season {
  id: string;
  seasonNumber: number;
  title: string;
  synopsis?: string;
  posterUrl?: string;
  episodes: Episode[];
}

export interface ContentItem {
  id: string;
  title: string;
  originalTitle?: string;
  slug: string;
  type: ContentType;
  category: CategoryType;
  synopsis: string;
  tagline?: string;
  releaseYear: number;
  runtimeMinutes?: number;
  maturityRating: MaturityRating;
  genres: string[];
  languages: string[];
  ratingScore: number;
  ratingCount: number;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl?: string;
  streamUrl: string; // Master HLS manifest URL
  dashUrl?: string;   // Master DASH manifest URL
  fallbackMp4?: string; // High compatibility MP4 URL
  isFeatured?: boolean;
  isTrending?: boolean;
  isOriginal?: boolean;
  isRestricted18Plus?: boolean;
  seasons?: Season[];
  cast: CastMember[];
  crew: CrewMember[];
  subtitles: SubtitleTrack[];
  audioTracks: AudioTrackOption[];
  license: {
    licensor: string;
    expiryDate: string;
    territories: string[];
  };
}

export interface PlaybackSessionToken {
  sessionId: string;
  userId?: string;
  contentId: string;
  episodeId?: string;
  expiresAt: number;
  maxQuality: string;
  allowedDrm: string;
  signature: string;
}

export interface UserSubscription {
  planId: string;
  status: 'active' | 'past_due' | 'canceled' | 'none';
  renewsAt?: string;
  maxScreens: number;
  videoQuality: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  subscription: UserSubscription;
  is18PlusVerified: boolean;
  role: 'user' | 'admin' | 'editor';
}
