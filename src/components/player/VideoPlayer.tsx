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

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  content,
  episodeId,
}) => {
  const router = useRouter();
  const { getProgress, saveProgress } = useAuth();

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const shakaPlayerRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedProgressRef = useRef<number>(0);
  const triedProxyRef = useRef<boolean>(false);

  // Playback State — strict truthfulness: isPlaying ONLY becomes true on <video onPlaying>
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
  const [detectedResolution, setDetectedResolution] = useState<string | null>(null);

  // Real Track State
  const [qualityTracks, setQualityTracks] = useState<QualityTrackOption[]>([]);
  const [selectedQualityId, setSelectedQualityId] = useState<string>('auto');
  const [audioTracks, setAudioTracks] = useState<AudioTrackOption[]>([]);
  const [selectedAudioLang, setSelectedAudioLang] = useState<string>('default');
  const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrackOption[]>([]);
  const [selectedSubtitleId, setSelectedSubtitleId] = useState<string>('off');

  // Menus & Drawers
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [resumeBanner, setResumeBanner] = useState<string | null>(null);

  // Status & Errors
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCounter, setRetryCounter] = useState(0);

  // Genuine VR mode (ONLY enabled when item actually carries VR metadata)
  const isGenuineVr = Boolean(
    (content as any).isVr ||
      (content as any).vrProjection ||
      content.category?.toLowerCase().includes('vr')
  );
  const defaultVrMode: VrProjectionMode = isGenuineVr
    ? ((content as any).vrProjection || '180_sbs')
    : 'flat';
  const [vrMode, setVrMode] = useState<VrProjectionMode>(defaultVrMode);
  const [vrLook, setVrLook] = useState({ yaw: 0, pitch: 0 });
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);

  // Metadata-only item flag (e.g. StashDB entry with no linked media file)
  const isMetadataOnly = Boolean((content as any).isMetadataOnly);

  // Resolve current & next episode for series
  const { currentEpisode, nextEpisode, episodeList } = useMemo(() => {
    let cur: any = null;
    let nxt: any = null;
    let eps: any[] = [];
    if (content.seasons && content.seasons.length > 0) {
      for (const season of content.seasons) {
        const list = (season as any).episodes || [];
        if (list.length > eps.length) eps = list;
        const idx = list.findIndex((e: any) => e.id === episodeId);
        if (idx !== -1) {
          cur = list[idx];
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
    return { currentEpisode: cur, nextEpisode: nxt, episodeList: eps };
  }, [content.seasons, episodeId]);

  // Resolve video sources & strictly reject mismatched demo streams
  const sources: VideoSource[] = useMemo(
    () => content.videoSources || (content as any).video_sources || [],
    [content]
  );

  const directSource = useMemo(
    () =>
      sources.find(
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

  const candidateDirectUrl = useMemo(() => {
    if (isMetadataOnly) return undefined;
    const rawCandidates = [
      currentEpisode?.fallbackMp4,
      currentEpisode?.streamUrl,
      content.fallbackMp4,
      content.streamUrl,
      directSource?.playbackUrl,
    ];
    for (const raw of rawCandidates) {
      const normalized = normalizeMediaUrl(raw);
      if (normalized && isPlayableMediaUrl(normalized, content.title)) {
        return normalized;
      }
    }
    return undefined;
  }, [isMetadataOnly, currentEpisode, content, directSource]);

  // Official trailer YouTube ID
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
    if (candidateDirectUrl) return 'direct';
    if (ytId) return 'youtube';
    if (officialWatchSources.length > 0) return 'official_hub';
    return 'unavailable';
  });

  useEffect(() => {
    if (candidateDirectUrl) {
      setPlaybackMode('direct');
    } else if (ytId) {
      setPlaybackMode('youtube');
    } else if (officialWatchSources.length > 0) {
      setPlaybackMode('official_hub');
    } else {
      setPlaybackMode('unavailable');
    }
    setHasPlaybackError(false);
    setErrorMessage('');
    setIsPlaying(false);
    setIsBuffering(Boolean(candidateDirectUrl));
  }, [candidateDirectUrl, ytId, officialWatchSources.length, content.id, episodeId]);

  useEffect(() => {
    triedProxyRef.current = false;
  }, [candidateDirectUrl]);

  // PiP support & fullscreen sync listeners
  useEffect(() => {
    setIsPipSupported(
      typeof document !== 'undefined' && Boolean((document as any).pictureInPictureEnabled)
    );

    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
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

  // Optional DeviceOrientation gyroscope support for genuine VR videos
  useEffect(() => {
    if (!isGenuineVr || !gyroEnabled || vrMode === 'flat') return;
    const onOrientation = (ev: DeviceOrientationEvent) => {
      if (ev.gamma == null || ev.beta == null) return;
      const yaw = Math.max(-45, Math.min(45, (ev.gamma || 0) * 0.7));
      const pitch = Math.max(-25, Math.min(25, ((ev.beta || 45) - 45) * 0.5));
      setVrLook({ yaw, pitch });
    };
    window.addEventListener('deviceorientation', onOrientation);
    return () => window.removeEventListener('deviceorientation', onOrientation);
  }, [isGenuineVr, gyroEnabled, vrMode]);

  const syncTrackListsFromPlayers = useCallback(() => {
    const shaka = shakaPlayerRef.current;
    if (shaka) {
      try {
        const variants = shaka.getVariantTracks?.() || [];
        const uniqueHeights = new Map<number, QualityTrackOption>();
        variants.forEach((v: any) => {
          if (v.height && !uniqueHeights.has(v.height)) {
            uniqueHeights.set(v.height, {
              id: `h-${v.height}`,
              label: `${v.height}p`,
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
  }, []);

  // Initialize HTML5 / MPEG-TS / Shaka Player cleanly
  useEffect(() => {
    if (playbackMode !== 'direct' || !candidateDirectUrl) return;

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

      const protocol = classifyStreamProtocol(candidateDirectUrl);

      // 1. MPEG-TS (.ts) streams via mpegts.js
      if (protocol === 'mpegts') {
        try {
          const mpegtsModule = await import('mpegts.js');
          const mpegts: any = mpegtsModule.default || mpegtsModule;
          if (!isCancelled && videoRef.current && mpegts?.getFeatureList?.()?.mseLivePlayback) {
            const proxiedTsUrl = candidateDirectUrl.startsWith('http')
              ? `/api/library/stream-proxy?url=${encodeURIComponent(candidateDirectUrl)}`
              : candidateDirectUrl;
            const player = mpegts.createPlayer({
              type: 'mpegts',
              isLive: false,
              url: proxiedTsUrl,
            });
            mpegtsPlayer = player;
            player.on(mpegts.Events?.ERROR || 'error', (_type: any, detail: any) => {
              if (!isCancelled) {
                setIsBuffering(false);
                setIsPlaying(false);
                setHasPlaybackError(true);
                setErrorMessage(`MPEG-TS stream error: ${String(detail || 'Unable to decode stream')}`);
              }
            });
            player.attachMediaElement(videoRef.current);
            player.load();
            videoRef.current.play().catch(() => {
              if (!isCancelled) setIsBuffering(false);
            });
            return;
          }
        } catch (err: any) {
          console.warn('MPEG-TS initialization failed:', err?.message);
        }
      }

      // 2. Direct MP4 / WebM / Stash proxy byte-range stream
      if (protocol === 'mp4') {
        videoEl.src = candidateDirectUrl;
        videoEl.load();
        videoEl.play().catch(() => {
          if (!isCancelled) setIsBuffering(false);
        });
        return;
      }

      // 3. HLS (.m3u8) / DASH (.mpd) via Shaka Player
      try {
        const shakaModule = await import('shaka-player');
        const shaka: any = shakaModule.default || shakaModule;
        if (shaka.polyfill?.installAll) shaka.polyfill.installAll();

        if (!isCancelled && videoRef.current && shaka.Player?.isBrowserSupported?.()) {
          const player = new shaka.Player(videoRef.current);
          shakaInstance = player;
          shakaPlayerRef.current = player;

          player.configure({
            abr: { enabled: true, defaultBandwidthEstimate: 5000000 },
            streaming: { bufferingGoal: 25, rebufferingGoal: 2 },
          });

          player.addEventListener('error', (event: any) => {
            if (isCancelled) return;
            const code = event?.detail?.code;
            const fallback = currentEpisode?.fallbackMp4 || content.fallbackMp4;
            if (
              fallback &&
              fallback !== candidateDirectUrl &&
              isPlayableMediaUrl(fallback, content.title) &&
              videoRef.current
            ) {
              player.destroy().catch(() => {});
              shakaPlayerRef.current = null;
              videoRef.current.src = fallback;
              videoRef.current.load();
              videoRef.current.play().catch(() => setIsBuffering(false));
              return;
            }
            setIsPlaying(false);
            setIsBuffering(false);
            setHasPlaybackError(true);
            setErrorMessage(
              `Adaptive stream playback failed (Shaka code ${code || 'network/codec'}).`
            );
          });

          await player.load(candidateDirectUrl);
          if (!isCancelled) {
            syncTrackListsFromPlayers();
            videoRef.current?.play().catch(() => {
              if (!isCancelled) setIsBuffering(false);
            });
          }
        } else if (!isCancelled && videoRef.current) {
          // Safari native HLS or fallback
          if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            videoRef.current.src = candidateDirectUrl;
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
  }, [candidateDirectUrl, playbackMode, retryCounter, content.title, content.fallbackMp4, currentEpisode?.fallbackMp4, syncTrackListsFromPlayers]);

  // Restore saved watch progress
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

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSpeedMenu(false);
        setShowSubtitleMenu(false);
        setShowAudioMenu(false);
        setShowQualityMenu(false);
      }
    }, 3500);
  };

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid || hasPlaybackError) return;
    if (!vid.paused && !vid.ended) {
      vid.pause();
    } else {
      vid.play().catch((err) => {
        setIsBuffering(false);
        setIsPlaying(false);
        setErrorMessage(err?.message || 'Playback was blocked by browser autoplay policy.');
      });
    }
  };

  const seekDelta = (seconds: number) => {
    const vid = videoRef.current;
    if (!vid) return;
    const maxDur = duration || vid.duration || 0;
    const target = Math.max(0, Math.min(maxDur, vid.currentTime + seconds));
    vid.currentTime = target;
    setCurrentTime(target);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
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
    if (!shaka) return;
    if (option === 'auto') {
      shaka.configure({ abr: { enabled: true } });
      setSelectedQualityId('auto');
    } else if (option.shakaTrack) {
      shaka.configure({ abr: { enabled: false } });
      shaka.selectVariantTrack(option.shakaTrack, true);
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
      vid.textTracks[i].mode =
        option !== 'off' && option.trackIndex === i ? 'showing' : 'disabled';
    }
    setSelectedSubtitleId(option === 'off' ? 'off' : option.id);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  const vrTransformStyle = useMemo(() => {
    if (!isGenuineVr || vrMode === 'flat') return undefined;
    const scale = vrMode === '180_sbs' || vrMode === 'top_bottom' ? 1.35 : 1.18;
    return {
      transform: `perspective(900px) scale(${scale}) rotateY(${vrLook.yaw}deg) rotateX(${-vrLook.pitch}deg)`,
      transition: dragStartRef.current ? 'none' : 'transform 120ms ease-out',
    };
  }, [isGenuineVr, vrMode, vrLook]);

  const statusPillLabel =
    playbackMode === 'direct'
      ? isPlaying
        ? 'Direct Stream'
        : isBuffering
        ? 'Connecting'
        : 'Ready'
      : playbackMode === 'youtube'
      ? 'Official Trailer'
      : playbackMode === 'official_hub'
      ? 'Partner Info'
      : isMetadataOnly
      ? 'Metadata Only'
      : 'Unavailable';

  const resolutionLabel =
    detectedResolution ||
    (directSource?.quality ? directSource.quality : playbackMode === 'youtube' ? 'Trailer' : null);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full max-w-6xl mx-auto bg-black overflow-hidden shadow-2xl border border-zinc-800/80 flex flex-col select-none ${
        isFullscreen ? 'h-screen max-w-none rounded-none border-0' : 'md:rounded-2xl'
      }`}
    >
      {/* ─── Clean Non-Overlapping Header Bar (Docked above viewport, overlaid ONLY in fullscreen) ─── */}
      <div
        className={
          isFullscreen
            ? `absolute top-0 left-0 right-0 z-30 pt-[max(0.75rem,env(safe-area-inset-top))] px-4 pb-6 bg-gradient-to-b from-black/90 via-black/45 to-transparent flex items-center justify-between gap-3 transition-opacity duration-300 ${
                showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`
            : 'shrink-0 bg-[#080B12]/98 border-b border-white/10 px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2.5 z-20'
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
              <h1 className="text-xs sm:text-sm font-bold text-white truncate">
                {content.title}
                {currentEpisode ? ` • E${currentEpisode.episodeNumber}` : ''}
              </h1>
              <span className="inline-flex shrink-0 px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-semibold">
                {statusPillLabel}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate mt-0.5">
              {[
                resolutionLabel,
                content.category ? content.category.toUpperCase() : 'MEDIA',
                content.releaseYear,
              ]
                .filter(Boolean)
                .join(' • ')}
            </p>
          </div>
        </div>

        {/* Right Header Controls (No duplicate/stacked pills) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isGenuineVr && playbackMode === 'direct' && (
            <button
              onClick={() => {
                const order: VrProjectionMode[] = ['flat', '180_sbs', '360_interactive', 'top_bottom'];
                const next = order[(order.indexOf(vrMode) + 1) % order.length];
                setVrMode(next);
                setVrLook({ yaw: 0, pitch: 0 });
              }}
              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 transition-all ${
                vrMode !== 'flat'
                  ? 'bg-purple-600/30 text-purple-200 border-purple-400/50'
                  : 'bg-white/5 text-zinc-300 border-white/10 hover:text-white'
              }`}
              title="Switch VR Projection Mode"
            >
              <Glasses className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {vrMode === 'flat' ? 'VR: Flat' : vrMode === '180_sbs' ? '180° SBS' : vrMode === 'top_bottom' ? 'TB 3D' : '360° VR'}
              </span>
            </button>
          )}

          {candidateDirectUrl && (
            <button
              onClick={() => {
                setHasPlaybackError(false);
                setPlaybackMode('direct');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold border transition-all ${
                playbackMode === 'direct'
                  ? 'bg-rose-600 text-white border-rose-500'
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
                  ? 'bg-rose-600 text-white border-rose-500'
                  : 'bg-white/5 text-zinc-300 border-white/10 hover:text-white'
              }`}
            >
              Trailer
            </button>
          )}

          {officialWatchSources.length > 0 && (
            <button
              onClick={() => setPlaybackMode('official_hub')}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold border transition-all ${
                playbackMode === 'official_hub'
                  ? 'bg-cyan-600 text-white border-cyan-500'
                  : 'bg-white/5 text-zinc-300 border-white/10 hover:text-white'
              }`}
            >
              Providers
            </button>
          )}
        </div>
      </div>

      {/* ─── Video Stage Container ─── */}
      <div
        className={`relative w-full ${isFullscreen ? 'flex-1' : 'aspect-video'} bg-black overflow-hidden`}
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
              yaw: Math.max(-55, Math.min(55, dragStartRef.current.yaw + dx * 0.15)),
              pitch: Math.max(-35, Math.min(35, dragStartRef.current.pitch + dy * 0.15)),
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
        {/* ─── Mode 1: Direct Video Player (HTML5 / Shaka / mpegts.js) ─── */}
        {playbackMode === 'direct' && !hasPlaybackError && (
          <>
            <video
              ref={videoRef}
              playsInline
              crossOrigin="anonymous"
              style={vrTransformStyle}
              className="w-full h-full object-contain cursor-pointer"
              onClick={togglePlay}
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
                if (videoRef.current && (!duration || isNaN(duration))) {
                  const dur = videoRef.current.duration;
                  if (!isNaN(dur) && dur > 0) setDuration(dur);
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
                if (videoRef.current && !isNaN(videoRef.current.duration)) {
                  setDuration(videoRef.current.duration);
                }
              }}
              onProgress={() => {
                if (videoRef.current && videoRef.current.buffered.length > 0) {
                  setBufferedTime(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
                }
              }}
              onWaiting={() => setIsBuffering(true)}
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
                if (!triedProxyRef.current && candidateDirectUrl?.startsWith('http') && videoRef.current) {
                  triedProxyRef.current = true;
                  videoRef.current.src = `/api/library/stream-proxy?url=${encodeURIComponent(
                    candidateDirectUrl
                  )}`;
                  videoRef.current.load();
                  videoRef.current.play().catch(() => setIsBuffering(false));
                  return;
                }
                setIsPlaying(false);
                setIsBuffering(false);
                setHasPlaybackError(true);
                setErrorMessage(
                  'Direct stream could not be decoded or returned an HTTP/network error.'
                );
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

            {/* VR Mode HUD Hint */}
            {isGenuineVr && vrMode !== 'flat' && (
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-purple-950/85 border border-purple-500/40 text-[10px] font-bold text-purple-200">
                  Drag video to pan • {vrMode === '180_sbs' ? '180° SBS' : vrMode === 'top_bottom' ? 'Top/Bottom 3D' : '360° VR'}
                </span>
                <button
                  onClick={() => setGyroEnabled((g) => !g)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold border flex items-center gap-1 ${
                    gyroEnabled
                      ? 'bg-cyan-600/80 text-white border-cyan-400'
                      : 'bg-black/70 text-zinc-300 border-white/15'
                  }`}
                >
                  <Compass className="w-3 h-3" />
                  <span>{gyroEnabled ? 'Gyro On' : 'Gyro Off'}</span>
                </button>
              </div>
            )}

            {/* Resume Toast */}
            {resumeBanner && (
              <div className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-lg bg-black/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold">
                {resumeBanner}
              </div>
            )}

            {/* Buffering Spinner */}
            {isBuffering && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 pointer-events-none z-20">
                <div className="w-11 h-11 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-zinc-200 font-medium mt-3">Loading video stream...</p>
              </div>
            )}

            {/* Center Play Button (shown when paused & not buffering) */}
            {!isPlaying && !isBuffering && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/25 cursor-pointer z-10 transition-opacity hover:bg-black/15"
              >
                <div className="w-16 h-16 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-[0_0_28px_rgba(225,29,72,0.55)] hover:scale-105 transition-transform">
                  <Play className="w-8 h-8 fill-white ml-1" />
                </div>
              </div>
            )}

            {/* Skip Intro Floating Button */}
            {isPlaying && currentTime > 5 && currentTime < 90 && (
              <button
                onClick={() => seekDelta(85 - currentTime)}
                className="absolute bottom-20 left-4 z-20 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold hover:bg-rose-600 transition-all flex items-center gap-1.5 shadow-xl"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Skip Intro</span>
              </button>
            )}

            {/* Bottom Controls Bar */}
            <div
              className={`absolute bottom-0 left-0 right-0 px-3 sm:px-4 pt-8 pb-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent space-y-2 z-30 transition-opacity duration-300 ${
                showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Seek Slider */}
              <div className="relative flex items-center">
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-white/25 rounded-full pointer-events-none"
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
                {/* Left Transport Controls */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition-colors shrink-0"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 fill-white" />
                    ) : (
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() => seekDelta(-10)}
                    className="p-1.5 text-zinc-300 hover:text-white transition-colors"
                    title="Rewind 10s"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => seekDelta(10)}
                    className="p-1.5 text-zinc-300 hover:text-white transition-colors"
                    title="Forward 10s"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  {nextEpisode && (
                    <button
                      onClick={() => router.push(`/watch/${content.id}?episode=${nextEpisode.id}`)}
                      className="p-1.5 text-zinc-300 hover:text-white transition-colors"
                      title="Next Episode"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button onClick={toggleMute} className="text-zinc-300 hover:text-white" title="Mute">
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
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
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Right Track & View Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Speed */}
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
                        {speedOptions.map((speed) => (
                          <button
                            key={speed}
                            onClick={() => handleSpeedChange(speed)}
                            className={`w-full text-left px-2 py-1 rounded text-xs font-semibold ${
                              playbackSpeed === speed
                                ? 'bg-rose-600 text-white'
                                : 'text-zinc-300 hover:bg-zinc-800'
                            }`}
                          >
                            {speed === 1.0 ? 'Normal' : `${speed}x`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Audio Tracks */}
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
                                selectedAudioLang === a.language
                                  ? 'bg-rose-600 text-white'
                                  : 'text-zinc-300 hover:bg-zinc-800'
                              }`}
                            >
                              <span>{a.label}</span>
                              {selectedAudioLang === a.language && <Check className="w-3 h-3" />}
                            </button>
                          ))
                        ) : (
                          <p className="text-[11px] text-zinc-400 px-1 py-1">
                            Default stream audio (single track)
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Subtitles */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowSubtitleMenu(!showSubtitleMenu);
                        setShowSpeedMenu(false);
                        setShowAudioMenu(false);
                        setShowQualityMenu(false);
                      }}
                      className={`p-1.5 rounded transition-colors ${
                        selectedSubtitleId !== 'off'
                          ? 'text-rose-400 bg-rose-950/40'
                          : 'text-zinc-300 hover:text-white'
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
                            selectedSubtitleId === 'off'
                              ? 'bg-rose-600 text-white'
                              : 'text-zinc-300 hover:bg-zinc-800'
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
                                selectedSubtitleId === sub.id
                                  ? 'bg-rose-600 text-white'
                                  : 'text-zinc-300 hover:bg-zinc-800'
                              }`}
                            >
                              <span>{sub.label}</span>
                              {selectedSubtitleId === sub.id && <Check className="w-3 h-3" />}
                            </button>
                          ))
                        ) : (
                          <p className="text-[11px] text-zinc-400 px-1 py-1">
                            No embedded subtitle tracks in this stream
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quality Settings */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowQualityMenu(!showQualityMenu);
                        setShowSpeedMenu(false);
                        setShowSubtitleMenu(false);
                        setShowAudioMenu(false);
                      }}
                      className="p-1.5 text-zinc-300 hover:text-white"
                      title="Quality"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    {showQualityMenu && (
                      <div className="absolute bottom-9 right-0 bg-zinc-900 border border-zinc-700 rounded-xl p-2 w-40 space-y-1 shadow-2xl z-50">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase px-1">Quality</p>
                        <button
                          onClick={() => selectQualityTrack('auto')}
                          className={`w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between ${
                            selectedQualityId === 'auto'
                              ? 'bg-rose-600 text-white'
                              : 'text-zinc-300 hover:bg-zinc-800'
                          }`}
                        >
                          <span>Auto ({detectedResolution || 'ABR'})</span>
                          {selectedQualityId === 'auto' && <Check className="w-3 h-3" />}
                        </button>
                        {qualityTracks.map((q) => (
                          <button
                            key={q.id}
                            onClick={() => selectQualityTrack(q)}
                            className={`w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between ${
                              selectedQualityId === q.id
                                ? 'bg-rose-600 text-white'
                                : 'text-zinc-300 hover:bg-zinc-800'
                            }`}
                          >
                            <span>{q.label}</span>
                            {selectedQualityId === q.id && <Check className="w-3 h-3" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Episodes */}
                  {episodeList.length > 1 && (
                    <button
                      onClick={() => setShowEpisodeDrawer(!showEpisodeDrawer)}
                      className="px-2 py-1 rounded bg-zinc-800/90 text-zinc-200 hover:text-white text-[11px] font-semibold"
                    >
                      Episodes
                    </button>
                  )}

                  {/* Picture-in-Picture */}
                  {isPipSupported && (
                    <button
                      onClick={togglePictureInPicture}
                      className={`p-1.5 rounded transition-colors ${
                        isPipActive ? 'text-cyan-400 bg-cyan-950/50' : 'text-zinc-300 hover:text-white'
                      }`}
                      title="Picture-in-Picture"
                    >
                      <PictureInPicture2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Fullscreen */}
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

        {/* ─── Mode 2: Embedded Official Preview Player (In-App, Zero External Redirect) ─── */}
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

        {/* ─── Mode 3 / Error / Metadata-Only State ─── */}
        {(playbackMode === 'official_hub' ||
          playbackMode === 'unavailable' ||
          hasPlaybackError) && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#0E1320] via-[#080B12] to-black flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto text-center z-20">
            <div className="max-w-md w-full space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
                {hasPlaybackError ? (
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                ) : isMetadataOnly ? (
                  <Info className="w-6 h-6 text-purple-400" />
                ) : (
                  <Sparkles className="w-6 h-6" />
                )}
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-black text-white">{content.title}</h2>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  {hasPlaybackError
                    ? errorMessage || 'Stream playback failed.'
                    : isMetadataOnly
                    ? 'This StashDB entry contains verified metadata only and is not linked to a playable file on your Stash media server.'
                    : 'No direct stream is hosted for this commercial title inside PROZ. Review licensed streaming availability below or watch the official trailer.'}
                </p>
              </div>

              {hasPlaybackError && candidateDirectUrl && (
                <button
                  onClick={() => {
                    triedProxyRef.current = false;
                    setHasPlaybackError(false);
                    setRetryCounter((c) => c + 1);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
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
                          <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
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
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline"
                  >
                    Play Official Trailer Inside PROZ Player
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Series Episode Drawer */}
        {showEpisodeDrawer && episodeList.length > 0 && (
          <div className="absolute top-0 right-0 bottom-0 w-72 sm:w-80 bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-800 p-4 z-40 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-rose-500" />
                <span>Episodes ({episodeList.length})</span>
              </h3>
              <button
                onClick={() => setShowEpisodeDrawer(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
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
                      ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                      : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  <div className="w-16 aspect-video rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                    <img
                      src={ep.thumbnailUrl || content.backdropUrl || '/brand/logo-main.svg'}
                      alt={ep.title}
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
