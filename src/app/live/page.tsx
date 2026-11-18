"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Radio, 
  Search, 
  Heart, 
  Tv, 
  Play, 
  Clock, 
  ExternalLink, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  Volume2,
  Maximize2
} from 'lucide-react';
import { getAllChannels } from '@/lib/data/channelsData';
import { resolveChannelProfile } from '@/lib/providers/channelRegistry';

interface EpgProgram {
  currentTitle: string;
  currentTime: string;
  nextTitle: string;
  nextTime: string;
}

export default function LiveTvPage() {
  const allChannels = useMemo(() => {
    return getAllChannels().map(c => resolveChannelProfile(c));
  }, []);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeChannelId, setActiveChannelId] = useState<string>(allChannels[0]?.id || 'alt-balaji');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites
  useEffect(() => {
    try {
      const saved = localStorage.getItem('proz_live_favorites');
      if (saved) setFavorites(JSON.parse(saved));
    } catch {
      // Ignore
    }
  }, []);

  const toggleFavorite = (id: string) => {
    let updated: string[];
    if (favorites.includes(id)) {
      updated = favorites.filter(f => f !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    try {
      localStorage.setItem('proz_live_favorites', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const activeChannel = useMemo(() => {
    return allChannels.find(c => c.id === activeChannelId) || allChannels[0];
  }, [allChannels, activeChannelId]);

  // EPG Program Generator
  const epgData: EpgProgram = useMemo(() => {
    return {
      currentTitle: `${activeChannel?.name || 'Channel'} • Prime Time Broadcast`,
      currentTime: '21:00 – 22:30 IST',
      nextTitle: `${activeChannel?.category || 'Special'} • Late Night Masterwork`,
      nextTime: '22:30 – 00:00 IST'
    };
  }, [activeChannel]);

  const filteredChannels = useMemo(() => {
    return allChannels.filter(c => {
      const matchQ = c.name.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === 'All' || 
        (selectedCategory === 'Favorites' ? favorites.includes(c.id) : c.category.toLowerCase() === selectedCategory.toLowerCase());
      return matchQ && matchCat;
    });
  }, [allChannels, search, selectedCategory, favorites]);

  return (
    <div className="min-h-screen bg-[#07090E] text-zinc-100 pb-16">
      
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-rose-950/40 via-red-950/10 to-transparent pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>OFFICIAL BROADCAST & LIVE CHANNELS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Live TV & Broadcasters
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
              Region: India (IST)
            </span>
          </div>
        </div>

        {/* Live Broadcast Player Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Video Broadcast Frame */}
          <div className="lg:col-span-2 space-y-3">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl flex flex-col items-center justify-center p-6 text-center">
              
              <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600 text-white font-bold text-[10px] tracking-wider uppercase shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  LIVE
                </span>
                <span className="text-xs font-bold text-white bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
                  {activeChannel.name}
                </span>
              </div>

              {/* Broadcast Hub Screen */}
              <div className="space-y-4 max-w-md">
                <div 
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center font-extrabold text-white text-xl border-2 border-zinc-700 shadow-xl"
                  style={{ background: `radial-gradient(circle, ${activeChannel.color || '#E11D48'}, #0A0D15)` }}
                >
                  {activeChannel.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{epgData.currentTitle}</h3>
                  <p className="text-xs text-rose-400 font-semibold mt-0.5">{epgData.currentTime}</p>
                </div>

                <p className="text-xs text-zinc-400">
                  This broadcast feed is provided by the official {activeChannel.name} broadcaster network.
                </p>

                <div className="flex items-center justify-center gap-3 pt-2">
                  {activeChannel.officialWebsite && (
                    <a
                      href={activeChannel.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-all"
                    >
                      <span>Watch Live Feed</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => toggleFavorite(activeChannel.id)}
                    className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
                    title="Bookmark Channel"
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(activeChannel.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Bottom EPG Bar */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between text-xs text-left">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-zinc-400 text-[11px]">Up Next:</span>
                  <span className="font-semibold text-white text-[11px] truncate max-w-xs">{epgData.nextTitle}</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">{epgData.nextTime}</span>
              </div>

            </div>
          </div>

          {/* Program Guide & Broadcaster Info */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#0F1420] border border-zinc-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-500" />
                <span>EPG Program Guide</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wide">NOW PLAYING</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{epgData.currentTime}</span>
                  </div>
                  <p className="font-bold text-white">{epgData.currentTitle}</p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">NEXT PROGRAM</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{epgData.nextTime}</span>
                  </div>
                  <p className="font-semibold text-zinc-300">{epgData.nextTitle}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
                <p>Status: <span className="text-emerald-400 font-semibold">{activeChannel.integrationStatus || 'Broadcaster Verified'}</span></p>
                <p className="mt-1">Category: <span className="text-zinc-300 font-semibold">{activeChannel.category}</span></p>
              </div>
            </div>
          </div>

        </div>

        {/* Channels Search & Category Filter */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search live broadcaster or category..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F1420] border border-zinc-800 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none no-scrollbar">
              {['All', 'Favorites', 'Indian OTT', 'Regional', 'Drama', 'Comedy'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-rose-600 text-white font-bold'
                      : 'bg-[#0F1420] text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Channels Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredChannels.slice(0, 36).map((c) => {
              const isActive = c.id === activeChannelId;
              const initials = c.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

              return (
                <button
                  key={c.id}
                  onClick={() => setActiveChannelId(c.id)}
                  className={`p-3 rounded-xl border text-left transition-all group flex flex-col justify-between space-y-2 ${
                    isActive
                      ? 'bg-rose-600/15 border-rose-500 shadow-md ring-1 ring-rose-500'
                      : 'bg-[#0F1420] border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] text-white border border-zinc-700"
                      style={{ background: `radial-gradient(circle, ${c.color || '#991B1B'}, #0A0D15)` }}
                    >
                      {initials}
                    </div>

                    <span className="flex items-center gap-1 text-[9px] font-bold text-rose-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      LIVE
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-rose-400 truncate">
                      {c.name}
                    </h4>
                    <span className="text-[10px] text-zinc-500 block truncate">
                      {c.category}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
