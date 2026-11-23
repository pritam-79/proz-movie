/**
 * PROZ Entertainment v0.02 — Authorized P2P & Legal Torrent Adapter Types
 * Strict Compliance: Public Domain, Creative Commons, and Verified Rights-Holder Feeds ONLY.
 * Piracy-site scraping and unauthorized torrent indexing are strictly prohibited.
 */

export type LicenceType = 
  | 'public_domain'
  | 'creative_commons_cc_by'
  | 'creative_commons_cc_by_sa'
  | 'creative_commons_cc0'
  | 'open_source_media'
  | 'direct_publisher_licence';

export interface AuthorizedMediaSource {
  id: string;
  sourceName: string;
  sourceUrl: string;
  sourceType: 'webtorrent_tracker' | 'archive_feed' | 'cc_index' | 'direct_manifest';
  licenceType: LicenceType;
  rightsOwner: string;
  redistributionPermission: boolean;
  allowedTerritories: string[];
  verificationStatus: 'verified' | 'pending_review' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  verificationEvidence?: string;
  isEnabled: boolean;
  createdAt: string;
}

export interface TorrentMetadata {
  infoHash: string;
  name: string;
  totalLengthBytes: number;
  files: Array<{
    name: string;
    lengthBytes: number;
    path: string;
    isVideo: boolean;
    mimeType?: string;
  }>;
  createdDate?: string;
  comment?: string;
  sourceRegistryId: string;
  licenceVerified: boolean;
  licenceType: LicenceType;
}

export interface P2PPlaybackStatus {
  infoHash: string;
  title: string;
  status: 'idle' | 'connecting' | 'metadata_fetching' | 'buffering' | 'streaming' | 'completed' | 'error' | 'stopped';
  progressPercent: number;
  downloadSpeedBytesPerSec: number;
  uploadSpeedBytesPerSec: number;
  numPeers: number;
  downloadedBytes: number;
  totalBytes: number;
  timeRemainingSeconds?: number;
  streamUrl?: string;
  errorMessage?: string;
  isLegalVerified: boolean;
}

export interface P2PAdapterConfig {
  maxDownloadRateBytesPerSec: number;
  maxUploadRateBytesPerSec: number;
  maxActiveDownloads: number;
  storageLimitMb: number;
  cleanupThresholdPercent: number;
  allowWebRTC: boolean;
  requireSignedAuthorization: boolean;
}
