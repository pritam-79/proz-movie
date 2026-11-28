'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Database,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Film,
  Users,
  Building,
  Play,
  Info,
  X,
  Tag,
  Clock,
  ExternalLink,
} from 'lucide-react';
import type {
  StashDbSceneItem,
  StashDbPerformerItem,
  StashDbStudioItem,
} from '@/lib/providers/stashdb';
import { toStashWatchPath } from '@/lib/utils/streamUtils';

interface StashDbPanelProps {
  onSelectPerformer?: (id: string) => void;
  onSelectStudio?: (id: string) => void;
}

export const StashDbPanel: React.FC<StashDbPanelProps> = ({
  onSelectPerformer,
  onSelectStudio,
}) => {
  const [subTab, setSubTab] = useState<'scenes' | 'performers' | 'studios'>('scenes');
  const [sceneTag, setSceneTag] = useState<'all' | 'hentai' | 'vr' | '3d'>('all');
  const [perfGender, setPerfGender] = useState<'FEMALE' | 'MALE' | 'TRANSGENDER_FEMALE' | 'ALL'>('FEMALE');
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [page, setPage] = useState(1);

  const [scenes, setScenes] = useState<StashDbSceneItem[]>([]);
  const [performers, setPerformers] = useState<StashDbPerformerItem[]>([]);
  const [studios, setStudios] = useState<StashDbStudioItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [connected, setConnected] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Connecting to backend StashDB service...');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedScene, setSelectedScene] = useState<StashDbSceneItem | null>(null);

  const loadStashDb = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams({
        mode: subTab,
        page: String(page),
      });
      if (activeQuery.trim()) params.set('q', activeQuery.trim());
      if (subTab === 'scenes' && sceneTag !== 'all') params.set('tag', sceneTag);
      if (subTab === 'performers') params.set('gender', perfGender);

      const res = await fetch(`/api/library/stash/stashdb?${params.toString()}`);
      const data = await res.json();

      if (data.success && data.configured) {
        setConnected(true);
        setTotalCount(data.count || 0);
        if (subTab === 'scenes') setScenes(data.scenes || []);
        if (subTab === 'performers') setPerformers(data.performers || []);
        if (subTab === 'studios') setStudios(data.studios || []);
        setStatusMessage(
          `Backend StashDB Connected • ${(data.count || 0).toLocaleString()} indexed ${subTab}`
        );
      } else {
        setConnected(false);
        const msg = data.error || data.message || 'StashDB backend unavailable';
        setErrorMsg(msg);
        setStatusMessage(msg);
      }
    } catch (err: any) {
      setConnected(false);
      const msg = err?.message || 'Unable to query backend StashDB service';
      setErrorMsg(msg);
      setStatusMessage(msg);
    } finally {
      setLoading(false);
    }
  }, [subTab, page, activeQuery, sceneTag, perfGender]);

  useEffect(() => {
    loadStashDb();
  }, [loadStashDb]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveQuery(searchInput);
  };

  return (
    <div className="space-y-5 rounded-3xl cinema-card p-4 sm:p-6">
      {/* Header Status Bar — strictly backend-managed (no manual API key inputs) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-proz-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-proz-purple/15 text-proz-purple border border-proz-purple/30 text-[11px] font-bold uppercase tracking-wider">
              <Database className="w-3.5 h-3.5" /> StashDB Metadata Catalogue
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                connected
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}
            >
              {connected ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              {statusMessage}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-proz-white">
            StashDB Community Metadata &amp; File Matcher
          </h3>
          <p className="text-xs text-proz-grey">
            Authenticated automatically through PROZ backend. Play actions appear only when a catalog item matches an actual playable media file in your library.
          </p>
        </div>

        <button
          onClick={loadStashDb}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-proz-elevated hover:bg-proz-purple/20 text-proz-white border border-proz-border text-xs font-semibold flex items-center gap-1.5 transition shrink-0 self-start"
          title="Refresh StashDB"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-proz-purple ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Catalogue</span>
        </button>
      </div>

      {/* Subtabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'scenes', label: 'Catalogue Scenes', icon: Film },
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
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition ${
                  active
                    ? 'glass-button-primary shadow-purple-glow'
                    : 'bg-proz-elevated text-proz-grey hover:text-proz-white border border-proz-border'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-80">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-proz-grey absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={`Search StashDB ${subTab}...`}
              className="w-full pl-8 pr-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl glass-button-primary text-xs font-semibold transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category Tag / Gender Filters */}
      {subTab === 'scenes' && (
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Indexed Scenes (1.13M+)' },
            { id: 'vr', label: 'Virtual Reality (39k+)' },
            { id: '3d', label: '3D Available (15k+)' },
            { id: 'hentai', label: 'Hentai (1,639+)' },
          ].map((tagItem) => (
            <button
              key={tagItem.id}
              onClick={() => {
                setSceneTag(tagItem.id as any);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition ${
                sceneTag === tagItem.id
                  ? 'bg-proz-cyan/15 text-proz-cyan border-proz-cyan/40'
                  : 'bg-proz-elevated text-proz-grey border-proz-border hover:text-proz-white'
              }`}
            >
              {tagItem.label}
            </button>
          ))}
        </div>
      )}

      {subTab === 'performers' && (
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'FEMALE', label: 'Female Stars (70k+)' },
            { id: 'MALE', label: 'Male Performers' },
            { id: 'TRANSGENDER_FEMALE', label: 'Transgender Performers' },
            { id: 'ALL', label: 'All Genders' },
          ].map((g) => (
            <button
              key={g.id}
              onClick={() => {
                setPerfGender(g.id as any);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition ${
                perfGender === g.id
                  ? 'bg-proz-purple/15 text-proz-purple border-proz-purple/40'
                  : 'bg-proz-elevated text-proz-grey border-proz-border hover:text-proz-white'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}

      {/* Explicit Error & Retry State */}
      {!loading && errorMsg && (
        <div className="rounded-2xl bg-rose-950/35 border border-rose-500/35 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-rose-200 keep-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            {errorMsg.includes('STASHDB_API_KEY') && (
              <Link
                href="/settings"
                className="px-3.5 py-1.5 rounded-xl bg-proz-elevated hover:bg-proz-purple/20 border border-proz-border text-proz-white text-xs font-bold"
              >
                Settings Vault
              </Link>
            )}
            <button
              onClick={loadStashDb}
              className="px-3.5 py-1.5 rounded-xl glass-button-primary text-xs font-bold"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[16/11] rounded-2xl bg-proz-elevated/60 animate-pulse" />
          ))}
        </div>
      ) : subTab === 'scenes' ? (
        scenes.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-proz-elevated/50 border border-proz-border text-xs text-proz-grey">
            No StashDB scenes found matching &ldquo;{activeQuery || 'latest catalog'}&rdquo;.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {scenes.map((scene) => (
              <div
                key={scene.id}
                className="group rounded-2xl overflow-hidden cinema-card border border-proz-border/60 hover:border-proz-purple/50 transition-all flex flex-col justify-between"
              >
                <div
                  onClick={() => setSelectedScene(scene)}
                  className="cursor-pointer"
                >
                  <div className="relative aspect-video bg-proz-elevated overflow-hidden">
                    {scene.image ? (
                      <img
                        src={scene.image}
                        alt={scene.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (!img.dataset.proxied && scene.image) {
                            img.dataset.proxied = '1';
                            img.src = `/api/library/image-proxy?url=${encodeURIComponent(scene.image)}`;
                          }
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-proz-purple/20 to-proz-midnight text-xs text-proz-grey p-3 text-center">
                        {scene.studioName}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                    <span
                      className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        scene.isPlayable
                          ? 'bg-emerald-600/90 text-white keep-white border-emerald-400/50'
                          : 'bg-black/80 text-zinc-200 keep-white border-white/15'
                      }`}
                    >
                      {scene.isPlayable ? 'Matched Playable File' : 'Metadata Only'}
                    </span>
                    {scene.durationSeconds > 0 && (
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-white keep-white font-mono">
                        {Math.floor(scene.durationSeconds / 60)}m
                      </span>
                    )}
                  </div>

                  <div className="p-3 space-y-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-proz-white line-clamp-1">
                      {scene.title}
                    </h4>
                    <p className="text-[11px] text-proz-purple truncate">
                      {scene.studioName}
                      {scene.performers.length > 0
                        ? ` • ${scene.performers.map((p) => p.name).slice(0, 2).join(', ')}`
                        : ''}
                    </p>
                    <p className="text-[10px] text-proz-grey line-clamp-2">{scene.details}</p>
                    {scene.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {scene.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 rounded bg-proz-elevated text-[9px] text-proz-grey"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Footer: NEVER show Play unless isPlayable & matchedSceneId exist */}
                <div className="px-3 pb-3 pt-1 flex items-center gap-2">
                  {scene.isPlayable && scene.matchedSceneId ? (
                    <Link
                      href={toStashWatchPath(scene.matchedSceneId)}
                      className="flex-1 py-1.5 rounded-lg glass-button-primary text-[11px] font-bold flex items-center justify-center gap-1 hover:opacity-95 transition"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Play Matched Media</span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => setSelectedScene(scene)}
                      className="flex-1 py-1.5 rounded-lg bg-proz-elevated/80 hover:bg-proz-elevated border border-proz-border text-proz-grey hover:text-proz-white text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                    >
                      <Info className="w-3 h-3 text-proz-cyan" />
                      <span>View Metadata Only</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : subTab === 'performers' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {performers.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                if (onSelectPerformer) {
                  onSelectPerformer(`stashdb-${p.id}`);
                } else {
                  setSubTab('scenes');
                  setSearchInput(p.name);
                  setActiveQuery(p.name);
                  setPage(1);
                }
              }}
              className="group text-left rounded-2xl overflow-hidden cinema-card border border-proz-border/60 hover:border-proz-purple/50 transition flex flex-col"
            >
              <div className="aspect-[3/4] w-full bg-proz-elevated overflow-hidden">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.dataset.proxied && p.imageUrl) {
                        img.dataset.proxied = '1';
                        img.src = `/api/library/image-proxy?url=${encodeURIComponent(p.imageUrl)}`;
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-proz-grey text-xs">
                    <Users className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <h4 className="text-xs font-bold text-proz-white truncate">{p.name}</h4>
                <p className="text-[10px] text-proz-grey truncate">
                  {p.country || 'Metadata'} • {(p.sceneCount || 0).toLocaleString()} credits
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {studios.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                if (onSelectStudio) {
                  onSelectStudio(`stashdb-${s.id}`);
                } else {
                  setSubTab('scenes');
                  setSearchInput(s.name);
                  setActiveQuery(s.name);
                  setPage(1);
                }
              }}
              className="text-left rounded-2xl cinema-card hover:border-proz-purple/50 border border-proz-border/60 p-4 flex items-center gap-3 transition"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-proz-elevated border border-proz-border shrink-0 flex items-center justify-center">
                {s.imageUrl ? (
                  <img
                    src={s.imageUrl}
                    alt={s.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.dataset.proxied && s.imageUrl) {
                        img.dataset.proxied = '1';
                        img.src = `/api/library/image-proxy?url=${encodeURIComponent(s.imageUrl)}`;
                      }
                    }}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                ) : (
                  <Building className="w-5 h-5 text-proz-purple" />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-proz-white truncate">{s.name}</h4>
                <span className="text-[11px] text-proz-grey">Open Studio Metadata →</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalCount > 24 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3.5 py-1.5 rounded-xl bg-proz-elevated border border-proz-border text-xs text-proz-white disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-xs text-proz-grey">
            Page <strong className="text-proz-white">{page}</strong>
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-3.5 py-1.5 rounded-xl bg-proz-elevated border border-proz-border text-xs text-proz-white"
          >
            Next
          </button>
        </div>
      )}

      {/* Metadata Detail Drawer / Modal */}
      {selectedScene && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cinema-card bg-proz-navy border border-proz-purple/40 rounded-3xl max-w-xl w-full p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-proz-purple/15 text-proz-purple border border-proz-purple/30">
                  {selectedScene.isPlayable ? 'Playable Media Linked' : 'StashDB Metadata Only — Not a Video File'}
                </span>
                <h4 className="text-lg font-black text-proz-white mt-2">{selectedScene.title}</h4>
              </div>
              <button
                onClick={() => setSelectedScene(null)}
                className="p-1.5 rounded-lg bg-proz-elevated hover:bg-proz-purple/20 text-proz-grey hover:text-proz-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedScene.image && (
              <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-proz-border">
                <img
                  src={selectedScene.image}
                  alt={selectedScene.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (!img.dataset.proxied && selectedScene.image) {
                      img.dataset.proxied = '1';
                      img.src = `/api/library/image-proxy?url=${encodeURIComponent(selectedScene.image)}`;
                    }
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <p className="text-xs text-proz-grey leading-relaxed">{selectedScene.details}</p>

            <div className="grid grid-cols-2 gap-3 text-xs bg-proz-elevated/60 border border-proz-border rounded-xl p-3">
              <div>
                <span className="text-proz-grey block text-[10px] uppercase">Studio</span>
                <span className="font-semibold text-proz-white">{selectedScene.studioName}</span>
              </div>
              <div>
                <span className="text-proz-grey block text-[10px] uppercase">Release Date / Duration</span>
                <span className="font-semibold text-proz-white flex items-center gap-1">
                  <Clock className="w-3 h-3 text-proz-cyan" />
                  {selectedScene.date || 'N/A'} • {Math.floor((selectedScene.durationSeconds || 0) / 60)}m
                </span>
              </div>
            </div>

            {selectedScene.performers.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-proz-grey uppercase">Cast / Performers</p>
                <div className="flex flex-wrap gap-2">
                  {selectedScene.performers.map((perf) => (
                    <button
                      key={perf.id}
                      onClick={() => {
                        setSelectedScene(null);
                        onSelectPerformer?.(`stashdb-${perf.id}`);
                      }}
                      className="px-2.5 py-1 rounded-full bg-proz-purple/15 border border-proz-purple/30 text-proz-purple text-xs font-medium hover:bg-proz-purple/25"
                    >
                      {perf.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedScene.tags.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-proz-grey uppercase flex items-center gap-1">
                  <Tag className="w-3 h-3 text-proz-cyan" /> Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedScene.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-full bg-proz-elevated border border-proz-border text-[11px] text-proz-grey"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              {selectedScene.isPlayable && selectedScene.matchedSceneId ? (
                <Link
                  href={toStashWatchPath(selectedScene.matchedSceneId)}
                  className="px-4 py-2 rounded-xl glass-button-primary text-xs font-bold flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Play Linked Stream</span>
                </Link>
              ) : selectedScene.officialUrls[0]?.url ? (
                <a
                  href={selectedScene.officialUrls[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-proz-elevated hover:bg-proz-border text-proz-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>Reference Record</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StashDbPanel;
