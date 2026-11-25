"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
  Cast,
  FastForward,
  Radio
} from 'lucide-react';
import { ContentItem } from '@/types/content';
import { VideoSource } from '@/types/provider';
import { useAuth } from '@/context/AuthContext';

interface VideoPlayerProps {
  content: ContentItem;
  episodeId?: string;
  sessionToken?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  content,
  episodeId,
}) => {
  const router = useRouter();
  const { getProgress, saveProgress } = useAuth();

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Video State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState('1080p (Super)');
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('off');
  const [showControls, setShowControls] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showCastModal, setShowCastModal] = useState(false);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Mode: 'direct' | 'youtube' | 'official_hub'
  const [playbackMode, setPlaybackMode] = useState<'direct' | 'youtube' | 'official_hub'>('direct');

  // Resolve current episode if series
  let currentEpisode: any = null;
  let nextEpisode: any = null;

  if (content.type === 'series' && content.seasons) {
    for (const season of content.seasons) {
      const episodes = (season as any).episodes || [];
      const idx = episodes.findIndex((e: any) => e.id === episodeId);
      if (idx !== -1) {
        currentEpisode = episodes[idx];
        nextEpisode = episodes[idx + 1] || null;
        break;
      }
    }
    if (!currentEpisode && (content.seasons[0] as any)?.episodes?.[0]) {
      currentEpisode = (content.seasons[0] as any).episodes[0];
      nextEpisode = (content.seasons[0] as any).episodes[1] || null;
    }
  }

  // Resolve sources
  const sources: VideoSource[] = content.videoSources || (content as any).video_sources || [];
  const directSource = sources.find(s => s.sourceType === 'direct_hls' || s.sourceType === 'direct_dash' || s.sourceType === 'html5_mp4');
  const youtubeSource = sources.find(s => s.sourceType === 'youtube_embed');
  const officialWatchSources = sources.filter(s => s.sourceType === 'official_web' || s.sourceType === 'app_deep_link');

  // Normalize & classify stream URLs cleanly
  const rawActiveStream =
    currentEpisode?.fallbackMp4 ||
    content.fallbackMp4 ||
    currentEpisode?.streamUrl ||
    content.streamUrl ||
    directSource?.playbackUrl;

  const normalizeStreamUrl = (url?: string): string | undefined => {
    if (!url) return undefined;
    const trimmed = url.trim();
    if (!trimmed) return undefined;
    if (trimmed.startsWith('/')) return trimmed;
    try {
      return new URL(trimmed).href;
    } catch {
      return encodeURI(trimmed);
    }
  };

  const activeStream = normalizeStreamUrl(rawActiveStream);

  const isSampleDemoStream = (url?: string): boolean => {
    if (!url) return false;
    return (
      url.includes('unified-streaming.com/k8s/features/stable/video/tears-of-steel') ||
      url.includes('test-streams.mux.dev/x36xhzz') ||
      url.includes('archive.org/download/BigBuckBunny_124')
    );
  };

  const isPlayableDirectUrl = (url?: string): boolean => {
    if (!url) return false;
    const pathPart = url.split('?')[0].toLowerCase();
    return (
      pathPart.endsWith('.mp4') ||
      pathPart.endsWith('.ts') ||
      pathPart.endsWith('.webm') ||
      pathPart.endsWith('.mov') ||
      pathPart.endsWith('.m4v') ||
      url.toLowerCase().includes('.m3u8') ||
      url.toLowerCase().includes('.mpd') ||
      url.startsWith('/api/library/stash/proxy-stream') ||
      url.startsWith('/api/library/stream-proxy')
    );
  };

  // YouTube ID fallback
  let ytId = (content as any).youtubeId || (content as any).youtube_id;
  if (!ytId && content.trailerUrl) {
    const m = content.trailerUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (m) ytId = m[1];
  }

  // Determine initial playback mode:
  // Avoid playing the same sample demo loop across every movie/anime when a title has its own unique official YouTube trailer.
  useEffect(() => {
    if (
      activeStream &&
      isPlayableDirectUrl(activeStream) &&
      (!ytId || !isSampleDemoStream(activeStream))
    ) {
      setPlaybackMode('direct');
    } else if (ytId) {
      setPlaybackMode('youtube');
    } else if (activeStream && isPlayableDirectUrl(activeStream)) {
      setPlaybackMode('direct');
    } else {
      setPlaybackMode('official_hub');
    }
  }, [activeStream, ytId]);

  const triedProxyRef = useRef(false);
  useEffect(() => {
    triedProxyRef.current = false;
  }, [activeStream]);

  // Initialize HTML5 / MPEG-TS (.ts) / Shaka Player
  useEffect(() => {
    if (playbackMode !== 'direct' || !activeStream) return;

    let shakaInstance: any = null;
    let mpegtsPlayer: any = null;
    let isCancelled = false;

    const initPlayer = async () => {
      setHasPlaybackError(false);
      setIsBuffering(true);

      if (!videoRef.current) return;

      const lowerPath = activeStream.split('?')[0].toLowerCase();
      const isTsStream = lowerPath.endsWith('.ts');
      const isAdaptive = activeStream.toLowerCase().includes('.m3u8') || activeStream.toLowerCase().includes('.mpd');

      // MPEG-TS (.ts) live/VOD CDN channel streams via mpegts.js
      if (isTsStream) {
        try {
          const mpegtsModule = await import('mpegts.js');
          const mpegts: any = mpegtsModule.default || mpegtsModule;
          if (!isCancelled && videoRef.current && mpegts?.getFeatureList?.()?.mseLivePlayback) {
            const proxiedTsUrl = activeStream.startsWith('http')
              ? `/api/library/stream-proxy?url=${encodeURIComponent(activeStream)}`
              : activeStream;
            const player = mpegts.createPlayer({
              type: 'mpegts',
              isLive: false,
              url: proxiedTsUrl,
            });
            mpegtsPlayer = player;
            player.attachMediaElement(videoRef.current);
            player.load();
            videoRef.current.play().then(() => {
              setIsPlaying(true);
              setIsBuffering(false);
            }).catch(() => setIsBuffering(false));
            return;
          }
        } catch (err) {
          console.warn('mpegts.js initialization failed, falling back to proxied native:', err);
        }
      }

      // Direct MP4 / WebM / Proxy stream
      if (!isAdaptive) {
        videoRef.current.src = activeStream;
        videoRef.current.load();
        videoRef.current.play().then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
        }).catch(() => {
          setIsBuffering(false);
        });
        return;
      }

      // HLS / DASH via Shaka Player
      try {
        const shakaModule = await import('shaka-player');
        const shaka: any = shakaModule.default || shakaModule;

        if (shaka.polyfill?.installAll) {
          shaka.polyfill.installAll();
        }

        if (!isCancelled && videoRef.current && shaka.Player?.isBrowserSupported && shaka.Player.isBrowserSupported()) {
          const player = new shaka.Player(videoRef.current);
          shakaInstance = player;

          player.configure({
            abr: { enabled: true, defaultBandwidthEstimate: 5000000 },
            streaming: { bufferingGoal: 30, rebufferingGoal: 2 },
            drm: {
              servers: {
                'com.widevine.alpha': 'https://cwip-shaka-drm.appspot.com/no_auth',
              },
              clearKeys: {
                'nrQFDeRLSAKTLAvxUFRUiA': 'K8D899RhTJL6zpdMGHeTurnA'
              }
            }
          });

          player.addEventListener('error', async (event: any) => {
            console.warn('Shaka playback error, trying direct fallback:', event.detail);
            const fallback = currentEpisode?.fallbackMp4 || content.fallbackMp4;
            if (fallback && fallback !== activeStream && videoRef.current) {
              try {
                await player.destroy();
                if (videoRef.current) {
                  videoRef.current.src = fallback;
                  videoRef.current.load();
                  videoRef.current.play().then(() => {
                    setIsPlaying(true);
                    setIsBuffering(false);
                  }).catch(() => setIsBuffering(false));
                  return;
                }
              } catch {
                // fall through
              }
            }
            setHasPlaybackError(true);
            setErrorMessage('Stream playback error. You can stream directly via official provider below.');
            setIsBuffering(false);
          });

          await player.load(activeStream);
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              setIsPlaying(true);
              setIsBuffering(false);
            }).catch(() => {
              setIsBuffering(false);
            });
          }
        } else if (videoRef.current) {
          videoRef.current.src = activeStream;
          videoRef.current.load();
          videoRef.current.play().then(() => {
            setIsPlaying(true);
            setIsBuffering(false);
          }).catch(() => setIsBuffering(false));
        }
      } catch (err: any) {
        console.warn('Player initialization falling back to native HTML5:', err);
        if (videoRef.current) {
          videoRef.current.src = activeStream;
          videoRef.current.load();
          videoRef.current.play().then(() => {
            setIsPlaying(true);
            setIsBuffering(false);
          }).catch(() => setIsBuffering(false));
        } else {
          setHasPlaybackError(true);
          setErrorMessage(err.message || 'Unable to play stream.');
          setIsBuffering(false);
        }
      }
    };

    initPlayer();

    return () => {
      isCancelled = true;
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
  }, [activeStream, playbackMode]);

  // Resume saved progress
  useEffect(() => {
    const savedTime = getProgress(content.id, currentEpisode?.id);
    if (savedTime > 5 && videoRef.current) {
      videoRef.current.currentTime = savedTime;
      setCurrentTime(savedTime);
    }
  }, [content.id, currentEpisode?.id]);

  // Controls auto-hide
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSettingsMenu(false);
        setShowSpeedMenu(false);
        setShowSubtitleMenu(false);
        setShowQualityMenu(false);
      }
    }, 4000);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const seekDelta = (seconds: number) => {
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = target;
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

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
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

  const speedOptions = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const qualityOptions = ['Auto', '1080p (Super)', '720p (High)', '480p (Standard)'];
  const subtitleOptions = [
    { label: 'Off', value: 'off' },
    { label: 'English [CC]', value: 'en' },
    { label: 'Hindi', value: 'hi' },
    { label: 'Bengali', value: 'bn' },
    { label: 'Spanish', value: 'es' }
  ];

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl group select-none border border-zinc-800"
    >
      {/* ─── Mode 1: Direct Player (HTML5 / Shaka) ─── */}
      {playbackMode === 'direct' && !hasPlaybackError && (
        <>
          <video
            ref={videoRef}
            playsInline
            autoPlay
            className="w-full h-full object-contain cursor-pointer"
            onClick={togglePlay}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                const dur = videoRef.current.duration;
                if (!isNaN(dur) && dur > 0) setDuration(dur);
              }
            }}
            onCanPlay={() => {
              setIsBuffering(false);
              if (videoRef.current && (!duration || isNaN(duration))) {
                const dur = videoRef.current.duration;
                if (!isNaN(dur) && dur > 0) setDuration(dur);
              }
            }}
            onTimeUpdate={() => {
              if (videoRef.current) {
                const cur = videoRef.current.currentTime;
                setCurrentTime(cur);
                saveProgress(content.id, cur, currentEpisode?.id);
                if ((!duration || isNaN(duration)) && videoRef.current.duration) {
                  setDuration(videoRef.current.duration);
                }
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
            onPause={() => setIsPlaying(false)}
            onError={() => {
              if (!triedProxyRef.current && activeStream && activeStream.startsWith('http') && videoRef.current) {
                triedProxyRef.current = true;
                videoRef.current.src = `/api/library/stream-proxy?url=${encodeURIComponent(activeStream)}`;
                videoRef.current.load();
                videoRef.current.play().catch(() => setIsBuffering(false));
                return;
              }
              setHasPlaybackError(true);
              setErrorMessage('Stream error on direct playback. Switching to backup provider.');
              setIsBuffering(false);
            }}
          />

          {/* Buffering Indicator */}
          {isBuffering && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 pointer-events-none z-20">
              <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-zinc-300 font-medium mt-3">Buffering stream...</p>
            </div>
          )}

          {/* Big Center Play Overlay (when paused and not buffering) */}
          {!isPlaying && !isBuffering && (
            <div 
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer z-10 transition-opacity hover:bg-black/20"
            >
              <div className="w-16 h-16 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-[0_0_30px_rgba(225,29,72,0.6)] transform hover:scale-110 transition-all">
                <Play className="w-8 h-8 fill-white ml-1" />
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── Mode 2: Official YouTube IFrame Player ─── */}
      {playbackMode === 'youtube' && ytId && !hasPlaybackError && (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&controls=1&modestbranding=1&rel=0`}
          title={content.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        />
      )}

      {/* ─── Mode 3 / Fallback: Official Provider Streaming Hub ─── */}
      {(playbackMode === 'official_hub' || hasPlaybackError) && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#13070A] via-[#0C0E14] to-black flex flex-col items-center justify-center p-6 text-center z-20">
          <div className="max-w-md w-full space-y-4">
            
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
                Official Multi-Provider Hub
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white mt-2">
                Watch {content.title}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {hasPlaybackError 
                  ? 'Direct stream is currently restricted in your region. Stream through verified official providers below.' 
                  : 'This title is available via official provider integrations. Select your preferred service to stream.'}
              </p>
            </div>

            {/* Provider List */}
            <div className="space-y-2 pt-2">
              {officialWatchSources.length > 0 ? (
                officialWatchSources.map((source) => (
                  <div 
                    key={source.id}
                    className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-rose-500/50 flex items-center justify-between gap-3 text-left transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-rose-400" />
                        {source.providerName}
                      </p>
                      <span className="text-[10px] text-zinc-400 block mt-0.5 capitalize">
                        {source.pricingType === 'subscription' ? 'Included with Subscription' : source.pricingType === 'free' ? 'Free to Stream' : `${source.pricingType} (${source.price || 'Standard'})`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {source.appDeepLink?.android && (
                        <a
                          href={source.appDeepLink.android}
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                          title="Open Mobile App"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <a
                        href={source.officialWatchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-all"
                      >
                        <span>Watch Now</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-left">
                  <div>
                    <p className="text-xs font-bold text-white">TMDB Streaming Discovery</p>
                    <span className="text-[10px] text-zinc-400">Locate theatrical and OTT availability</span>
                  </div>
                  <a
                    href={content.tmdb_id
                      ? `https://www.themoviedb.org/${content.type === 'series' ? 'tv' : 'movie'}/${content.tmdb_id}/watch`
                      : `https://www.themoviedb.org/search?query=${encodeURIComponent(content.title || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold"
                  >
                    <span>Check Watch</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Quick Mode Toggle */}
            {ytId && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    setHasPlaybackError(false);
                    setPlaybackMode('youtube');
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline"
                >
                  Switch to Official YouTube Embed
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ─── Top Overlay Header ─── */}
      <div 
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between z-30 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-zinc-300 hover:text-white transition-colors"
          title="Go Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="text-center px-4">
          <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
            {content.title} {currentEpisode ? `• E${currentEpisode.episodeNumber}` : ''}
          </h1>
          <span className="text-[10px] text-zinc-400 block truncate">
            {content.releaseYear || 2024} • {content.category?.toUpperCase() || 'ENTERTAINMENT'}
          </span>
        </div>

        {/* Source Mode Switcher & Screencast */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowCastModal(true)}
            className="p-1.5 rounded-lg bg-black/40 text-zinc-300 hover:text-white border border-white/10"
            title="Screencast / DLNA"
          >
            <Cast className="w-4 h-4" />
          </button>

          {activeStream && (
            <button
              onClick={() => {
                setHasPlaybackError(false);
                setPlaybackMode('direct');
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                playbackMode === 'direct'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                  : 'bg-black/40 text-zinc-400 border-white/10 hover:text-white'
              }`}
            >
              Direct Stream
            </button>
          )}

          {ytId && (
            <button
              onClick={() => {
                setHasPlaybackError(false);
                setPlaybackMode('youtube');
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                playbackMode === 'youtube'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                  : 'bg-black/40 text-zinc-400 border-white/10 hover:text-white'
              }`}
            >
              YouTube
            </button>
          )}

          <button
            onClick={() => setPlaybackMode('official_hub')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
              playbackMode === 'official_hub'
                ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                : 'bg-black/40 text-zinc-400 border-white/10 hover:text-white'
            }`}
          >
            Providers Hub
          </button>
        </div>
      </div>

      {/* Skip Intro Floating Button */}
      {playbackMode === 'direct' && isPlaying && currentTime > 5 && currentTime < 90 && (
        <button
          onClick={() => seekDelta(85 - currentTime)}
          className="absolute bottom-20 left-4 z-40 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold hover:bg-rose-600 transition-all flex items-center gap-1.5 shadow-xl"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>Skip Intro</span>
        </button>
      )}

      {/* ─── Bottom Controls Bar (Direct Playback Mode) ─── */}
      {playbackMode === 'direct' && !hasPlaybackError && (
        <div 
          className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent space-y-2 z-30 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Progress Bar */}
          <div className="relative group/progress">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-zinc-700/60 rounded-full appearance-none cursor-pointer accent-rose-500 hover:h-2 transition-all"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-200">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>

              <button
                onClick={() => seekDelta(-10)}
                className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                title="Rewind 10s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => seekDelta(10)}
                className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                title="Forward 10s"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {nextEpisode && (
                <button
                  onClick={() => router.push(`/watch/${content.id}?episode=${nextEpisode.id}`)}
                  className="p-1.5 text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                  title="Next Episode"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              )}

              {/* Volume */}
              <div className="flex items-center gap-2 group/vol">
                <button onClick={toggleMute} className="text-zinc-400 hover:text-white">
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

              <span className="text-[11px] text-zinc-400 font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right Controls (Speed, Subtitles, Quality, Episodes, Fullscreen) */}
            <div className="flex items-center gap-2">
              {/* Playback Speed (Cinema HD exact speeds) */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSpeedMenu(!showSpeedMenu);
                    setShowSubtitleMenu(false);
                    setShowQualityMenu(false);
                  }}
                  className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 hover:text-white text-[11px] font-bold"
                  title="Playback Speed"
                >
                  {playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`}
                </button>

                {showSpeedMenu && (
                  <div className="absolute bottom-8 right-0 bg-zinc-900 border border-zinc-700 rounded-xl p-1.5 w-24 space-y-1 shadow-2xl z-50">
                    {speedOptions.map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`w-full text-left px-2 py-1 rounded text-xs font-semibold ${
                          playbackSpeed === speed ? 'bg-rose-600 text-white' : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        {speed === 1.0 ? 'Normal' : `${speed}x`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Subtitles Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSubtitleMenu(!showSubtitleMenu);
                    setShowSpeedMenu(false);
                    setShowQualityMenu(false);
                  }}
                  className={`p-1.5 rounded transition-colors ${
                    selectedSubtitle !== 'off' ? 'text-rose-400 bg-rose-950/40' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Subtitles"
                >
                  <Subtitles className="w-4 h-4" />
                </button>

                {showSubtitleMenu && (
                  <div className="absolute bottom-8 right-0 bg-zinc-900 border border-zinc-700 rounded-xl p-1.5 w-32 space-y-1 shadow-2xl z-50">
                    <p className="text-[10px] text-zinc-500 font-bold px-2 py-0.5 uppercase">Subtitles</p>
                    {subtitleOptions.map((sub) => (
                      <button
                        key={sub.value}
                        onClick={() => {
                          setSelectedSubtitle(sub.value);
                          setShowSubtitleMenu(false);
                        }}
                        className={`w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between ${
                          selectedSubtitle === sub.value ? 'bg-rose-600 text-white' : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <span>{sub.label}</span>
                        {selectedSubtitle === sub.value && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quality Menu (Cinema HD Super / High / Standard) */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowQualityMenu(!showQualityMenu);
                    setShowSpeedMenu(false);
                    setShowSubtitleMenu(false);
                  }}
                  className="p-1.5 text-zinc-400 hover:text-white"
                  title="Quality Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {showQualityMenu && (
                  <div className="absolute bottom-8 right-0 bg-zinc-900 border border-zinc-700 rounded-xl p-1.5 w-36 space-y-1 shadow-2xl z-50">
                    <p className="text-[10px] text-zinc-500 font-bold px-2 py-0.5 uppercase">Video Quality</p>
                    {qualityOptions.map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          setSelectedQuality(q);
                          setShowQualityMenu(false);
                        }}
                        className={`w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between ${
                          selectedQuality === q ? 'bg-rose-600 text-white' : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <span>{q}</span>
                        {selectedQuality === q && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Episodes Drawer toggle if series */}
              {content.type === 'series' && content.seasons && (
                <button
                  onClick={() => setShowEpisodeDrawer(!showEpisodeDrawer)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-[11px] font-semibold"
                >
                  Episodes
                </button>
              )}

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 text-zinc-400 hover:text-white transition-colors"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Series Episode Drawer */}
      {showEpisodeDrawer && content.type === 'series' && content.seasons && (
        <div className="absolute top-0 right-0 bottom-0 w-80 bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-800 p-4 z-40 overflow-y-auto space-y-3 animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-rose-500" />
              <span>Episodes</span>
            </h3>
            <button
              onClick={() => setShowEpisodeDrawer(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="space-y-2">
            {((content.seasons[0] as any)?.episodes || []).map((ep: any) => (
              <div
                key={ep.id}
                onClick={() => {
                  setShowEpisodeDrawer(false);
                  router.push(`/watch/${content.id}?episode=${ep.id}`);
                }}
                className={`p-2 rounded-xl flex items-center gap-2.5 cursor-pointer transition-all ${
                  ep.id === (currentEpisode?.id || episodeId)
                    ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
                    : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                <div className="w-16 aspect-video rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                  <img
                    src={ep.thumbnailUrl || content.backdropUrl}
                    alt={ep.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <p className="font-semibold text-white truncate">{ep.title}</p>
                  <span className="text-[10px] text-zinc-500">{ep.durationMinutes || 24} mins</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Screencast / DLNA Modal Dialog (Matching Cinema HD Cast prompt) */}
      {showCastModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Cast className="w-4 h-4 text-rose-500" />
                <span>Cast to Device (DLNA)</span>
              </div>
              <button 
                onClick={() => setShowCastModal(false)}
                className="text-zinc-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Please make sure your phone and TV are connected to the same Wi-Fi network.
            </p>

            <div className="space-y-2 py-2">
              <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-between hover:border-rose-500 cursor-pointer transition-all">
                <div className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold text-white">Living Room Smart TV</p>
                    <span className="text-[10px] text-zinc-400">Android TV / DLNA Ready</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-600/20 text-rose-400 border border-rose-500/30">
                  Connect
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-between hover:border-rose-500 cursor-pointer transition-all">
                <div className="flex items-center gap-2.5">
                  <Cast className="w-4 h-4 text-cyan-400" />
                  <div>
                    <p className="text-xs font-bold text-white">Bedroom Chromecast Ultra</p>
                    <span className="text-[10px] text-zinc-400">Google Cast Ready</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                  Connect
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowCastModal(false)}
              className="w-full py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default VideoPlayer;
