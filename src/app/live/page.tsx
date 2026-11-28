"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Radio,
  Search,
  Heart,
  Play,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { getAllChannels } from '@/lib/data/channelsData';
import { resolveChannelProfile } from '@/lib/providers/channelRegistry';
import VideoPlayer from '@/components/player/VideoPlayer';

export default function LiveTvPage() {
  const allChannels = useMemo(() => {
    return getAllChannels().map((c) => resolveChannelProfile(c));
  }, []);

  const [iptvStreams, setIptvStreams] = useState<any[]>([]);
  const [loadingStreams, setLoadingStreams] = useState(true);
  const [selectedLiveStream, setSelectedLiveStream] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('proz_live_favorites');
      if (saved) setFavorites(JSON.parse(saved));
    } catch {}

    setLoadingStreams(true);
    fetch('/api/v07/catalog?category=live_tv')
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d?.items) ? d.items : [];
        setIptvStreams(list);
        if (list.length > 0) setSelectedLiveStream(list[0]);
      })
      .catch(() => {})
      .finally(() => setLoadingStreams(false));
  }, []);

  const toggleFavorite = (id: string) => {
    const updated = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(updated);
    try {
      localStorage.setItem('proz_live_favorites', JSON.stringify(updated));
    } catch {}
  };

  const filteredBroadcasters = useMemo(() => {
    return allChannels.filter((c) => {
      const matchQ =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        selectedCategory === 'All' ||
        (selectedCategory === 'Favorites'
          ? favorites.includes(c.id)
          : c.category.toLowerCase() === selectedCategory.toLowerCase());
      return matchQ && matchCat;
    });
  }, [allChannels, search, selectedCategory, favorites]);

  const playerContent = useMemo(() => {
    if (!selectedLiveStream) return null;
    return {
      id: selectedLiveStream.id || `iptv-${selectedLiveStream.title}`,
      title: selectedLiveStream.title,
      slug: selectedLiveStream.id || 'live-tv',
      content_type: 'movie' as const,
      category: 'Live TV (.m3u8)',
      releaseYear: 2026,
      streamUrl: selectedLiveStream.streamUrl,
      fallbackMp4: selectedLiveStream.streamUrl,
      poster_url: selectedLiveStream.poster || '',
      backdrop_url: selectedLiveStream.backdrop || '',
      videoSources: [
        {
          id: `src-live-${selectedLiveStream.id}`,
          contentId: selectedLiveStream.id,
          providerId: 'iptv_org',
          providerName: 'IPTV-Org Live HLS',
          sourceType: 'direct_hls' as const,
          format: 'hls' as const,
          playbackUrl: selectedLiveStream.streamUrl,
          officialWatchUrl: selectedLiveStream.streamUrl,
          pricingType: 'free' as const,
          quality: '1080p',
          country: 'GLOBAL',
          rightsStatus: 'authorized' as const,
          verificationStatus: 'verified' as const,
          lastChecked: new Date().toISOString(),
        },
      ],
    } as any;
  }, [selectedLiveStream]);

  return (
    <div className="min-h-screen bg-proz-midnight text-proz-white pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-proz-purple/15 border border-proz-purple/30 text-proz-purple text-xs font-bold mb-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>LIVE BROADCASTS &amp; FREE-TO-AIR HLS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-proz-white">
              Live TV &amp; Broadcasters
            </h1>
          </div>
          <span className="px-3 py-1.5 rounded-xl glass-card text-xs text-proz-grey font-mono">
            {iptvStreams.length} Live HLS Streams Active
          </span>
        </div>

        {/* Live HLS Player Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {playerContent ? (
              <VideoPlayer content={playerContent} />
            ) : (
              <div className="aspect-video rounded-2xl cinema-card flex flex-col items-center justify-center p-6 text-center space-y-3">
                <RefreshCw className={`w-8 h-8 text-proz-purple ${loadingStreams ? 'animate-spin' : ''}`} />
                <p className="text-xs text-proz-grey">
                  {loadingStreams
                    ? 'Connecting to live HLS broadcast feeds...'
                    : 'Select a live channel on the right to start HLS playback.'}
                </p>
              </div>
            )}
          </div>

          <div className="cinema-card rounded-2xl p-4 space-y-3 max-h-[480px] flex flex-col">
            <h3 className="text-sm font-bold text-proz-white flex items-center gap-2 border-b border-proz-border/40 pb-2.5">
              <Radio className="w-4 h-4 text-proz-purple" />
              <span>
                {loadingStreams
                  ? 'Loading Live HLS Channels...'
                  : `Playable Live HLS Channels (${iptvStreams.length})`}
              </span>
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loadingStreams && iptvStreams.length === 0 && (
                <div className="space-y-2 py-2">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-12 rounded-xl bg-proz-elevated/60 animate-pulse border border-proz-border/40"
                    />
                  ))}
                </div>
              )}
              {iptvStreams.map((ch) => {
                const active = selectedLiveStream?.id === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedLiveStream(ch)}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between gap-2 text-left transition ${
                      active
                        ? 'bg-gradient-to-r from-proz-purple/25 to-orange-500/15 border border-proz-purple/60'
                        : 'bg-proz-elevated/50 hover:bg-proz-elevated border border-proz-border/40'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-proz-white truncate">{ch.title}</p>
                      <span className="text-[10px] text-proz-grey block truncate">
                        {ch.genres?.join(', ') || 'Free-to-Air HLS'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[9px] font-bold shrink-0 flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-current" /> LIVE
                    </span>
                  </button>
                );
              })}
              {!loadingStreams && iptvStreams.length === 0 && (
                <p className="text-xs text-proz-grey py-6 text-center">
                  No live HTTPS HLS streams available right now. Browse verified OTT channels below.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Verified On-Demand Channels Directory */}
        <div className="space-y-4 pt-4 border-t border-proz-border/40">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-proz-grey" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search verified OTT channel or category..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none no-scrollbar">
              {['All', 'Favorites', 'Indian OTT', 'Web Series', 'Regional', 'Drama', 'Comedy'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap border transition-all ${
                    selectedCategory === cat
                      ? 'glass-button-primary border-transparent'
                      : 'glass-button-secondary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredBroadcasters.slice(0, 48).map((c) => {
              const initials = c.name
                .split(' ')
                .slice(0, 2)
                .map((w) => w[0])
                .join('')
                .toUpperCase();
              const isFav = favorites.includes(c.id);

              return (
                <div
                  key={c.id}
                  className="p-3 rounded-2xl cinema-card hover:border-proz-purple/50 transition-all flex flex-col justify-between space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] text-white keep-white border border-white/15"
                      style={{
                        background: `radial-gradient(circle, ${c.color || '#FF2E54'}, #07070A)`,
                      }}
                    >
                      {initials}
                    </div>
                    <button onClick={() => toggleFavorite(c.id)} title="Bookmark">
                      <Heart
                        className={`w-3.5 h-3.5 ${isFav ? 'fill-proz-purple text-proz-purple' : 'text-proz-grey'}`}
                      />
                    </button>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-proz-white truncate">{c.name}</h4>
                    <span className="text-[10px] text-proz-grey block truncate">{c.category}</span>
                  </div>

                  <Link
                    href={`/channels/${c.slug}`}
                    className="w-full py-1.5 rounded-lg glass-button-secondary text-[10px] font-bold flex items-center justify-center gap-1"
                  >
                    <span>Open Channel</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
