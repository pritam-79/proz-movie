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
  Sparkles,
  Tv,
  List
} from 'lucide-react';
import { ContentItem, SubtitleTrack, AudioTrackOption } from '@/types/content';
import { useAuth } from '@/context/AuthContext';

interface VideoPlayerProps {
  content: ContentItem;
  episodeId?: string;
  sessionToken?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  content,
  episodeId,
  sessionToken,
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
  const [selectedAudio, setSelectedAudio] = useState<string>('default');
  const [showControls, setShowControls] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [drmVerified, setDrmVerified] = useState(true);

  // Resolve current episode if series
  let currentEpisode = null;
  let nextEpisode = null;

  if (content.type === 'series' && content.seasons) {
    for (const season of content.seasons) {
      const idx = season.episodes.findIndex(e => e.id === episodeId);
      if (idx !== -1) {
        currentEpisode = season.episodes[idx];
        nextEpisode = season.episodes[idx + 1] || null;
        break;
      }
    }
    if (!currentEpisode && content.seasons[0]?.episodes[0]) {
      currentEpisode = content.seasons[0].episodes[0];
      nextEpisode = content.seasons[0].episodes[1] || null;
    }
  }

  // Active stream URL
  const activeStream = currentEpisode?.fallbackMp4 || currentEpisode?.streamUrl || content.fallbackMp4 || content.streamUrl;

  // 1. Initialize Shaka Player or Native Player
  useEffect(() => {
    let shakaPlayerInstance: any = null;

    const initShaka = async () => {
      try {
        if (typeof window !== 'undefined' && videoRef.current) {
          // Dynamic import of Shaka Player to prevent SSR issues
          const shakaModule = await import('shaka-player');
          const shaka: any = shakaModule.default || shakaModule;
          
          if (shaka.polyfill?.installAll) {
            shaka.polyfill.installAll();
          }

          if (shaka.Player && shaka.Player.isBrowserSupported && shaka.Player.isBrowserSupported()) {
            const player = new shaka.Player(videoRef.current);
            shakaPlayerInstance = player;

            // Configure Adaptive Bitrate (ABR)
            player.configure({
              abr: {
                enabled: true,
                defaultBandwidthEstimate: 5000000, // 5 Mbps
              },
              streaming: {
                bufferingGoal: 30,
                rebufferingGoal: 2,
              }
            });

            // Listen for errors
            player.addEventListener('error', (event: any) => {
              console.warn('Shaka error:', event.detail);
              // Fallback to direct video src
              if (videoRef.current && activeStream) {
                videoRef.current.src = activeStream;
              }
            });

            // Load stream
            try {
              await player.load(activeStream);
            } catch (loadErr) {
              // Direct fallback
              if (videoRef.current) {
                videoRef.current.src = activeStream;
              }
            }
          } else {
            // Direct HTML5 fallback for browsers without MSE (like iOS Safari)
            if (videoRef.current) {
              videoRef.current.src = activeStream;
            }
          }
        }
      } catch (err) {
        console.warn('Shaka load fallback to HTML5 native:', err);
        if (videoRef.current) {
          videoRef.current.src = activeStream;
        }
      }
    };

    initShaka();

    return () => {
      if (shakaPlayerInstance) {
        shakaPlayerInstance.destroy();
      }
    };
  }, [activeStream]);

  // 2. Resume last saved progress
  useEffect(() => {
    const savedTime = getProgress(content.id, currentEpisode?.id);
    if (savedTime > 5 && videoRef.current) {
      videoRef.current.currentTime = savedTime;
      setCurrentTime(savedTime);
    }
  }, [content.id, currentEpisode?.id]);

  // 3. Auto-hide Controls after inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSettingsMenu(false);
        setShowSubtitleMenu(false);
      }
    }, 3500);
  };

  // 4. Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekDelta(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekDelta(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isMuted, isFullscreen]);

  // Playback Control Functions
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
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const adjustVolume = (delta: number) => {
    if (!videoRef.current) return;
    const newVol = Math.max(0, Math.min(1, volume + delta));
    setVolume(newVol);
    videoRef.current.volume = newVol;
    setIsMuted(newVol === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.volume = volume || 0.8;
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.warn("PiP error:", e);
    }
  };

  // Video Event Handlers
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    // Skip intro detection (between introStart and introEnd)
    const introStart = currentEpisode?.introStartSec || 15;
    const introEnd = currentEpisode?.introEndSec || 45;
    setShowSkipIntro(curr >= introStart && curr <= introEnd);

    // Buffer tracking
    if (videoRef.current.buffered.length > 0) {
      setBufferedTime(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
    }

    // Save progress every 5 seconds
    if (Math.floor(curr) % 5 === 0 && duration > 0) {
      saveProgress(content.id, Math.floor(curr), Math.floor(duration), currentEpisode?.id);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen bg-black overflow-hidden select-none flex items-center justify-center font-sans"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
            setIsBuffering(false);
          }
        }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onEnded={() => {
          setIsPlaying(false);
          if (nextEpisode) {
            router.push(`/watch/${content.id}?episode=${nextEpisode.id}`);
          }
        }}
      />

      {/* Loading Spinner during buffering */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-16 h-16 rounded-full border-4 border-proz-border/40 border-t-proz-cyan animate-spin" />
        </div>
      )}

      {/* Skip Intro Floating Button */}
      {showSkipIntro && (
        <button
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.currentTime = currentEpisode?.introEndSec || 50;
              setShowSkipIntro(false);
            }
          }}
          className="absolute bottom-28 right-8 z-30 px-5 py-2.5 rounded-full glass-card border border-proz-cyan/50 text-proz-white font-bold text-xs flex items-center gap-2 hover:bg-proz-cyan hover:text-proz-midnight transition-all shadow-cyan-glow"
        >
          <SkipForward className="w-4 h-4" />
          <span>Skip Intro</span>
        </button>
      )}

      {/* Signed Session & DRM Watermark */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-[10px] text-emerald-400 border border-emerald-500/30">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span className="font-mono">PROZ-DRM • SECURE SESSION</span>
      </div>

      {/* Top Overlay Bar */}
      <div
        className={`absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-proz-midnight/90 to-transparent flex items-center justify-between transition-opacity duration-300 z-30 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-full glass-card hover:border-proz-cyan/50 text-proz-white transition-all"
            aria-label="Back to details"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-proz-white">
              {content.title}
            </h2>
            {currentEpisode && (
              <p className="text-xs text-proz-cyan">
                Season {currentEpisode.seasonNumber} • Episode {currentEpisode.episodeNumber}: {currentEpisode.title}
              </p>
            )}
          </div>
        </div>

        {/* Series Episodes Drawer Toggle */}
        {content.type === 'series' && content.seasons && (
          <button
            onClick={() => setShowEpisodeDrawer(!showEpisodeDrawer)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-proz-border/50 text-xs font-semibold text-proz-white hover:border-proz-cyan/50"
          >
            <List className="w-4 h-4 text-proz-cyan" />
            <span>Episodes</span>
          </button>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-proz-midnight/95 via-proz-midnight/70 to-transparent flex flex-col gap-3 transition-opacity duration-300 z-30 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber Seek Bar */}
        <div className="relative w-full flex items-center group cursor-pointer">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeekChange}
            className="w-full h-1.5 bg-proz-border/50 rounded-lg appearance-none cursor-pointer accent-proz-cyan group-hover:h-2.5 transition-all"
          />
        </div>

        {/* Controls Layout */}
        <div className="flex items-center justify-between">
          
          {/* Left Controls: Play, Skip, Volume, Time */}
          <div className="flex items-center gap-4">
            
            <button
              onClick={togglePlay}
              className="p-2.5 rounded-full glass-button-primary shadow-cyan-glow"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            <button
              onClick={() => seekDelta(-10)}
              className="text-proz-grey hover:text-white transition-colors"
              title="Rewind 10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => seekDelta(10)}
              className="text-proz-grey hover:text-white transition-colors"
              title="Fast Forward 10s"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 group">
              <button
                onClick={toggleMute}
                className="text-proz-grey hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  if (videoRef.current) {
                    videoRef.current.volume = val;
                    videoRef.current.muted = val === 0;
                    setIsMuted(val === 0);
                  }
                }}
                className="w-16 h-1 bg-proz-border/50 rounded-lg appearance-none cursor-pointer accent-proz-cyan hidden sm:block"
              />
            </div>

            {/* Timestamp Display */}
            <div className="text-xs font-mono text-proz-grey">
              <span className="text-proz-white">{formatTime(currentTime)}</span>
              <span> / </span>
              <span>{formatTime(duration)}</span>
            </div>

          </div>

          {/* Right Controls: Subtitles, Settings, Quality, PiP, Fullscreen */}
          <div className="flex items-center gap-3 relative">
            
            {/* Next Episode Button */}
            {nextEpisode && (
              <button
                onClick={() => router.push(`/watch/${content.id}?episode=${nextEpisode.id}`)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card hover:border-proz-cyan/50 text-xs font-semibold text-proz-white"
              >
                <span>Next Episode</span>
                <SkipForward className="w-3.5 h-3.5 text-proz-cyan" />
              </button>
            )}

            {/* Subtitle Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSubtitleMenu(!showSubtitleMenu);
                  setShowSettingsMenu(false);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  selectedSubtitle !== 'off' ? 'text-proz-cyan' : 'text-proz-grey hover:text-white'
                }`}
                title="Subtitles"
              >
                <Subtitles className="w-4 h-4" />
              </button>

              {showSubtitleMenu && (
                <div className="absolute bottom-12 right-0 w-48 rounded-2xl glass-card border border-proz-border/60 shadow-glass-lg p-2 z-40 text-xs space-y-1">
                  <p className="px-2 py-1 font-bold text-proz-white border-b border-proz-border/40">Subtitles</p>
                  <button
                    onClick={() => { setSelectedSubtitle('off'); setShowSubtitleMenu(false); }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left ${
                      selectedSubtitle === 'off' ? 'bg-proz-cyan/20 text-proz-cyan' : 'text-proz-grey hover:text-white'
                    }`}
                  >
                    <span>Off</span>
                    {selectedSubtitle === 'off' && <Check className="w-3 h-3" />}
                  </button>
                  {content.subtitles.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => { setSelectedSubtitle(sub.id); setShowSubtitleMenu(false); }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left ${
                        selectedSubtitle === sub.id ? 'bg-proz-cyan/20 text-proz-cyan' : 'text-proz-grey hover:text-white'
                      }`}
                    >
                      <span>{sub.label}</span>
                      {selectedSubtitle === sub.id && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality & Speed Settings Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSettingsMenu(!showSettingsMenu);
                  setShowSubtitleMenu(false);
                }}
                className="p-2 rounded-lg text-proz-grey hover:text-white transition-colors"
                title="Playback Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              {showSettingsMenu && (
                <div className="absolute bottom-12 right-0 w-56 rounded-2xl glass-card border border-proz-border/60 shadow-glass-lg p-3 z-40 text-xs space-y-3">
                  <div>
                    <p className="font-bold text-proz-white mb-1.5">Stream Quality</p>
                    <div className="grid grid-cols-2 gap-1">
                      {['Auto (ABR)', '4K UHD', '1080p FHD', '720p HD'].map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setSelectedQuality(q);
                            setShowSettingsMenu(false);
                          }}
                          className={`px-2 py-1 rounded text-center text-[10px] font-semibold ${
                            selectedQuality.includes(q) ? 'bg-proz-cyan text-proz-midnight font-bold' : 'glass-pill text-proz-grey'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-proz-border/40">
                    <p className="font-bold text-proz-white mb-1.5">Playback Speed</p>
                    <div className="flex items-center justify-between gap-1">
                      {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => {
                            setPlaybackSpeed(spd);
                            if (videoRef.current) videoRef.current.playbackRate = spd;
                            setShowSettingsMenu(false);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            playbackSpeed === spd ? 'bg-proz-purple text-white' : 'glass-pill text-proz-grey'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PiP */}
            <button
              onClick={togglePiP}
              className="p-2 rounded-lg text-proz-grey hover:text-white transition-colors hidden sm:block"
              title="Picture in Picture"
            >
              <PictureInPicture className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg text-proz-grey hover:text-white transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

          </div>

        </div>

      </div>

      {/* Series Episode Drawer Panel */}
      {showEpisodeDrawer && content.type === 'series' && content.seasons && (
        <div className="absolute top-0 right-0 bottom-0 w-80 sm:w-96 glass-card border-l border-proz-border/60 shadow-glass-lg p-5 z-40 overflow-y-auto no-scrollbar space-y-4 animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b border-proz-border/40 pb-3">
            <h3 className="font-bold text-proz-white flex items-center gap-2">
              <Tv className="w-4 h-4 text-proz-cyan" />
              <span>Episodes</span>
            </h3>
            <button
              onClick={() => setShowEpisodeDrawer(false)}
              className="text-xs text-proz-grey hover:text-white px-2 py-1 rounded-lg glass-card"
            >
              Close
            </button>
          </div>

          <div className="space-y-2.5">
            {content.seasons[0].episodes.map((ep) => (
              <div
                key={ep.id}
                onClick={() => {
                  setShowEpisodeDrawer(false);
                  router.push(`/watch/${content.id}?episode=${ep.id}`);
                }}
                className={`p-2.5 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
                  ep.id === (currentEpisode?.id || episodeId)
                    ? 'bg-proz-cyan/15 border border-proz-cyan/50 text-proz-cyan'
                    : 'glass-card hover:border-proz-border/80 text-proz-grey hover:text-white'
                }`}
              >
                <img
                  src={ep.thumbnailUrl}
                  alt={ep.title}
                  className="w-20 aspect-video rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate text-proz-white">{ep.title}</p>
                  <p className="text-[10px] text-proz-grey">{ep.durationMinutes} mins</p>
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
