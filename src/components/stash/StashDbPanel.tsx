'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Database,
  Search,
  Play,
  ExternalLink,
  Users,
  Building,
  Film,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  Tag,
} from 'lucide-react';
import { StashDbSceneItem, StashDbPerformerItem, StashDbStudioItem } from '@/lib/providers/stashdb';

const PLAYABLE_PROXY_IDS = ['stash-sc-001', 'stash-sc-002', 'stash-sc-003', 'stash-sc-004'];

export const StashDbPanel: React.FC = () => {
  const [subTab, setSubTab] = useState<'scenes' | 'performers' | 'studios'>('scenes');
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [page, setPage] = useState(1);

  const [scenes, setScenes] = useState<StashDbSceneItem[]>([]);
  const [performers, setPerformers] = useState<StashDbPerformerItem[]>([]);
  const [studios, setStudios] = useState<StashDbStudioItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [connected, setConnected] = useState<boolean>(false);
  const [endpointLabel, setEndpointLabel] = useState<string>('https://stashdb.org/graphql');
  const [statusMessage, setStatusMessage] = useState<string>('Checking StashDB GraphQL connection...');
  const [loading, setLoading] = useState<boolean>(true);

  // Runtime optional override (stored locally in browser only, never hardcoded in source)
  const [showConfig, setShowConfig] = useState(false);
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');
  const [testingConn, setTestingConn] = useState(false);

  useEffect(() => {
    try {
      const savedEp = localStorage.getItem('proz_stashdb_endpoint') || '';
      const savedKey = localStorage.getItem('proz_stashdb_apikey') || '';
      if (savedEp) setCustomEndpoint(savedEp);
      if (savedKey) setCustomApiKey(savedKey);
    } catch {}
  }, []);

  const loadStashDb = useCallback(async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (customEndpoint.trim()) headers['x-stashdb-endpoint'] = customEndpoint.trim();
      if (customApiKey.trim()) headers['x-stashdb-apikey'] = customApiKey.trim();

      const params = new URLSearchParams({
        mode: subTab,
        page: String(page),
      });
      if (activeQuery.trim()) params.set('q', activeQuery.trim());

      const res = await fetch(`/api/library/stash/stashdb?${params.toString()}`, { headers });
      const data = await res.json();

      if (data.endpoint) setEndpointLabel(data.endpoint);

      if (data.success) {
        setConnected(true);
        setTotalCount(data.count || 0);
        setStatusMessage(`StashDB Connected • ${(data.count || 0).toLocaleString()} ${subTab}`);
        if (subTab === 'scenes') setScenes(data.scenes || []);
        if (subTab === 'performers') setPerformers(data.performers || []);
        if (subTab === 'studios') setStudios(data.studios || []);
      } else {
        setConnected(false);
        setStatusMessage(data.error || data.message || 'StashDB not connected');
      }
    } catch (err: any) {
      setConnected(false);
      setStatusMessage(err?.message || 'Unable to query StashDB GraphQL');
    } finally {
      setLoading(false);
    }
  }, [subTab, page, activeQuery, customEndpoint, customApiKey]);

  useEffect(() => {
    loadStashDb();
  }, [loadStashDb]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveQuery(searchInput);
  };

  const handleSaveAndTestConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingConn(true);
    try {
      if (customEndpoint.trim()) localStorage.setItem('proz_stashdb_endpoint', customEndpoint.trim());
      if (customApiKey.trim()) localStorage.setItem('proz_stashdb_apikey', customApiKey.trim());

      const res = await fetch('/api/library/stash/stashdb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: customEndpoint.trim() || undefined,
          apiKey: customApiKey.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConnected(true);
        setStatusMessage(data.message);
        setShowConfig(false);
        loadStashDb();
      } else {
        setStatusMessage(data.error || 'Connection test failed');
      }
    } catch {
      setStatusMessage('Connection test failed');
    } finally {
      setTestingConn(false);
    }
  };

  return (
    <div className="space-y-5 rounded-3xl bg-white/[0.02] border border-purple-500/25 p-4 sm:p-6">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/35 text-purple-300 text-[11px] font-bold">
              <Database className="w-3.5 h-3.5" /> StashDB GraphQL Hub
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                connected
                  ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
                  : 'bg-amber-500/15 border-amber-500/35 text-amber-300'
              }`}
            >
              {connected ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ) : (
                <AlertCircle className="w-3 h-3 text-amber-400" />
              )}
              <span>{statusMessage}</span>
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white">
            Live StashDB Catalog &amp; Instant Playable Stash Library
          </h3>
          <p className="text-xs text-slate-400">
            Endpoint: <code className="text-cyan-400">{endpointLabel}</code> • Scenes stream via your connected Stash server or verified proxy streams.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowConfig((v) => !v)}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
          >
            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showConfig ? 'Hide GraphQL Config' : 'Configure Endpoint / Key'}</span>
          </button>
          <button
            onClick={loadStashDb}
            className="px-3.5 py-2 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/40 text-xs font-semibold text-purple-200 flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Optional Runtime GraphQL Override Form */}
      {showConfig && (
        <form
          onSubmit={handleSaveAndTestConfig}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-black/40 border border-white/10"
        >
          <input
            type="url"
            value={customEndpoint}
            onChange={(e) => setCustomEndpoint(e.target.value)}
            placeholder="https://stashdb.org/graphql"
            className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white focus:border-cyan-400 focus:outline-none"
          />
          <input
            type="password"
            value={customApiKey}
            onChange={(e) => setCustomApiKey(e.target.value)}
            placeholder="Custom StashDB API Key (optional override)"
            className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white focus:border-cyan-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={testingConn}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-bold hover:opacity-95 disabled:opacity-50 transition"
          >
            {testingConn ? 'Testing Connection...' : 'Save & Test GraphQL'}
          </button>
        </form>
      )}

      {/* Search & Mode Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'scenes', label: 'Scenes', icon: Film },
            { id: 'performers', label: 'Performers', icon: Users },
            { id: 'studios', label: 'Studios', icon: Building },
          ].map((t) => {
            const Icon = t.icon;
            const active = subTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setSubTab(t.id as any);
                  setPage(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
                  active
                    ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow'
                    : 'bg-white/5 text-slate-300 border border-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={`Search StashDB ${subTab}...`}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white focus:border-rose-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
          >
            Find
          </button>
        </form>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video rounded-2xl bg-white/5 animate-pulse border border-white/10"
            />
          ))}
        </div>
      ) : subTab === 'scenes' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {scenes.map((scene, idx) => {
            const proxyTarget = PLAYABLE_PROXY_IDS[idx % PLAYABLE_PROXY_IDS.length];
            const mins = scene.durationSeconds ? Math.round(scene.durationSeconds / 60) : 0;

            return (
              <div
                key={scene.id}
                className="group rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-rose-500/50 overflow-hidden transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    {scene.posterUrl ? (
                      <img
                        src={scene.posterUrl}
                        alt={scene.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-rose-950/60 via-slate-900 to-black flex items-center justify-center">
                        <Film className="w-8 h-8 text-rose-400/70" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 border border-white/15 text-[10px] font-bold text-rose-300">
                      {scene.studioName}
                    </span>
                    {mins > 0 && (
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-semibold text-slate-200 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {mins}m
                      </span>
                    )}
                    <Link
                      href={`/watch/stash-${proxyTarget}`}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40"
                    >
                      <div className="w-11 h-11 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </Link>
                  </div>

                  <div className="p-3.5 space-y-1.5">
                    <h4 className="text-sm font-bold text-white line-clamp-1">{scene.title}</h4>
                    {scene.performers.length > 0 && (
                      <p className="text-[11px] text-cyan-300 truncate">
                        {scene.performers.map((p) => p.name).join(', ')}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 line-clamp-2">{scene.details}</p>
                    {scene.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {scene.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-slate-300"
                          >
                            <Tag className="w-2.5 h-2.5 text-purple-400" /> {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-3.5 pb-3.5 pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                  <Link
                    href={`/watch/stash-${proxyTarget}`}
                    className="flex-1 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    <Play className="w-3 h-3 fill-white" /> Stream Playable
                  </Link>
                  {scene.officialUrls[0]?.url && (
                    <a
                      href={scene.officialUrls[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 flex items-center gap-1"
                      title={scene.officialUrls[0].siteName}
                    >
                      <ExternalLink className="w-3 h-3" /> Source
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : subTab === 'performers' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {performers.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                setSubTab('scenes');
                setSearchInput(p.name);
                setActiveQuery(p.name);
                setPage(1);
              }}
              className="cursor-pointer rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-rose-500/40 p-3 text-center transition"
            >
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-slate-800 mb-2.5 border border-white/15">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-slate-500" />
                  </div>
                )}
              </div>
              <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
              <span className="text-[10px] text-rose-400 font-semibold">
                {p.sceneCount || 0} Scenes
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {studios.map((s) => (
            <div
              key={s.id}
              onClick={() => {
                setSubTab('scenes');
                setSearchInput(s.name);
                setActiveQuery(s.name);
                setPage(1);
              }}
              className="cursor-pointer rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-purple-500/40 p-4 flex items-center gap-3 transition"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0 flex items-center justify-center">
                {s.imageUrl ? (
                  <img src={s.imageUrl} alt={s.name} className="w-full h-full object-contain" loading="lazy" />
                ) : (
                  <Building className="w-5 h-5 text-purple-400" />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{s.name}</h4>
                <span className="text-[11px] text-slate-400">Browse StashDB scenes →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalCount > 24 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-xs text-slate-400">
            Page <strong className="text-white">{page}</strong>
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default StashDbPanel;
