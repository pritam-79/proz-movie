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
  Video
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StashScene, StashPerformer, StashStudio, StashGallery } from '@/types/library';

type AdultCategory = 'all' | 'movies' | 'series' | 'hentai' | 'vr3d' | 'performers' | 'studios' | 'galleries' | 'settings';

export default function RestrictedPage() {
  const { user, verify18Plus } = useAuth();
  const [birthYear, setBirthYear] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeCategory, setActiveCategory] = useState<AdultCategory>('all');
  
  // Stash Library Data
  const [scenes, setScenes] = useState<StashScene[]>([]);
  const [performers, setPerformers] = useState<StashPerformer[]>([]);
  const [studios, setStudios] = useState<StashStudio[]>([]);
  const [galleries, setGalleries] = useState<StashGallery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Stash Connection Config State
  const [serverUrl, setServerUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [stashVersion, setStashVersion] = useState('');

  const isUnlocked = user?.is18PlusVerified || false;

  useEffect(() => {
    if (isUnlocked) {
      checkStashStatus();
      loadStashData();
    }
  }, [isUnlocked]);

  const checkStashStatus = async () => {
    try {
      const res = await fetch('/api/library/stash/sync');
      const data = await res.json();
      if (data.connected) {
        setConnectionStatus('connected');
        setStashVersion(data.version || 'v0.27+');
        setConnectionMessage(`Connected to Stash (${data.version})`);
      } else {
        setConnectionStatus('disconnected');
        setConnectionMessage('Stash is not connected. Connect a private media library to import your own authorized content.');
      }
    } catch {
      setConnectionStatus('disconnected');
      setConnectionMessage('Stash is not connected. Connect a private media library to import your own authorized content.');
    }
  };

  const loadStashData = () => {
    setIsLoading(true);
    Promise.all([
      fetch('/api/library/stash/scenes').then(r => r.json()).catch(() => ({ scenes: [] })),
      fetch('/api/library/stash/performers').then(r => r.json()).catch(() => ({ performers: [] })),
      fetch('/api/library/stash/studios').then(r => r.json()).catch(() => ({ studios: [] })),
      fetch('/api/library/stash/galleries').then(r => r.json()).catch(() => ({ galleries: [] }))
    ]).then(([sRes, pRes, stdRes, gRes]) => {
      if (sRes.success && sRes.scenes) setScenes(sRes.scenes);
      if (pRes.success && pRes.performers) setPerformers(pRes.performers);
      if (stdRes.success && stdRes.studios) setStudios(stdRes.studios);
      if (gRes.success && gRes.galleries) setGalleries(gRes.galleries);
    }).finally(() => setIsLoading(false));
  };

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverUrl) {
      setConnectionMessage('Please enter a valid GraphQL endpoint URL (e.g. http://localhost:9999/graphql)');
      return;
    }
    setConnectionStatus('connecting');
    setConnectionMessage('Testing GraphQL connection to Stash server...');

    try {
      const res = await fetch('/api/library/stash/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverUrl, apiKey })
      });
      const data = await res.json();
      if (data.success) {
        setConnectionStatus('connected');
        setStashVersion(data.version || 'Stash GraphQL');
        setConnectionMessage(`Successfully connected! Found ${data.summary?.scenesScanned || 0} scenes.`);
        loadStashData();
      } else {
        setConnectionStatus('error');
        setConnectionMessage(data.error || 'Connection failed. Verify endpoint URL and API key.');
      }
    } catch (err: any) {
      setConnectionStatus('error');
      setConnectionMessage(err?.message || 'Failed to reach Stash server.');
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
    { id: 'all', label: 'All Categories', icon: Layers },
    { id: 'movies', label: 'Adult Movies', icon: Film, count: scenes.length },
    { id: 'series', label: 'Hot Web Series', icon: Tv, count: 0 },
    { id: 'hentai', label: 'Hentai & Anime', icon: Sparkles, count: 0 },
    { id: 'vr3d', label: '3D & VR Adult', icon: Zap, count: 0 },
    { id: 'performers', label: 'Performers & Models', icon: Users, count: performers.length },
    { id: 'studios', label: 'Adult Studios', icon: Building, count: studios.length },
    { id: 'galleries', label: 'Photo Galleries', icon: ImageIcon, count: galleries.length },
    { id: 'settings', label: 'Vault Connection', icon: Server }
  ];

  return (
    <div className="min-h-screen bg-[#06080F] text-slate-100 pt-28 pb-20 px-4 md:px-8">
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
                    Private media vault and adult content discovery. Zero piracy scraping; supports private Stash instances and authorized feeds.
                  </p>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{connectionStatus === 'connected' ? `Stash Live (${stashVersion})` : 'Stash Disconnected'}</span>
              </div>
              <button
                onClick={() => setActiveCategory('settings')}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition"
              >
                <Server className="w-3.5 h-3.5" />
                <span>Configure Vault</span>
              </button>
            </div>
          </div>

          {/* Stash Notice Callout when Disconnected */}
          {connectionStatus !== 'connected' && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400" />
                <div>
                  <span className="font-bold">Stash is not connected.</span> Connect a private media library to import your own authorized content.
                </div>
              </div>
              <button
                onClick={() => setActiveCategory('settings')}
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition"
              >
                Connect Stash Server
              </button>
            </div>
          )}

          {/* Category Navigation Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
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

          {/* SETTINGS / ONBOARDING TAB */}
          {activeCategory === 'settings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Server className="w-5 h-5 text-red-400" />
                    <span>Connect Stash Media Vault</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Connect your private Stash GraphQL server to securely stream your organized personal media collections.
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
                    <p className="text-[11px] text-slate-500">Default local Stash port is 9999.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">API Key (Optional / Authenticated)</label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter Stash API Key if enabled"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>

                  {connectionMessage && (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      connectionStatus === 'connected'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : connectionStatus === 'error'
                        ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                        : 'bg-white/5 text-slate-300 border border-white/10'
                    }`}>
                      {connectionStatus === 'connected' && <Check className="w-4 h-4 text-emerald-400" />}
                      {connectionStatus === 'error' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                      {connectionStatus === 'connecting' && <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />}
                      <span>{connectionMessage}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={connectionStatus === 'connecting'}
                      className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition disabled:opacity-50"
                    >
                      {connectionStatus === 'connecting' ? 'Testing...' : 'Test & Save Connection'}
                    </button>
                    <button
                      type="button"
                      onClick={() => checkStashStatus()}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition"
                    >
                      Refresh Status
                    </button>
                  </div>
                </form>
              </div>

              {/* Onboarding Guide */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>How to Host & Connect Stash</span>
                </h3>
                
                <div className="space-y-3 text-xs text-slate-400">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="font-bold text-white block mb-1">1. Run Stash Locally via Docker:</span>
                    <code className="text-[11px] text-cyan-300 bg-black/40 p-2 rounded block font-mono">
                      docker run -d -p 9999:9999 -v C:\Media:/data stashapp/stash:latest
                    </code>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="font-bold text-white block mb-1">2. Run via Standalone Executable:</span>
                    <p>Download the official Stash executable from <a href="https://github.com/stashapp/stash/releases" target="_blank" rel="noreferrer" className="text-red-400 underline">github.com/stashapp/stash</a>, launch it, and open <code className="text-slate-200">http://localhost:9999</code>.</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="font-bold text-white block mb-1">3. Generate API Key:</span>
                    <p>In Stash, navigate to <strong>Settings &rarr; Security &rarr; API Key</strong>, copy the generated key, and paste it into the connection form on the left.</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="font-bold text-white block mb-1">4. Automatic Sync:</span>
                    <p>PROZ MOVIE will automatically index your scenes, performers, tags, and studios with end-to-end encrypted proxy playback.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ALL OR MOVIES TAB */}
          {(activeCategory === 'all' || activeCategory === 'movies') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-red-400" />
                  <span>Adult Movies & Scenes ({scenes.length})</span>
                </h3>
              </div>

              {scenes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                            <span className="text-red-400 font-semibold">{scene.studio?.name || 'Private Studio'}</span>
                            <span>{scene.date || 'Recent'}</span>
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
                          <span>{scene.playCount || 0} views</span>
                          <button className="hover:text-red-400 transition" title="Favourite">
                            <Heart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 rounded-3xl bg-white/[0.02] border border-white/5 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
                    <Film className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">No Scenes Currently Indexed</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Your Stash library is not connected or contains no indexed scenes. Connect your local or private Stash server in Vault Settings to sync your collection.
                  </p>
                  <button
                    onClick={() => setActiveCategory('settings')}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 border border-white/10 transition"
                  >
                    Configure Stash Endpoint
                  </button>
                </div>
              )}
            </div>
          )}

          {/* HOT WEB SERIES TAB */}
          {(activeCategory === 'all' || activeCategory === 'series') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Tv className="w-4 h-4 text-rose-400" />
                  <span>Hot Web Series & Multi-Episode Collections</span>
                </h3>
              </div>

              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
                  <Tv className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">No Web Series Connected</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Series collections are imported via authorized episodic adult feeds or tag-grouped Stash galleries. Connect your content provider to browse episodic series.
                </p>
              </div>
            </div>
          )}

          {/* HENTAI / 2D & 3D ANIME TAB */}
          {(activeCategory === 'all' || activeCategory === 'hentai') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Hentai & Animated Adult Content</span>
                </h3>
              </div>

              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">No Animated Content Configured</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  To index 2D and 3D animated adult media, configure a Stash instance with animated tags or connect an authorized studio repository.
                </p>
              </div>
            </div>
          )}

          {/* 3D / VR TAB */}
          {(activeCategory === 'all' || activeCategory === 'vr3d') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>3D Adult VR & Interactive Experiences</span>
                </h3>
              </div>

              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
                  <Zap className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">No VR / 3D Experiences Indexed</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Stereoscopic 180° / 360° VR adult video playback is supported when indexed via Stash with VR tags.
                </p>
              </div>
            </div>
          )}

          {/* PERFORMERS TAB */}
          {(activeCategory === 'all' || activeCategory === 'performers') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-red-400" />
                  <span>Performers & Models ({performers.length})</span>
                </h3>
              </div>

              {performers.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {performers.map(perf => (
                    <div
                      key={perf.id}
                      className="group bg-white/[0.03] border border-white/10 hover:border-red-500/40 rounded-2xl p-3 text-center transition"
                    >
                      <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-slate-800 mb-3 border-2 border-transparent group-hover:border-red-500 transition">
                        <img
                          src={perf.imagePath || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop'}
                          alt={perf.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">{perf.name}</h4>
                      <span className="text-[11px] text-red-400 font-medium">{perf.sceneCount || 0} Scenes</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                  <p className="text-xs text-slate-400">No performers found. Sync your Stash library to populate performer profiles.</p>
                </div>
              )}
            </div>
          )}

          {/* STUDIOS TAB */}
          {(activeCategory === 'all' || activeCategory === 'studios') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-red-400" />
                  <span>Authorized Adult Studios ({studios.length})</span>
                </h3>
              </div>

              {studios.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {studios.map(studio => (
                    <div
                      key={studio.id}
                      className="bg-white/[0.03] border border-white/10 hover:border-red-500/40 rounded-2xl p-5 flex items-center gap-4 transition"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 border border-white/10 flex-shrink-0">
                        <img src={studio.imagePath || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=200&auto=format&fit=crop'} alt={studio.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">{studio.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">{studio.sceneCount || 0} Indexed Titles</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                  <p className="text-xs text-slate-400">No studios indexed. Connect your Stash server to discover studio catalogues.</p>
                </div>
              )}
            </div>
          )}

          {/* GALLERIES TAB */}
          {(activeCategory === 'all' || activeCategory === 'galleries') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-red-400" />
                  <span>Photo Galleries ({galleries.length})</span>
                </h3>
              </div>

              {galleries.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {galleries.map(gal => (
                    <div
                      key={gal.id}
                      className="group bg-white/[0.03] border border-white/10 hover:border-red-500/40 rounded-2xl overflow-hidden transition"
                    >
                      <div className="relative aspect-video w-full bg-slate-800 overflow-hidden">
                        <img src={gal.coverPath || 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=600&auto=format&fit=crop'} alt={gal.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      </div>
                      <div className="p-4">
                        <h4 className="text-sm font-bold text-white line-clamp-1">{gal.title}</h4>
                        <p className="text-xs text-slate-400 mt-1">{gal.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                  <p className="text-xs text-slate-400">No image galleries indexed in connected repositories.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
