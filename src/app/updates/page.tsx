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
  Activity
} from 'lucide-react';
import { brandConfig } from '@/config/brand.config';

export default function UpdatesPage() {
  const features = [
    {
      title: "Automated Content Discovery Engine",
      desc: "Zero manual video uploads. Autonomous catalog ingestion across official provider APIs, public domain archives, and Creative Commons repositories.",
      icon: Compass,
      color: "text-cyan-400"
    },
    {
      title: "Verified Internet Archive Stream Integration",
      desc: "Direct, high-fidelity HTML5 MP4 playback of legendary public-domain cinema classics (Night of the Living Dead, Charade, Metropolis, His Girl Friday).",
      icon: Film,
      color: "text-purple-400"
    },
    {
      title: "Federated PeerTube CC Streaming",
      desc: "Integrated decentralized streaming from verified PeerTube instances featuring licensed Creative Commons open films (Sintel, Tears of Steel).",
      icon: Radio,
      color: "text-emerald-400"
    },
    {
      title: "Truthful, Transparent 18+ Adult Ecosystem",
      desc: "Completely eliminated fake mock scenes. Dedicated onboarding portal for self-hosted Stash instances with honest empty states and birth-year statutory age gate.",
      icon: ShieldCheck,
      color: "text-rose-400"
    },
    {
      title: "Live Provider API Health Dashboard",
      desc: "Real-time latency monitoring across 10 major providers (Internet Archive, PeerTube, Openverse, TVmaze, AniList, TMDB, Supabase, Stash).",
      icon: Activity,
      color: "text-amber-400"
    },
    {
      title: "Legitimate Watch Provider Deep Linking",
      desc: "Commercial Hollywood & Bollywood titles feature official streaming provider links (Netflix, Prime Video, Disney+ Hotstar, JioCinema, Zee5).",
      icon: Globe,
      color: "text-cyan-300"
    },
    {
      title: "Unified Profile Management",
      desc: "Persistent user profile name and email personalization with zero intrusive admin links; security portal accessible at designated administrative routes.",
      icon: Layers,
      color: "text-purple-300"
    },
    {
      title: "Android v0.03 WebView Resiliency",
      desc: "Eliminated false offline reconnect loops; seamless single-page application navigation with immediate in-app update checks.",
      icon: Zap,
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
        <div className="p-8 rounded-3xl bg-white/[0.03] border border-cyan-500/30 backdrop-blur-xl shadow-2xl relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider">
              Release Notes
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              Production Stable
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            PROZ MOVIE {brandConfig.version}
          </h1>
          <p className="text-base text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Automated Content Discovery Engine, Verified Playable Cinema, PeerTube Federation, and Truthful 18+ Private Vault Architecture.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/movies"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition flex items-center gap-2"
            >
              <Film className="w-4 h-4" />
              <span>Browse Playable Movies</span>
            </Link>
            <Link
              href="/restricted"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>18+ Adult Zone</span>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span>What&apos;s New in {brandConfig.version}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div 
                key={i} 
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/40 transition flex items-start gap-4"
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
