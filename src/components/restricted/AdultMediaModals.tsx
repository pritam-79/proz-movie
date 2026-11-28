'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  X,
  Play,
  Heart,
  Image as ImageIcon,
  Building,
  Sparkles,
  Film,
  ChevronLeft,
  ChevronRight,
  Globe,
  Clock,
  Layers,
  ZoomIn,
  ZoomOut,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toStashWatchPath, normalizeStashId, toImageProxyFallback } from '@/lib/utils/streamUtils';

function applyImgProxyFallback(e: React.SyntheticEvent<HTMLImageElement>, rawSrc?: string) {
  const img = e.currentTarget;
  if (!img.dataset.proxied && rawSrc && !rawSrc.startsWith('/') && !rawSrc.startsWith('data:')) {
    img.dataset.proxied = '1';
    img.src = toImageProxyFallback(rawSrc);
  }
}

export function PhotoGalleryModal({
  title,
  images,
  onClose,
}: {
  title: string;
  images: string[];
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState<1 | 1.5 | 2>(1);

  const handlePrev = useCallback(() => {
    setZoom(1);
    setIdx((p) => (p - 1 + images.length) % images.length);
  }, [images.length]);

  const handleNext = useCallback(() => {
    setZoom(1);
    setIdx((p) => (p + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    setIdx(0);
    setZoom(1);
  }, [title, images]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === '+' || e.key === '=') setZoom((z) => (z === 1 ? 1.5 : 2));
      else if (e.key === '-') setZoom((z) => (z === 2 ? 1.5 : 1));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, handlePrev, handleNext]);

  if (!images || images.length === 0) return null;
  const activeUrl = images[idx] || images[0];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/92 backdrop-blur-lg flex flex-col justify-between p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <ImageIcon className="w-4 h-4 text-proz-cyan shrink-0" />
          <h3 className="text-sm sm:text-base font-bold text-white keep-white truncate">{title}</h3>
          <span className="text-xs font-mono text-proz-cyan bg-white/10 px-2 py-0.5 rounded-md shrink-0">
            {idx + 1} / {images.length}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setZoom((z) => (z === 1 ? 1.5 : z === 1.5 ? 2 : 1))}
            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white keep-white text-xs font-semibold flex items-center gap-1 transition"
            title="Toggle Zoom"
          >
            {zoom > 1 ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
            <span>{zoom}x</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-proz-purple text-white keep-white transition"
            aria-label="Close gallery"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center overflow-auto my-3 select-none">
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/75 border border-white/20 text-white keep-white hover:bg-proz-purple transition"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <img
          src={activeUrl}
          alt={`${title} - ${idx + 1}`}
          referrerPolicy="no-referrer"
          onError={(e) => applyImgProxyFallback(e, activeUrl)}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          className="max-h-[74vh] max-w-full object-contain rounded-2xl border border-white/15 shadow-2xl transition-transform duration-200"
        />

        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/75 border border-white/20 text-white keep-white hover:bg-proz-purple transition"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
        {images.map((src, i) => (
          <button
            type="button"
            key={`${src}-${i}`}
            onClick={() => {
              setZoom(1);
              setIdx(i);
            }}
            className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition ${
              i === idx ? 'border-proz-cyan shadow-cyan-glow' : 'border-white/10 opacity-55 hover:opacity-100'
            }`}
          >
            <img
              src={src}
              alt="thumb"
              referrerPolicy="no-referrer"
              onError={(e) => applyImgProxyFallback(e, src)}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function PerformerProfileModal({
  performerId,
  favorites,
  onToggleFavorite,
  onSelectStudio,
  onOpenPhotos,
  onClose,
}: {
  performerId: string;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectStudio: (studioId: string) => void;
  onOpenPhotos: (title: string, images: string[]) => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetch(`/api/library/stash/performers?id=${encodeURIComponent(performerId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        if (!d.success) {
          setError(d.error || 'Could not load performer profile');
        } else {
          setProfile(d);
        }
      })
      .catch(() => active && setError('Network error loading performer profile'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [performerId]);

  const p = profile?.performer;
  const isFav = favorites.includes(performerId);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="cinema-card bg-proz-navy border border-proz-border rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-6">
        <div className="flex items-center justify-between gap-3 border-b border-proz-border/60 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-proz-purple">
            <Sparkles className="w-4 h-4" />
            <span>Verified 18+ Performer Profile</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-proz-elevated hover:bg-proz-purple/20 text-proz-grey hover:text-proz-white transition"
            aria-label="Close performer profile"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-proz-grey">Loading performer profile & filmography...</div>
        ) : error || !p ? (
          <div className="py-16 text-center text-sm text-rose-400 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error || 'Profile unavailable.'}</span>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="w-40 sm:w-48 aspect-[3/4] rounded-2xl overflow-hidden bg-proz-elevated border border-proz-border shrink-0 mx-auto sm:mx-0">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => applyImgProxyFallback(e, p.imageUrl)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-proz-grey text-xs">
                    No Portrait
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black text-proz-white">{p.name}</h2>
                    {Array.isArray(p.aliases) && p.aliases.length > 0 && (
                      <p className="text-xs text-proz-grey mt-0.5">
                        Also known as: {p.aliases.slice(0, 4).join(', ')}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(performerId)}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                      isFav
                        ? 'bg-proz-purple/20 border-proz-purple text-proz-purple'
                        : 'bg-proz-elevated border-proz-border text-proz-grey hover:text-proz-white'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                    <span>{isFav ? 'Favorited' : 'Add Favorite'}</span>
                  </button>
                </div>

                {p.details && (
                  <p className="text-xs text-proz-grey leading-relaxed">{p.details}</p>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-proz-elevated/70 border border-proz-border/60">
                    <span className="text-[10px] text-proz-grey block uppercase">Country</span>
                    <span className="font-semibold text-proz-white">{p.country || 'International'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-proz-elevated/70 border border-proz-border/60">
                    <span className="text-[10px] text-proz-grey block uppercase">Ethnicity</span>
                    <span className="font-semibold text-proz-white">{p.ethnicity || 'N/A'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-proz-elevated/70 border border-proz-border/60">
                    <span className="text-[10px] text-proz-grey block uppercase">Hair / Height</span>
                    <span className="font-semibold text-proz-white">
                      {p.hairColor || 'N/A'} {p.heightCm ? `• ${p.heightCm}cm` : ''}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-proz-elevated/70 border border-proz-border/60">
                    <span className="text-[10px] text-proz-grey block uppercase">Active Since</span>
                    <span className="font-semibold text-proz-white">{p.careerStartYear || '2020+'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-proz-elevated/70 border border-proz-border/60">
                    <span className="text-[10px] text-proz-grey block uppercase">Indexed Credits</span>
                    <span className="font-semibold text-proz-white">
                      {((profile.playableScenes?.length || 0) + (p.sceneCount || 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-proz-elevated/70 border border-proz-border/60">
                    <span className="text-[10px] text-proz-grey block uppercase">Source</span>
                    <span className="font-semibold text-proz-cyan uppercase">{profile.source}</span>
                  </div>
                </div>

                {Array.isArray(p.studios) && p.studios.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold uppercase text-proz-grey">Associated Studios</p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.studios.map((s: any) => (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => {
                            onClose();
                            onSelectStudio(`stashdb-${s.id}`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-proz-purple/15 border border-proz-purple/30 text-proz-purple text-xs font-medium hover:bg-proz-purple/25"
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {Array.isArray(profile.photos) && profile.photos.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-proz-cyan">
                    Profile Photo Gallery ({profile.photos.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => onOpenPhotos(`${p.name} Gallery`, profile.photos)}
                    className="text-xs text-proz-cyan underline font-semibold"
                  >
                    Open Fullscreen Lightbox
                  </button>
                </div>
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {profile.photos.slice(0, 8).map((src: string, idx: number) => (
                    <button
                      type="button"
                      key={`${src}-${idx}`}
                      onClick={() => onOpenPhotos(`${p.name} Gallery`, profile.photos)}
                      className="w-24 h-32 rounded-xl overflow-hidden border border-proz-border hover:border-proz-cyan shrink-0 transition"
                    >
                      <img
                        src={src}
                        alt="Performer still"
                        referrerPolicy="no-referrer"
                        onError={(e) => applyImgProxyFallback(e, src)}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(profile.playableScenes) && profile.playableScenes.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Playable Videos Inside PROZ ({profile.playableScenes.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {profile.playableScenes.slice(0, 12).map((sc: any) => (
                    <Link
                      key={sc.id}
                      href={toStashWatchPath(sc.id)}
                      onClick={onClose}
                      className="group rounded-2xl overflow-hidden bg-proz-elevated/60 border border-proz-border hover:border-proz-purple/60 transition flex flex-col"
                    >
                      <div className="relative aspect-video bg-proz-midnight overflow-hidden">
                        {sc.paths?.screenshot && (
                          <img
                            src={sc.paths.screenshot}
                            alt={sc.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => applyImgProxyFallback(e, sc.paths.screenshot)}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-80 group-hover:opacity-100">
                          <div className="p-2 rounded-full bg-proz-purple text-white keep-white shadow-purple-glow">
                            <Play className="w-4 h-4 fill-white" />
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <h5 className="text-xs font-bold text-proz-white line-clamp-1">{sc.title}</h5>
                        <p className="text-[11px] text-proz-grey mt-0.5 truncate">{sc.studio?.name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(profile.catalogScenes) && profile.catalogScenes.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-proz-purple">
                  StashDB Filmography Credits ({profile.catalogScenes.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {profile.catalogScenes.slice(0, 10).map((sc: any) => (
                    <div
                      key={sc.id}
                      className="p-3 rounded-xl bg-proz-elevated/50 border border-proz-border/70 flex items-center gap-3"
                    >
                      {sc.image && (
                        <img
                          src={sc.image}
                          alt={sc.title}
                          referrerPolicy="no-referrer"
                          onError={(e) => applyImgProxyFallback(e, sc.image)}
                          className="w-16 h-11 rounded-lg object-cover shrink-0 bg-proz-midnight"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-proz-white truncate">{sc.title}</p>
                        <p className="text-[10px] text-proz-grey truncate">
                          {sc.studioName} • {sc.date || 'N/A'}
                        </p>
                      </div>
                      {sc.isPlayable && sc.matchedSceneId ? (
                        <Link
                          href={toStashWatchPath(sc.matchedSceneId)}
                          onClick={onClose}
                          className="px-2.5 py-1 rounded-lg bg-proz-purple text-white keep-white text-[10px] font-bold shrink-0"
                        >
                          Play
                        </Link>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-proz-elevated text-proz-grey text-[9px] font-semibold shrink-0">
                          Metadata
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function StudioDetailModal({
  studioId,
  onSelectPerformer,
  onClose,
}: {
  studioId: string;
  onSelectPerformer: (performerId: string) => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetch(`/api/library/stash/studios?id=${encodeURIComponent(studioId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        if (!d.success) setError(d.error || 'Studio lookup failed');
        else setDetail(d);
      })
      .catch(() => active && setError('Network error loading studio details'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [studioId]);

  const studio = detail?.studio;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="cinema-card bg-proz-navy border border-proz-border rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-proz-border/60 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-proz-purple">
            <Building className="w-4 h-4" />
            <span>Studio Profile & Catalog</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-proz-elevated hover:bg-proz-purple/20 text-proz-grey hover:text-proz-white transition"
            aria-label="Close studio detail"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-proz-grey">Loading studio details & releases...</div>
        ) : error || !studio ? (
          <div className="py-16 text-center text-sm text-rose-400">{error || 'Studio unavailable.'}</div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row items-center gap-5 bg-proz-elevated/50 border border-proz-border/70 rounded-2xl p-4">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-proz-midnight border border-proz-border shrink-0 flex items-center justify-center">
                {studio.image ? (
                  <img
                    src={studio.image}
                    alt={studio.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => applyImgProxyFallback(e, studio.image)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building className="w-8 h-8 text-proz-purple" />
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-black text-proz-white">{studio.name}</h2>
                <p className="text-xs text-proz-grey mt-1">{studio.description}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-proz-cyan/15 text-proz-cyan text-[10px] font-bold">
                  {studio.category} • {studio.itemCount} Indexed
                </span>
              </div>
            </div>

            {Array.isArray(detail.playableScenes) && detail.playableScenes.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Playable Videos ({detail.playableScenes.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {detail.playableScenes.slice(0, 12).map((sc: any) => (
                    <Link
                      key={sc.id}
                      href={toStashWatchPath(sc.id)}
                      onClick={onClose}
                      className="group rounded-2xl overflow-hidden bg-proz-elevated/60 border border-proz-border hover:border-proz-purple transition flex flex-col"
                    >
                      <div className="relative aspect-video bg-proz-midnight">
                        {sc.paths?.screenshot && (
                          <img
                            src={sc.paths.screenshot}
                            alt={sc.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => applyImgProxyFallback(e, sc.paths.screenshot)}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="w-7 h-7 text-white keep-white fill-white/85" />
                        </div>
                      </div>
                      <div className="p-3">
                        <h5 className="text-xs font-bold text-proz-white line-clamp-1">{sc.title}</h5>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(detail.performers) && detail.performers.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-proz-purple">
                  Featured Studio Performers
                </h4>
                <div className="flex flex-wrap gap-2">
                  {detail.performers.map((perf: any) => (
                    <button
                      type="button"
                      key={perf.id}
                      onClick={() => {
                        onClose();
                        onSelectPerformer(perf.id);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-proz-elevated hover:bg-proz-purple/20 border border-proz-border text-xs font-semibold text-proz-white flex items-center gap-2 transition"
                    >
                      {perf.image && (
                        <img
                          src={perf.image}
                          alt={perf.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => applyImgProxyFallback(e, perf.image)}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      )}
                      <span>{perf.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(detail.catalogScenes) && detail.catalogScenes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-proz-cyan">
                  StashDB Studio Releases
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {detail.catalogScenes.slice(0, 10).map((sc: any) => (
                    <div
                      key={sc.id}
                      className="p-3 rounded-xl bg-proz-elevated/50 border border-proz-border/70 flex items-center gap-3"
                    >
                      {sc.image && (
                        <img
                          src={sc.image}
                          alt={sc.title}
                          referrerPolicy="no-referrer"
                          onError={(e) => applyImgProxyFallback(e, sc.image)}
                          className="w-16 h-11 rounded-lg object-cover shrink-0 bg-proz-midnight"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-proz-white truncate">{sc.title}</p>
                        <p className="text-[10px] text-proz-grey truncate">{sc.date || 'Metadata Record'}</p>
                      </div>
                      {sc.isPlayable && sc.matchedSceneId ? (
                        <Link
                          href={toStashWatchPath(sc.matchedSceneId)}
                          onClick={onClose}
                          className="px-2.5 py-1 rounded-lg bg-proz-purple text-white keep-white text-[10px] font-bold"
                        >
                          Play
                        </Link>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-proz-elevated text-proz-grey text-[9px] font-semibold">
                          Metadata
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function SeriesDetailModal({
  series,
  onClose,
}: {
  series: any;
  onClose: () => void;
}) {
  const { getProgress } = useAuth();
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [liveEpisodes, setLiveEpisodes] = useState<any[]>([]);
  const [liveMeta, setLiveMeta] = useState<{ description?: string; cast?: string; language?: string } | null>(null);

  useEffect(() => {
    if (!series) return;
    const isCine18Series = Boolean(series.isRealCine18Series || String(series.id || '').startsWith('cine18-'));
    if (!isCine18Series) return;

    const seriesId = String(series.id || '');
    const channelSlug = String(series.studio || '').trim();
    const uid =
      series.channelUid ||
      (seriesId.startsWith('cine18-')
        ? seriesId.replace(/^cine18-/, '').split('-')[0] || seriesId.replace(/^cine18-/, '')
        : seriesId);

    const routeSlug = encodeURIComponent(uid || channelSlug);
    const titleParam = encodeURIComponent(series.title || channelSlug);

    let active = true;
    setLoadingEpisodes(true);
    fetch(`/api/channels/${routeSlug}/videos?title=${titleParam}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        const eps = Array.isArray(d.videos) ? d.videos : [];
        setLiveEpisodes(eps);
        if (eps[0]) {
          setLiveMeta({
            description: eps[0].description || eps[0].storyline || '',
            cast: eps[0].cast || '',
            language: eps[0].language || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => active && setLoadingEpisodes(false));

    return () => {
      active = false;
    };
  }, [series]);

  if (!series) return null;

  const isCine18 = Boolean(series.isRealCine18Series || String(series.id || '').startsWith('cine18-'));
  const staticEpisodes = series.episodes || series.episodeList || [];
  const episodesToShow = isCine18 ? liveEpisodes : staticEpisodes;
  const baseWatchHref = series.watchHref || (isCine18 ? `/watch/${series.id}` : toStashWatchPath(normalizeStashId(series.id || '')));
  const firstEpisodeHref =
    isCine18 && liveEpisodes[0]
      ? `/watch/cine18-${liveEpisodes[0].uid || liveEpisodes[0].id}`
      : baseWatchHref;
  const resumeSec = getProgress(normalizeStashId(String(series.id || '')));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="cinema-card bg-proz-navy border border-proz-border rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-proz-purple/20 text-proz-purple border border-proz-purple/30">
              {series.subcategory || 'Hot Web Series'} • {series.studio}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-proz-white mt-2">{series.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-proz-elevated hover:bg-proz-purple/20 text-proz-grey hover:text-proz-white transition"
            aria-label="Close series modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {(series.banner || series.poster) && (
          <div className="aspect-video rounded-2xl overflow-hidden bg-proz-midnight border border-proz-border relative">
            <img
              src={series.banner || series.poster}
              alt={series.title}
              referrerPolicy="no-referrer"
              onError={(e) => applyImgProxyFallback(e, series.banner || series.poster)}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-black/80 text-white keep-white text-xs font-bold">
                {loadingEpisodes ? 'Loading stream count...' : `${episodesToShow.length} Playable Videos`}
              </span>
              {series.rating && (
                <span className="px-2.5 py-1 rounded-lg bg-proz-cyan/25 text-proz-cyan text-xs font-bold">
                  ★ {series.rating}
                </span>
              )}
            </div>
          </div>
        )}

        <p className="text-xs sm:text-sm text-proz-grey leading-relaxed">
          {liveMeta?.description || series.synopsis || series.description}
        </p>

        {liveMeta && (liveMeta.cast || liveMeta.language) && (
          <div className="flex flex-wrap gap-3 text-xs text-proz-grey bg-proz-elevated/50 border border-proz-border rounded-xl p-3">
            {liveMeta.language && (
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-proz-cyan" /> Language:{' '}
                <strong className="text-proz-white">{liveMeta.language}</strong>
              </span>
            )}
            {liveMeta.cast && (
              <span>
                Cast: <strong className="text-proz-white">{liveMeta.cast}</strong>
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={firstEpisodeHref}
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl glass-button-primary text-xs font-bold flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{resumeSec > 10 ? `Resume (${Math.floor(resumeSec / 60)}m)` : 'Stream Now in Player'}</span>
          </Link>
        </div>

        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-proz-cyan flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            {loadingEpisodes ? 'Fetching Live Catalog Episodes...' : `Available Episodes & Videos (${episodesToShow.length})`}
          </h4>
          {loadingEpisodes ? (
            <div className="py-6 text-center text-xs text-proz-grey">Querying Cine18 live channel index...</div>
          ) : episodesToShow.length === 0 ? (
            <div className="p-4 rounded-xl bg-proz-elevated/40 border border-proz-border text-xs text-proz-grey flex items-center gap-2">
              <Film className="w-4 h-4 text-proz-grey shrink-0" />
              <span>Channel index loaded with no extra episode cards — use Stream Now above or browse Channels.</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {episodesToShow.map((ep: any, idx: number) => {
                const epHref = isCine18
                  ? `/watch/cine18-${ep.uid || ep.id || series.channelUid}`
                  : `${baseWatchHref}${episodesToShow.length > 1 ? `?ep=${ep.episodeNumber || idx + 1}` : ''}`;
                const epNum = ep.episodeNumber || ep.ep || idx + 1;
                const thumb = ep.portrait_img || ep.banner_img || ep.thumbnailUrl || series.banner || series.poster;

                return (
                  <Link
                    key={ep.id || ep.uid || idx}
                    href={epHref}
                    onClick={onClose}
                    className="p-3 rounded-xl bg-proz-elevated/60 hover:bg-proz-elevated border border-proz-border/70 hover:border-proz-purple/50 flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {thumb && (
                        <img
                          src={thumb}
                          alt={ep.title}
                          referrerPolicy="no-referrer"
                          onError={(e) => applyImgProxyFallback(e, thumb)}
                          className="w-16 h-10 rounded-lg object-cover shrink-0 bg-proz-midnight"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-proz-white truncate">
                          {ep.season ? `S${ep.season}:E${epNum}` : `EP ${epNum}`} • {ep.title}
                        </p>
                        <p className="text-[11px] text-proz-grey flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {ep.duration || 'Full Stream'} • {ep.releaseDate || ep.language || series.studio}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-proz-purple text-white keep-white text-[11px] font-bold shrink-0">
                      Play
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
