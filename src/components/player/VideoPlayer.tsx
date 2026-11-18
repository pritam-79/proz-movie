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
  PictureInPicture, 
  ArrowLeft, 
  SkipForward, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  Smartphone,
  Globe,
  Sparkles,
  Tv,
  RefreshCw
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
  const [selectedQuality, setSelectedQuality] = useState('Auto (1080p)');
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('off');
  const [showControls, setShowControls] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
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

  // Fallback stream URLs from content model
  const activeStream = currentEpisode?.fallbackMp4 || content.fallbackMp4 || currentEpisode?.streamUrl || content.streamUrl || directSource?.playbackUrl;
  
  // YouTube ID fallback
  let ytId = (content as any).youtubeId || (content as any).youtube_id;
  if (!ytId && content.trailerUrl) {
    const m = content.trailerUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (m) ytId = m[1];
  }

  // Determine initial playback mode
  useEffect(() => {
    if (activeStream && (activeStream.endsWith('.mp4') || activeStream.includes('.m3u8') || activeStream.includes('.mpd'))) {
      setPlaybackMode('direct');
    } else if (ytId) {
      setPlaybackMode('youtube');
    } else {
      setPlaybackMode('official_hub');
    }
  }, [activeStream, ytId]);

  // Initialize Shaka or native HTML5 video
  useEffect(() => {
    if (playbackMode !== 'direct' || !activeStream) return;

    let shakaInstance: any = null;
    let isCancelled = false;

    const initPlayer = async () => {
      setHasPlaybackError(false);
      setIsBuffering(true);

      if (!videoRef.current) return;

      // Direct MP4
      if (activeStream.endsWith('.mp4') || (!activeStream.includes('.m3u8') && !activeStream.includes('.mpd'))) {
        videoRef.current.src = activeStream;
        videoRef.current.load();
        setIsBuffering(false);
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
            streaming: { bufferingGoal: 30, rebufferingGoal: 2 }
          });

          player.addEventListener('error', (event: any) => {
            console.warn('Shaka playback error:', event.detail);
            setHasPlaybackError(true);
            setErrorMessage('Network or stream manifest error. You can stream directly via official provider below.');
            setIsBuffering(false);
          });

          await player.load(activeStream);
          setIsBuffering(false);
        } else if (videoRef.current) {
          videoRef.current.src = activeStream;
          videoRef.current.load();
          setIsBuffering(false);
        }
      } catch (err: any) {
        console.warn('Player initialization failed:', err);
        setHasPlaybackError(true);
        setErrorMessage(err.message || 'Unable to play direct stream.');
        setIsBuffering(false);
      }
    };

    initPlayer();

    return () => {
      isCancelled = true;
      if (shakaInstance) {
        shakaInstance.destroy().catch(() => {});
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
        setShowSubtitleMenu(false);
      }
    }, 3500);
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
            className="w-full h-full object-contain cursor-pointer"
            onClick={togglePlay}
            onTimeUpdate={() => {
              if (videoRef.current) {
                const cur = videoRef.current.currentTime;
                setCurrentTime(cur);
                saveProgress(content.id, cur, currentEpisode?.id);
              }
            }}
            onDurationChange={() => {
              if (videoRef.current) setDuration(videoRef.current.duration || 0);
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
              setHasPlaybackError(true);
              setErrorMessage('CORS or playback format error on direct stream.');
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

      {/* ─── Mode 3 / Error Fallback: Official Provider Streaming Hub ─── */}
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
                    href={`https://www.themoviedb.org/movie/${content.tmdb_id || 533535}/watch`}
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
            {content.releaseYear || 2024} • {content.category?.toUpperCase() || 'CINEMA'}
          </span>
        </div>

        {/* Source Mode Switcher */}
        <div className="flex items-center gap-1">
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

            {/* Right Controls */}
            <div className="flex items-center gap-2">
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

    </div>
  );
};

export default VideoPlayer;
