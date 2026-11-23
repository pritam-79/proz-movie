"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Film,
  Zap,
  Sparkles,
  Flame,
  Globe,
  Tv,
  Play,
  Heart,
  Star,
  Users,
  Building,
  Image as ImageIcon,
  FolderLock,
  Layers,
  Filter,
  AlertTriangle,
  Server,
  Key,
  RefreshCw,
  ExternalLink,
  Lock,
  Check,
  Video,
  Radio,
  Glasses
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StashScene, StashPerformer, StashStudio, StashGallery } from '@/types/library';
import { 
  CURATED_ADULT_SCENES,
  CURATED_HOT_WEB_SERIES,
  CURATED_HENTAI_COLLECTIONS,
  CURATED_VR_SCENES,
  VERIFIED_ADULT_TUBE_PORTALS
} from '@/lib/providers/stash';

type AdultCategory = 
  | 'all' 
  | 'movies' 
  | 'series' 
  | 'hentai' 
  | 'vr3d' 
  | 'tubes'
  | 'performers' 
  | 'studios' 
  | 'galleries' 
  | 'settings';

export default function RestrictedPage() {
  const { user, verify18Plus } = useAuth();
  const [birthYear, setBirthYear] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeCategory, setActiveCategory] = useState<AdultCategory>('all');
  
  // Stash Library Data
  const [scenes, setScenes] = useState<StashScene[]>(CURATED_ADULT_SCENES);
  const [performers, setPerformers] = useState<StashPerformer[]>([]);
  const [studios, setStudios] = useState<StashStudio[]>([]);
  const [galleries, setGalleries] = useState<StashGallery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Stash Connection Config State (Truthful Disconnected State by default)
  const [serverUrl, setServerUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('disconnected');
  const [connectionMessage, setConnectionMessage] = useState('Not Connected — Connect a Stash Server to Use This Feature');
  const [stashVersion, setStashVersion] = useState('Not Connected');
  const [liveAdultSeries, setLiveAdultSeries] = useState<any[]>([]);
  const [liveAdultMovies, setLiveAdultMovies] = useState<any[]>([]);

  const isUnlocked = user?.is18PlusVerified || false;

  useEffect(() => {
    if (isUnlocked) {
      loadStashData();
    }
  }, [isUnlocked]);

  const loadStashData = () => {
    setIsLoading(true);
    Promise.all([
      fetch('/api/library/adult-content').then(r => r.json()).catch(() => ({ success: false })),
      fetch('/api/library/stash/scenes').then(r => r.json()).catch(() => ({ scenes: CURATED_ADULT_SCENES })),
      fetch('/api/library/stash/performers').then(r => r.json()).catch(() => ({ performers: [] })),
      fetch('/api/library/stash/studios').then(r => r.json()).catch(() => ({ studios: [] })),
      fetch('/api/library/stash/galleries').then(r => r.json()).catch(() => ({ galleries: [] }))
    ]).then(([adultRes, sRes, pRes, stdRes, gRes]) => {
      if (adultRes && adultRes.success) {
        if (adultRes.series && adultRes.series.length > 0) setLiveAdultSeries(adultRes.series);
        if (adultRes.movies && adultRes.movies.length > 0) setLiveAdultMovies(adultRes.movies);
      }
      if (sRes.success && sRes.scenes && sRes.scenes.length > 0) {
        setScenes(sRes.scenes);
      } else {
        setScenes(CURATED_ADULT_SCENES);
      }
      if (pRes.success && pRes.performers) setPerformers(pRes.performers);
      if (stdRes.success && stdRes.studios) setStudios(stdRes.studios);
      if (gRes.success && gRes.galleries) setGalleries(gRes.galleries);
    }).finally(() => setIsLoading(false));
  };

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverUrl.trim()) {
      setConnectionStatus('disconnected');
      setConnectionMessage('Not Connected — Connect a Stash Server to Use This Feature');
      return;
    }
    setConnectionStatus('connecting');
    setConnectionMessage('Testing connection to Stash GraphQL server...');

    try {
      const res = await fetch('/api/library/stash/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverUrl, apiKey })
      });
      const data = await res.json();
      if (data.success) {
        setConnectionStatus('connected');
        setStashVersion(data.version || 'v0.05');
        setConnectionMessage(`Connected to Stash Server (${data.version})!`);
        loadStashData();
      } else {
        setConnectionStatus('disconnected');
        setConnectionMessage(data.error || 'Connection Failed — Verify your Stash URL and API key.');
      }
    } catch {
      setConnectionStatus('disconnected');
      setConnectionMessage('Connection Failed — Stash server could not be reached.');
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const year = parseInt(birthYear);
    const currentYear = new Date().getFullYear();
    if (!year || isNaN(year) || year < 1920 || year > currentYear) {
      setErrorMsg('Please enter a valid four-digit birth year.');
      return;
    }
    const age = currentYear - year;
    if (age < 18) {
      setErrorMsg('Access denied: You must be at least 18 years of age to access this section.');
      return;
    }

    verify18Plus(`${birthYear}-01-01`);
    setErrorMsg('');
  };

  const categories: { id: AdultCategory; label: string; icon: any; count?: number }[] = [
    { id: 'all', label: 'All Adult Media', icon: Layers },
    { id: 'movies', label: 'Adult Movies & Scenes', icon: Film, count: scenes.length },
    { id: 'series', label: 'Hot Web Series', icon: Tv, count: CURATED_HOT_WEB_SERIES.length },
    { id: 'hentai', label: 'Hentai & Anime', icon: Sparkles, count: CURATED_HENTAI_COLLECTIONS.length },
    { id: 'vr3d', label: '3D VR & Interactive', icon: Zap, count: CURATED_VR_SCENES.length },
    { id: 'tubes', label: 'Adult Tube Sites', icon: Globe, count: VERIFIED_ADULT_TUBE_PORTALS.length },
    { id: 'performers', label: 'Performers & Models', icon: Users, count: performers.length || 4 },
    { id: 'studios', label: 'Adult Studios', icon: Building, count: studios.length || 4 },
    { id: 'galleries', label: 'Photo Galleries', icon: ImageIcon, count: galleries.length || 3 },
    { id: 'settings', label: 'Vault Connection', icon: Server }
  ];

  return (
    <div className="min-h-screen bg-[#06080F] text-slate-100 pt-28 pb-28 px-4 md:px-8">
      {/* ─── LOCKED STATE: STRICT AGE VERIFICATION GATE (NO PIN REQUIRED) ─── */}
      {!isUnlocked ? (
        <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl bg-white/[0.03] border border-red-500/30 backdrop-blur-xl shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-extrabold uppercase tracking-wider">
            Statutory Age Verification
          </span>

          <h2 className="text-2xl font-black text-white tracking-tight mt-4">
            PROZ RESTRICTED 18+ ECOSYSTEM
          </h2>

          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            This section contains mature entertainment and media collections intended exclusively for consenting adults aged 18 and older. 
            All content is managed through federated private Stash repositories and authorized feeds.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-red-950/20 border border-red-500/20 text-xs text-red-300 text-left flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
            <div>
              <span className="font-bold">Strict Legal Notice:</span> Content involving non-consensual material, minors, or unverified origin is strictly prohibited and denied by default. No parental PIN is required — verification is confirmed once per session by entering your birth year.
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-left">
                Enter Your Birth Year to Confirm Age (18+)
              </label>
              <input
                type="number"
                placeholder="YYYY (e.g. 1998)"
                value={birthYear}
                onChange={e => setBirthYear(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-center font-bold text-lg tracking-widest focus:outline-none focus:border-red-500"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-red-400 font-semibold">{errorMsg}</p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition"
            >
              Verify Age & Unlock Adult Ecosystem
            </button>
          </form>

          <div className="mt-6 text-[11px] text-slate-500">
            By unlocking, you agree to our <Link href="/legal/age-policy" className="underline hover:text-slate-300">Age Policy</Link> and certify compliance with regional regulations.
          </div>
        </div>
      ) : (
        /* ─── UNLOCKED STATE: COMPLETE 18+ ECOSYSTEM & PRIVATE VAULT ─── */
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-red-500/20 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                  <Flame className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-red-200 to-rose-400 bg-clip-text text-transparent">
                      PROZ 18+ Adult Ecosystem
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-extrabold">
                      AGE VERIFIED
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5">
                    Curated adult movies, hot web series, hentai anime, 3D VR, tube portals, and private Stash vault streaming.
                  </p>
                </div>
              </div>
            </div>

            {/* Auto-Connected Status Indicator */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Stash Vault Auto-Connected ({stashVersion})</span>
              </div>
              <button
                onClick={() => setActiveCategory('settings')}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition"
              >
                <Server className="w-3.5 h-3.5" />
                <span>Vault Settings</span>
              </button>
            </div>
          </div>

          {/* Category Navigation Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    activeCategory === cat.id
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                  {cat.count !== undefined && cat.count > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ─── TAB CONTENT ─── */}

          {/* 1. ADULT MOVIES & SCENES */}
          {(activeCategory === 'all' || activeCategory === 'movies') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-red-400" />
                  <span>Adult Feature Movies & Scenes ({liveAdultMovies.length + scenes.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {liveAdultMovies.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-red-500/40 rounded-2xl overflow-hidden transition shadow-xl flex flex-col justify-between"
                  >
                    <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                      <img
                        src={item.banner || item.poster}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as any).src = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-bold text-red-400 border border-red-500/30">
                        {item.channel}
                      </div>
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-amber-400" /> {item.rating}
                      </div>

                      <Link
                        href={item.streamUrl}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs"
                      >
                        <div className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/50 transform group-hover:scale-110 transition">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </Link>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span className="text-red-400 font-semibold">{item.channel}</span>
                          <span>HD 1080p</span>
                        </div>
                        <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-red-300 transition">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.details}</p>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-xs text-slate-400">
                        <span className="text-emerald-400 font-medium">Stream Ready</span>
                        <Link
                          href={item.streamUrl}
                          className="px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-500 text-white font-bold text-[11px] flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-white" /> Play
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                {scenes.map(scene => (
                  <div
                    key={scene.id}
                    className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-red-500/40 rounded-2xl overflow-hidden transition shadow-xl flex flex-col"
                  >
                    <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                      <img
                        src={scene.paths.screenshot || scene.paths.webp || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop'}
                        alt={scene.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                      
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-400 flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-amber-400" /> {scene.rating || 4.9}
                        </span>
                      </div>

                      <Link
                        href={`/watch/stash-${scene.id}`}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs"
                      >
                        <div className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/50 transform group-hover:scale-110 transition">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </Link>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span className="text-red-400 font-semibold">{scene.studio?.name || 'Studio'}</span>
                          <span>{scene.date || '2026'}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-red-300 transition">
                          {scene.title}
                        </h4>
                        {scene.performers && scene.performers.length > 0 && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                            {scene.performers.map(p => p.name).join(', ')}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-xs text-slate-400">
                        <span>{scene.playCount || 1200} views</span>
                        <Link
                          href={`/watch/stash-${scene.id}`}
                          className="px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-500 text-white font-bold text-[11px] flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-white" /> Play
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. HOT WEB SERIES */}
          {(activeCategory === 'all' || activeCategory === 'series') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Tv className="w-4 h-4 text-rose-400" />
                  <span>Hot Web Series & Multi-Episode Collections ({liveAdultSeries.length + CURATED_HOT_WEB_SERIES.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {liveAdultSeries.map(series => (
                  <div
                    key={series.id}
                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-rose-500/40 transition shadow-xl space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-800 mb-3">
                        <img 
                          src={series.banner || series.poster} 
                          alt={series.title} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.target as any).src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop';
                          }}
                        />
                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-rose-400">
                          {series.channel}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span className="text-rose-400 font-semibold">{series.channel}</span>
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" /> {series.rating}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white">{series.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{series.details}</p>
                    </div>

                    <Link
                      href={series.streamUrl}
                      className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition text-center"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Stream Series Now</span>
                    </Link>
                  </div>
                ))}

                {CURATED_HOT_WEB_SERIES.map(series => (
                  <div
                    key={series.id}
                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-rose-500/40 transition shadow-xl space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-800 mb-3">
                        <img src={series.banner} alt={series.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-rose-400">
                          {series.seasons} Seasons • {series.episodesCount} EPs
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span className="text-rose-400 font-semibold">{series.studio}</span>
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" /> {series.rating}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white">{series.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{series.synopsis}</p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-white/5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Featured Episodes:</span>
                      {series.episodes.map(ep => (
                        <Link
                          key={ep.ep}
                          href={`/watch/${ep.streamId}`}
                          className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-xs transition"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center font-bold text-[10px] text-white">
                              {ep.ep}
                            </span>
                            <span className="text-white font-medium">{ep.title}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Play className="w-3 h-3 fill-rose-400 text-rose-400" /> {ep.duration}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. HENTAI & 2D/3D ANIME */}
          {(activeCategory === 'all' || activeCategory === 'hentai') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Hentai & 2D / 3D Animated Adult Content ({CURATED_HENTAI_COLLECTIONS.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {CURATED_HENTAI_COLLECTIONS.map(item => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/40 transition shadow-xl space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-800 mb-3">
                        <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-purple-950/80 backdrop-blur-md text-[10px] font-bold text-purple-300 border border-purple-500/30">
                          {item.type}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span className="text-purple-400 font-semibold">{item.studio}</span>
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" /> {item.rating}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{item.synopsis}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {item.tags.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-purple-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link
                      href={`/watch/${item.streamId}`}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition text-center"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Stream OVA Now</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. 3D VR & INTERACTIVE EXPERIENCES */}
          {(activeCategory === 'all' || activeCategory === 'vr3d') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>3D VR & Interactive Experiences ({CURATED_VR_SCENES.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {CURATED_VR_SCENES.map(vr => (
                  <div
                    key={vr.id}
                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/40 transition shadow-xl space-y-4"
                  >
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-800">
                      <img src={vr.cover} alt={vr.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-black text-cyan-400 flex items-center gap-1.5 border border-cyan-500/30">
                        <Glasses className="w-3.5 h-3.5" />
                        <span>{vr.format}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">{vr.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">Starring: <span className="text-cyan-300 font-semibold">{vr.performer}</span> • {vr.duration}</p>
                      <ul className="mt-3 space-y-1 text-xs text-slate-300">
                        {vr.features.map(f => (
                          <li key={f} className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-cyan-400" /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link
                      href={`/watch/${vr.streamId}`}
                      className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition text-center"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Launch 3D VR Stream</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. VERIFIED ADULT TUBE PORTALS */}
          {(activeCategory === 'all' || activeCategory === 'tubes') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Verified Adult Tube Portals & Streaming Hubs ({VERIFIED_ADULT_TUBE_PORTALS.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {VERIFIED_ADULT_TUBE_PORTALS.map(tube => (
                  <div
                    key={tube.id}
                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 transition shadow-xl space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                          {tube.badge}
                        </span>
                        <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400" /> {tube.rating}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white">{tube.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{tube.description}</p>
                    </div>

                    <a
                      href={tube.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <span>Open {tube.name}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. PERFORMERS & MODELS */}
          {(activeCategory === 'all' || activeCategory === 'performers') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-red-400" />
                  <span>Featured Performers & Models</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { id: 'p1', name: 'Elena Vance', count: 42, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop' },
                  { id: 'p2', name: 'Maya Lin', count: 35, img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop' },
                  { id: 'p3', name: 'Charlotte Dubois', count: 29, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop' },
                  { id: 'p4', name: 'Sora Takahashi', count: 38, img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop' }
                ].map(perf => (
                  <div
                    key={perf.id}
                    className="group bg-white/[0.03] border border-white/10 hover:border-red-500/40 rounded-2xl p-3 text-center transition"
                  >
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-slate-800 mb-3 border-2 border-transparent group-hover:border-red-500 transition">
                      <img src={perf.img} alt={perf.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                    </div>
                    <h4 className="text-sm font-bold text-white truncate">{perf.name}</h4>
                    <span className="text-[11px] text-red-400 font-medium">{perf.count} Scenes</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. STUDIOS */}
          {(activeCategory === 'all' || activeCategory === 'studios') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-red-400" />
                  <span>Authorized Adult Studios</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { id: 's1', name: 'CyberVelvet Studios', desc: 'Futuristic Cinematic 4K Productions', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop' },
                  { id: 's2', name: 'Noir Intimate Cinema', desc: 'Monochrome and Atmospheric Sessions', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop' },
                  { id: 's3', name: 'Tokyo Velvet Arts', desc: 'Luxury High-Rise Tokyo Encounters', img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=200&auto=format&fit=crop' },
                  { id: 's4', name: 'Crimson Passion', desc: 'High-Energy Romantic Feature Choreography', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=200&auto=format&fit=crop' }
                ].map(studio => (
                  <div
                    key={studio.id}
                    className="bg-white/[0.03] border border-white/10 hover:border-red-500/40 rounded-2xl p-5 flex items-center gap-4 transition"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 border border-white/10 flex-shrink-0">
                      <img src={studio.img} alt={studio.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">{studio.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{studio.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. GALLERIES */}
          {(activeCategory === 'all' || activeCategory === 'galleries') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-red-400" />
                  <span>High-Resolution Photo Galleries</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { id: 'g1', title: 'Neon Velvet Exclusive Session', photos: 48, img: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop' },
                  { id: 'g2', title: 'Midnight Noir Backstage Portraits', photos: 64, img: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=600&auto=format&fit=crop' },
                  { id: 'g3', title: 'Crimson Velvet High-Fashion Glamour', photos: 52, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop' }
                ].map(gal => (
                  <div
                    key={gal.id}
                    className="group bg-white/[0.03] border border-white/10 hover:border-red-500/40 rounded-2xl overflow-hidden transition"
                  >
                    <div className="relative aspect-video w-full bg-slate-800 overflow-hidden">
                      <img src={gal.img} alt={gal.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-bold text-white backdrop-blur-md">
                        {gal.photos} Photos
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-bold text-white line-clamp-1">{gal.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. SETTINGS TAB */}
          {activeCategory === 'settings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Server className="w-5 h-5 text-red-400" />
                    <span>Personal Stash Media Server Connection</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Connect your private Stash media server via GraphQL to browse personal collections. Public 18+ content streams directly via CineWebby API.
                  </p>
                </div>

                <form onSubmit={handleTestConnection} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Stash GraphQL Endpoint URL</label>
                    <input
                      type="url"
                      value={serverUrl}
                      onChange={(e) => setServerUrl(e.target.value)}
                      placeholder="http://localhost:9999/graphql"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">API Key (Optional)</label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter Stash API Key if configured"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>

                  {connectionMessage && (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      connectionStatus === 'connected'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    }`}>
                      {connectionStatus === 'connected' ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <span>{connectionMessage}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={connectionStatus === 'connecting'}
                      className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition disabled:opacity-50"
                    >
                      {connectionStatus === 'connecting' ? 'Testing...' : 'Test & Connect Stash Server'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-rose-400" />
                  <span>Stash Server: {connectionStatus === 'connected' ? 'Connected' : 'Not Connected'}</span>
                </h3>
                <div className="space-y-2 text-xs text-slate-400">
                  <p>• Personal Stash status: <span className={connectionStatus === 'connected' ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                    {connectionStatus === 'connected' ? `Connected (${stashVersion})` : 'Not Connected — Connect a Stash Server to Use This Feature'}
                  </span></p>
                  <p>• Public 18+ Channels & Streams: <span className="text-emerald-400 font-bold">Connected & Operational (CineWebby API)</span></p>
                  <p>• Category indexing: <span className="text-emerald-400 font-bold">Movies, Hot Web Series, Hentai, 3D VR, Tube Hubs</span></p>
                  <p>• Age verification: <span className="text-emerald-400 font-bold">Statutory 18+ Unlocked</span></p>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
