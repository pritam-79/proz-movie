"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FolderLock, 
  Grid, 
  List, 
  Clock, 
  Star, 
  Heart, 
  Eye, 
  Play, 
  Download, 
  Plus, 
  Filter, 
  Search, 
  Sparkles, 
  Server, 
  Layers, 
  Tv, 
  Users, 
  CheckCircle2, 
  Share2,
  Film,
  Camera,
  Tag,
  Shuffle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StashScene, StashPerformer, StashStudio, MediaViewMode } from '@/types/library';
import StashDbPanel from '@/components/stash/StashDbPanel';

export default function PersonalLibraryPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<MediaViewMode>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'scenes' | 'performers' | 'studios' | 'playlists'>('all');
  const [scenes, setScenes] = useState<StashScene[]>([]);
  const [performers, setPerformers] = useState<StashPerformer[]>([]);
  const [studios, setStudios] = useState<StashStudio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudio, setSelectedStudio] = useState<string>('all');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [scenesRes, perfRes, studiosRes] = await Promise.all([
          fetch('/api/library/stash/scenes').then(r => r.json()),
          fetch('/api/library/stash/performers').then(r => r.json()),
          fetch('/api/library/stash/studios').then(r => r.json())
        ]);

        if (scenesRes.success) setScenes(scenesRes.scenes);
        if (perfRes.success) setPerformers(perfRes.performers);
        if (studiosRes.success) setStudios(studiosRes.studios);
      } catch (e) {
        console.error('Failed to load library data', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredScenes = scenes.filter(s => {
    if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedStudio !== 'all' && s.studio?.id !== selectedStudio) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 pt-5 sm:pt-8 pb-28 px-4 md:px-8">
      {/* Header & Sub-Bar */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <FolderLock className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-transparent">
                  My Private Library
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Multi-server federated vault powered by Stash GraphQL engine & Liquid Glass precision.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/restricted"
              className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs sm:text-sm font-semibold flex items-center gap-2 transition"
            >
              <FolderLock className="w-4 h-4" />
              <span>18+ Stash Ecosystem</span>
            </Link>
            <Link
              href="/tv"
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-medium flex items-center gap-2 transition"
            >
              <Tv className="w-4 h-4 text-cyan-400" />
              <span>TV Mode</span>
            </Link>
            <Link
              href="/library/playlists"
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium flex items-center gap-2 transition"
            >
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Playlists</span>
            </Link>
            <Link
              href="/library/downloads"
              className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-sm font-medium flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>Downloads</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs & View Mode Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {(['all', 'scenes', 'performers', 'studios', 'playlists'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* View Toggles & Search */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vault..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/60 w-48 transition"
              />
            </div>

            <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'compact' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Compact Grid"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm">Synchronizing with connected Stash servers...</p>
          </div>
        ) : filteredScenes.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/10 rounded-2xl p-8">
            <FolderLock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-300">No scenes found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Check your filters or trigger a synchronization with your Stash server in the Admin Hub.
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              : viewMode === 'compact'
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
              : "flex flex-col gap-3"
          }>
            {filteredScenes.map(scene => (
              <div
                key={scene.id}
                className="group relative bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-purple-500/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col"
              >
                {/* Media Thumbnail & Hover Preview */}
                <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                  <img
                    src={scene.paths.screenshot || scene.paths.webp}
                    alt={scene.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  
                  {/* Rating / O-Counter Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {scene.rating && (
                      <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        {scene.rating}
                      </span>
                    )}
                    {scene.oCounter ? (
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/80 backdrop-blur-md text-[10px] font-bold text-white">
                        {scene.oCounter}x
                      </span>
                    ) : null}
                  </div>

                  {/* Play Overlay */}
                  <Link
                    href={`/watch/stash-${scene.id}`}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs"
                  >
                    <div className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/50 transform group-hover:scale-110 transition">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </Link>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>{scene.studio?.name || 'Independent Studio'}</span>
                      <span>{scene.date}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-200 line-clamp-1 group-hover:text-purple-300 transition">
                      {scene.title}
                    </h4>
                    {scene.performers && scene.performers.length > 0 && (
                      <p className="text-xs text-purple-400/90 mt-1 line-clamp-1">
                        {scene.performers.map(p => p.name).join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Footer Action Icons */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-slate-400 text-xs">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      {scene.playCount || 0} views
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        className="hover:text-red-400 transition"
                        title="Add to Favourites"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                      <button 
                        className="hover:text-cyan-400 transition"
                        title="Add to Playlist"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button 
                        className="hover:text-purple-400 transition"
                        title="Download Scene"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Live StashDB GraphQL Catalog */}
        <div className="mt-10">
          <StashDbPanel />
        </div>
      </div>
    </div>
  );
}
