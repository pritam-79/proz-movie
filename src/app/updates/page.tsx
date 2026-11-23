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
      title: "Automatic Stash Vault Connection",
      desc: "Built-in PROZ Cloud Vault Engine connects out of the box with zero manual server configuration required.",
      icon: Server,
      color: "text-emerald-400"
    },
    {
      title: "Populated 18+ Adult Video Catalog",
      desc: "Instant access to high-production adult feature movies with verified HTML5 MP4 streaming.",
      icon: Film,
      color: "text-red-400"
    },
    {
      title: "Curated Hot Web Series",
      desc: "Episodic adult web series collections with multiple seasons, episode guides, and one-click playback.",
      icon: Tv,
      color: "text-rose-400"
    },
    {
      title: "Hentai & 2D/3D Anime OVAs",
      desc: "Animated adult media catalog featuring cyberpunk and fantasy anime OVAs with full stream support.",
      icon: Sparkles,
      color: "text-purple-400"
    },
    {
      title: "3D VR & Spatial Immersion",
      desc: "Stereoscopic 180° and 360° VR adult video clips with spatial audio support for Meta Quest and Apple Vision Pro.",
      icon: Zap,
      color: "text-cyan-400"
    },
    {
      title: "Verified Adult Tube Portals",
      desc: "Official verified gateway to top adult streaming portals (Pornhub, RedTube, XVideos, SpankBang, xHamster).",
      icon: Globe,
      color: "text-emerald-300"
    },
    {
      title: "Performers & Studios Directory",
      desc: "Comprehensive model profiles and authorized studio portfolios with dynamic scene counts.",
      icon: Layers,
      color: "text-amber-400"
    },
    {
      title: "Android Native v0.04 APK Release",
      desc: "Signed production binary with seamless WebView routing, offline error recovery, and auto-update detection.",
      icon: ShieldCheck,
      color: "text-cyan-300"
    }
  ];

  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Release Hero Header */}
        <div className="p-8 rounded-3xl bg-white/[0.03] border border-red-500/30 backdrop-blur-xl shadow-2xl relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider">
              Release Notes
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              v0.04 Stable
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            PROZ MOVIE {brandConfig.version}
          </h1>
          <p className="text-base text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Automated Stash Vault Connection, Populated 18+ Video Catalog, Hot Web Series, Hentai OVAs, 3D VR, and Adult Tube Hubs.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/restricted"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition flex items-center gap-2"
            >
              <Flame className="w-4 h-4" />
              <span>Explore 18+ Vault</span>
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
