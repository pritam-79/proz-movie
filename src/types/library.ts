/**
 * PROZ Entertainment v0.02 — Private Media Library & Stash Ecosystem Types
 * Inspired by Peek Stash Browser (MIT License) & Stash GraphQL Specifications
 */

export type UserRole = 
  | 'super_admin'
  | 'admin'
  | 'moderator'
  | 'premium_user'
  | 'standard_user'
  | 'restricted_user';

export type LibraryType = 'stash' | 'local' | 's3' | 'custom';

export interface StashServerConfig {
  id: string;
  name: string;
  serverUrl: string;
  apiKey?: string; // Kept strictly server-side
  connectionStatus: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSyncAt: string | null;
  syncSchedule: 'hourly' | 'daily' | 'manual';
  isEnabled: boolean;
  libraryIdentifier: string;
  version?: string;
  sceneCount?: number;
  performerCount?: number;
  studioCount?: number;
  galleryCount?: number;
}

export interface MediaLibrary {
  id: string;
  serverId: string;
  name: string;
  description?: string;
  type: LibraryType;
  isRestrictedAdult: boolean;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StashPerformer {
  id: string;
  name: string;
  disambiguation?: string;
  aliases?: string;
  gender?: string;
  birthdate?: string;
  ethnicity?: string;
  country?: string;
  eyeColor?: string;
  hairColor?: string;
  height?: number;
  cupSize?: string;
  bandScore?: string;
  waist?: number;
  hip?: number;
  measurements?: string;
  tattoos?: string;
  piercings?: string;
  rating?: number;
  favorite?: boolean;
  imagePath?: string;
  sceneCount?: number;
  galleryCount?: number;
  updatedAt?: string;
}

export interface StashStudio {
  id: string;
  name: string;
  url?: string;
  parentStudioId?: string;
  parentStudioName?: string;
  imagePath?: string;
  sceneCount?: number;
  rating?: number;
  favorite?: boolean;
}

export interface StashTag {
  id: string;
  name: string;
  description?: string;
  imagePath?: string;
  sceneCount?: number;
}

export interface StashScene {
  id: string;
  title: string;
  details?: string;
  url?: string;
  date?: string;
  rating?: number;
  organized?: boolean;
  oCounter?: number;
  resumeTime?: number;
  playCount?: number;
  playDuration?: number;
  files?: Array<{
    id: string;
    path: string;
    size: number;
    duration: number;
    videoCodec: string;
    audioCodec: string;
    width: number;
    height: number;
    frameRate: number;
    bitRate: number;
  }>;
  paths: {
    screenshot?: string;
    preview?: string;
    stream?: string;
    webp?: string;
    vtt?: string;
    sprite?: string;
    funscript?: string;
  };
  studio?: StashStudio;
  performers?: StashPerformer[];
  tags?: StashTag[];
  movies?: Array<{
    id: string;
    name: string;
    sceneIndex?: number;
  }>;
  galleries?: StashGallery[];
  libraryId?: string;
  serverId?: string;
  isFavorite?: boolean;
  isWatched?: boolean;
  userRating?: number;
}

export interface StashGallery {
  id: string;
  title: string;
  details?: string;
  url?: string;
  date?: string;
  rating?: number;
  imageCount: number;
  coverPath?: string;
  images?: string[];
  studio?: StashStudio;
  performers?: StashPerformer[];
  tags?: StashTag[];
  scenes?: Array<{ id: string; title: string }>;
}

export interface UserGroup {
  id: string;
  name: string;
  description: string;
  allowedLibraries: string[];
  allowedStudios?: string[];
  hiddenTags?: string[];
  canDownload: boolean;
  canPlayAdult: boolean;
  canSharePlaylists: boolean;
  canUseExternalPlayer: boolean;
  createdAt: string;
}

export interface UserLibraryPermissions {
  userId: string;
  allowedLibraries: string[];
  allowedStudios?: string[];
  hiddenTags?: string[];
  canDownload: boolean;
  canPlayAdult: boolean;
  canSharePlaylists: boolean;
  canUseExternalPlayer: boolean;
  storageQuotaMb: number;
}

export interface PrivatePlaylist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  isSharedWithGroups: string[];
  itemCount: number;
  thumbnailUrl?: string;
  items: PlaylistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistItem {
  id: string;
  playlistId: string;
  mediaId: string;
  title: string;
  thumbnailUrl?: string;
  durationSeconds: number;
  orderIndex: number;
  addedAt: string;
  sourceType: 'stash' | 'ott' | 'p2p';
}

export interface UserSavedFilter {
  id: string;
  userId: string;
  name: string;
  filterType: 'scenes' | 'performers' | 'studios' | 'movies';
  criteria: Record<string, unknown>;
  createdAt: string;
}

export interface DownloadItem {
  id: string;
  userId: string;
  mediaId: string;
  title: string;
  fileName: string;
  fileSizeBytes: number;
  downloadedBytes: number;
  status: 'queued' | 'downloading' | 'paused' | 'completed' | 'error' | 'cancelled';
  speedBytesPerSec?: number;
  estimatedRemainingSec?: number;
  signedDownloadUrl?: string;
  expiresAt: string;
  createdAt: string;
}

export interface MediaBrowsingFilters {
  searchQuery?: string;
  studioId?: string;
  performerId?: string;
  tagId?: string;
  country?: string;
  year?: number;
  minDuration?: number;
  maxDuration?: number;
  minRating?: number;
  isWatched?: boolean;
  isFavorite?: boolean;
  libraryId?: string;
  sortBy?: 'date' | 'title' | 'rating' | 'duration' | 'views' | 'random';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export type MediaViewMode = 'grid' | 'compact' | 'list' | 'gallery' | 'timeline';
