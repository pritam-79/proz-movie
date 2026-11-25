"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  FolderLock, 
  ShieldCheck, 
  Radio, 
  Download, 
  Tv, 
  Layers, 
  Server,
  Zap,
  Globe,
  Compass,
  Film,
  Activity,
  Flame,
  Glasses
} from 'lucide-react';
import { brandConfig } from '@/config/brand.config';

export default function UpdatesPage() {
  const features = [
    {
      title: "v0.08 Distinct Movie & Anime Playback",
      desc: "Fixed shared demo video loop and Deadpool fallback bug — every movie, anime, and dynamic AniList/Kitsu/TVmaze title now loads its own metadata and official trailer.",
      icon: Film,
      color: "text-cyan-400"
    },
    {
      title: "Channel MPEG-TS (.ts) & Stream Proxy Repair",
      desc: "Added mpegts.js playback for .ts CDN channels, URL space/Unicode encoding, CORS range proxy, and automatic retry caching across all CineWebby channels.",
      icon: Tv,
      color: "text-rose-400"
    },
    {
      title: "StashDB GraphQL + Complete Stash Ecosystem",
      desc: "Integrated live StashDB GraphQL scenes, performers, and studios cleanly into Stash Vault & 18+ Zone, and replaced broken HTTP 403 Stash proxy streams.",
      icon: FolderLock,
      color: "text-purple-400"
    },
    {
      title: "Mobile WebView Redesign & v0.08 Update Popup",
      desc: "Fixed header/sub-nav overlapping on mobile phones, upgraded circular channel artwork, removed cluttered demo showcase, and added an automatic informative release popup.",
      icon: Sparkles,
      color: "text-emerald-400"
    },
    {
      title: "v0.07 Modern Categorized OTT Hub (/ott-hub)",
      desc: "Unified modern hub with master tabs for Full Playable Movies, Anime Universe, TV & Dramas, Live TV (.m3u8), Channels, Space & Open Cinema, and Playable-Only filtering.",
      icon: Compass,
      color: "text-cyan-400"
    },
    {
      title: "Cross-Source Deduplication Engine",
      desc: "Canonical matching merges duplicate entries across Internet Archive, PeerTube, NASA, Wikimedia, IPTV-Org, Kitsu, AniList, TVmaze, CineWebby, and core catalog.",
      icon: Layers,
      color: "text-purple-400"
    },
    {
      title: "Expanded Public-Domain & Open-Cinema Playback",
      desc: "Direct metadata resolution for full-length Internet Archive MP4 feature films, PeerTube HLS/MP4 videos, NASA space films, and Wikimedia Commons video.",
      icon: Film,
      color: "text-emerald-400"
    },
    {
      title: "Live TV Free-to-Air HLS + Kitsu Anime & Authorized DRM Lab",
      desc: "Integrates verified HTTPS .m3u8 channels from IPTV-Org, Kitsu anime API, and standards-based Widevine/ClearKey/FairPlay/PlayReady BYO test bench.",
      icon: Radio,
      color: "text-rose-400"
    },
    {
      title: "Live Cine18 / CineWebby API Provider",
      desc: "Universal provider adapter integrating 329+ live OTT channels, web series, video cards, and high-speed CDN stream links.",
      icon: Server,
      color: "text-emerald-400"
    },
    {
      title: "Fixed Channel Pages & Authentic Content",
      desc: "Alt Balaji, Bharti Jha, New Sensations, and Family XXX now display their genuine videos instead of unrelated Hollywood titles.",
      icon: Tv,
      color: "text-rose-400"
    },
    {
      title: "Robust Image Error Fallbacks",
      desc: "Graceful gradient placeholders and logo fallbacks across ContentCard and channel covers prevent broken image boxes.",
      icon: Film,
      color: "text-cyan-400"
    },
    {
      title: "Truthful Personal Stash Status",
      desc: "Eliminated artificial connection claims; shows clear 'Not Connected' status until a personal Stash server is linked.",
      icon: ShieldCheck,
      color: "text-amber-400"
    },
    {
      title: "Populated 18+ Streaming Catalog",
      desc: "Instant access to real streaming adult web series and movies with verified CDN playback links.",
      icon: Flame,
      color: "text-red-400"
    },
    {
      title: "Realistic 3D VR Playback",
      desc: "Stereoscopic 180° and 360° Side-by-Side playback with WebXR browser and headset compatibility.",
      icon: Zap,
      color: "text-purple-400"
    },
    {
      title: "Fixed UI Overlapping & Badges",
      desc: "Permanently removed intrusive floating version badge that covered navigation buttons and channel cards.",
      icon: Layers,
      color: "text-emerald-300"
    },
    {
      title: "Android Native v0.06 APK Release",
      desc: "Signed production binary with seamless WebView routing, offline recovery, and in-app update checks.",
      icon: Download,
      color: "text-cyan-300"
    }
  ];

  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 pt-6 sm:pt-10 pb-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Release Hero Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-red-500/30 backdrop-blur-xl shadow-2xl relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider">
              Release Notes
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              v0.08 Latest
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            PRO2 ENTERTAINMENT {brandConfig.version}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Playback Engine Repair, Channel MPEG-TS &amp; CDN Proxy Fixes, StashDB GraphQL Integration, Modern Mobile Layout Redesign, and Informative Update Popup.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/library"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-2"
            >
              <FolderLock className="w-4 h-4" />
              <span>Open Stash Vault</span>
            </Link>
            <Link
              href="/channels"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition flex items-center gap-2"
            >
              <Tv className="w-4 h-4" />
              <span>Explore Channels</span>
            </Link>
            <Link
              href="/restricted"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition flex items-center gap-2"
            >
              <Flame className="w-4 h-4" />
              <span>Explore 18+ Section</span>
            </Link>
            <Link
              href="/movies"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition flex items-center gap-2"
            >
              <Film className="w-4 h-4" />
              <span>Browse Movies</span>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-red-400" />
          <span>What&apos;s New in {brandConfig.version}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div 
                key={i} 
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-red-500/40 transition flex items-start gap-4"
              >
                <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${f.color} flex-shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{f.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
