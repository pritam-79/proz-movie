"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Lock, 
  Unlock,
  CheckCircle2, 
  Calendar, 
  Film,
  Zap,
  Sparkles,
  Flame,
  Globe,
  ExternalLink,
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
  Eye,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StashScene, StashPerformer, StashStudio, StashGallery } from '@/types/library';

export default function RestrictedPage() {
  const { user, verify18Plus } = useAuth();
  const [birthYear, setBirthYear] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'scenes' | 'performers' | 'studios' | 'galleries'>('scenes');
  
  // Data from Stash Vault
  const [scenes, setScenes] = useState<StashScene[]>([]);
  const [performers, setPerformers] = useState<StashPerformer[]>([]);
  const [studios, setStudios] = useState<StashStudio[]>([]);
  const [galleries, setGalleries] = useState<StashGallery[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isUnlocked = user?.is18PlusVerified || false;

  useEffect(() => {
    if (isUnlocked) {
      setIsLoading(true);
      Promise.all([
        fetch('/api/library/stash/scenes').then(r => r.json()),
        fetch('/api/library/stash/performers').then(r => r.json()),
        fetch('/api/library/stash/studios').then(r => r.json()),
        fetch('/api/library/stash/galleries').then(r => r.json())
      ]).then(([sRes, pRes, stdRes, gRes]) => {
        if (sRes.success) setScenes(sRes.scenes);
        if (pRes.success) setPerformers(pRes.performers);
        if (stdRes.success) setStudios(stdRes.studios);
        if (gRes.success) setGalleries(gRes.galleries);
      }).finally(() => setIsLoading(false));
    }
  }, [isUnlocked]);

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

  return (
    <div className="min-h-screen bg-[#06080F] text-slate-100 pt-28 pb-20 px-4 md:px-8">
      {/* ─── LOCKED STATE: STRICT AGE VERIFICATION GATE ─── */}
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
            This section contains adult media collections intended exclusively for consenting adults aged 18 and older. 
            All content is managed through federated private Stash repositories and licensed partner feeds.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-red-950/20 border border-red-500/20 text-xs text-red-300 text-left flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
            <div>
              <span className="font-bold">Strict Legal Notice:</span> Content involving non-consensual material, minors, or unverified origin is strictly prohibited and denied by default.
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
        /* ─── UNLOCKED STATE: PEEK / STASH ADULT VAULT ECOSYSTEM ─── */
        <div className="max-w-7xl mx-auto">
          {/* Top Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-red-500/20 pb-6 mb-8">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                  <Flame className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-red-200 to-rose-400 bg-clip-text text-transparent">
                      PROZ 18+ Private Vault
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-extrabold">
                      AGE VERIFIED
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5">
                    Private media federation inspired by Peek Stash Browser. End-to-end encrypted proxy streaming.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex items-center gap-2">
              {(['scenes', 'performers', 'studios', 'galleries'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                    activeTab === tab
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* TAB 1: SCENES */}
          {activeTab === 'scenes' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-red-400" />
                  <span>Curated Scenes ({scenes.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {scenes.map(scene => (
                  <div
                    key={scene.id}
                    className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-red-500/40 rounded-2xl overflow-hidden transition shadow-xl flex flex-col"
                  >
                    <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                      <img
                        src={scene.paths.screenshot || scene.paths.webp}
                        alt={scene.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                      
                      {/* Rating / Badges */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        {scene.rating && (
                          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-400 flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-amber-400" /> {scene.rating}
                          </span>
                        )}
                      </div>

                      {/* Play Button Link */}
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
                          <span className="text-red-400 font-semibold">{scene.studio?.name}</span>
                          <span>{scene.date}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-red-300 transition">
                          {scene.title}
                        </h4>
                        {scene.performers && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                            {scene.performers.map(p => p.name).join(', ')}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-xs text-slate-400">
                        <span>{scene.playCount || 0} views</span>
                        <div className="flex items-center gap-2">
                          <button className="hover:text-red-400 transition" title="Favourite">
                            <Heart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PERFORMERS */}
          {activeTab === 'performers' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-red-400" />
                  <span>Featured Performers ({performers.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {performers.map(perf => (
                  <div
                    key={perf.id}
                    className="group bg-white/[0.03] border border-white/10 hover:border-red-500/40 rounded-2xl p-3 text-center transition"
                  >
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-slate-800 mb-3 border-2 border-transparent group-hover:border-red-500 transition">
                      <img
                        src={perf.imagePath}
                        alt={perf.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                    </div>
                    <h4 className="text-sm font-bold text-white truncate">{perf.name}</h4>
                    <span className="text-[11px] text-red-400 font-medium">{perf.sceneCount || 0} Scenes</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STUDIOS */}
          {activeTab === 'studios' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-red-400" />
                  <span>Authorized Studios ({studios.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {studios.map(studio => (
                  <div
                    key={studio.id}
                    className="bg-white/[0.03] border border-white/10 hover:border-red-500/40 rounded-2xl p-5 flex items-center gap-4 transition"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 border border-white/10 flex-shrink-0">
                      <img src={studio.imagePath} alt={studio.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">{studio.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">High-Definition Cinematic Production</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: GALLERIES */}
          {activeTab === 'galleries' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-red-400" />
                  <span>High-Resolution Photo Galleries ({galleries.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {galleries.map(gal => (
                  <div
                    key={gal.id}
                    className="group bg-white/[0.03] border border-white/10 hover:border-red-500/40 rounded-2xl overflow-hidden transition"
                  >
                    <div className="relative aspect-video w-full bg-slate-800 overflow-hidden">
                      <img src={gal.coverPath} alt={gal.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-bold text-white backdrop-blur-md">
                        {gal.imageCount} Photos
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-bold text-white line-clamp-1">{gal.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{gal.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
