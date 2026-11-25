'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FolderLock,
  Grid,
  List,
  LayoutGrid,
  Play,
  Search,
  Database,
  RefreshCw,
  CheckCircle2,
  Image as ImageIcon,
  UploadCloud,
  Flame,
  Building,
  Users,
  Glasses,
  Sparkles,
  Tv,
  Compass,
  Globe,
  AlertCircle,
} from 'lucide-react';
import { StashScene, StashPerformer, StashStudio, StashGallery, MediaViewMode } from '@/types/library';
import { toStashWatchPath } from '@/lib/utils/streamUtils';
import StashDbPanel from '@/components/stash/StashDbPanel';
import {
  PerformerProfileModal,
  PhotoGalleryModal,
  StudioDetailModal,
} from '@/components/restricted/AdultMediaModals';

export default function LibraryPage() {
  const [viewMode, setViewMode] = useState<MediaViewMode>('grid');
  const [scenes, setScenes] = useState<StashScene[]>([]);
  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const [galleries, setGalleries] = useState<StashGallery[]>([]);
  const [performers, setPerformers] = useState<StashPerformer[]>([]);
  const [studios, setStudios] = useState<StashStudio[]>([]);
  const [backendStatus, setBackendStatus] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudio, setSelectedStudio] = useState<string>('all');

  const [selectedPerformerId, setSelectedPerformerId] = useState<string | null>(null);
  const [selectedStudioId, setSelectedStudioId] = useState<string | null>(null);
  const [lightboxGallery, setLightboxGallery] = useState<{ title: string; images: string[] } | null>(null);

  const fetchVaultData = useCallback(async () => {
    setLoading(true);
    try {
      const [srvData, scenesData, uploadsData, perfData, studioData, galData] = await Promise.all([
        fetch('/api/library/servers').then((r) => r.json()).catch(() => ({})),
        fetch('/api/library/stash/scenes').then((r) => r.json()).catch(() => ({})),
        fetch('/api/library/stash/recent-uploads').then((r) => r.json()).catch(() => ({})),
        fetch('/api/library/stash/performers').then((r) => r.json()).catch(() => ({})),
        fetch('/api/library/stash/studios').then((r) => r.json()).catch(() => ({})),
        fetch('/api/library/stash/galleries').then((r) => r.json()).catch(() => ({})),
      ]);

      if (srvData?.backendStatus) setBackendStatus(srvData.backendStatus);
      if (scenesData.success) setScenes(scenesData.scenes || []);
      if (uploadsData.success) setRecentUploads(uploadsData.uploads || []);
      if (perfData.success) setPerformers(perfData.performers || []);
      if (studioData.success) setStudios(studioData.studios || []);
      if (galData.success) setGalleries(galData.galleries || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVaultData();
  }, [fetchVaultData]);

  const handleSyncRefresh = async () => {
    setSyncing(true);
    try {
      await fetch('/api/library/stash/sync', { method: 'POST' });
      await fetchVaultData();
    } finally {
      setSyncing(false);
    }
  };

  const filteredScenes = scenes.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.performers?.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStudio = selectedStudio === 'all' || s.studio?.id === selectedStudio;
    return matchesSearch && matchesStudio;
  });

  return (
    <div className="min-h-screen bg-[#06080F] text-white pb-20">
      {/* Header Banner */}
      <div className="border-b border-white/10 bg-gradient-to-r from-[#0A0F1D] via-[#06080F] to-purple-950/20 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold mb-2">
                <FolderLock className="w-3.5 h-3.5" />
                <span>Gallery &amp; Automated Stash Hub</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                Gallery, Recent Uploads &amp; StashDB
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mt-1">
                Unified photo galleries, Recent Uploads synced automatically from Stash, PRO 18+ ecosystem sections, and metadata-only StashDB catalogue.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleSyncRefresh}
                disabled={syncing}
                className="px-4 py-2 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing...' : 'Sync Stash Backend'}</span>
              </button>
              <Link
                href="/restricted"
                className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/35 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Open Full PRO 18+ Ecosystem</span>
              </Link>
            </div>
          </div>

          {/* Automatic Backend Connection Indicators */}
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {backendStatus?.stashdb?.connected
                ? `StashDB Auto-Connected (${backendStatus.stashdb.indexedScenesCount.toLocaleString()} scenes)`
                : 'StashDB Backend Ready'}
            </span>
            {backendStatus?.personalStash && !backendStatus.personalStash.configured && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                Personal Stash Server: STASH_SERVER_URL unset in backend
              </span>
            )}
          </div>

          {/* Complete PRO 18+ Category Quick Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
              { label: 'Recent Uploads', tab: 'recent_uploads', icon: UploadCloud },
              { label: 'Studios', tab: 'studios', icon: Building },
              { label: 'Performers', tab: 'performers', icon: Users },
              { label: 'Tube Hub', tab: 'tubes', icon: Globe },
              { label: '3D VR', tab: 'vr', icon: Glasses },
              { label: 'Hentai & 3D', tab: 'hentai', icon: Sparkles },
              { label: 'Hot Series', tab: 'series', icon: Tv },
              { label: 'Recommended', tab: 'recommendations', icon: Compass },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.tab}
                  href={`/restricted?tab=${item.tab}`}
                  className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/40 flex items-center gap-2 text-xs font-semibold text-slate-200 transition"
                >
                  <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* Recent Uploads Carousel (Photos + Videos) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-cyan-400" />
                <span>Recent Uploads</span>
              </h2>
              <p className="text-xs text-slate-400">
                Recently uploaded photos, galleries, collections, and synced Stash videos.
              </p>
            </div>
            <Link
              href="/restricted?tab=recent_uploads"
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300"
            >
              View All Recent Uploads →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {recentUploads.slice(0, 8).map((u) => (
              <div
                key={`lib-up-${u.kind}-${u.id}`}
                className="rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 hover:border-cyan-500/40 transition flex flex-col justify-between"
              >
                <div className="aspect-video bg-slate-900 relative overflow-hidden">
                  {u.thumbnail && (
                    <img src={u.thumbnail} alt={u.title} className="w-full h-full object-cover" loading="lazy" />
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/80 text-[10px] font-bold text-cyan-300 uppercase">
                    {u.kind === 'photo_gallery' ? 'Photos' : u.kind === 'collection' ? 'Collection' : 'Video'}
                  </span>
                </div>
                <div className="p-3 space-y-2">
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">{u.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {u.uploadedAt} • {u.durationOrCount}
                  </p>
                  {u.galleryImages ? (
                    <button
                      onClick={() => setLightboxGallery({ title: u.title, images: u.galleryImages })}
                      className="w-full py-1.5 rounded-lg bg-cyan-600/20 text-cyan-200 border border-cyan-500/30 text-xs font-bold"
                    >
                      Open Gallery
                    </button>
                  ) : (
                    <Link
                      href={u.watchHref || toStashWatchPath(u.id)}
                      className="w-full py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Play Video</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Adult Photo Galleries Grid */}
        {galleries.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-rose-400" />
              <span>Photo Galleries ({galleries.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {galleries.map((gal) => (
                <button
                  key={gal.id}
                  onClick={() => setLightboxGallery({ title: gal.title, images: gal.images || (gal.coverPath ? [gal.coverPath] : []) })}
                  className="text-left rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 hover:border-cyan-400/50 transition"
                >
                  <div className="aspect-video bg-slate-900 relative">
                    <img src={gal.coverPath || ''} alt={gal.title} className="w-full h-full object-cover" loading="lazy" />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-cyan-300">
                      {gal.imageCount} Photos
                    </span>
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-bold text-white truncate">{gal.title}</h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {gal.studio?.name || 'Gallery'} • {gal.date}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Search + Filter Controls for Playable Stash Library */}
        <section className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search scenes, performers, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <select
                value={selectedStudio}
                onChange={(e) => setSelectedStudio(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-purple-500 focus:outline-none"
              >
                <option value="all">All Studios ({studios.length})</option>
                {studios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 self-start">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'compact' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-video rounded-2xl bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          ) : filteredScenes.length === 0 ? (
            <div className="text-center py-14 bg-white/[0.02] border border-white/10 rounded-2xl p-8">
              <Database className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No Matching Library Scenes</h3>
              <p className="text-xs text-slate-400">Try clearing your search or studio filter.</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-2.5">
              {filteredScenes.map((scene) => (
                <div
                  key={scene.id}
                  className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4 transition"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-28 aspect-video rounded-xl overflow-hidden bg-slate-900 shrink-0 relative">
                      {scene.paths?.screenshot && (
                        <img src={scene.paths.screenshot} alt={scene.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white truncate">{scene.title}</h3>
                      <p className="text-xs text-slate-400">
                        {scene.studio?.name || 'Stash Vault'} • {Math.floor((scene.files?.[0]?.duration || 0) / 60)}m
                      </p>
                    </div>
                  </div>
                  <Link
                    href={toStashWatchPath(scene.id)}
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" /> Play
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`grid gap-4 ${
                viewMode === 'compact'
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                  : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              }`}
            >
              {filteredScenes.map((scene) => (
                <Link
                  key={scene.id}
                  href={toStashWatchPath(scene.id)}
                  className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-purple-500/40 rounded-2xl overflow-hidden transition flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-video bg-slate-900 relative overflow-hidden">
                      {scene.paths?.screenshot && (
                        <img
                          src={scene.paths.screenshot}
                          alt={scene.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <Play className="w-9 h-9 text-white fill-white" />
                      </div>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                        {scene.files?.[0]?.height ? `${scene.files[0].height}p` : 'HD'}
                      </span>
                    </div>
                    <div className="p-3.5 space-y-1.5">
                      <h3 className="font-bold text-white text-sm line-clamp-1">{scene.title}</h3>
                      <p className="text-[11px] text-slate-400 truncate">
                        {scene.studio?.name || 'Stash Vault'} • {(scene.performers || []).map((p) => p.name).join(', ')}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Featured Performers Quick Directory */}
        {performers.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-rose-400" />
                <span>Featured Performers ({performers.length})</span>
              </h2>
              <Link
                href="/restricted?tab=performers"
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300"
              >
                Full Performers Directory →
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {performers.slice(0, 12).map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPerformerId(p.id)}
                  className="w-32 shrink-0 rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 hover:border-rose-500/40 transition text-left"
                >
                  <div className="aspect-[3/4] bg-slate-900">
                    {(p.image || p.imagePath) && (
                      <img src={p.image || p.imagePath} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-bold text-white truncate">{p.name}</p>
                    <span className="text-[10px] text-slate-400 truncate block">
                      {p.sceneCount || 0} credits
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Live StashDB GraphQL Metadata Catalogue */}
        <StashDbPanel
          onSelectPerformer={(id) => setSelectedPerformerId(id)}
          onSelectStudio={(id) => setSelectedStudioId(id)}
        />
      </div>

      {selectedPerformerId && (
        <PerformerProfileModal
          performerId={selectedPerformerId}
          favorites={[]}
          onToggleFavorite={() => {}}
          onSelectStudio={(sid) => setSelectedStudioId(sid)}
          onOpenPhotos={(title, images) => setLightboxGallery({ title, images })}
          onClose={() => setSelectedPerformerId(null)}
        />
      )}

      {selectedStudioId && (
        <StudioDetailModal
          studioId={selectedStudioId}
          onSelectPerformer={(pid) => setSelectedPerformerId(pid)}
          onClose={() => setSelectedStudioId(null)}
        />
      )}

      {lightboxGallery && (
        <PhotoGalleryModal
          title={lightboxGallery.title}
          images={lightboxGallery.images}
          onClose={() => setLightboxGallery(null)}
        />
      )}
    </div>
  );
}
