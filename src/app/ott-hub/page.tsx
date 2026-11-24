'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Play,
  Radio,
  ShieldCheck,
  Film,
  Tv,
  Sparkles,
  CheckCircle2,
  Layers,
  Globe2,
  SlidersHorizontal,
  RefreshCw,
  Info,
  KeyRound,
} from 'lucide-react';
import { V07MediaItem } from '@/lib/providers/kitsu';
import { V07HubCategory } from '@/lib/services/v07Aggregator';
import { AUTHORIZED_DRM_PROFILES } from '@/lib/providers/drmConfig';
import OttQuickPlayerModal from '@/components/v07/OttQuickPlayerModal';

const MASTER_TABS: Array<{ id: V07HubCategory; label: string; badge?: string }> = [
  { id: 'all', label: 'All Deduplicated' },
  { id: 'playable_now', label: 'Full Playable Now', badge: 'NO TRAILERS' },
  { id: 'movies', label: 'Movies & Cinema' },
  { id: 'anime', label: 'Anime Universe' },
  { id: 'series_drama', label: 'TV & Dramas' },
  { id: 'live_tv', label: 'Live TV (.m3u8)', badge: 'LIVE' },
  { id: 'channels', label: 'OTT Channels' },
  { id: 'documentary', label: 'Space & Open Film' },
  { id: 'drm_lab', label: 'DRM & BYO Player', badge: 'EME' },
];

const SUB_CHIPS = [
  'All',
  'Classic Feature Films',
  'Sci-Fi & Horror',
  'Classic Comedy',
  'Anime Movies',
  'Anime Series',
  'Vintage Animation',
  'Space & Science Films',
  'PeerTube Open Cinema',
  'News',
  'Entertainment',
  'Music',
  'Sports',
];

export default function OttHubPage() {
  const [category, setCategory] = useState<V07HubCategory>('all');
  const [subCategory, setSubCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [playableOnly, setPlayableOnly] = useState(false);
  const [items, setItems] = useState<V07MediaItem[]>([]);
  const [stats, setStats] = useState<{
    rawTotal: number;
    uniqueTotal: number;
    duplicatesRemoved: number;
    playableNowCount: number;
    byProvider: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePlayerItem, setActivePlayerItem] = useState<V07MediaItem | null>(null);

  // Authorized BYO Stream & License Tester State
  const [byoStreamUrl, setByoStreamUrl] = useState('');
  const [byoLicenseUrl, setByoLicenseUrl] = useState('');

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category,
        subCategory,
        playableOnly: String(playableOnly),
        limit: '72',
      });
      if (submittedQuery.trim()) {
        params.set('q', submittedQuery.trim());
      }
      const res = await fetch(`/api/v07/catalog?${params.toString()}`);
      const data = await res.json();
      if (data?.success) {
        setItems(data.items || []);
        setStats(data.stats || null);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [category, subCategory, submittedQuery, playableOnly]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(query);
  };

  const handleLaunchByoStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!byoStreamUrl.trim()) return;
    const url = byoStreamUrl.trim();
    const isDash = url.includes('.mpd');
    const isHls = url.includes('.m3u8');

    const byoItem: V07MediaItem = {
      id: `byo-${Date.now()}`,
      externalId: 'byo-custom',
      providerId: 'byo_operator',
      providerName: 'Authorized Operator / BYO Stream',
      title: 'Custom Licensed / Personal Media Stream',
      canonicalTitle: 'Custom Stream',
      description: `Streaming operator-configured URL via Shaka EME engine (${isDash ? 'MPEG-DASH' : isHls ? 'HLS' : 'MP4'}).`,
      poster: '',
      backdrop: '',
      category: 'movies',
      subCategory: 'BYO Authorized Media',
      contentType: 'movie',
      releaseYear: 2026,
      language: 'Multi',
      country: 'GLOBAL',
      genres: ['Authorized Stream', 'BYO'],
      rating: 9.0,
      isAdult: false,
      playableType: byoLicenseUrl.trim() ? 'drm_test' : 'full_stream',
      streamUrl: url,
      streamFormat: isDash ? 'dash' : isHls ? 'hls' : 'mp4',
      drmConfig: byoLicenseUrl.trim()
        ? {
            type: 'widevine',
            licenseServerUrl: byoLicenseUrl.trim(),
            note: 'Custom Authorized License Server URL',
          }
        : undefined,
      rightsLabel: 'User-Supplied Authorized Stream',
      detailHref: '/ott-hub',
    };

    setActivePlayerItem(byoItem);
  };

  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 pt-24 pb-28">
      {/* Top Cinematic Header */}
      <div className="border-b border-white/10 bg-gradient-to-b from-rose-950/30 via-[#0C101B] to-[#080B12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/35 text-rose-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> PRO2 ENTERTAINMENT v0.07
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                  <Globe2 className="w-3.5 h-3.5" /> Multi-API + Dedup Engine
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Modern Categorized OTT Hub
              </h1>
              <p className="text-sm text-slate-400 max-w-2xl">
                Unified open-media, public-domain cinema, live HLS TV feeds, anime directories, and authorized EME DRM playback — compared across sources with duplicate entries automatically merged.
              </p>
            </div>

            {/* Deduplication Live Telemetry Pills */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
                <div className="px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Raw Queried</p>
                  <p className="text-lg font-extrabold text-white">{stats.rawTotal}</p>
                </div>
                <div className="px-3.5 py-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/25">
                  <p className="text-[10px] uppercase tracking-wider text-cyan-300">Unique Catalog</p>
                  <p className="text-lg font-extrabold text-cyan-200">{stats.uniqueTotal}</p>
                </div>
                <div className="px-3.5 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25">
                  <p className="text-[10px] uppercase tracking-wider text-amber-300">Deduped</p>
                  <p className="text-lg font-extrabold text-amber-200">{stats.duplicatesRemoved}</p>
                </div>
                <div className="px-3.5 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-300">Instant Playable</p>
                  <p className="text-lg font-extrabold text-emerald-200">{stats.playableNowCount}</p>
                </div>
              </div>
            )}
          </div>

          {/* Search Bar + Playable-Only Switch */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search movies, anime, live TV, sci-fi, classic comedy, NASA space..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 focus:border-cyan-400/60 focus:outline-none text-sm text-white placeholder:text-slate-500"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold transition"
              >
                Search
              </button>
            </form>

            <button
              onClick={() => setPlayableOnly((prev) => !prev)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                playableOnly
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                  : 'bg-white/[0.04] border-white/15 text-slate-300 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{playableOnly ? 'Playable Full Streams Only (ON)' : 'Filter: Direct Playable Only'}</span>
            </button>
          </div>

          {/* Primary OTT Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {MASTER_TABS.map((tab) => {
              const active = category === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setCategory(tab.id);
                    setSubCategory('All');
                  }}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                    active
                      ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-lg shadow-rose-600/25'
                      : 'bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:border-white/25'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/40 border border-white/20 text-cyan-300 font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Sub-Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {SUB_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setSubCategory(chip)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                subCategory === chip
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                  : 'bg-white/[0.03] text-slate-400 border border-white/10 hover:text-white'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Special Panel when DRM & BYO Player Tab is active */}
        {category === 'drm_lab' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white/[0.03] border border-purple-500/30 p-5 space-y-4">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <KeyRound className="w-4 h-4" />
                <span>Launch Operator-Authorized Stream / DRM License</span>
              </div>
              <p className="text-xs text-slate-400">
                Test your own hosted HLS (`.m3u8`), MPEG-DASH (`.mpd`), or MP4 stream alongside an authorized Widevine license endpoint in Shaka Player.
              </p>
              <form onSubmit={handleLaunchByoStream} className="space-y-3">
                <input
                  type="url"
                  required
                  value={byoStreamUrl}
                  onChange={(e) => setByoStreamUrl(e.target.value)}
                  placeholder="Stream Manifest URL (https://.../master.m3u8 or .mpd or .mp4)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:border-purple-400 focus:outline-none"
                />
                <input
                  type="url"
                  value={byoLicenseUrl}
                  onChange={(e) => setByoLicenseUrl(e.target.value)}
                  placeholder="Optional Authorized Widevine License URL (https://...)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:border-purple-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-bold hover:opacity-95 transition"
                >
                  Launch Authorized Shaka Player Session
                </button>
              </form>
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 space-y-3">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Supported EME / DRM Standards in PRO2 v0.07</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {AUTHORIZED_DRM_PROFILES.map((prof) => (
                  <div
                    key={prof.id}
                    className="p-3 rounded-xl bg-black/30 border border-white/10 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{prof.keySystemLabel}</span>
                      <span className="text-[10px] font-mono text-cyan-400">{prof.keySystem}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{prof.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Provider Source Breakdown Bar */}
        {stats && Object.keys(stats.byProvider).length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-2.5">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-slate-300">Active Sources Merged:</span>
            {Object.entries(stats.byProvider).map(([prov, count]) => (
              <span
                key={prov}
                className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300"
              >
                {prov}: <strong className="text-white">{count}</strong>
              </span>
            ))}
            <button
              onClick={loadCatalog}
              className="ml-auto inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              <RefreshCw className="w-3 h-3" /> Refresh Live
            </button>
          </div>
        )}

        {/* Catalog Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-[2/3] rounded-2xl bg-white/[0.04] animate-pulse border border-white/10"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-12 text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No matching titles found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Try clearing your sub-category chip or disabling the Playable-Only toggle to browse metadata &amp; official trailers as well.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setCategory('all');
                  setSubCategory('All');
                  setQuery('');
                  setSubmittedQuery('');
                  setPlayableOnly(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map((item) => {
              const isDirect =
                item.playableType === 'full_stream' ||
                item.playableType === 'live_hls' ||
                item.playableType === 'drm_test';

              return (
                <div
                  key={item.id}
                  onClick={() => setActivePlayerItem(item)}
                  className="cursor-pointer group rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-rose-500/60 overflow-hidden transition-all duration-200 flex flex-col"
                >
                  {/* Artwork Container */}
                  <div className="relative aspect-[2/3] bg-gradient-to-br from-[#161B2E] via-[#0B0F1A] to-[#06080F] overflow-hidden">
                    {item.poster ? (
                      <img
                        src={item.poster}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                        <Tv className="w-7 h-7 text-slate-500 mb-2" />
                        <span className="text-xs font-bold text-slate-300 line-clamp-3">
                          {item.title}
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent pointer-events-none" />

                    {/* Playability Badge */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
                      {item.playableType === 'live_hls' ? (
                        <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-black uppercase flex items-center gap-1 shadow">
                          <Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE HLS
                        </span>
                      ) : item.playableType === 'full_stream' ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-black uppercase shadow">
                          FULL PLAYABLE
                        </span>
                      ) : item.playableType === 'drm_test' ? (
                        <span className="px-1.5 py-0.5 rounded bg-purple-600 text-white text-[9px] font-black uppercase shadow">
                          EME DRM
                        </span>
                      ) : item.playableType === 'trailer' ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/90 text-slate-950 text-[9px] font-black uppercase shadow">
                          TRAILER
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800/90 text-slate-200 text-[9px] font-bold uppercase">
                          CATALOG
                        </span>
                      )}

                      <span className="px-1.5 py-0.5 rounded bg-black/75 text-amber-400 text-[10px] font-black">
                        {item.rating.toFixed(1)}
                      </span>
                    </div>

                    {/* Play Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center shadow-xl ${
                          isDirect ? 'bg-emerald-500 text-slate-950' : 'bg-rose-600 text-white'
                        }`}
                      >
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Bottom Provider Tag */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-slate-200 pointer-events-none">
                      <span className="px-1.5 py-0.5 rounded bg-black/70 border border-white/10 truncate max-w-[120px]">
                        {item.subCategory}
                      </span>
                      <span className="text-slate-300 font-semibold">{item.releaseYear}</span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="p-2.5 flex-1 flex flex-col justify-between gap-1">
                    <h3 className="text-xs font-bold text-white line-clamp-2 group-hover:text-cyan-300 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 truncate">{item.providerName}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Helpful link preserving all legacy sections */}
        <div className="pt-4 text-center text-xs text-slate-500">
          Need your 18+ private Vault or Stash server?{' '}
          <Link href="/restricted" className="text-rose-400 hover:text-rose-300 font-semibold underline">
            Open Age-Verified 18+ Section
          </Link>
        </div>
      </div>

      {/* Inline Adaptive Quick Player Modal */}
      <OttQuickPlayerModal
        item={activePlayerItem}
        customLicenseUrl={byoLicenseUrl}
        onClose={() => setActivePlayerItem(null)}
      />
    </div>
  );
}
