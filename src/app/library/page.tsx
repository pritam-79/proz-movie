'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Play,
  Search,
  RefreshCw,
  Grid,
  LayoutGrid,
  List,
  Image as ImageIcon,
  ListVideo,
  Download,
  Tv,
  History,
  Flame,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Settings,
} from 'lucide-react';
import { StashScene, StashGallery, MediaViewMode } from '@/types/library';
import { toStashWatchPath, formatResolutionBadge, toImageProxyFallback } from '@/lib/utils/streamUtils';
import { diagnosticFetch } from '@/lib/diagnostics/bugDetector';
import { PhotoGalleryModal } from '@/components/restricted/AdultMediaModals';
import StashDbPanel from '@/components/stash/StashDbPanel';

const GALLERY_CATEGORIES = [
  'All',
  'Portrait Sets',
  'Scene Stills',
  'Hentai & Anime CG',
  'VR & 3D Stills',
];

function imgFallback(e: React.SyntheticEvent<HTMLImageElement>, rawSrc?: string) {
  const img = e.currentTarget;
  if (!img.dataset.proxied && rawSrc && !rawSrc.startsWith('/') && !rawSrc.startsWith('data:')) {
    img.dataset.proxied = '1';
    img.src = toImageProxyFallback(rawSrc);
  }
}

export default function MediaLibraryPage() {
  const [scenes, setScenes] = useState<StashScene[]>([]);
  const [galleries, setGalleries] = useState<StashGallery[]>([]);
  const [galleryTotal, setGalleryTotal] = useState(0);
  const [galleryPage, setGalleryPage] = useState(1);
  const [galleryHasMore, setGalleryHasMore] = useState(false);
  const [galleryCategory, setGalleryCategory] = useState('All');

  const [loading, setLoading] = useState(true);
  const [loadingMoreGalleries, setLoadingMoreGalleries] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [resFilter, setResFilter] = useState('all');
  const [viewMode, setViewMode] = useState<MediaViewMode>('grid');
  const [activeLightbox, setActiveLightbox] = useState<{ title: string; images: string[] } | null>(null);

  const mountedRef = useRef(false);

  const fetchScenesAndInitialGalleries = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const sp = new URLSearchParams();
      if (searchQuery.trim()) sp.set('q', searchQuery.trim());
      if (sortBy) sp.set('sort', sortBy);
      if (resFilter !== 'all') sp.set('resolution', resFilter);

      const gsp = new URLSearchParams({ page: '1', category: galleryCategory });
      if (searchQuery.trim()) gsp.set('q', searchQuery.trim());

      const [scRes, galRes] = await Promise.all([
        diagnosticFetch(`/api/library/stash/scenes?${sp.toString()}`, { category: 'stash' }),
        diagnosticFetch(`/api/library/stash/galleries?${gsp.toString()}`, { category: 'stash' }),
      ]);

      const [scJson, galJson] = await Promise.all([scRes.json(), galRes.json()]);
      if (scJson.success) {
        setScenes(Array.isArray(scJson.scenes) ? scJson.scenes : []);
      } else {
        setErrorMsg(scJson.error || 'Failed to load indexed scenes');
      }

      if (galJson.success) {
        setGalleries(Array.isArray(galJson.galleries) ? galJson.galleries : []);
        setGalleryTotal(galJson.totalCount || galJson.galleries?.length || 0);
        setGalleryHasMore(Boolean(galJson.hasMore));
        setGalleryPage(1);
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Unable to connect to Gallery & Library API');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy, resFilter, galleryCategory]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
    }
    const t = setTimeout(() => {
      fetchScenesAndInitialGalleries();
    }, 120);
    return () => clearTimeout(t);
  }, [fetchScenesAndInitialGalleries]);

  const loadMoreGalleries = async () => {
    if (loadingMoreGalleries || !galleryHasMore) return;
    setLoadingMoreGalleries(true);
    try {
      const nextPage = galleryPage + 1;
      const gsp = new URLSearchParams({
        page: String(nextPage),
        category: galleryCategory,
      });
      if (searchQuery.trim()) gsp.set('q', searchQuery.trim());
      const res = await diagnosticFetch(`/api/library/stash/galleries?${gsp.toString()}`, {
        category: 'stash',
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.galleries)) {
        setGalleries((prev) => {
          const seen = new Set(prev.map((g) => g.id));
          return [...prev, ...data.galleries.filter((g: StashGallery) => !seen.has(g.id))];
        });
        setGalleryPage(nextPage);
        setGalleryHasMore(Boolean(data.hasMore));
        if (data.totalCount) setGalleryTotal(data.totalCount);
      }
    } finally {
      setLoadingMoreGalleries(false);
    }
  };

  const handleSyncBackend = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await diagnosticFetch('/api/library/stash/sync', {
        method: 'POST',
        category: 'stash',
      });
      const data = await res.json();
      if (data.success) {
        setSyncMsg(
          `Synced ${data.summary?.scenesUpdated || 0} playable scenes • ${data.summary?.galleriesUpdated || 0} galleries`
        );
        await fetchScenesAndInitialGalleries();
      } else {
        setSyncMsg(data.error || 'Backend sync failed');
      }
    } catch {
      setSyncMsg('Network error during sync');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-proz-midnight text-proz-white pb-24">
      {/* Hero Header */}
      <div className="border-b border-proz-border/50 bg-gradient-to-br from-proz-navy via-proz-midnight to-proz-purple/10 py-7 sm:py-9">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-proz-purple/15 border border-proz-purple/30 text-proz-purple text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Media Gallery & Stash Library</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-proz-white">
                Playable Archive, Photo Galleries &amp; Stash Ecosystem
              </h1>
              <p className="text-xs sm:text-sm text-proz-grey max-w-2xl">
                Unified personal Stash GraphQL, Cine18 OTT archives, curated Photo Galleries, and StashDB community matching with zero broken thumbnails.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleSyncBackend}
                disabled={syncing}
                className="px-4 py-2 rounded-xl glass-button-primary text-xs font-bold flex items-center gap-1.5 disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing Vault...' : 'Sync Backend'}</span>
              </button>
              <Link
                href="/restricted"
                className="px-4 py-2 rounded-xl bg-proz-elevated hover:bg-proz-purple/20 border border-proz-border text-xs font-bold text-proz-white flex items-center gap-1.5 transition"
              >
                <Flame className="w-3.5 h-3.5 text-proz-purple" />
                <span>PRO 18+ Zone</span>
              </Link>
              <Link
                href="/settings"
                className="px-3.5 py-2 rounded-xl bg-proz-elevated hover:bg-proz-border border border-proz-border text-xs font-semibold text-proz-grey hover:text-proz-white flex items-center gap-1.5 transition"
              >
                <Settings className="w-3.5 h-3.5 text-proz-cyan" />
                <span>Health</span>
              </Link>
            </div>
          </div>

          {syncMsg && (
            <div className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{syncMsg}</span>
            </div>
          )}

          {/* Quick Sub-Links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Link
              href="/library/playlists"
              className="p-2.5 rounded-xl cinema-card hover:border-proz-cyan/50 flex items-center gap-2 text-xs font-semibold text-proz-white transition"
            >
              <ListVideo className="w-4 h-4 text-proz-cyan shrink-0" />
              <span>Playlists</span>
            </Link>
            <Link
              href="/library/downloads"
              className="p-2.5 rounded-xl cinema-card hover:border-proz-cyan/50 flex items-center gap-2 text-xs font-semibold text-proz-white transition"
            >
              <Download className="w-4 h-4 text-proz-purple shrink-0" />
              <span>Offline Downloads</span>
            </Link>
            <Link
              href="/tv"
              className="p-2.5 rounded-xl cinema-card hover:border-proz-cyan/50 flex items-center gap-2 text-xs font-semibold text-proz-white transition"
            >
              <Tv className="w-4 h-4 text-proz-cyan shrink-0" />
              <span>10-Foot TV Mode</span>
            </Link>
            <Link
              href="/timeline"
              className="p-2.5 rounded-xl cinema-card hover:border-proz-cyan/50 flex items-center gap-2 text-xs font-semibold text-proz-white transition"
            >
              <History className="w-4 h-4 text-proz-purple shrink-0" />
              <span>Watch Timeline</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-10">
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/35 text-xs text-rose-300 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </span>
            <button
              type="button"
              onClick={fetchScenesAndInitialGalleries}
              className="px-3 py-1 rounded-lg bg-rose-600 text-white keep-white font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Photo Galleries Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-proz-cyan" />
              <h2 className="text-lg sm:text-xl font-black text-proz-white">
                Photo Galleries &amp; Lookbooks ({galleryTotal})
              </h2>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {GALLERY_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setGalleryCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition ${
                    galleryCategory === cat
                      ? 'bg-proz-purple text-white keep-white border-proz-purple shadow-purple-glow'
                      : 'bg-proz-elevated border-proz-border text-proz-grey hover:text-proz-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] rounded-2xl bg-proz-elevated/60 animate-pulse border border-proz-border/40" />
              ))}
            </div>
          ) : galleries.length === 0 ? (
            <div className="p-6 rounded-2xl cinema-card text-center text-xs text-proz-grey">
              No galleries match this category or search query right now.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {galleries.map((gal) => {
                  const imgs = gal.images && gal.images.length > 0 ? gal.images : gal.coverPath ? [gal.coverPath] : [];
                  return (
                    <button
                      type="button"
                      key={gal.id}
                      onClick={() =>
                        imgs.length > 0 && setActiveLightbox({ title: gal.title, images: imgs })
                      }
                      className="group text-left rounded-2xl overflow-hidden cinema-card cinema-card-hover flex flex-col justify-between"
                    >
                      <div className="relative aspect-[4/3] w-full bg-proz-elevated overflow-hidden">
                        {gal.coverPath ? (
                          <img
                            src={gal.coverPath}
                            alt={gal.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => imgFallback(e, gal.coverPath)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-proz-grey">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white keep-white text-[10px] font-bold">
                          {gal.imageCount} Photos
                        </span>
                      </div>
                      <div className="p-3 space-y-1">
                        <h3 className="text-xs font-bold text-proz-white line-clamp-1 group-hover:text-proz-cyan transition-colors">
                          {gal.title}
                        </h3>
                        <p className="text-[11px] text-proz-grey truncate">
                          {gal.studio?.name || 'Archive Gallery'} {gal.date ? `• ${gal.date}` : ''}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {galleryHasMore && (
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={loadMoreGalleries}
                    disabled={loadingMoreGalleries}
                    className="px-5 py-2 rounded-xl bg-proz-elevated hover:bg-proz-purple/20 border border-proz-border text-xs font-bold text-proz-white transition disabled:opacity-50"
                  >
                    {loadingMoreGalleries ? 'Loading More Galleries...' : 'Load More Galleries'}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Filter & Playable Scenes */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-proz-purple" />
              <h2 className="text-lg sm:text-xl font-black text-proz-white">
                Playable Streams &amp; Scenes ({scenes.length})
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-proz-grey absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search scenes, performers..."
                  className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs"
                />
              </div>

              <select
                value={resFilter}
                onChange={(e) => setResFilter(e.target.value)}
                className="glass-input rounded-xl px-3 py-2 text-xs"
              >
                <option value="all">All Resolutions</option>
                <option value="4k">4K UHD (2160p)</option>
                <option value="1080p">1080p Full HD+</option>
                <option value="720p">720p HD</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="glass-input rounded-xl px-3 py-2 text-xs"
              >
                <option value="date">Newest First</option>
                <option value="popular">Most Viewed</option>
                <option value="rating">Highest Rated</option>
                <option value="title">Title A-Z</option>
              </select>

              <div className="flex items-center gap-1 bg-proz-elevated p-1 rounded-xl border border-proz-border">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-proz-purple text-white keep-white' : 'text-proz-grey hover:text-proz-white'}`}
                  aria-label="Grid view"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('compact')}
                  className={`p-1.5 rounded-lg transition ${viewMode === 'compact' ? 'bg-proz-purple text-white keep-white' : 'text-proz-grey hover:text-proz-white'}`}
                  aria-label="Compact view"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-proz-purple text-white keep-white' : 'text-proz-grey hover:text-proz-white'}`}
                  aria-label="List view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-video rounded-2xl bg-proz-elevated/60 animate-pulse border border-proz-border/40" />
              ))}
            </div>
          ) : scenes.length === 0 ? (
            <div className="p-8 rounded-2xl cinema-card text-center text-xs text-proz-grey">
              No playable scenes match these filters. Try clearing filters or syncing backend.
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-2">
              {scenes.slice(0, 60).map((sc) => {
                const badge = formatResolutionBadge(sc.files?.[0]?.width, sc.files?.[0]?.height);
                return (
                  <Link
                    key={sc.id}
                    href={toStashWatchPath(sc.id)}
                    className="p-3 rounded-2xl cinema-card hover:border-proz-purple/50 flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={sc.paths?.screenshot || ''}
                        alt={sc.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => imgFallback(e, sc.paths?.screenshot)}
                        className="w-24 h-14 rounded-xl object-cover bg-proz-elevated shrink-0"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-proz-white truncate">{sc.title}</h3>
                        <p className="text-xs text-proz-grey truncate">
                          {sc.studio?.name || 'Stash Vault'} {sc.date ? `• ${sc.date}` : ''} {badge ? `• ${badge}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-xl glass-button-primary text-xs font-bold shrink-0">
                      Play
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div
              className={`grid gap-4 ${
                viewMode === 'compact'
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              }`}
            >
              {scenes.slice(0, 60).map((sc) => {
                const badge = formatResolutionBadge(sc.files?.[0]?.width, sc.files?.[0]?.height);
                return (
                  <Link
                    key={sc.id}
                    href={toStashWatchPath(sc.id)}
                    className="group cinema-card cinema-card-hover rounded-2xl overflow-hidden flex flex-col justify-between"
                  >
                    <div className="relative aspect-video bg-proz-elevated overflow-hidden">
                      {sc.paths?.screenshot && (
                        <img
                          src={sc.paths.screenshot}
                          alt={sc.title}
                          referrerPolicy="no-referrer"
                          onError={(e) => imgFallback(e, sc.paths?.screenshot)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      )}
                      {badge && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-proz-cyan text-[10px] font-bold">
                          {badge}
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="p-2.5 rounded-full bg-proz-purple text-white keep-white shadow-purple-glow">
                          <Play className="w-4 h-4 fill-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3 space-y-1">
                      <h3 className="text-xs sm:text-sm font-bold text-proz-white line-clamp-1 group-hover:text-proz-purple transition-colors">
                        {sc.title}
                      </h3>
                      <p className="text-[11px] text-proz-grey truncate">
                        {sc.studio?.name || 'Stash Vault'} {sc.date ? `• ${sc.date}` : ''}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* StashDB Community Panel */}
        <section className="space-y-3">
          <StashDbPanel />
        </section>
      </div>

      {activeLightbox && (
        <PhotoGalleryModal
          title={activeLightbox.title}
          images={activeLightbox.images}
          onClose={() => setActiveLightbox(null)}
        />
      )}
    </div>
  );
}
