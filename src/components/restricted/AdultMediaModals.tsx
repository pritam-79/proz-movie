'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Play,
  Heart,
  Building,
  Users,
  Film,
  Image as ImageIcon,
  Info,
  ChevronLeft,
  ChevronRight,
  Globe,
  Clock,
  Tv,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { normalizeStashId, toStashWatchPath } from '@/lib/utils/streamUtils';

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
  if (!images || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col p-4 sm:p-6">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          <ImageIcon className="w-4 h-4 text-cyan-400 shrink-0" />
          <h3 className="text-sm sm:text-base font-bold text-white truncate">{title}</h3>
          <span className="text-xs text-slate-400 font-mono shrink-0">
            {idx + 1} / {images.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center relative overflow-hidden my-4">
        <img
          src={images[idx]}
          alt={`${title} #${idx + 1}`}
          className="max-h-full max-w-full object-contain rounded-2xl border border-white/10 shadow-2xl"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-2 sm:left-6 p-3 rounded-full bg-black/70 hover:bg-black text-white border border-white/15"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIdx((i) => (i + 1) % images.length)}
              className="absolute right-2 sm:right-6 p-3 rounded-full bg-black/70 hover:bg-black text-white border border-white/15"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 justify-center">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 ${
                i === idx ? 'border-cyan-400' : 'border-white/10 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
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
        if (d.success) {
          setProfile(d);
        } else {
          setError(d.error || 'Performer metadata unavailable');
        }
      })
      .catch((e) => {
        if (active) setError(e?.message || 'Unable to load performer profile');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [performerId]);

  const p = profile?.performer;
  const isFav = favorites.includes(performerId);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B0F1A] border border-white/15 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
            <Users className="w-4 h-4" />
            <span>Performer Profile</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Loading verified performer metadata &amp; indexed scenes...
          </div>
        ) : error || !p ? (
          <div className="py-16 text-center text-xs text-rose-400">
            {error || 'No metadata returned for this performer.'}
          </div>
        ) : (
          <>
            {/* Identity & Metadata — Strictly from source data, zero fabricated fields */}
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="w-36 h-48 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shrink-0 flex items-center justify-center">
                {p.imageUrl || p.imagePath ? (
                  <img
                    src={p.imageUrl || p.imagePath}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users className="w-10 h-10 text-slate-500" />
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-2xl font-black text-white">{p.name}</h2>
                    {p.aliases && (Array.isArray(p.aliases) ? p.aliases.length > 0 : Boolean(p.aliases)) && (
                      <p className="text-xs text-slate-400">
                        Also known as: {Array.isArray(p.aliases) ? p.aliases.slice(0, 4).join(', ') : p.aliases}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onToggleFavorite(performerId)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                      isFav
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
                    <span>{isFav ? 'Favorited' : 'Favorite'}</span>
                  </button>
                </div>

                {p.details && (
                  <p className="text-xs text-slate-300 leading-relaxed">{p.details}</p>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  {p.country && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] text-slate-500 block">Country</span>
                      <span className="text-white font-semibold">{p.country}</span>
                    </div>
                  )}
                  {p.ethnicity && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] text-slate-500 block">Ethnicity</span>
                      <span className="text-white font-semibold">{p.ethnicity}</span>
                    </div>
                  )}
                  {p.hairColor && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] text-slate-500 block">Hair</span>
                      <span className="text-white font-semibold">{p.hairColor}</span>
                    </div>
                  )}
                  {(p.heightCm || p.measurements) && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] text-slate-500 block">Specs</span>
                      <span className="text-white font-semibold">
                        {p.measurements || `${p.heightCm} cm`}
                      </span>
                    </div>
                  )}
                </div>

                {p.studios && p.studios.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">
                      Associated Studios
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {p.studios.map((s: any) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            onClose();
                            onSelectStudio(`stashdb-${s.id}`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-200 text-xs font-medium hover:bg-purple-500/25"
                        >
                          {s.name} ({s.sceneCount || 0})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Available Photos */}
            {profile.photos && profile.photos.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Available Photographs ({profile.photos.length})
                  </h4>
                  <button
                    onClick={() => onOpenPhotos(`${p.name} Photos`, profile.photos)}
                    className="text-xs text-cyan-300 underline"
                  >
                    Open Full Viewer
                  </button>
                </div>
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {profile.photos.slice(0, 8).map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => onOpenPhotos(`${p.name} Photos`, profile.photos)}
                      className="w-24 h-28 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0"
                    >
                      <img src={img} alt={p.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Associated Playable Scenes */}
            {profile.playableScenes && profile.playableScenes.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Playable Scenes in Library ({profile.playableScenes.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {profile.playableScenes.map((sc: any) => (
                    <Link
                      key={sc.id}
                      href={toStashWatchPath(sc.id)}
                      onClick={onClose}
                      className="group rounded-xl overflow-hidden bg-white/[0.04] border border-white/10 hover:border-rose-500/50 transition"
                    >
                      <div className="aspect-video bg-slate-900 relative">
                        {sc.paths?.screenshot && (
                          <img
                            src={sc.paths.screenshot}
                            alt={sc.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-bold text-white truncate">{sc.title}</p>
                        <span className="text-[10px] text-slate-400">
                          {sc.studio?.name || 'Stash Library'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* StashDB Indexed Scene Credits (Metadata Only unless matched) */}
            {profile.catalogScenes && profile.catalogScenes.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Indexed StashDB Credits ({profile.catalogScenes.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {profile.catalogScenes.slice(0, 9).map((sc: any) => (
                    <div
                      key={sc.id}
                      className="rounded-xl overflow-hidden bg-white/[0.03] border border-white/10 p-2.5 space-y-1.5"
                    >
                      {sc.image && (
                        <div className="aspect-video rounded-lg overflow-hidden bg-slate-900">
                          <img src={sc.image} alt={sc.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <p className="text-xs font-bold text-white truncate">{sc.title}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{sc.studioName}</span>
                        <span>{sc.date || 'Metadata Only'}</span>
                      </div>
                      {sc.isPlayable && sc.matchedSceneId ? (
                        <Link
                          href={toStashWatchPath(sc.matchedSceneId)}
                          onClick={onClose}
                          className="block w-full py-1.5 rounded-lg bg-rose-600 text-white text-center text-[11px] font-bold"
                        >
                          Play Matched Media
                        </Link>
                      ) : (
                        <span className="block w-full py-1 rounded-lg bg-white/5 text-slate-400 text-center text-[10px]">
                          Catalog Metadata Only
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
    fetch(`/api/library/stash/studios?id=${encodeURIComponent(studioId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        if (d.success) {
          setDetail(d);
        } else {
          setError(d.error || 'Studio metadata unavailable');
        }
      })
      .catch((e) => {
        if (active) setError(e?.message || 'Failed to load studio catalog');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [studioId]);

  const studio = detail?.studio;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B0F1A] border border-white/15 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
            <Building className="w-4 h-4" />
            <span>Studio Catalogue Profile</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading studio collection...</div>
        ) : error || !studio ? (
          <div className="py-16 text-center text-xs text-rose-400">
            {error || 'Studio details unavailable.'}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shrink-0 flex items-center justify-center">
                {studio.image ? (
                  <img src={studio.image} alt={studio.name} className="w-full h-full object-cover" />
                ) : (
                  <Building className="w-8 h-8 text-purple-400" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">{studio.name}</h2>
                <p className="text-xs text-slate-400 mt-1">{studio.description}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-[10px] font-bold">
                  {studio.category} • {studio.itemCount} Indexed Items
                </span>
              </div>
            </div>

            {detail.playableScenes && detail.playableScenes.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Playable Studio Videos ({detail.playableScenes.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {detail.playableScenes.map((sc: any) => (
                    <Link
                      key={sc.id}
                      href={toStashWatchPath(sc.id)}
                      onClick={onClose}
                      className="group rounded-xl overflow-hidden bg-white/[0.04] border border-white/10 hover:border-rose-500/50 transition"
                    >
                      <div className="aspect-video bg-slate-900 relative">
                        {sc.paths?.screenshot && (
                          <img src={sc.paths.screenshot} alt={sc.title} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-bold text-white truncate">{sc.title}</p>
                        <span className="text-[10px] text-slate-400">{sc.date || 'HD Stream'}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {detail.catalogScenes && detail.catalogScenes.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  StashDB Studio Catalogue ({detail.catalogScenes.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {detail.catalogScenes.slice(0, 9).map((sc: any) => (
                    <div key={sc.id} className="rounded-xl bg-white/[0.03] border border-white/10 p-2.5 space-y-1.5">
                      {sc.image && (
                        <div className="aspect-video rounded-lg overflow-hidden bg-slate-900">
                          <img src={sc.image} alt={sc.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <p className="text-xs font-bold text-white truncate">{sc.title}</p>
                      <span className="text-[10px] text-slate-400 block">{sc.date || 'Indexed Metadata'}</span>
                      {sc.isPlayable && sc.matchedSceneId ? (
                        <Link
                          href={toStashWatchPath(sc.matchedSceneId)}
                          onClick={onClose}
                          className="block py-1.5 rounded-lg bg-rose-600 text-white text-center text-[11px] font-bold"
                        >
                          Play Matched Media
                        </Link>
                      ) : (
                        <span className="block py-1 rounded-lg bg-white/5 text-slate-400 text-center text-[10px]">
                          Metadata Only (No Local Video File)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detail.performers && detail.performers.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Featured Studio Roster
                </h4>
                <div className="flex flex-wrap gap-2">
                  {detail.performers.map((perf: any) => (
                    <button
                      key={perf.id}
                      onClick={() => {
                        onClose();
                        onSelectPerformer(perf.id);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-medium"
                    >
                      {perf.name}
                    </button>
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
  if (!series) return null;

  const episodeList = series.episodes || series.episodeList || [];
  const firstStreamId = episodeList[0]?.streamId || 'stash-sc-001';
  const resumeSec = getProgress(normalizeStashId(firstStreamId));

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B0F1A] border border-white/15 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase">
              {series.subcategory || series.studio || 'Hot Web Series'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-2">{series.title}</h2>
            <p className="text-xs text-slate-400 mt-1">
              {series.seasons} Season(s) • {series.episodesCount || episodeList.length} Episodes • {series.rating}/5.0
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{series.synopsis}</p>

        <div className="flex items-center gap-3">
          <Link
            href={toStashWatchPath(firstStreamId)}
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{resumeSec > 5 ? 'Continue Watching' : 'Play Episode 1'}</span>
          </Link>
        </div>

        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Tv className="w-3.5 h-3.5" /> Season 1 Episodes
          </h4>
          <div className="space-y-2">
            {episodeList.map((ep: any) => {
              const epProg = getProgress(normalizeStashId(ep.streamId));
              return (
                <Link
                  key={ep.ep}
                  href={toStashWatchPath(ep.streamId)}
                  onClick={onClose}
                  className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 flex items-center justify-between gap-3 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-20 aspect-video rounded-xl overflow-hidden bg-slate-900 shrink-0 relative">
                      <img src={series.banner || series.poster} alt={ep.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-white truncate">
                        E{ep.ep}: {ep.title}
                      </p>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> {ep.duration}
                        {epProg > 5 && (
                          <span className="text-cyan-400 font-semibold">• Resume {Math.floor(epProg / 60)}m</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold shrink-0">
                    Play
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
