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
  Globe
} from 'lucide-react';

export default function UpdatesPage() {
  const features = [
    {
      title: "Private Multi-User Library",
      desc: "Isolated personal libraries with independent ratings, favourites, watch progress, and hidden collections.",
      icon: FolderLock,
      color: "text-purple-400"
    },
    {
      title: "Multiple Stash Connections",
      desc: "Federated integration with self-hosted Stash instances via official GraphQL API without leaking internal credentials.",
      icon: Server,
      color: "text-cyan-400"
    },
    {
      title: "Playlists & Group Sharing",
      desc: "Customizable playlists with shuffle, repeat, and permission-governed group collaboration.",
      icon: Layers,
      color: "text-emerald-400"
    },
    {
      title: "Direct Authorized Media Playback",
      desc: "Unified Shaka/HTML5 player supporting short-lived signed sessions and encrypted streaming proxy.",
      icon: Zap,
      color: "text-amber-400"
    },
    {
      title: "Download Permissions & Queue Manager",
      desc: "Offline download management with per-user storage quotas and pause/resume capabilities.",
      icon: Download,
      color: "text-purple-300"
    },
    {
      title: "Adult-Section Privacy Controls",
      desc: "Dedicated 18+ ecosystem with strict birth-year gate, performer profiles, studio directories, and galleries.",
      icon: ShieldCheck,
      color: "text-rose-400"
    },
    {
      title: "Authorized P2P Integration Framework",
      desc: "Strictly allowlisted Public Domain, Creative Commons, and rights-holder distribution adapter.",
      icon: Radio,
      color: "text-cyan-300"
    },
    {
      title: "10-Foot TV Mode & Media Timeline",
      desc: "Remote-friendly navigation with big media cards and chronological activity feeds.",
      icon: Tv,
      color: "text-emerald-300"
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
        <div className="p-8 rounded-3xl bg-white/[0.03] border border-purple-500/30 backdrop-blur-xl shadow-2xl relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider">
              Release Notes
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              Stable Build
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            PROZ MOVIE v0.02
          </h1>
          <p className="text-base text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Premium OTT Streaming meets Private Federated Media Library and Restricted 18+ Ecosystem.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/library"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition flex items-center gap-2"
            >
              <FolderLock className="w-4 h-4" />
              <span>Explore My Library</span>
            </Link>
            <Link
              href="/restricted"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Open 18+ Vault</span>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span>What&apos;s New in v0.02</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div 
                key={i} 
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-500/40 transition flex items-start gap-4"
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
