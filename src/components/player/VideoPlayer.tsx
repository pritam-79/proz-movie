"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Settings,
  Subtitles,
  ArrowLeft,
  SkipForward,
  Check,
  ExternalLink,
  Smartphone,
  Globe,
  Sparkles,
  Tv,
  FastForward,
  PictureInPicture2,
  Languages,
  Glasses,
  RefreshCw,
  AlertTriangle,
  Info,
  Compass,
  Activity,
  ZoomIn,
} from 'lucide-react';
import { ContentItem } from '@/types/content';
import { VideoSource } from '@/types/provider';
import { useAuth } from '@/context/AuthContext';
import {
  classifyStreamProtocol,
  formatResolutionBadge,
  isMismatchedPlaceholderStream,
  isPlayableMediaUrl,
  normalizeMediaUrl,
} from '@/lib/utils/streamUtils';
import { bugDetector } from '@/lib/diagnostics/bugDetector';

interface VideoPlayerProps {
  content: ContentItem;
  episodeId?: string;
  sessionToken?: string;
}

interface QualityTrackOption {
  id: string;
  label: string;
  height?: number;
  bandwidth?: number;
  shakaTrack?: any;
  directUrl?: string;
}

interface AudioTrackOption {
  id: string;
  label: string;
  language: string;
}

interface SubtitleTrackOption {
  id: string;
  label: string;
  language: string;
  source: 'shaka' | 'native';
  trackIndex?: number;
}

type VrProjectionMode = 'flat' | '180_sbs' | '360_interactive' | 'top_bottom';

const SEEK_STEP_STORAGE_KEY = 'proz_player_seek_step';
const DEFAULT_QUALITY_STORAGE_KEY = 'proz_player_default_quality';
const MAX_CHUNK_SIZE = 1572864; // 1.5 MB byte-range chunks for Naughty America & all .ts streams

/**
 * Builds a custom Chunked HTTP 206 Range Loader class for mpegts.js.
 * Keeps every chunk well under Vercel serverless limits (<= 1.5 MB), handles seek ranges,
 * and retries transient upstream glitches cleanly so 600MB+ .ts files stream reliably.
 */
function createChunkedRangeLoaderClass(mpegts: any) {
  const BaseLoader = mpegts.BaseLoader;
  const LoaderStatus = mpegts.LoaderStatus || {
    kIdle: 0,
    kConnecting: 1,
    kBuffering: 2,
    kError: 3,
    kComplete: 4,
  };
  const LoaderErrors = mpegts.LoaderErrors || {
    OK: 'OK',
    EXCEPTION: 'Exception',
    HTTP_STATUS_CODE_INVALID: 'HttpStatusCodeInvalid',
    CONNECTING_TIMEOUT: 'ConnectingTimeout',
    EARLY_EOF: 'EarlyEof',
  };

  return class ChunkedTsRangeLoader extends BaseLoader {
    private _abortController: AbortController | null = null;
    private _aborted = false;
    private _receivedLength = 0;

    constructor() {
      super('chunked-range-loader');
    }

    destroy() {
      this.abort();
      super.destroy();
    }

    abort() {
      this._aborted = true;
      if (this._abortController) {
        try {
          this._abortController.abort();
        } catch {}
        this._abortController = null;
      }
      this._status = LoaderStatus.kIdle;
    }

    async open(dataSource: any, range: any) {
      this._aborted = false;
      this._receivedLength = 0;
      this._status = LoaderStatus.kConnecting;

      const url: string = dataSource.url;
      const fromByte: number = Math.max(0, Number(range?.from) || 0);
      const targetTo: number = typeof range?.to === 'number' && range.to >= fromByte ? range.to : -1;

      let cursor = fromByte;
      let totalFileLength: number | null = null;
      let notifiedLength = false;

      try {
        while (!this._aborted) {
          const chunkEnd =
            targetTo >= 0
              ? Math.min(targetTo, cursor + MAX_CHUNK_SIZE - 1)
              : totalFileLength
              ? Math.min(totalFileLength - 1, cursor + MAX_CHUNK_SIZE - 1)
              : cursor + MAX_CHUNK_SIZE - 1;

          if (chunkEnd < cursor) break;

          let res: Response | null = null;
          let lastErr: any = null;

          for (let retry = 0; retry < 3 && !this._aborted; retry++) {
            this._abortController = new AbortController();
            const timer = setTimeout(() => this._abortController?.abort(), 16000);
            try {
              res = await fetch(url, {
                headers: {
                  Range: `bytes=${cursor}-${chunkEnd}`,
                },
                signal: this._abortController.signal,
              });
              clearTimeout(timer);
              if (res.ok || res.status === 206) break;
              if (res.status >= 400 && res.status < 500 && res.status !== 416) {
                throw new Error(`HTTP ${res.status}`);
              }
            } catch (err) {
              clearTimeout(timer);
              lastErr = err;
              if (this._aborted) return;
              await new Promise((r) => setTimeout(r, 300 * (retry + 1)));
            }
          }

          if (this._aborted) return;
          if (!res || (!res.ok && res.status !== 206)) {
            if (res?.status === 416) break; // Reached EOF
            this._status = LoaderStatus.kError;
            this._onError?.(LoaderErrors.HTTP_STATUS_CODE_INVALID, {
              code: res?.status || -1,
              msg: lastErr?.message || `HTTP ${res?.status || 'Network Error'}`,
            });
            return;
          }

          const contentRange = res.headers.get('content-range');
          if (contentRange) {
            const m = contentRange.match(/bytes\s+\d+-\d+\/(\d+)/i);
            if (m) {
              const parsedTotal = parseInt(m[1], 10);
              if (!isNaN(parsedTotal) && parsedTotal > 0) {
                totalFileLength = parsedTotal;
                if (!notifiedLength && this._onContentLengthKnown) {
                  notifiedLength = true;
                  this._onContentLengthKnown(parsedTotal);
                }
              }
            }
          }

          const buffer = await res.arrayBuffer();
          if (this._aborted) return;
          if (buffer.byteLength === 0) break;

          this._status = LoaderStatus.kBuffering;
          this._receivedLength += buffer.byteLength;
          this._onDataArrival?.(buffer, cursor, this._receivedLength);

          cursor += buffer.byteLength;

          if (targetTo >= 0 && cursor > targetTo) break;
          if (totalFileLength !== null && cursor >= totalFileLength) break;
          if (res.status === 200) break; // Upstream ignored Range and returned whole small body
        }

        if (!this._aborted) {
          this._status = LoaderStatus.kComplete;
          this._onComplete?.(fromByte, cursor - 1);
        }
      } catch (err: any) {
        if (this._aborted) return;
        this._status = LoaderStatus.kError;
        this._onError?.(LoaderErrors.EXCEPTION, {
          code: -1,
          msg: err?.message || 'Chunked TS stream interrupted',
        });
      }
    }
  };
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ content, episodeId }) => {
  const router = useRouter();
  const { getProgress, saveProgress } = useAuth();

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const shakaPlayerRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedProgressRef = useRef<number>(0);
  const triedProxyRef = useRef<boolean>(false);
  const autoRetryCountRef = useRef<number>(0);
  const lastTapRef = useRef<{ time: number; side: 'left' | 'right' | 'center' }>({
    time: 0,
    side: 'center',
  });
  const pendingSeekAfterSwitchRef = useRef<number | null>(null);

  // Playback state — strict truthfulness: isPlaying ONLY becomes true on <video onPlaying>
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPipSupported, setIsPipSupported] = useState(false);
  const [isPipActive, setIsPipActive] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [seekStep, setSeekStep] = useState<number>(10);
  const [detectedResolution, setDetectedResolution] = useState<string | null>(null);
  const [manualDirectUrl, setManualDirectUrl] = useState<string | null>(null);

  // Track lists
  const [qualityTracks, setQualityTracks] = useState<QualityTrackOption[]>([]);
  const [selectedQualityId, setSelectedQualityId] = useState<string>('auto');
  const [audioTracks, setAudioTracks] = useState<AudioTrackOption[]>([]);
  const [selectedAudioLang, setSelectedAudioLang] = useState<string>('default');
  const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrackOption[]>([]);
  const [selectedSubtitleId, setSelectedSubtitleId] = useState<string>('off');

  // Menus & HUD Overlays
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [showDiagnosticsHud, setShowDiagnosticsHud] = useState(false);
  const [resumeBanner, setResumeBanner] = useState<string | null>(null);
  const [doubleTapFeedback, setDoubleTapFeedback] = useState<{
    side: 'left' | 'right';
    amount: number;
  } | null>(null);

  // Buffering & Recovery Diagnostics
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCounter, setRetryCounter] = useState(0);
  const [diagStats, setDiagStats] = useState<{
    protocol: string;
    engine: string;
    bitrateKbps?: number;
    downlinkMbps?: number;
    droppedFrames?: number;
  }>({ protocol: 'auto', engine: 'HTML5' });

  // Genuine VR mode (ONLY enabled when item genuinely carries VR metadata)
  const isGenuineVr = Boolean(
    (content as any).isVr ||
      (content as any).vrProjection ||
      content.category?.toLowerCase().includes('vr')
  );
  const defaultVrMode: VrProjectionMode = isGenuineVr
    ? (content as any).vrProjection || '180_sbs'
    : 'flat';
  const [vrMode, setVrMode] = useState<VrProjectionMode>(defaultVrMode);
  const [vrLook, setVrLook] = useState({ yaw: 0, pitch: 0 });
  const [vrZoom, setVrZoom] = useState(1.25);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);

  const isMetadataOnly = Boolean((content as any).isMetadataOnly);

  // Load configurable seek step & preferred quality from localStorage
  useEffect(() => {
    try {
      const savedStep = parseInt(localStorage.getItem(SEEK_STEP_STORAGE_KEY) || '10', 10);
      if ([5, 10, 15, 30].includes(savedStep)) setSeekStep(savedStep);
    } catch {}
  }, []);

  // Resolve current, next, and previous episode
  const { currentEpisode, prevEpisode, nextEpisode, episodeList } = useMemo(() => {
    let cur: any = null;
    let prv: any = null;
    let nxt: any = null;
    let eps: any[] = [];
    if (content.seasons && content.seasons.length > 0) {
      for (const season of content.seasons) {
        const list = (season as any).episodes || [];
        if (list.length > eps.length) eps = list;
        const idx = list.findIndex((e: any) => e.id === episodeId);
        if (idx !== -1) {
          cur = list[idx];
          prv = list[idx - 1] || null;
          nxt = list[idx + 1] || null;
          eps = list;
          break;
        }
      }
      if (!cur && (content.seasons[0] as any)?.episodes?.[0]) {
        eps = (content.seasons[0] as any).episodes;
        cur = eps[0];
        nxt = eps[1] || null;
      }
    }
    return { currentEpisode: cur, prevEpisode: prv, nextEpisode: nxt, episodeList: eps };
  }, [content.seasons, episodeId]);

  const sources: VideoSource[] = useMemo(
    () => content.videoSources || (content as any).video_sources || [],
    [content]
  );

  const directSources = useMemo(
    () =>
      sources.filter(
        (s) =>
          (s.sourceType === 'direct_hls' ||
            s.sourceType === 'direct_dash' ||
            s.sourceType === 'html5_mp4') &&
          !isMismatchedPlaceholderStream(s.playbackUrl, content.title)
      ),
    [sources, content.title]
  );

  const officialWatchSources = useMemo(
    () => sources.filter((s) => s.sourceType === 'official_web' || s.sourceType === 'app_deep_link'),
    [sources]
  );

  const defaultDirectUrl = useMemo(() => {
    if (isMetadataOnly) return undefined;
    const rawCandidates = [
      currentEpisode?.fallbackMp4,
      currentEpisode?.streamUrl,
      content.fallbackMp4,
      content.streamUrl,
      directSources[0]?.playbackUrl,
    ];
    for (const raw of rawCandidates) {
      const normalized = normalizeMediaUrl(raw);
      if (normalized && isPlayableMediaUrl(normalized, content.title)) {
        return normalized;
      }
    }
    return undefined;
  }, [isMetadataOnly, currentEpisode, content, directSources]);

  const activeDirectUrl = manualDirectUrl || defaultDirectUrl;

  useEffect(() => {
    setManualDirectUrl(null);
    autoRetryCountRef.current = 0;
  }, [defaultDirectUrl, content.id, episodeId]);

  const ytId = useMemo(() => {
    let id = (content as any).youtubeId || (content as any).youtube_id;
    if (!id && content.trailerUrl) {
      const m = content.trailerUrl.match(
        /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
      );
      if (m) id = m[1];
    }
    return id || null;
  }, [content]);

  type PlaybackMode = 'direct' | 'youtube' | 'official_hub' | 'unavailable';
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>(() => {
    if (activeDirectUrl) return 'direct';
    if (ytId) return 'youtube';
    if (officialWatchSources.length > 0) return 'official_hub';
    return 'unavailable';
  });

  useEffect(() => {
    if (activeDirectUrl) setPlaybackMode('direct');
    else if (ytId) setPlaybackMode('youtube');
    else if (officialWatchSources.length > 0) setPlaybackMode('official_hub');
    else setPlaybackMode('unavailable');
    setHasPlaybackError(false);
    setErrorMessage('');
    setIsPlaying(false);
    setIsBuffering(Boolean(activeDirectUrl));
  }, [activeDirectUrl, ytId, officialWatchSources.length, content.id, episodeId]);

  useEffect(() => {
    triedProxyRef.current = false;
  }, [activeDirectUrl]);

  // PiP & Fullscreen orientation listeners
  useEffect(() => {
    setIsPipSupported(
      typeof document !== 'undefined' && Boolean((document as any).pictureInPictureEnabled)
    );
    const handleFsChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      try {
        const ori = (screen as any).orientation;
        if (active && ori?.lock) {
          ori.lock('landscape').catch(() => {});
        } else if (!active && ori?.unlock) {
          ori.unlock();
        }
      } catch {}
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const onEnterPip = () => setIsPipActive(true);
    const onLeavePip = () => setIsPipActive(false);
    videoEl.addEventListener('enterpictureinpicture', onEnterPip);
    videoEl.addEventListener('leavepictureinpicture', onLeavePip);
    return () => {
      videoEl.removeEventListener('enterpictureinpicture', onEnterPip);
      videoEl.removeEventListener('leavepictureinpicture', onLeavePip);
    };
  }, [playbackMode]);

  // Optional DeviceOrientation gyroscope for VR
  useEffect(() => {
    if (!isGenuineVr || !gyroEnabled || vrMode === 'flat') return;
    const onOrientation = (ev: DeviceOrientationEvent) => {
      if (ev.gamma == null || ev.beta == null) return;
      const yaw = Math.max(-55, Math.min(55, (ev.gamma || 0) * 0.75));
      const pitch = Math.max(-35, Math.min(35, ((ev.beta || 45) - 45) * 0.55));
      setVrLook({ yaw, pitch });
    };
    window.addEventListener('deviceorientation', onOrientation);
    return () => window.removeEventListener('deviceorientation', onOrientation);
  }, [isGenuineVr, gyroEnabled, vrMode]);

  const toggleGyroscope = async () => {
    if (!gyroEnabled && typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
      try {
        const res = await (DeviceOrientationEvent as any).requestPermission();
        if (res !== 'granted') return;
      } catch {
        return;
      }
    }
    setGyroEnabled((g) => !g);
  };

  const syncTrackListsFromPlayers = useCallback(() => {
    const shaka = shakaPlayerRef.current;
    if (shaka) {
      try {
        const variants = shaka.getVariantTracks?.() || [];
        const uniqueHeights = new Map<number, QualityTrackOption>();
        variants.forEach((v: any) => {
          if (v.height && !uniqueHeights.has(v.height)) {
            const label =
              v.height >= 2160
                ? '2160p 4K UHD'
                : v.height >= 1440
                ? '1440p QHD'
                : v.height >= 1080
                ? '1080p Full HD'
                : v.height >= 720
                ? '720p HD'
                : `${v.height}p`;
            uniqueHeights.set(v.height, {
              id: `h-${v.height}`,
              label,
              height: v.height,
              bandwidth: v.bandwidth,
              shakaTrack: v,
            });
          }
        });
        setQualityTracks(
          Array.from(uniqueHeights.values()).sort((a, b) => (b.height || 0) - (a.height || 0))
        );

        const langs: string[] = shaka.getAudioLanguages?.() || [];
        const uniqueAudios: AudioTrackOption[] = Array.from(new Set(langs)).map((lang) => ({
          id: lang || 'und',
          label: lang ? lang.toUpperCase() : 'Default Audio',
          language: lang,
        }));
        setAudioTracks(uniqueAudios);
      } catch {}
    } else if (directSources.length > 1) {
      // Multi-source URLs (e.g. RedGIFs HD + SD)
      const list: QualityTrackOption[] = directSources
        .filter((s) => s.playbackUrl)
        .map((s) => ({
          id: s.id,
          label: s.quality || 'HD',
          directUrl: normalizeMediaUrl(s.playbackUrl!),
        }));
      setQualityTracks(list);
    } else {
      setQualityTracks([]);
      setAudioTracks([]);
    }

    const vid = videoRef.current;
    if (vid?.textTracks) {
      const tracks: SubtitleTrackOption[] = [];
      for (let i = 0; i < vid.textTracks.length; i++) {
        const t = vid.textTracks[i];
        tracks.push({
          id: `native-${i}`,
          label: t.label || t.language?.toUpperCase() || `Subtitle ${i + 1}`,
          language: t.language || 'und',
          source: 'native',
          trackIndex: i,
        });
      }
      setSubtitleTracks(tracks);
    }
  }, [directSources]);

  // Initialize Player (MPEG-TS Chunked Range Loader / HTML5 Direct MP4 & MKV / Shaka ABR 4K)
  useEffect(() => {
    if (playbackMode !== 'direct' || !activeDirectUrl) return;

    let shakaInstance: any = null;
    let mpegtsPlayer: any = null;
    let isCancelled = false;

    const initPlayer = async () => {
      setHasPlaybackError(false);
      setErrorMessage('');
      setIsPlaying(false);
      setIsBuffering(true);
      setQualityTracks([]);
      setAudioTracks([]);
      setDetectedResolution(null);

      const videoEl = videoRef.current;
      if (!videoEl) return;

      const protocol = classifyStreamProtocol(activeDirectUrl);
      const navConn: any = typeof navigator !== 'undefined' ? (navigator as any).connection : null;
      const estimatedBps =
        navConn?.downlink && navConn.downlink > 0 ? Math.round(navConn.downlink * 1_000_000) : 8_000_000;

      // 1. MPEG-TS (.ts) streams — e.g. Naughty America, New Sensations, Family Xxx, etc.
      if (protocol === 'mpegts') {
        setDiagStats({
          protocol: 'MPEG-TS (.ts)',
          engine: 'mpegts.js Chunked Range Loader',
          downlinkMbps: navConn?.downlink,
        });
        try {
          const mpegtsModule = await import('mpegts.js');
          const mpegts: any = mpegtsModule.default || mpegtsModule;
          if (!isCancelled && videoRef.current && mpegts?.getFeatureList?.()?.mseLivePlayback) {
            const proxiedTsUrl = activeDirectUrl.startsWith('http')
              ? `/api/library/stream-proxy?url=${encodeURIComponent(activeDirectUrl)}`
              : activeDirectUrl;
            const CustomRangeLoader = mpegts.BaseLoader ? createChunkedRangeLoaderClass(mpegts) : undefined;

            const player = mpegts.createPlayer(
              {
                type: 'mpegts',
                isLive: false,
                url: proxiedTsUrl,
              },
              {
                enableWorker: false,
                enableStashBuffer: true,
                stashInitialSize: 512 * 1024,
                lazyLoad: true,
                lazyLoadMaxDuration: 45,
                lazyLoadRecoverDuration: 20,
                seekType: 'range',
                rangeLoadZeroStart: true,
                fixAudioTimestampGap: true,
                ...(CustomRangeLoader ? { customLoader: CustomRangeLoader } : {}),
              }
            );
            mpegtsPlayer = player;
            player.on(mpegts.Events?.ERROR || 'error', (_type: any, detail: any) => {
              if (isCancelled) return;
              bugDetector.report({
                severity: 'warn',
                category: 'playback',
                source: content.title,
                message: `MPEG-TS error: ${String(detail || 'network/decode error')}`,
              });
              if (autoRetryCountRef.current < 2) {
                autoRetryCountRef.current++;
                bugDetector.recordRecoveryAttempt(true, 'playback', content.title, 'mpegts auto-retry');
                setRetryCounter((c) => c + 1);
                return;
              }
              setIsBuffering(false);
              setIsPlaying(false);
              setHasPlaybackError(true);
              setErrorMessage(
                `Stream failed after retries: ${String(detail || 'Unable to decode MPEG-TS video')}`
              );
            });
            player.attachMediaElement(videoRef.current);
            player.load();
            if (pendingSeekAfterSwitchRef.current && videoRef.current) {
              videoRef.current.currentTime = pendingSeekAfterSwitchRef.current;
              pendingSeekAfterSwitchRef.current = null;
            }
            videoRef.current.play().catch(() => {
              if (!isCancelled) setIsBuffering(false);
            });
            syncTrackListsFromPlayers();
            return;
          }
        } catch (err: any) {
          bugDetector.report({
            severity: 'error',
            category: 'playback',
            source: content.title,
            message: err?.message || 'MPEG-TS initialization failed',
          });
        }
      }

      // 2. Direct MP4 / WebM / MKV / Stash byte-range stream
      if (protocol === 'mp4' || protocol === 'mkv') {
        setDiagStats({
          protocol: protocol.toUpperCase(),
          engine: 'HTML5 Native Range Engine',
          downlinkMbps: navConn?.downlink,
        });
        videoEl.src = activeDirectUrl;
        videoEl.load();
        if (pendingSeekAfterSwitchRef.current) {
          videoEl.currentTime = pendingSeekAfterSwitchRef.current;
          pendingSeekAfterSwitchRef.current = null;
        }
        syncTrackListsFromPlayers();
        videoEl.play().catch(() => {
          if (!isCancelled) setIsBuffering(false);
        });
        return;
      }

      // 3. Adaptive HLS (.m3u8) / DASH (.mpd) via Shaka Player with 4K ABR
      setDiagStats({
        protocol: protocol.toUpperCase(),
        engine: 'Shaka ABR 4K Engine',
        downlinkMbps: navConn?.downlink,
      });

      try {
        const shakaModule = await import('shaka-player');
        const shaka: any = shakaModule.default || shakaModule;
        if (shaka.polyfill?.installAll) shaka.polyfill.installAll();

        if (!isCancelled && videoRef.current && shaka.Player?.isBrowserSupported?.()) {
          const player = new shaka.Player(videoRef.current);
          shakaInstance = player;
          shakaPlayerRef.current = player;

          player.configure({
            abr: {
              enabled: true,
              defaultBandwidthEstimate: estimatedBps,
              switchInterval: 4,
            },
            streaming: {
              bufferingGoal: 30,
              rebufferingGoal: 2,
              retryParameters: {
                maxAttempts: 4,
                baseDelay: 600,
                backoffFactor: 1.8,
                fuzzFactor: 0.3,
              },
            },
          });

          player.addEventListener('adaptation', () => {
            try {
              const stats = player.getStats?.();
              if (stats?.height) {
                const badge = formatResolutionBadge(stats.width || Math.round((stats.height * 16) / 9), stats.height);
                if (badge) setDetectedResolution(badge);
              }
              setDiagStats((prev) => ({
                ...prev,
                bitrateKbps: stats?.streamBandwidth ? Math.round(stats.streamBandwidth / 1000) : prev.bitrateKbps,
                droppedFrames: stats?.droppedFrames,
              }));
            } catch {}
          });

          player.addEventListener('error', (event: any) => {
            if (isCancelled) return;
            const code = event?.detail?.code;
            bugDetector.report({
              severity: 'warn',
              category: 'playback',
              source: content.title,
              message: `Shaka playback error code ${code}`,
            });
            const fallback = currentEpisode?.fallbackMp4 || content.fallbackMp4;
            if (
              fallback &&
              fallback !== activeDirectUrl &&
              isPlayableMediaUrl(fallback, content.title) &&
              videoRef.current
            ) {
              player.destroy().catch(() => {});
              shakaPlayerRef.current = null;
              videoRef.current.src = fallback;
              videoRef.current.load();
              videoRef.current.play().catch(() => setIsBuffering(false));
              bugDetector.recordRecoveryAttempt(true, 'playback', content.title, 'Shaka -> MP4 fallback');
              return;
            }
            setIsPlaying(false);
            setIsBuffering(false);
            setHasPlaybackError(true);
            setErrorMessage(`Adaptive stream playback failed (Shaka code ${code || 'network/codec'}).`);
          });

          await player.load(activeDirectUrl);
          if (!isCancelled) {
            // Apply preferred quality setting if not Auto
            try {
              const pref = localStorage.getItem(DEFAULT_QUALITY_STORAGE_KEY);
              if (pref && pref !== 'auto') {
                const targetH = parseInt(pref, 10);
                const variants = player.getVariantTracks?.() || [];
                const match = variants.find((v: any) => v.height === targetH);
                if (match) {
                  player.configure({ abr: { enabled: false } });
                  player.selectVariantTrack(match, false);
                  setSelectedQualityId(`h-${match.height}`);
                }
              }
            } catch {}
            syncTrackListsFromPlayers();
            if (pendingSeekAfterSwitchRef.current && videoRef.current) {
              videoRef.current.currentTime = pendingSeekAfterSwitchRef.current;
              pendingSeekAfterSwitchRef.current = null;
            }
            videoRef.current?.play().catch(() => {
              if (!isCancelled) setIsBuffering(false);
            });
          }
        } else if (!isCancelled && videoRef.current) {
          if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            videoRef.current.src = activeDirectUrl;
            videoRef.current.load();
            videoRef.current.play().catch(() => setIsBuffering(false));
          } else {
            setIsBuffering(false);
            setHasPlaybackError(true);
            setErrorMessage('This browser does not support adaptive HLS/DASH MSE playback.');
          }
        }
      } catch (err: any) {
        if (!isCancelled) {
          setIsPlaying(false);
          setIsBuffering(false);
          setHasPlaybackError(true);
          setErrorMessage(err?.message || 'Unable to load stream manifest.');
        }
      }
    };

    initPlayer();

    return () => {
      isCancelled = true;
      shakaPlayerRef.current = null;
      if (shakaInstance) {
        shakaInstance.destroy().catch(() => {});
      }
      if (mpegtsPlayer) {
        try {
          mpegtsPlayer.unload();
          mpegtsPlayer.detachMediaElement();
          mpegtsPlayer.destroy();
        } catch {}
      }
    };
  }, [
    activeDirectUrl,
    playbackMode,
    retryCounter,
    content.title,
    content.fallbackMp4,
    currentEpisode?.fallbackMp4,
    syncTrackListsFromPlayers,
  ]);

  // Restore saved progress cleanly
  useEffect(() => {
    if (playbackMode !== 'direct') return;
    const savedTime = getProgress(content.id, currentEpisode?.id);
    if (savedTime > 5 && videoRef.current) {
      try {
        videoRef.current.currentTime = savedTime;
        setCurrentTime(savedTime);
        setResumeBanner(`Resumed from ${formatTime(savedTime)}`);
        const t = setTimeout(() => setResumeBanner(null), 3500);
        return () => clearTimeout(t);
      } catch {}
    }
  }, [content.id, currentEpisode?.id, playbackMode, getProgress]);

  const scheduleControlsHide = useCallback(
    (playingOverride?: boolean) => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      const activePlaying = playingOverride !== undefined ? playingOverride : isPlaying;
      if (
        activePlaying &&
        !showSpeedMenu &&
        !showSubtitleMenu &&
        !showAudioMenu &&
        !showQualityMenu &&
        !showDiagnosticsHud
      ) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3200);
      }
    },
    [isPlaying, showSpeedMenu, showSubtitleMenu, showAudioMenu, showQualityMenu, showDiagnosticsHud]
  );

  useEffect(() => {
    if (isPlaying) scheduleControlsHide(true);
    else setShowControls(true);
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, scheduleControlsHide]);

  const togglePlay = useCallback(() => {
    const vid = videoRef.current;
    if (!vid || hasPlaybackError) return;
    if (!vid.paused && !vid.ended) {
      vid.pause();
      setShowControls(true);
    } else {
      vid.play().catch((err) => {
        setIsBuffering(false);
        setIsPlaying(false);
        setErrorMessage(err?.message || 'Tap Play again to authorize playback.');
      });
    }
  }, [hasPlaybackError]);

  const seekDelta = useCallback(
    (seconds: number) => {
      const vid = videoRef.current;
      if (!vid) return;
      const maxDur = duration || vid.duration || vid.currentTime + Math.abs(seconds);
      const target = Math.max(0, Math.min(maxDur || 99999, vid.currentTime + seconds));
      vid.currentTime = target;
      setCurrentTime(target);
      scheduleControlsHide();
    },
    [duration, scheduleControlsHide]
  );

  // Double-tap left/right seek handler + single tap control reveal/toggle
  const handleStageTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (playbackMode !== 'direct' || hasPlaybackError) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / Math.max(1, rect.width);
    const side: 'left' | 'right' | 'center' = xRatio < 0.34 ? 'left' : xRatio > 0.66 ? 'right' : 'center';
    const now = Date.now();

    if (side !== 'center' && lastTapRef.current.side === side && now - lastTapRef.current.time < 320) {
      const delta = side === 'left' ? -seekStep : seekStep;
      seekDelta(delta);
      setDoubleTapFeedback({ side, amount: seekStep });
      setTimeout(() => setDoubleTapFeedback(null), 650);
      lastTapRef.current = { time: 0, side: 'center' };
      return;
    }

    lastTapRef.current = { time: now, side };
    if (showControls && isPlaying && side === 'center') {
      togglePlay();
    } else {
      setShowControls((v) => !v);
      scheduleControlsHide();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
      setCurrentTime(target);
      scheduleControlsHide();
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) videoRef.current.playbackRate = speed;
    setShowSpeedMenu(false);
    scheduleControlsHide();
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    scheduleControlsHide();
  };

  const togglePictureInPicture = async () => {
    const vid = videoRef.current as any;
    if (!vid) return;
    try {
      if ((document as any).pictureInPictureElement) {
        await (document as any).exitPictureInPicture();
      } else if (vid.requestPictureInPicture) {
        await vid.requestPictureInPicture();
      }
    } catch {}
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const selectQualityTrack = (option: QualityTrackOption | 'auto') => {
    setShowQualityMenu(false);
    const shaka = shakaPlayerRef.current;

    if (option === 'auto') {
      if (shaka) {
        shaka.configure({ abr: { enabled: true } });
      } else if (defaultDirectUrl && manualDirectUrl) {
        pendingSeekAfterSwitchRef.current = videoRef.current?.currentTime || 0;
        setManualDirectUrl(null);
      }
      setSelectedQualityId('auto');
      return;
    }

    if (option.shakaTrack && shaka) {
      // false clearBuffer preserves existing buffered frames so video switches without restarting!
      shaka.configure({ abr: { enabled: false } });
      shaka.selectVariantTrack(option.shakaTrack, false);
      setSelectedQualityId(option.id);
      if (option.height) {
        const badge = formatResolutionBadge(Math.round((option.height * 16) / 9), option.height);
        if (badge) setDetectedResolution(badge);
      }
    } else if (option.directUrl) {
      pendingSeekAfterSwitchRef.current = videoRef.current?.currentTime || 0;
      setManualDirectUrl(option.directUrl);
      setSelectedQualityId(option.id);
    }
  };

  const selectAudioLanguage = (option: AudioTrackOption) => {
    setShowAudioMenu(false);
    const shaka = shakaPlayerRef.current;
    if (shaka?.selectAudioLanguage) {
      shaka.selectAudioLanguage(option.language);
      setSelectedAudioLang(option.language);
    }
  };

  const selectSubtitleTrack = (option: SubtitleTrackOption | 'off') => {
    setShowSubtitleMenu(false);
    const vid = videoRef.current;
    if (!vid?.textTracks) return;
    for (let i = 0; i < vid.textTracks.length; i++) {
      vid.textTracks[i].mode = option !== 'off' && option.trackIndex === i ? 'showing' : 'disabled';
    }
    setSelectedSubtitleId(option === 'off' ? 'off' : option.id);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const vrTransformStyle = useMemo(() => {
    if (!isGenuineVr || vrMode === 'flat') return undefined;
    return {
      transform: `perspective(900px) scale(${vrZoom}) rotateY(${vrLook.yaw}deg) rotateX(${-vrLook.pitch}deg)`,
      transition: dragStartRef.current ? 'none' : 'transform 120ms ease-out',
    };
  }, [isGenuineVr, vrMode, vrLook, vrZoom]);

  const statusPillLabel =
    playbackMode === 'direct'
      ? isPlaying
        ? 'Direct Stream'
        : isBuffering
        ? 'Buffering'
        : 'Ready'
      : playbackMode === 'youtube'
      ? 'Official Trailer'
      : playbackMode === 'official_hub'
      ? 'Partner Info'
      : isMetadataOnly
      ? 'Metadata Only'
      : 'Unavailable';

  const hasSubtitles = Boolean(content.subtitles && content.subtitles.length > 0);

  return (
    <div
      ref={containerRef}
      onMouseMove={() => scheduleControlsHide()}
      className={`relative w-full max-w-6xl mx-auto bg-black overflow-hidden shadow-2xl border border-proz-border/60 flex flex-col select-none ${
        isFullscreen ? 'h-screen max-w-none rounded-none border-0' : 'md:rounded-3xl'
      }`}
    >
      {/* Top Header Bar (Docked outside fullscreen; auto-hides in fullscreen) */}
      <div
        className={
          isFullscreen
            ? `absolute top-0 left-0 right-0 z-30 pt-[max(0.75rem,env(safe-area-inset-top))] px-4 pb-6 bg-gradient-to-b from-black/90 via-black/45 to-transparent flex items-center justify-between gap-3 transition-opacity duration-300 ${
                showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`
            : 'shrink-0 bg-[#0A0B0F] border-b border-white/10 px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2.5 z-20'
        }
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            onClick={() => router.back()}
            className="shrink-0 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 hover:text-white transition-colors"
            title="Go Back"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-xs sm:text-sm font-bold text-white keep-white truncate">
                {content.title}
                {currentEpisode ? ` • E${currentEpisode.episodeNumber}` : ''}
              </h1>
              <span className="inline-flex shrink-0 px-2 py-0.5 rounded-md bg-proz-purple/20 text-proz-purple border border-proz-purple/35 text-[10px] font-bold">
                {statusPillLabel}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate mt-0.5">
              {[
                detectedResolution || (playbackMode === 'youtube' ? 'Trailer' : 'Detecting Res'),
                content.category ? content.category.toUpperCase() : 'STREAM',
                content.releaseYear,
              ]
                .filter(Boolean)
                .join(' • ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isGenuineVr && playbackMode === 'direct' && (
            <button
              onClick={() => {
                const order: VrProjectionMode[] = ['flat', '180_sbs', '360_interactive', 'top_bottom'];
                setVrMode(order[(order.indexOf(vrMode) + 1) % order.length]);
                setVrLook({ yaw: 0, pitch: 0 });
              }}
              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 transition-all ${
                vrMode !== 'flat'
                  ? 'bg-amber-500/25 text-amber-200 border-amber-400/50'
                  : 'bg-white/5 text-zinc-300 border-white/10 hover:text-white'
              }`}
              title="Switch VR Projection"
            >
              <Glasses className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {vrMode === 'flat'
                  ? 'VR: 2D'
                  : vrMode === '180_sbs'
                  ? '180° SBS'
                  : vrMode === 'top_bottom'
                  ? 'Top/Bot 3D'
                  : '360° VR'}
              </span>
            </button>
          )}

          <button
            onClick={() => setShowDiagnosticsHud((v) => !v)}
            className={`p-1.5 rounded-lg border text-[10px] font-semibold transition-all ${
              showDiagnosticsHud
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-white/5 text-zinc-300 border-white/10 hover:text-white'
            }`}
            title="Stream Diagnostics"
          >
            <Activity className="w-3.5 h-3.5" />
          </button>

          {activeDirectUrl && (
            <button
              onClick={() => {
                setHasPlaybackError(false);
                setPlaybackMode('direct');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold border transition-all ${
                playbackMode === 'direct'
                  ? 'bg-proz-purple text-white keep-white border-proz-purple'
                  : 'bg-white/5 text-zinc-300 border-white/10 hover:text-white'
              }`}
            >
              Stream
            </button>
          )}

          {ytId && (
            <button
              onClick={() => {
                setHasPlaybackError(false);
                setPlaybackMode('youtube');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold border transition-all ${
                playbackMode === 'youtube'
                  ? 'bg-proz-purple text-white keep-white border-proz-purple'
                  : 'bg-white/5 text-zinc-300 border-white/10 hover:text-white'
              }`}
            >
              Trailer
            </button>
          )}
        </div>
      </div>

      {/* Stage */}
      <div
        className={`relative w-full ${isFullscreen ? 'flex-1' : 'aspect-video'} bg-black overflow-hidden`}
        onClick={handleStageTap}
        onPointerDown={(e) => {
          if (isGenuineVr && vrMode !== 'flat') {
            dragStartRef.current = { x: e.clientX, y: e.clientY, yaw: vrLook.yaw, pitch: vrLook.pitch };
          }
        }}
        onPointerMove={(e) => {
          if (dragStartRef.current && isGenuineVr && vrMode !== 'flat') {
            const dx = e.clientX - dragStartRef.current.x;
            const dy = e.clientY - dragStartRef.current.y;
            setVrLook({
              yaw: Math.max(-55, Math.min(55, dragStartRef.current.yaw + dx * 0.16)),
              pitch: Math.max(-35, Math.min(35, dragStartRef.current.pitch + dy * 0.16)),
            });
          }
        }}
        onPointerUp={() => {
          dragStartRef.current = null;
        }}
        onPointerLeave={() => {
          dragStartRef.current = null;
        }}
      >
        {/* Mode 1: Direct Video Player */}
        {playbackMode === 'direct' && !hasPlaybackError && (
          <>
            <video
              ref={videoRef}
              playsInline
              preload="auto"
              crossOrigin={hasSubtitles ? 'anonymous' : undefined}
              style={vrTransformStyle}
              className="w-full h-full object-contain cursor-pointer"
              onLoadedMetadata={() => {
                const vid = videoRef.current;
                if (!vid) return;
                if (!isNaN(vid.duration) && vid.duration > 0) setDuration(vid.duration);
                const res = formatResolutionBadge(vid.videoWidth, vid.videoHeight);
                if (res) setDetectedResolution(res);
                syncTrackListsFromPlayers();
              }}
              onResize={() => {
                const vid = videoRef.current;
                if (!vid) return;
                const res = formatResolutionBadge(vid.videoWidth, vid.videoHeight);
                if (res) setDetectedResolution(res);
              }}
              onCanPlay={() => {
                setIsBuffering(false);
                autoRetryCountRef.current = 0;
                if (videoRef.current && (!duration || isNaN(duration)) && !isNaN(videoRef.current.duration)) {
                  if (videoRef.current.duration > 0) setDuration(videoRef.current.duration);
                }
              }}
              onTimeUpdate={() => {
                const vid = videoRef.current;
                if (!vid) return;
                const cur = vid.currentTime;
                setCurrentTime(cur);
                if ((!duration || isNaN(duration)) && vid.duration > 0) {
                  setDuration(vid.duration);
                }
                const now = Date.now();
                if (now - lastSavedProgressRef.current > 4000) {
                  lastSavedProgressRef.current = now;
                  saveProgress(content.id, cur, vid.duration || duration || 0, currentEpisode?.id);
                }
              }}
              onDurationChange={() => {
                if (videoRef.current && !isNaN(videoRef.current.duration) && videoRef.current.duration > 0) {
                  setDuration(videoRef.current.duration);
                }
              }}
              onProgress={() => {
                if (videoRef.current && videoRef.current.buffered.length > 0) {
                  setBufferedTime(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
                }
              }}
              onWaiting={() => {
                setIsBuffering(true);
                bugDetector.report({
                  severity: 'info',
                  category: 'buffering',
                  source: content.title,
                  message: 'Player buffering',
                });
              }}
              onPlaying={() => {
                setIsBuffering(false);
                setIsPlaying(true);
              }}
              onPause={() => {
                setIsPlaying(false);
                if (videoRef.current) {
                  saveProgress(
                    content.id,
                    videoRef.current.currentTime,
                    videoRef.current.duration || duration || 0,
                    currentEpisode?.id
                  );
                }
              }}
              onEnded={() => setIsPlaying(false)}
              onEmptied={() => setIsPlaying(false)}
              onError={() => {
                if (!triedProxyRef.current && activeDirectUrl?.startsWith('http') && videoRef.current) {
                  triedProxyRef.current = true;
                  const proxyUrl = `/api/library/stream-proxy?url=${encodeURIComponent(activeDirectUrl)}`;
                  bugDetector.recordRecoveryAttempt(true, 'playback', content.title, 'Range Proxy Fallback');
                  videoRef.current.src = proxyUrl;
                  videoRef.current.load();
                  videoRef.current.play().catch(() => setIsBuffering(false));
                  return;
                }
                setIsPlaying(false);
                setIsBuffering(false);
                setHasPlaybackError(true);
                const msg =
                  classifyStreamProtocol(activeDirectUrl) === 'mkv'
                    ? 'MKV container codec is not natively supported by this mobile/browser decoder.'
                    : 'Direct stream failed due to upstream CDN or incompatible media encoding.';
                setErrorMessage(msg);
                bugDetector.report({
                  severity: 'error',
                  category: 'playback',
                  source: content.title,
                  message: msg,
                });
              }}
            >
              {(content.subtitles || []).map((sub, idx) => (
                <track
                  key={sub.id || idx}
                  kind="subtitles"
                  src={sub.url}
                  srcLang={sub.lang}
                  label={sub.label}
                  default={Boolean(sub.isDefault)}
                />
              ))}
            </video>

            {/* Double-Tap Seek HUD Ripple */}
            {doubleTapFeedback && (
              <div
                className={`absolute top-1/2 -translate-y-1/2 z-30 pointer-events-none px-4 py-3 rounded-2xl bg-black/75 border border-white/20 text-white keep-white flex flex-col items-center gap-1 animate-pulse ${
                  doubleTapFeedback.side === 'left' ? 'left-8' : 'right-8'
                }`}
              >
                {doubleTapFeedback.side === 'left' ? (
                  <RotateCcw className="w-6 h-6 text-proz-purple" />
                ) : (
                  <RotateCw className="w-6 h-6 text-proz-cyan" />
                )}
                <span className="text-xs font-black font-mono">
                  {doubleTapFeedback.side === 'left' ? '-' : '+'}
                  {doubleTapFeedback.amount}s
                </span>
              </div>
            )}

            {/* VR Mode HUD Controls */}
            {isGenuineVr && vrMode !== 'flat' && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5"
              >
                <span className="px-2.5 py-1 rounded-lg bg-black/80 border border-amber-500/40 text-[10px] font-bold text-amber-200">
                  Drag to pan • {vrMode === '180_sbs' ? '180° SBS' : vrMode === 'top_bottom' ? 'Top/Bottom 3D' : '360° VR'}
                </span>
                <button
                  onClick={toggleGyroscope}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold border flex items-center gap-1 ${
                    gyroEnabled ? 'bg-proz-purple text-white border-proz-purple' : 'bg-black/75 text-zinc-200 border-white/15'
                  }`}
                >
                  <Compass className="w-3 h-3" />
                  <span>{gyroEnabled ? 'Gyro On' : 'Gyro'}</span>
                </button>
                <button
                  onClick={() => setVrZoom((z) => (z >= 1.75 ? 1.05 : Number((z + 0.25).toFixed(2))))}
                  className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-black/75 text-zinc-200 border border-white/15 flex items-center gap-1"
                >
                  <ZoomIn className="w-3 h-3" />
                  <span>{vrZoom}x</span>
                </button>
                <button
                  onClick={() => setVrLook({ yaw: 0, pitch: 0 })}
                  className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-black/75 text-zinc-200 border border-white/15"
                >
                  Recenter
                </button>
              </div>
            )}

            {/* Diagnostics Overlay HUD */}
            {showDiagnosticsHud && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-3 right-3 z-30 bg-black/85 backdrop-blur-md border border-emerald-500/35 rounded-xl p-3 text-[10px] font-mono text-zinc-200 space-y-1 max-w-xs shadow-2xl"
              >
                <p className="font-bold text-emerald-400">STREAM DIAGNOSTICS</p>
                <p>Engine: {diagStats.engine}</p>
                <p>Protocol: {diagStats.protocol}</p>
                <p>Resolution: {detectedResolution || 'Inspecting stream...'}</p>
                <p>Buffer Ahead: {Math.max(0, bufferedTime - currentTime).toFixed(1)}s</p>
                {diagStats.downlinkMbps && <p>Connection: ~{diagStats.downlinkMbps} Mbps</p>}
                {diagStats.bitrateKbps && <p>Bitrate: {diagStats.bitrateKbps} kbps</p>}
              </div>
            )}

            {/* Resume Toast */}
            {resumeBanner && (
              <div className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-lg bg-black/80 border border-amber-500/40 text-amber-300 text-xs font-semibold">
                {resumeBanner}
              </div>
            )}

            {/* Buffering Spinner */}
            {isBuffering && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 pointer-events-none z-20">
                <div className="w-11 h-11 border-4 border-proz-purple border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-zinc-200 font-medium mt-3">
                  Buffering stream...
                </p>
              </div>
            )}

            {/* Center Play Button */}
            {!isPlaying && !isBuffering && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/25 cursor-pointer z-10 transition-opacity hover:bg-black/15"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-proz-purple to-orange-600 text-white keep-white flex items-center justify-center shadow-purple-glow hover:scale-105 transition-transform">
                  <Play className="w-8 h-8 fill-white ml-1" />
                </div>
              </div>
            )}

            {/* Skip Intro */}
            {isPlaying && currentTime > 5 && currentTime < 90 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  seekDelta(85 - currentTime);
                }}
                className="absolute bottom-20 left-4 z-20 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-white keep-white text-xs font-bold hover:bg-proz-purple transition-all flex items-center gap-1.5 shadow-xl"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Skip Intro</span>
              </button>
            )}

            {/* Auto-hiding Bottom Controls Bar */}
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute bottom-0 left-0 right-0 px-3 sm:px-4 pt-8 pb-3 bg-gradient-to-t from-black/95 via-black/75 to-transparent space-y-2 z-30 transition-opacity duration-300 ${
                showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Seek Slider with Buffer Bar */}
              <div className="relative flex items-center">
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-white/30 rounded-full pointer-events-none"
                  style={{
                    width: duration > 0 ? `${Math.min(100, (bufferedTime / duration) * 100)}%` : '0%',
                  }}
                />
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="relative w-full h-1.5 bg-zinc-700/60 rounded-full appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-200 gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-lg bg-proz-purple text-white keep-white hover:opacity-90 transition shrink-0"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                  </button>

                  {prevEpisode && (
                    <button
                      onClick={() => router.push(`/watch/${content.id}?episode=${prevEpisode.id}`)}
                      className="p-1.5 text-zinc-300 hover:text-white rotate-180"
                      title="Previous Episode"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => seekDelta(-seekStep)}
                    className="p-1.5 text-zinc-300 hover:text-white flex items-center gap-0.5"
                    title={`Rewind ${seekStep}s`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-[9px] hidden sm:inline">{seekStep}</span>
                  </button>

                  <button
                    onClick={() => seekDelta(seekStep)}
                    className="p-1.5 text-zinc-300 hover:text-white flex items-center gap-0.5"
                    title={`Forward ${seekStep}s`}
                  >
                    <RotateCw className="w-4 h-4" />
                    <span className="text-[9px] hidden sm:inline">{seekStep}</span>
                  </button>

                  {nextEpisode && (
                    <button
                      onClick={() => router.push(`/watch/${content.id}?episode=${nextEpisode.id}`)}
                      className="p-1.5 text-zinc-300 hover:text-white"
                      title="Next Episode"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button onClick={toggleMute} className="text-zinc-300 hover:text-white" title="Mute">
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        if (videoRef.current) videoRef.current.volume = v;
                        setVolume(v);
                        setIsMuted(v === 0);
                      }}
                      className="w-14 h-1 bg-zinc-700 rounded appearance-none accent-rose-500 hidden sm:block"
                    />
                  </div>

                  <span className="text-[11px] text-zinc-300 font-mono truncate">
                    {formatTime(currentTime)} / {duration > 0 ? formatTime(duration) : '--:--'}
                  </span>
                </div>

                {/* Right Track & Settings Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowSpeedMenu(!showSpeedMenu);
                        setShowSubtitleMenu(false);
                        setShowAudioMenu(false);
                        setShowQualityMenu(false);
                      }}
                      className="px-2 py-1 rounded bg-zinc-800/90 text-zinc-200 hover:text-white text-[11px] font-bold"
                      title="Playback Speed"
                    >
                      {playbackSpeed === 1 ? '1x' : `${playbackSpeed}x`}
                    </button>
                    {showSpeedMenu && (
                      <div className="absolute bottom-9 right-0 bg-zinc-900 border border-zinc-700 rounded-xl p-1.5 w-24 space-y-1 shadow-2xl z-50">
                        {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                          <button
                            key={speed}
                            onClick={() => handleSpeedChange(speed)}
                            className={`w-full text-left px-2 py-1 rounded text-xs font-semibold ${
                              playbackSpeed === speed ? 'bg-proz-purple text-white' : 'text-zinc-300 hover:bg-zinc-800'
                            }`}
                          >
                            {speed === 1.0 ? 'Normal' : `${speed}x`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowAudioMenu(!showAudioMenu);
                        setShowSpeedMenu(false);
                        setShowSubtitleMenu(false);
                        setShowQualityMenu(false);
                      }}
                      className="p-1.5 rounded text-zinc-300 hover:text-white"
                      title="Audio Tracks"
                    >
                      <Languages className="w-4 h-4" />
                    </button>
                    {showAudioMenu && (
                      <div className="absolute bottom-9 right-0 bg-zinc-900 border border-zinc-700 rounded-xl p-2 w-44 space-y-1 shadow-2xl z-50">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase px-1">Audio Track</p>
                        {audioTracks.length > 0 ? (
                          audioTracks.map((a) => (
                            <button
                              key={a.id}
                              onClick={() => selectAudioLanguage(a)}
                              className={`w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between ${
                                selectedAudioLang === a.language ? 'bg-proz-purple text-white' : 'text-zinc-300 hover:bg-zinc-800'
                              }`}
                            >
                              <span>{a.label}</span>
                              {selectedAudioLang === a.language && <Check className="w-3 h-3" />}
                            </button>
                          ))
                        ) : (
                          <p className="text-[11px] text-zinc-400 px-1 py-1">Default stream audio track</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowSubtitleMenu(!showSubtitleMenu);
                        setShowSpeedMenu(false);
                        setShowAudioMenu(false);
                        setShowQualityMenu(false);
                      }}
                      className={`p-1.5 rounded transition-colors ${
                        selectedSubtitleId !== 'off' ? 'text-proz-purple bg-proz-purple/20' : 'text-zinc-300 hover:text-white'
                      }`}
                      title="Subtitles"
                    >
                      <Subtitles className="w-4 h-4" />
                    </button>
                    {showSubtitleMenu && (
                      <div className="absolute bottom-9 right-0 bg-zinc-900 border border-zinc-700 rounded-xl p-2 w-44 space-y-1 shadow-2xl z-50">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase px-1">Subtitles</p>
                        <button
                          onClick={() => selectSubtitleTrack('off')}
                          className={`w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between ${
                            selectedSubtitleId === 'off' ? 'bg-proz-purple text-white' : 'text-zinc-300 hover:bg-zinc-800'
                          }`}
                        >
                          <span>Off</span>
                          {selectedSubtitleId === 'off' && <Check className="w-3 h-3" />}
                        </button>
                        {subtitleTracks.length > 0 ? (
                          subtitleTracks.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => selectSubtitleTrack(sub)}
                              className={`w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between ${
                                selectedSubtitleId === sub.id ? 'bg-proz-purple text-white' : 'text-zinc-300 hover:bg-zinc-800'
                              }`}
                            >
                              <span>{sub.label}</span>
                              {selectedSubtitleId === sub.id && <Check className="w-3 h-3" />}
                            </button>
                          ))
                        ) : (
                          <p className="text-[11px] text-zinc-400 px-1 py-1">No subtitle tracks in this stream</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Resolution / Quality Menu */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowQualityMenu(!showQualityMenu);
                        setShowSpeedMenu(false);
                        setShowSubtitleMenu(false);
                        setShowAudioMenu(false);
                      }}
                      className="px-2 py-1 rounded bg-zinc-800/90 text-zinc-200 hover:text-white text-[10px] font-bold flex items-center gap-1"
                      title="Quality & Seek Settings"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">{detectedResolution || 'Auto'}</span>
                    </button>
                    {showQualityMenu && (
                      <div className="absolute bottom-9 right-0 bg-zinc-900 border border-zinc-700 rounded-xl p-2 w-48 space-y-1.5 shadow-2xl z-50">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase px-1">
                          Stream Quality (Honest Detection)
                        </p>
                        <button
                          onClick={() => selectQualityTrack('auto')}
                          className={`w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between ${
                            selectedQualityId === 'auto' ? 'bg-proz-purple text-white' : 'text-zinc-300 hover:bg-zinc-800'
                          }`}
                        >
                          <span>Auto ({detectedResolution || 'ABR'})</span>
                          {selectedQualityId === 'auto' && <Check className="w-3 h-3" />}
                        </button>
                        {qualityTracks.length > 0 ? (
                          qualityTracks.map((q) => (
                            <button
                              key={q.id}
                              onClick={() => selectQualityTrack(q)}
                              className={`w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between ${
                                selectedQualityId === q.id ? 'bg-proz-purple text-white' : 'text-zinc-300 hover:bg-zinc-800'
                              }`}
                            >
                              <span>{q.label}</span>
                              {selectedQualityId === q.id && <Check className="w-3 h-3" />}
                            </button>
                          ))
                        ) : (
                          <p className="text-[10px] text-zinc-400 px-1">
                            Single-bitrate source ({detectedResolution || 'Native'})
                          </p>
                        )}
                        <div className="border-t border-zinc-800 pt-1.5 mt-1">
                          <p className="text-[10px] text-zinc-500 font-bold uppercase px-1 mb-1">
                            Double-Tap Seek
                          </p>
                          <div className="grid grid-cols-4 gap-1 px-1">
                            {[5, 10, 15, 30].map((sec) => (
                              <button
                                key={sec}
                                onClick={() => {
                                  setSeekStep(sec);
                                  try {
                                    localStorage.setItem(SEEK_STEP_STORAGE_KEY, String(sec));
                                  } catch {}
                                }}
                                className={`py-1 rounded text-[10px] font-bold ${
                                  seekStep === sec ? 'bg-proz-purple text-white' : 'bg-zinc-800 text-zinc-300'
                                }`}
                              >
                                {sec}s
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {episodeList.length > 1 && (
                    <button
                      onClick={() => setShowEpisodeDrawer(!showEpisodeDrawer)}
                      className="px-2 py-1 rounded bg-zinc-800/90 text-zinc-200 hover:text-white text-[11px] font-semibold"
                    >
                      Episodes
                    </button>
                  )}

                  {isPipSupported && (
                    <button
                      onClick={togglePictureInPicture}
                      className={`p-1.5 rounded transition-colors ${
                        isPipActive ? 'text-amber-400 bg-amber-950/50' : 'text-zinc-300 hover:text-white'
                      }`}
                      title="Picture-in-Picture"
                    >
                      <PictureInPicture2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 text-zinc-300 hover:text-white transition-colors"
                    title="Fullscreen"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Mode 2: Embedded Official Preview Player */}
        {playbackMode === 'youtube' && ytId && !hasPlaybackError && (
          <div className="w-full h-full relative bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&controls=1&modestbranding=1&rel=0&playsinline=1`}
              title={content.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        )}

        {/* Mode 3 / Error / Metadata-Only State */}
        {(playbackMode === 'official_hub' || playbackMode === 'unavailable' || hasPlaybackError) && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#111218] via-[#07070A] to-black flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto text-center z-20">
            <div className="max-w-md w-full space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-proz-purple/15 border border-proz-purple/35 text-proz-purple flex items-center justify-center mx-auto">
                {hasPlaybackError ? (
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                ) : isMetadataOnly ? (
                  <Info className="w-6 h-6 text-proz-cyan" />
                ) : (
                  <Sparkles className="w-6 h-6" />
                )}
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-black text-white keep-white">{content.title}</h2>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  {hasPlaybackError
                    ? errorMessage || 'Stream playback failed.'
                    : isMetadataOnly
                    ? 'This StashDB entry contains verified metadata only and is not linked to a playable file on your Stash media server.'
                    : 'No direct stream is hosted for this commercial title inside PROZ. Review licensed streaming availability below or watch the official trailer.'}
                </p>
              </div>

              {hasPlaybackError && activeDirectUrl && (
                <button
                  onClick={() => {
                    triedProxyRef.current = false;
                    autoRetryCountRef.current = 0;
                    setHasPlaybackError(false);
                    setRetryCounter((c) => c + 1);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-button-primary text-xs font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Stream</span>
                </button>
              )}

              {officialWatchSources.length > 0 && (
                <div className="space-y-2 pt-1 max-h-44 overflow-y-auto text-left">
                  {officialWatchSources.map((source) => (
                    <div
                      key={source.id}
                      className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                          <Globe className="w-3.5 h-3.5 text-proz-cyan shrink-0" />
                          <span className="truncate">{source.providerName}</span>
                        </p>
                        <span className="text-[10px] text-zinc-400 capitalize">
                          {source.pricingType} • {source.quality || 'HD'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {source.appDeepLink?.android && (
                          <a
                            href={source.appDeepLink.android}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                            title="Open Partner App"
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <a
                          href={source.officialWatchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {ytId && (
                <div>
                  <button
                    onClick={() => {
                      setHasPlaybackError(false);
                      setPlaybackMode('youtube');
                    }}
                    className="text-xs text-proz-purple hover:underline font-semibold"
                  >
                    Play Official Trailer Inside PROZ Player
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Episode Drawer */}
        {showEpisodeDrawer && episodeList.length > 0 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-0 right-0 bottom-0 w-72 sm:w-80 bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-800 p-4 z-40 overflow-y-auto space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-proz-purple" />
                <span>Episodes ({episodeList.length})</span>
              </h3>
              <button onClick={() => setShowEpisodeDrawer(false)} className="text-xs text-zinc-400 hover:text-white">
                Close
              </button>
            </div>
            <div className="space-y-2">
              {episodeList.map((ep: any) => (
                <button
                  key={ep.id}
                  onClick={() => {
                    setShowEpisodeDrawer(false);
                    router.push(`/watch/${content.id}?episode=${ep.id}`);
                  }}
                  className={`w-full p-2 rounded-xl flex items-center gap-2.5 text-left transition-all ${
                    ep.id === (currentEpisode?.id || episodeId)
                      ? 'bg-proz-purple/20 border border-proz-purple/50 text-white'
                      : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  <div className="w-16 aspect-video rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                    <img
                      src={ep.thumbnailUrl || content.backdropUrl || '/brand/logo-main.svg'}
                      alt={ep.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="font-semibold text-white truncate">{ep.title}</p>
                    <span className="text-[10px] text-zinc-500">
                      Episode {ep.episodeNumber}
                      {ep.durationMinutes ? ` • ${ep.durationMinutes}m` : ''}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
