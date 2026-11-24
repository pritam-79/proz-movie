/**
 * PRO2 ENTERTAINMENT v0.07 — Authorized DRM & EME Standards Configuration
 * Supports ONLY standards-based authorized EME playback (Widevine, FairPlay, PlayReady, ClearKey)
 * using official demo test vectors or operator-supplied licensed server URLs.
 */

import { V07MediaItem } from './kitsu';

export interface AuthorizedDrmProfile {
  id: string;
  name: string;
  keySystem: 'com.widevine.alpha' | 'org.w3.clearkey' | 'com.apple.fps' | 'com.microsoft.playready';
  keySystemLabel: string;
  description: string;
  requiresLicenseUrl: boolean;
  defaultLicenseServer?: string;
}

export const AUTHORIZED_DRM_PROFILES: AuthorizedDrmProfile[] = [
  {
    id: 'widevine',
    name: 'Google Widevine Modular (EME)',
    keySystem: 'com.widevine.alpha',
    keySystemLabel: 'Widevine L1/L3',
    description: 'Industry-standard MPEG-DASH/HLS CENC encryption via authorized Widevine license proxy.',
    requiresLicenseUrl: true,
    defaultLicenseServer: 'https://cwip-shaka-drm.appspot.com/no_auth',
  },
  {
    id: 'clearkey',
    name: 'W3C ClearKey (Open EME Standard)',
    keySystem: 'org.w3.clearkey',
    keySystemLabel: 'W3C ClearKey',
    description: 'Standards-compliant open-key EME decryption for studio testing and self-hosted encrypted DASH.',
    requiresLicenseUrl: false,
  },
  {
    id: 'fairplay',
    name: 'Apple FairPlay Streaming',
    keySystem: 'com.apple.fps',
    keySystemLabel: 'FairPlay FPS',
    description: 'Authorized Apple Safari/iOS HLS DRM requiring official FairPlay Streaming Certificate & KSM URL.',
    requiresLicenseUrl: true,
  },
  {
    id: 'playready',
    name: 'Microsoft PlayReady',
    keySystem: 'com.microsoft.playready',
    keySystemLabel: 'PlayReady',
    description: 'Authorized PlayReady license server URL for Windows/Edge/Smart-TV CENC streams.',
    requiresLicenseUrl: true,
  },
];

// Official Google Shaka public reference test assets (standards verification)
export const OFFICIAL_DRM_TEST_STREAMS: V07MediaItem[] = [
  {
    id: 'drm-shaka-sintel-widevine',
    externalId: 'sintel-enc',
    providerId: 'shaka_official',
    providerName: 'Shaka Official DRM Test',
    title: 'Sintel (Encrypted Widevine Test Stream)',
    canonicalTitle: 'Sintel Widevine Test',
    description: 'Official Google Shaka Player Widevine CENC DASH reference stream verifying browser/WebView EME license handshake.',
    poster: 'https://storage.googleapis.com/shaka-asset-icons/sintel.png',
    backdrop: 'https://storage.googleapis.com/shaka-asset-icons/sintel.png',
    category: 'movies',
    subCategory: 'Authorized DRM Showcase',
    contentType: 'movie',
    releaseYear: 2010,
    language: 'Multi-Audio',
    country: 'GLOBAL',
    genres: ['Animation', 'Widevine DRM', 'DASH'],
    rating: 8.6,
    isAdult: false,
    playableType: 'drm_test',
    streamUrl: 'https://storage.googleapis.com/shaka-demo-assets/sintel-dark-webm/dash.mpd',
    streamFormat: 'dash',
    drmConfig: {
      type: 'widevine',
      licenseServerUrl: 'https://cwip-shaka-drm.appspot.com/no_auth',
      note: 'Public Shaka Widevine L3 Verification License Endpoint',
    },
    rightsLabel: 'Authorized Widevine Test Asset',
    detailHref: 'https://shaka-player-demo.appspot.com/',
    durationLabel: 'Widevine DASH',
  },
  {
    id: 'drm-shaka-angel-clearkey',
    externalId: 'angel-one-clearkey',
    providerId: 'shaka_official',
    providerName: 'Shaka Official ClearKey',
    title: 'Angel One (W3C ClearKey / Multi-Language DASH)',
    canonicalTitle: 'Angel One ClearKey',
    description: 'Official Multi-Audio / Multi-Subtitle Adaptive MPEG-DASH reference stream for player & subtitle diagnostics.',
    poster: 'https://storage.googleapis.com/shaka-asset-icons/angel_one.png',
    backdrop: 'https://storage.googleapis.com/shaka-asset-icons/angel_one.png',
    category: 'movies',
    subCategory: 'Authorized DRM Showcase',
    contentType: 'movie',
    releaseYear: 2018,
    language: 'Multi-Audio',
    country: 'GLOBAL',
    genres: ['Sci-Fi', 'MPEG-DASH', 'Multi-Track'],
    rating: 8.2,
    isAdult: false,
    playableType: 'drm_test',
    streamUrl: 'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd',
    streamFormat: 'dash',
    drmConfig: {
      type: 'none',
      note: 'Adaptive DASH with Multi-Audio & WebVTT Subtitles',
    },
    rightsLabel: 'Official DASH Reference',
    detailHref: 'https://shaka-player-demo.appspot.com/',
    durationLabel: 'Adaptive MPD',
  },
];

export function buildShakaDrmConfiguration(options?: {
  widevineLicenseUrl?: string;
  playReadyLicenseUrl?: string;
  clearKeys?: Record<string, string>;
  customHeaders?: Record<string, string>;
}) {
  const servers: Record<string, string> = {};
  if (options?.widevineLicenseUrl?.trim()) {
    servers['com.widevine.alpha'] = options.widevineLicenseUrl.trim();
  }
  if (options?.playReadyLicenseUrl?.trim()) {
    servers['com.microsoft.playready'] = options.playReadyLicenseUrl.trim();
  }

  return {
    drm: {
      servers,
      ...(options?.clearKeys && Object.keys(options.clearKeys).length > 0
        ? { clearKeys: options.clearKeys }
        : {}),
      retryParameters: {
        maxAttempts: 3,
        baseDelay: 1000,
        backoffFactor: 2,
      },
    },
  };
}
