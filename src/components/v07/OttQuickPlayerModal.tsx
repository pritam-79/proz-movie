'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  X,
  Play,
  ExternalLink,
  ShieldCheck,
  Radio,
  Film,
  Loader2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { V07MediaItem } from '@/lib/providers/kitsu';
import { buildShakaDrmConfiguration } from '@/lib/providers/drmConfig';

interface OttQuickPlayerModalProps {
  item: V07MediaItem | null;
  customLicenseUrl?: string;
  onClose: () => void;
}

export const OttQuickPlayerModal: React.FC<OttQuickPlayerModalProps> = ({
  item,
  customLicenseUrl,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [resolvedFormat, setResolvedFormat] = useState<'mp4' | 'hls' | 'dash' | 'youtube' | 'external'>('mp4');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [drmInfo, setDrmInfo] = useState<V07MediaItem['drmConfig'] | undefined>(undefined);

  useEffect(() => {
    if (!item) return;
    let cancelled = false;

    const loadStream = async () => {
      setErrorMsg(null);
      setResolvedUrl(null);
      setDrmInfo(item.drmConfig);

      // Trailer via YouTube
      if (item.playableType === 'trailer' && item.youtubeId) {
        setResolvedFormat('youtube');
        setResolvedUrl(`https://www.youtube-nocookie.com/embed/${item.youtubeId}?autoplay=1&rel=0`);
        return;
      }

      // Dynamic resolver endpoint
      if (item.streamUrl && item.streamUrl.startsWith('/api/v07/resolve-stream')) {
        setLoading(true);
        try {
          const res = await fetch(item.streamUrl);
          const data = await res.json();
          if (cancelled) return;
          if (data.success && data.playbackUrl) {
            setResolvedUrl(data.playbackUrl);
            setResolvedFormat(data.format || 'mp4');
            if (data.drmConfig) setDrmInfo(data.drmConfig);
          } else {
            setErrorMsg(data.error || 'Could not resolve a direct playable stream for this entry.');
          }
        } catch (err: any) {
          if (!cancelled) setErrorMsg(err?.message || 'Network error resolving stream URL.');
        } finally {
          if (!cancelled) setLoading(false);
        }
        return;
      }

      // Direct URL
      if (item.streamUrl) {
        setResolvedUrl(item.streamUrl);
        setResolvedFormat(item.streamFormat || (item.streamUrl.includes('.m3u8') ? 'hls' : item.streamUrl.includes('.mpd') ? 'dash' : 'mp4'));
      }
    };

    loadStream();
    return () => {
      cancelled = true;
    };
  }, [item]);

  useEffect(() => {
    if (!resolvedUrl || resolvedFormat === 'youtube' || resolvedFormat === 'external') return;
    let shakaInstance: any = null;
    let cancelled = false;

    const attachMedia = async () => {
      const video = videoRef.current;
      if (!video) return;

      // Direct MP4 / WebM progressive playback
      if (resolvedFormat === 'mp4' && !resolvedUrl.includes('.m3u8') && !resolvedUrl.includes('.mpd')) {
        video.src = resolvedUrl;
        video.load();
        video.play().catch(() => {});
        return;
      }

      // Adaptive HLS / DASH (with optional authorized EME DRM) via Shaka Player
      try {
        const shakaModule = await import('shaka-player');
        const shaka: any = shakaModule.default || shakaModule;
        shaka.polyfill?.installAll?.();

        if (!cancelled && video && shaka.Player?.isBrowserSupported?.()) {
          const player = new shaka.Player(video);
          shakaInstance = player;

          const effectiveLicense =
            customLicenseUrl?.trim() ||
            (drmInfo?.type === 'widevine' ? drmInfo.licenseServerUrl : undefined);

          const drmCfg = buildShakaDrmConfiguration({
            widevineLicenseUrl: effectiveLicense,
            clearKeys: drmInfo?.clearKeys,
          });

          player.configure({
            abr: { enabled: true },
            streaming: { bufferingGoal: 25, rebufferingGoal: 2 },
            ...drmCfg,
          });

          player.addEventListener('error', (ev: any) => {
            if (!cancelled) {
              // Fallback to native src for Safari/iOS HLS if Shaka fails on CORS/MSE
              if (resolvedUrl.includes('.m3u8') && video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = resolvedUrl;
                video.play().catch(() => {});
                return;
              }
              setErrorMsg(`Adaptive stream error (${ev?.detail?.code || 'CORS / offline feed'}). Try opening source directly or pick another live channel.`);
            }
          });

          await player.load(resolvedUrl);
          if (!cancelled) video.play().catch(() => {});
        } else if (video) {
          video.src = resolvedUrl;
          video.play().catch(() => {});
        }
      } catch {
        if (!cancelled && video) {
          video.src = resolvedUrl;
          video.play().catch(() => {});
        }
      }
    };

    attachMedia();
    return () => {
      cancelled = true;
      if (shakaInstance) {
        shakaInstance.destroy().catch(() => {});
      }
    };
  }, [resolvedUrl, resolvedFormat, drmInfo, customLicenseUrl]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6">
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#0D111A] border border-white/15 shadow-2xl overflow-hidden">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#0A0E16]">
          <div className="flex items-center gap-2.5 min-w-0">
            {item.playableType === 'live_hls' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-600/20 text-rose-400 border border-rose-500/40 text-[11px] font-bold">
                <Radio className="w-3 h-3 animate-pulse" /> LIVE HLS
              </span>
            ) : item.playableType === 'drm_test' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/40 text-[11px] font-bold">
                <ShieldCheck className="w-3 h-3" /> EME / DRM
              </span>
            ) : item.playableType === 'full_stream' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                <Play className="w-3 h-3 fill-current" /> FULL PLAYABLE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
                <Film className="w-3 h-3" /> {item.rightsLabel}
              </span>
            )}
            <h3 className="text-sm sm:text-base font-bold text-white truncate">{item.title}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition"
            aria-label="Close player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-slate-300">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              <span className="text-xs">Resolving verified media stream...</span>
            </div>
          ) : errorMsg ? (
            <div className="max-w-md text-center px-6 space-y-3">
              <AlertTriangle className="w-9 h-9 text-amber-400 mx-auto" />
              <p className="text-sm text-slate-200">{errorMsg}</p>
              <div className="flex items-center justify-center gap-3 pt-1">
                {item.detailHref && (
                  <a
                    href={item.detailHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-cyan-500/30"
                  >
                    <span>Open Source Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {item.id.startsWith('proz-') && (
                  <Link
                    href={`/watch/${item.id}`}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500"
                  >
                    Open Full Player
                  </Link>
                )}
              </div>
            </div>
          ) : resolvedFormat === 'youtube' && resolvedUrl ? (
            <iframe
              src={resolvedUrl}
              title={item.title}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : resolvedUrl && resolvedFormat !== 'external' ? (
            <video
              ref={videoRef}
              controls
              autoPlay
              playsInline
              className="w-full h-full bg-black"
              poster={item.backdrop || item.poster || undefined}
              onError={() => {
                setErrorMsg('Browser could not decode this stream (cross-origin or offline feed).');
              }}
            />
          ) : (
            <div className="text-center px-6 space-y-3">
              <Sparkles className="w-8 h-8 text-purple-400 mx-auto" />
              <p className="text-sm text-slate-200">
                Catalog & Channel Index Entry ({item.providerName})
              </p>
              <div className="flex justify-center gap-3">
                {item.detailHref.startsWith('/') ? (
                  <Link
                    href={item.detailHref}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-bold"
                  >
                    Browse Channel & Episodes
                  </Link>
                ) : (
                  <a
                    href={item.detailHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <span>View Official Listing</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Metadata & Stream Provenance */}
        <div className="px-5 py-4 bg-[#0B0F18] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1 max-w-2xl">
            <p className="text-slate-300 line-clamp-2">{item.description}</p>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              <span className="text-cyan-400 font-semibold">{item.providerName}</span>
              <span>•</span>
              <span>{item.subCategory}</span>
              <span>•</span>
              <span>{item.rightsLabel}</span>
              {drmInfo?.note && (
                <>
                  <span>•</span>
                  <span className="text-purple-300">{drmInfo.note}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {item.id.startsWith('cine18-ch-') && (
              <Link
                href={item.detailHref}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition"
              >
                Open Channel
              </Link>
            )}
            {resolvedUrl && resolvedFormat !== 'external' && (
              <a
                href={resolvedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-medium inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" /> Direct Source
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OttQuickPlayerModal;
