'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ShieldAlert,
  Lock,
  Play,
  Flame,
  Users,
  Tag as TagIcon,
  Image as ImageIcon,
  Search,
  Database,
  CheckCircle2,
  Heart,
  Tv,
  Sparkles,
  Glasses,
  Globe,
  ExternalLink,
  RefreshCw,
  Clock,
  Building,
  Layers,
  AlertCircle,
  Bookmark,
  ChevronRight,
  Compass,
  UploadCloud,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { normalizeStashId, toStashWatchPath } from '@/lib/utils/streamUtils';
import { StashScene, StashGallery } from '@/types/library';
import {
  CURATED_ADULT_SCENES,
  CURATED_HOT_WEB_SERIES,
  CURATED_HENTAI_COLLECTIONS,
  CURATED_VR_SCENES,
  VERIFIED_ADULT_TUBE_PORTALS,
} from '@/lib/providers/stash';
import StashDbPanel from '@/components/stash/StashDbPanel';
import {
  PerformerProfileModal,
  PhotoGalleryModal,
  SeriesDetailModal,
  StudioDetailModal,
} from '@/components/restricted/AdultMediaModals';

type RestrictedTab =
  | 'all'
  | 'recent_uploads'
  | 'movies'
  | 'series'
  | 'studios'
  | 'performers'
  | 'tubes'
  | 'vr'
  | 'hentai'
  | 'galleries'
  | 'stashdb'
  | 'recommendations';

const STORAGE_FAV_KEY = 'proz_18_favorites_v1';
const STORAGE_RECENT_TUBES_KEY = 'proz_18_recent_tubes_v1';

function RestrictedContent() {
  const searchParams = useSearchParams();
  const { user, verify18Plus, watchHistory } = useAuth();

  // Age Gate
  const [birthYear, setBirthYear] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const isUnlocked = user?.is18PlusVerified || false;

  // Navigation & Filters
  const [activeTab, setActiveTab] = useState<RestrictedTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'popular' | 'rating' | 'title'>('newest');
  const [resolutionFilter, setResolutionFilter] = useState<string>('all');
  const [studioFilter, setStudioFilter] = useState<string>('all');
  const [uploadKindFilter, setUploadKindFilter] = useState<'all' | 'video' | 'photo_gallery' | 'collection'>('all');
  const [hentaiSubcat, setHentaiSubcat] = useState<string>('All');
  const [seriesSubcat, setSeriesSubcat] = useState<string>('All');
  const [tubeCatFilter, setTubeCatFilter] = useState<string>('All');
  const [pageLimit, setPageLimit] = useState(24);

  // Sync URL query param (?tab=...)
  useEffect(() => {
    const tabParam = searchParams.get('tab') as RestrictedTab | null;
    if (tabParam) setActiveTab(tabParam);
  }, [searchParams]);

  // Persistent Favorites & Recent Tubes
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentTubeIds, setRecentTubeIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const f = localStorage.getItem(STORAGE_FAV_KEY);
      if (f) setFavorites(JSON.parse(f));
      const rt = localStorage.getItem(STORAGE_RECENT_TUBES_KEY);
      if (rt) setRecentTubeIds(JSON.parse(rt));
    } catch {}
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev];
      try {
        localStorage.setItem(STORAGE_FAV_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const recordTubeAccess = useCallback((tubeId: string) => {
    setRecentTubeIds((prev) => {
      const next = [tubeId, ...prev.filter((id) => id !== tubeId)].slice(0, 8);
      try {
        localStorage.setItem(STORAGE_RECENT_TUBES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Backend Data States (100% automatic backend connection)
  const [backendStatus, setBackendStatus] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [scenes, setScenes] = useState<StashScene[]>(CURATED_ADULT_SCENES);
  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const [performers, setPerformers] = useState<any[]>([]);
  const [studios, setStudios] = useState<any[]>([]);
  const [galleries, setGalleries] = useState<StashGallery[]>([]);
  const [recommendations, setRecommendations] = useState<any>(null);

  // Interactive Detail Modals
  const [selectedPerformerId, setSelectedPerformerId] = useState<string | null>(null);
  const [selectedStudioId, setSelectedStudioId] = useState<string | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<any | null>(null);
  const [lightboxGallery, setLightboxGallery] = useState<{ title: string; images: string[] } | null>(null);

  const loadAllEcosystemData = useCallback(async () => {
    setLoadingData(true);
    try {
      const watchedIds = watchHistory.map((h) => h.contentId).join(',');
      const favIds = favorites.join(',');

      const [srvRes, scenesRes, uploadsRes, perfsRes, studiosRes, galRes, recRes] =
        await Promise.all([
          fetch('/api/library/servers').then((r) => r.json()).catch(() => ({})),
          fetch('/api/library/stash/scenes').then((r) => r.json()).catch(() => ({})),
          fetch('/api/library/stash/recent-uploads').then((r) => r.json()).catch(() => ({})),
          fetch('/api/library/stash/performers').then((r) => r.json()).catch(() => ({})),
          fetch('/api/library/stash/studios').then((r) => r.json()).catch(() => ({})),
          fetch('/api/library/stash/galleries').then((r) => r.json()).catch(() => ({})),
          fetch(
            `/api/library/stash/recommendations?watched=${encodeURIComponent(
              watchedIds
            )}&favorites=${encodeURIComponent(favIds)}`
          )
            .then((r) => r.json())
            .catch(() => ({})),
        ]);

      if (srvRes?.backendStatus) setBackendStatus(srvRes.backendStatus);
      if (Array.isArray(scenesRes?.scenes) && scenesRes.scenes.length > 0) {
        setScenes(scenesRes.scenes);
      }
      if (Array.isArray(uploadsRes?.uploads)) setRecentUploads(uploadsRes.uploads);
      if (Array.isArray(perfsRes?.performers)) setPerformers(perfsRes.performers);
      if (Array.isArray(studiosRes?.studios)) setStudios(studiosRes.studios);
      if (Array.isArray(galRes?.galleries)) setGalleries(galRes.galleries);
      if (recRes?.recommendations) setRecommendations(recRes.recommendations);
    } finally {
      setLoadingData(false);
    }
  }, [favorites, watchHistory]);

  useEffect(() => {
    if (isUnlocked) {
      loadAllEcosystemData();
    }
  }, [isUnlocked, loadAllEcosystemData]);

  const handleManualRefreshSync = async () => {
    setSyncing(true);
    try {
      await fetch('/api/library/stash/sync', { method: 'POST' });
      await loadAllEcosystemData();
    } finally {
      setSyncing(false);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const year = parseInt(birthYear, 10);
    const currentYear = new Date().getFullYear();

    if (isNaN(year) || year < 1920 || year > currentYear) {
      setErrorMsg('Please enter a valid 4-digit birth year.');
      return;
    }
    if (currentYear - year < 18) {
      setErrorMsg('Access denied: You must be at least 18 years old.');
      return;
    }
    verify18Plus(`${birthYear}-01-01`);
  };

  // Derived Enriched Lists
  const vrItems = useMemo(
    () =>
      CURATED_VR_SCENES.map((vr, i) => ({
        ...vr,
        isVr: true,
        vrFormat: i % 2 === 0 ? 'Stereoscopic 180° SBS' : '360° Interactive WebXR',
      })),
    []
  );

  const safeTubes = useMemo(
    () =>
      VERIFIED_ADULT_TUBE_PORTALS.map((t) => ({
        ...t,
        allowsInAppPlayback: false,
        limitation: 'External Site Directory — Direct in-app streaming not permitted by host site.',
      })),
    []
  );

  const filteredScenes = useMemo(() => {
    let list = [...scenes];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.studio?.name || '').toLowerCase().includes(q) ||
          (s.performers || []).some((p) => p.name.toLowerCase().includes(q)) ||
          (s.tags || []).some((t) => t.name.toLowerCase().includes(q))
      );
    }
    if (studioFilter !== 'all') {
      list = list.filter((s) => s.studio?.name === studioFilter);
    }
    if (resolutionFilter !== 'all') {
      list = list.filter((s) => {
        const h = s.files?.[0]?.height || 1080;
        if (resolutionFilter === '4k') return h >= 2160;
        if (resolutionFilter === '1080p') return h >= 1080;
        return h < 1080;
      });
    }
    if (sortOrder === 'popular') list.sort((a, b) => (b.oCounter || 0) - (a.oCounter || 0));
    else if (sortOrder === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortOrder === 'title') list.sort((a, b) => a.title.localeCompare(b.title));
    else list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return list;
  }, [scenes, searchQuery, studioFilter, resolutionFilter, sortOrder]);

  const filteredUploads = useMemo(() => {
    let list = [...recentUploads];
    if (uploadKindFilter !== 'all') {
      list = list.filter((u) => u.kind === uploadKindFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (u) =>
          u.title.toLowerCase().includes(q) ||
          u.category.toLowerCase().includes(q) ||
          (u.studioName || '').toLowerCase().includes(q)
      );
    }
    if (sortOrder === 'popular') list.sort((a, b) => (b.views || 0) - (a.views || 0));
    else if (sortOrder === 'title') list.sort((a, b) => a.title.localeCompare(b.title));
    else list.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
    return list;
  }, [recentUploads, uploadKindFilter, searchQuery, sortOrder]);

  const filteredPerformers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return q
      ? performers.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.country || '').toLowerCase().includes(q)
        )
      : performers;
  }, [performers, searchQuery]);

  const filteredStudios = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return q
      ? studios.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.category.toLowerCase().includes(q)
        )
      : studios;
  }, [studios, searchQuery]);

  const filteredHentai = useMemo(() => {
    let list = CURATED_HENTAI_COLLECTIONS.map((h) => ({
      ...h,
      subType: h.type.toLowerCase().includes('3d')
        ? h.type.toLowerCase().includes('cgi')
          ? 'CGI'
          : '3D Animation'
        : h.type.toLowerCase().includes('hentai')
        ? 'Hentai'
        : 'Animated Adult',
    }));
    if (hentaiSubcat !== 'All') {
      list = list.filter(
        (h) =>
          h.subType === hentaiSubcat ||
          h.type.toLowerCase().includes(hentaiSubcat.toLowerCase()) ||
          h.tags.some((t) => t.toLowerCase().includes(hentaiSubcat.toLowerCase())) ||
          h.synopsis.toLowerCase().includes(hentaiSubcat.toLowerCase())
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (h) => h.title.toLowerCase().includes(q) || h.studio.toLowerCase().includes(q)
      );
    }
    return list;
  }, [hentaiSubcat, searchQuery]);

  const filteredSeries = useMemo(() => {
    let list = CURATED_HOT_WEB_SERIES.map((s) => ({
      ...s,
      subcategory: s.studio.toLowerCase().includes('ullu') || s.studio.toLowerCase().includes('alt')
        ? 'Regional Series'
        : 'Adult Web Series',
    }));
    if (seriesSubcat !== 'All') {
      list = list.filter(
        (s) =>
          s.subcategory === seriesSubcat ||
          s.genres.some((g) => g.toLowerCase().includes(seriesSubcat.toLowerCase()))
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) => s.title.toLowerCase().includes(q) || s.studio.toLowerCase().includes(q)
      );
    }
    return list;
  }, [seriesSubcat, searchQuery]);

  const filteredTubes = useMemo(() => {
    let list = safeTubes;
    if (tubeCatFilter !== 'All') {
      list = list.filter((t) => t.category.toLowerCase().includes(tubeCatFilter.toLowerCase()));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [safeTubes, tubeCatFilter, searchQuery]);

  const uniqueStudioNames = useMemo(
    () => Array.from(new Set(scenes.map((s) => s.studio?.name).filter(Boolean))) as string[],
    [scenes]
  );

  // Continue Watching & Favorites resolved against real library
  const continueWatchingItems = useMemo(() => {
    const stashHistory = watchHistory.filter(
      (h) => h.contentId.startsWith('stash-') || h.contentId.startsWith('cine18-')
    );
    return stashHistory
      .map((h) => {
        const cleanId = h.contentId.replace(/^(stash-)+/, '');
        const match = scenes.find(
          (s) => s.id === h.contentId || s.id === cleanId || s.id === `stash-${cleanId}`
        );
        return match
          ? {
              ...match,
              progressSeconds: h.progressSeconds,
              totalDurationSeconds: h.totalDurationSeconds,
            }
          : null;
      })
      .filter(Boolean) as any[];
  }, [watchHistory, scenes]);

  const favoriteScenes = useMemo(
    () => scenes.filter((s) => favorites.includes(s.id) || favorites.includes(normalizeStashId(s.id))),
    [scenes, favorites]
  );

  const navCategories: Array<{ id: RestrictedTab; label: string; icon: any; count?: number }> = [
    { id: 'all', label: 'All Stash & Adult Media', icon: Layers },
    { id: 'recent_uploads', label: 'Recent Uploads', icon: UploadCloud, count: recentUploads.length },
    { id: 'movies', label: 'Movies & Scenes', icon: Flame, count: scenes.length },
    { id: 'series', label: 'Hot Web Series', icon: Tv, count: CURATED_HOT_WEB_SERIES.length },
    { id: 'studios', label: 'Studios', icon: Building, count: studios.length },
    { id: 'performers', label: 'Performers', icon: Users, count: performers.length },
    { id: 'tubes', label: 'Tube Hub', icon: Globe, count: safeTubes.length },
    { id: 'vr', label: '3D VR & Interactive', icon: Glasses, count: vrItems.length },
    { id: 'hentai', label: 'Hentai & 3D', icon: Sparkles, count: CURATED_HENTAI_COLLECTIONS.length },
    { id: 'galleries', label: 'Photo Galleries', icon: ImageIcon, count: galleries.length },
    { id: 'stashdb', label: 'StashDB Catalogue', icon: Database },
    { id: 'recommendations', label: 'Recommended', icon: Compass },
  ];

  // ─── 18+ STRICT COMPLIANCE AGE GATE ───────────────────────────────────────────
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#06080F] flex flex-col items-center justify-center p-4 sm:p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-rose-500/40 shadow-[0_0_50px_rgba(225,29,72,0.18)] space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-[10px] font-bold tracking-widest uppercase text-rose-400">
              Statutory 18+ Age Verification
            </span>
            <h1 className="text-2xl font-black text-white">PRO 18+ Adult Ecosystem</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              This section provides age-gated adult entertainment, Stash library sync, and StashDB metadata strictly for consenting adults aged 18 and older.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/20 text-[11px] text-rose-200/90 text-left space-y-1">
            <p className="font-bold">Consenting Adults Compliance:</p>
            <p className="text-rose-200/75">
              Only lawful adult media involving verified consenting adults is indexed. Underage or non-consensual content is strictly blocked.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="text-left">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Enter Birth Year to Confirm Age (18+)
              </label>
              <input
                type="number"
                min="1920"
                max={new Date().getFullYear()}
                placeholder="e.g., 1995"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 text-sm font-mono text-center tracking-widest"
              />
            </div>

            {errorMsg && (
              <div className="text-xs text-rose-400 font-medium bg-rose-950/50 p-2.5 rounded-lg border border-rose-500/30">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-rose-600 to-purple-600 text-white text-sm font-bold shadow-lg shadow-rose-600/30 hover:opacity-95 transition"
            >
              Verify Age &amp; Enter PRO 18+
            </button>
          </form>

          <Link href="/" className="block text-xs text-slate-400 hover:text-white transition">
            Return to Standard Family Mode
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080F] text-white pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden border-b border-rose-500/20 bg-gradient-to-r from-rose-950/35 via-[#090D18] to-purple-950/30 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                  <Lock className="w-3 h-3" /> PRO 18+ Ecosystem Unlocked
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                    backendStatus?.stashdb?.connected
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {backendStatus?.stashdb?.connected
                    ? `StashDB Auto-Connected (${backendStatus.stashdb.indexedScenesCount.toLocaleString()} indexed)`
                    : 'Backend Stash Syncing'}
                </span>
                {backendStatus?.personalStash && !backendStatus.personalStash.configured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] font-semibold">
                    <AlertCircle className="w-3 h-3" /> Personal Stash Server: STASH_SERVER_URL unset
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                PRO <span className="text-rose-500">18+</span> Entertainment &amp; Stash Hub
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                Recent Uploads, Studios, Performers, Tube Directory, 3D VR, Hentai &amp; 3D Animation, Hot Web Series, and Live StashDB Metadata — managed automatically on the backend.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleManualRefreshSync}
                disabled={syncing}
                className="px-4 py-2 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing Library...' : 'Refresh Backend Sync'}</span>
              </button>
              <Link
                href="/library"
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Gallery Tab</span>
              </Link>
            </div>
          </div>

          {/* Unified Search + Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search scenes, performers, studios, tags, VR, hentai..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/50 border border-white/10 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-slate-200 focus:outline-none"
              >
                <option value="newest">Sort: Newest Added</option>
                <option value="popular">Sort: Popular</option>
                <option value="rating">Sort: Top Rated</option>
                <option value="title">Sort: A–Z</option>
              </select>

              <select
                value={resolutionFilter}
                onChange={(e) => setResolutionFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-slate-200 focus:outline-none"
              >
                <option value="all">Resolution: All</option>
                <option value="4k">4K UHD</option>
                <option value="1080p">1080p Full HD</option>
                <option value="720p">720p HD</option>
              </select>
            </div>
          </div>

          {/* Horizontal Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {navCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveTab(cat.id);
                    setPageLimit(24);
                  }}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white border-rose-500 shadow-lg'
                      : 'bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/[0.09] hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                  {cat.count !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-full bg-black/30 text-[10px]">
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-12">
        {/* Loading Skeletons */}
        {loadingData && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-video rounded-2xl bg-white/[0.04] animate-pulse" />
            ))}
          </div>
        )}

        {/* Continue Watching Carousel (Shown on Dashboard when history exists) */}
        {!loadingData && (activeTab === 'all' || activeTab === 'recommendations') && continueWatchingItems.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span>Continue Watching</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {continueWatchingItems.slice(0, 4).map((sc: any) => (
                <Link
                  key={sc.id}
                  href={toStashWatchPath(sc.id)}
                  className="group rounded-2xl overflow-hidden bg-white/[0.03] border border-cyan-500/30 hover:border-cyan-400 transition"
                >
                  <div className="aspect-video relative bg-slate-900">
                    {sc.paths?.screenshot && (
                      <img src={sc.paths.screenshot} alt={sc.title} className="w-full h-full object-cover" />
                    )}
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-cyan-300 font-mono">
                      Resume {Math.floor((sc.progressSeconds || 0) / 60)}m
                    </span>
                  </div>
                  <div className="p-3">
                    <h4 className="text-xs font-bold text-white truncate">{sc.title}</h4>
                    <p className="text-[10px] text-slate-400">{sc.studio?.name || 'Stash Media'}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Favorites Bar (Shown on All / Recommendations if user saved items) */}
        {!loadingData && (activeTab === 'all' || activeTab === 'recommendations') && favoriteScenes.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-rose-400" />
              <span>Your Favorites &amp; Watchlist ({favoriteScenes.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {favoriteScenes.slice(0, 4).map((sc) => (
                <Link
                  key={sc.id}
                  href={toStashWatchPath(sc.id)}
                  className="rounded-2xl overflow-hidden bg-white/[0.03] border border-rose-500/30 hover:border-rose-400 transition"
                >
                  <div className="aspect-video bg-slate-900">
                    {sc.paths?.screenshot && (
                      <img src={sc.paths.screenshot} alt={sc.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="text-xs font-bold text-white truncate">{sc.title}</h4>
                    <p className="text-[10px] text-rose-300">{sc.studio?.name || 'Saved Scene'}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 1. RECENT UPLOADS SECTION (Section 2A) */}
        {!loadingData && (activeTab === 'all' || activeTab === 'recent_uploads') && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-cyan-400" />
                  <span>Recent Uploads (Photos, Scenes &amp; Collections)</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Auto-synchronized with Stash library &amp; authorized media channels • {filteredUploads.length} items indexed
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {(['all', 'video', 'photo_gallery', 'collection'] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setUploadKindFilter(k)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold capitalize border ${
                      uploadKindFilter === k
                        ? 'bg-cyan-600 text-white border-cyan-500'
                        : 'bg-white/5 text-slate-300 border-white/10'
                    }`}
                  >
                    {k.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {filteredUploads.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-center text-xs text-slate-400">
                No recent uploads match your filter criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(activeTab === 'all' ? filteredUploads.slice(0, 8) : filteredUploads.slice(0, pageLimit)).map(
                  (u) => (
                    <div
                      key={`${u.kind}-${u.id}`}
                      className="group rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 hover:border-cyan-500/40 transition flex flex-col justify-between"
                    >
                      <div className="relative aspect-video bg-slate-900 overflow-hidden">
                        {u.thumbnail ? (
                          <img
                            src={u.thumbnail}
                            alt={u.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                            {u.category}
                          </div>
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/80 text-[10px] font-bold text-cyan-300 border border-white/15 uppercase">
                          {u.kind === 'photo_gallery' ? 'Photos' : u.kind === 'collection' ? 'Collection' : 'Video'}
                        </span>
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-white font-mono">
                          {u.uploadedAt}
                        </span>
                      </div>
                      <div className="p-3 space-y-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                          {u.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">
                          {u.studioName || u.category} • {u.durationOrCount}
                        </p>
                        {u.galleryImages ? (
                          <button
                            onClick={() =>
                              setLightboxGallery({ title: u.title, images: u.galleryImages })
                            }
                            className="w-full py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/35 border border-cyan-500/30 text-cyan-200 text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>View Photo Gallery</span>
                          </button>
                        ) : (
                          <Link
                            href={u.watchHref || toStashWatchPath(u.id)}
                            className="w-full py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>Play Inside PROZ</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        )}

        {/* 2. MOVIES & PLAYABLE SCENES (Section 2I) */}
        {!loadingData && (activeTab === 'all' || activeTab === 'movies') && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                <span>Movies &amp; Playable Scenes</span>
              </h2>
              <select
                value={studioFilter}
                onChange={(e) => setStudioFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs text-slate-200"
              >
                <option value="all">All Studios ({uniqueStudioNames.length})</option>
                {uniqueStudioNames.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {filteredScenes.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-center text-xs text-slate-400">
                No playable scenes matched your filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(activeTab === 'all' ? filteredScenes.slice(0, 8) : filteredScenes.slice(0, pageLimit)).map(
                  (scene) => {
                    const isFav = favorites.includes(scene.id);
                    const href = toStashWatchPath(scene.id);
                    return (
                      <div
                        key={scene.id}
                        className="group rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 hover:border-rose-500/40 transition flex flex-col justify-between"
                      >
                        <Link href={href} className="block relative aspect-video bg-slate-900 overflow-hidden">
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
                        </Link>
                        <div className="p-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                              {scene.title}
                            </h4>
                            <button
                              onClick={() => toggleFavorite(scene.id)}
                              className="shrink-0 p-1 rounded hover:bg-white/10"
                              title="Toggle Favorite"
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${
                                  isFav ? 'text-rose-500 fill-rose-500' : 'text-slate-400'
                                }`}
                              />
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            {scene.studio?.name || 'Stash Vault'} •{' '}
                            {(scene.performers || []).map((p) => p.name).join(', ') || 'Adult Feature'}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </section>
        )}

        {/* 3. HOT WEB SERIES & DRAMA (Section 2H) */}
        {!loadingData && (activeTab === 'all' || activeTab === 'series') && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Tv className="w-5 h-5 text-amber-400" />
                <span>Hot Web Series &amp; Drama</span>
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Adult Web Series', 'Regional Series', '18+ Romantic'].map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSeriesSubcat(sub)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold border ${
                      seriesSubcat === sub
                        ? 'bg-amber-600 text-white border-amber-500'
                        : 'bg-white/5 text-slate-300 border-white/10'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {filteredSeries.map((ser) => (
                <div
                  key={ser.id}
                  onClick={() => setSelectedSeries(ser)}
                  className="cursor-pointer rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 hover:border-amber-500/40 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-video relative bg-slate-900">
                      <img src={ser.banner} alt={ser.title} className="w-full h-full object-cover" loading="lazy" />
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-amber-600/90 text-[10px] font-bold text-white">
                        S{ser.seasons} • {ser.episodesCount} Eps
                      </span>
                    </div>
                    <div className="p-4 space-y-1.5">
                      <h3 className="text-sm sm:text-base font-black text-white">{ser.title}</h3>
                      <p className="text-[11px] text-amber-300">{ser.studio} • {ser.subcategory}</p>
                      <p className="text-xs text-slate-400 line-clamp-2">{ser.synopsis}</p>
                    </div>
                  </div>
                  <div className="px-4 pb-4 flex items-center justify-between text-xs text-cyan-400 font-bold">
                    <span>Open Seasons &amp; Episodes</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. STUDIOS CATALOGUE (Section 2C) */}
        {!loadingData && (activeTab === 'all' || activeTab === 'studios') && (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-400" />
                <span>Studios Directory ({filteredStudios.length})</span>
              </h2>
              <p className="text-xs text-slate-400">
                Click any studio to inspect its actual indexed playable videos and StashDB studio credits.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(activeTab === 'all' ? filteredStudios.slice(0, 8) : filteredStudios.slice(0, pageLimit)).map(
                (st) => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStudioId(st.id)}
                    className="text-left p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-purple-500/40 flex items-center gap-3 transition"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0 flex items-center justify-center">
                      {st.image ? (
                        <img src={st.image} alt={st.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <Building className="w-5 h-5 text-purple-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-white truncate">{st.name}</h4>
                      <p className="text-[11px] text-slate-400 truncate">{st.category}</p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold ${
                          st.hasDirectStreams
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-purple-500/15 text-purple-300'
                        }`}
                      >
                        {st.hasDirectStreams ? 'Playable Media Available' : 'StashDB Metadata'}
                      </span>
                    </div>
                  </button>
                )
              )}
            </div>
          </section>
        )}

        {/* 5. PERFORMERS DIRECTORY (Section 2D) */}
        {!loadingData && (activeTab === 'all' || activeTab === 'performers') && (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-rose-400" />
                <span>Performers Directory ({filteredPerformers.length})</span>
              </h2>
              <p className="text-xs text-slate-400">
                Real Stash &amp; StashDB profiles with associated studios, scenes, and available photos.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {(activeTab === 'all' ? filteredPerformers.slice(0, 12) : filteredPerformers.slice(0, pageLimit)).map(
                (p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPerformerId(p.id)}
                    className="group text-left rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 hover:border-rose-500/40 transition flex flex-col"
                  >
                    <div className="aspect-[3/4] w-full bg-slate-900 overflow-hidden relative">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <Users className="w-8 h-8" />
                        </div>
                      )}
                      {favorites.includes(p.id) && (
                        <Heart className="w-4 h-4 text-rose-500 fill-rose-500 absolute top-2 right-2" />
                      )}
                    </div>
                    <div className="p-2.5">
                      <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                      <p className="text-[10px] text-slate-400 truncate">
                        {p.country || 'Verified Profile'} • {(p.sceneCount || 0).toLocaleString()} scenes
                      </p>
                    </div>
                  </button>
                )
              )}
            </div>
          </section>
        )}

        {/* 6. 3D VR & INTERACTIVE (Section 2F) */}
        {!loadingData && (activeTab === 'all' || activeTab === 'vr') && (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Glasses className="w-5 h-5 text-cyan-400" />
                <span>3D VR &amp; Interactive Experiences</span>
              </h2>
              <p className="text-xs text-slate-400">
                Supports Stereoscopic 180° SBS, 360° Interactive Panning, and Mobile Gyroscope inside PROZ player.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vrItems.map((vr) => (
                <Link
                  key={vr.id}
                  href={toStashWatchPath(vr.streamId)}
                  className="group rounded-2xl overflow-hidden bg-white/[0.03] border border-cyan-500/25 hover:border-cyan-400 transition grid grid-cols-1 sm:grid-cols-5"
                >
                  <div className="sm:col-span-2 aspect-video sm:aspect-auto bg-slate-900 relative">
                    <img src={vr.cover} alt={vr.title} className="w-full h-full object-cover" loading="lazy" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-cyan-600/90 text-[10px] font-bold text-white">
                      {vr.vrFormat}
                    </span>
                  </div>
                  <div className="sm:col-span-3 p-4 space-y-2">
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition">
                      {vr.title}
                    </h3>
                    <p className="text-xs text-slate-400">{vr.performer} • {vr.duration}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {vr.features.map((f: string) => (
                        <span
                          key={f}
                          className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-200"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 7. HENTAI & 3D ANIMATION (Section 2G — Strictly Consenting Adults Only) */}
        {!loadingData && (activeTab === 'all' || activeTab === 'hentai') && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span>Hentai &amp; 3D CGI Animation (18+ Consenting Adults)</span>
                </h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Hentai', 'Animated Adult', '3D Animation', 'CGI'].map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setHentaiSubcat(sub)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold border ${
                      hentaiSubcat === sub
                        ? 'bg-purple-600 text-white border-purple-500'
                        : 'bg-white/5 text-slate-300 border-white/10'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredHentai.map((h) => (
                <div
                  key={h.id}
                  className="rounded-2xl overflow-hidden bg-white/[0.03] border border-purple-500/25 hover:border-purple-400 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-video relative bg-slate-900">
                      <img src={h.cover} alt={h.title} className="w-full h-full object-cover" loading="lazy" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-purple-600/90 text-[10px] font-bold text-white">
                        {h.subType} • {h.episodes} Eps
                      </span>
                    </div>
                    <div className="p-4 space-y-1.5">
                      <h3 className="text-sm font-bold text-white">{h.title}</h3>
                      <p className="text-[11px] text-purple-300">{h.studio}</p>
                      <p className="text-xs text-slate-400 line-clamp-2">{h.synopsis}</p>
                    </div>
                  </div>
                  <div className="px-4 pb-4 flex items-center gap-2">
                    <Link
                      href={toStashWatchPath(h.streamId)}
                      className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Play Inside PROZ</span>
                    </Link>
                    <button
                      onClick={() => toggleFavorite(h.id)}
                      className="p-2 rounded-xl bg-white/5 border border-white/10"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          favorites.includes(h.id) ? 'text-rose-500 fill-rose-500' : 'text-slate-400'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. PHOTO GALLERIES (Inside Gallery & 18+ Ecosystem) */}
        {!loadingData && (activeTab === 'all' || activeTab === 'galleries') && (
          <section className="space-y-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-cyan-400" />
              <span>Adult Photo Galleries ({galleries.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {galleries.map((gal) => (
                <button
                  key={gal.id}
                  onClick={() => setLightboxGallery({ title: gal.title, images: gal.images || (gal.coverPath ? [gal.coverPath] : []) })}
                  className="text-left group rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 hover:border-cyan-400/50 transition"
                >
                  <div className="aspect-video bg-slate-900 relative overflow-hidden">
                    <img
                      src={gal.coverPath || ''}
                      alt={gal.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-cyan-300">
                      {gal.imageCount} Photos
                    </span>
                  </div>
                  <div className="p-3.5">
                    <h4 className="text-sm font-bold text-white truncate">{gal.title}</h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {gal.studio?.name || 'Stash Photography'} • {gal.date}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 9. TUBE HUB (Section 2E — Explicit External Portal Limitation Notices, Zero Paywall Bypass) */}
        {!loadingData && (activeTab === 'all' || activeTab === 'tubes') && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-400" />
                  <span>Tube Hub Directory</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Categorized external provider portals. Sites that do not offer open embed streams are clearly labeled as External Reference Only.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Full Feature', 'HD Studio', 'Creator'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setTubeCatFilter(c)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold border ${
                      tubeCatFilter === c
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-white/5 text-slate-300 border-white/10'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {recentTubeIds.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 font-semibold">Recently Accessed:</span>
                {recentTubeIds.map((id) => {
                  const found = safeTubes.find((t) => t.id === id);
                  if (!found) return null;
                  return (
                    <a
                      key={id}
                      href={found.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300"
                    >
                      {found.name}
                    </a>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTubes.map((tube) => (
                <div
                  key={tube.id}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={tube.logo}
                          alt={tube.name}
                          className="w-11 h-11 rounded-xl object-cover border border-white/10"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white">{tube.name}</h4>
                          <span className="text-[11px] text-emerald-300">{tube.category}</span>
                        </div>
                      </div>
                      <button onClick={() => toggleFavorite(tube.id)}>
                        <Heart
                          className={`w-4 h-4 ${
                            favorites.includes(tube.id)
                              ? 'text-rose-500 fill-rose-500'
                              : 'text-slate-500'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">{tube.description}</p>
                    <p className="text-[10px] px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                      Limitation: {tube.limitation}
                    </p>
                  </div>

                  <a
                    href={tube.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => recordTubeAccess(tube.id)}
                    className="py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Visit External Site</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 10. STASHDB CATALOGUE (Section 2J — Automated Backend & Metadata-Only Protection) */}
        {(activeTab === 'all' || activeTab === 'stashdb') && (
          <section className="space-y-3">
            <StashDbPanel
              onSelectPerformer={(id) => setSelectedPerformerId(id)}
              onSelectStudio={(id) => setSelectedStudioId(id)}
            />
          </section>
        )}

        {/* 11. DATA-DRIVEN RECOMMENDATIONS (Section 2L) */}
        {!loadingData && (activeTab === 'all' || activeTab === 'recommendations') && recommendations && (
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                <span>Recommended From Your Library Metadata</span>
              </h2>
              <p className="text-xs text-slate-400">
                Computed dynamically from indexed performers, studios, tags, watch history, and saved favorites.
              </p>
            </div>

            {[
              { title: 'Popular in Your Library', items: recommendations.popular || [] },
              { title: 'Similar Performers', items: recommendations.similarPerformers || [] },
              { title: 'Similar Studios', items: recommendations.similarStudios || [] },
              { title: 'Similar Tags & Discovery', items: recommendations.similarTags || [] },
            ].map(
              (group) =>
                group.items.length > 0 && (
                  <div key={group.title} className="space-y-2.5">
                    <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider">
                      {group.title}
                    </h3>
                    <div className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-none">
                      {group.items.map((sc: any) => (
                        <Link
                          key={`${group.title}-${sc.id}`}
                          href={toStashWatchPath(sc.id)}
                          className="w-56 shrink-0 rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 hover:border-cyan-400/50 transition"
                        >
                          <div className="aspect-video bg-slate-900">
                            {sc.paths?.screenshot && (
                              <img src={sc.paths.screenshot} alt={sc.title} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="p-2.5">
                            <p className="text-xs font-bold text-white truncate">{sc.title}</p>
                            <span className="text-[10px] text-slate-400 truncate block">
                              {sc.studio?.name || 'Stash Vault'}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
            )}
          </section>
        )}

        {/* Load More Pagination Control */}
        {activeTab !== 'all' && activeTab !== 'stashdb' && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setPageLimit((p) => p + 24)}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300"
            >
              Show More Indexed Items
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedPerformerId && (
        <PerformerProfileModal
          performerId={selectedPerformerId}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
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

      {selectedSeries && (
        <SeriesDetailModal series={selectedSeries} onClose={() => setSelectedSeries(null)} />
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

export default function RestrictedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#06080F] flex items-center justify-center text-xs text-slate-400">
          Initializing PRO 18+ Ecosystem...
        </div>
      }
    >
      <RestrictedContent />
    </Suspense>
  );
}
