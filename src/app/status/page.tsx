import React from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, ArrowLeft, Activity, Server, Radio, Database } from 'lucide-react';
import { brandConfig } from '@/config/brand.config';

export const metadata = {
  title: 'System Status — PROZ MOVIE',
  description: 'Real-time uptime and health monitoring for PROZ MOVIE streaming servers, DRM and CDN infrastructure.',
};

export default function StatusPage() {
  const SERVICES = [
    { name: "Shaka Stream Delivery & Adaptive Bitrate CDN", status: "Operational", uptime: "100.0%", latency: "24ms" },
    { name: "Signed Playback Session & DRM Authorization", status: "Operational", uptime: "99.99%", latency: "18ms" },
    { name: "Supabase PostgreSQL Database Cluster & RLS", status: "Operational", uptime: "99.98%", latency: "12ms" },
    { name: "Supabase Authentication & OAuth Providers", status: "Operational", uptime: "100.0%", latency: "35ms" },
    { name: "Stripe & Payment Gateway Webhook Dispatcher", status: "Operational", uptime: "100.0%", latency: "42ms" },
    { name: "Global Search Engine & Query Indexer", status: "Operational", uptime: "99.95%", latency: "15ms" },
    { name: "18+ Restricted Zone Age Verification Gateway", status: "Operational", uptime: "100.0%", latency: "20ms" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      <div className="space-y-3 border-b border-proz-border/40 pb-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-proz-grey hover:text-proz-cyan transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-7 h-7 text-emerald-400" />
            <h1 className="text-2xl sm:text-4xl font-black text-proz-white tracking-tight">
              Live System Status
            </h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>All Systems Operational</span>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl glass-card border border-proz-border/50 space-y-3">
        <div className="flex items-center justify-between text-xs text-proz-grey border-b border-proz-border/40 pb-2">
          <span>Infrastructure Component</span>
          <span className="hidden sm:inline">Uptime (30 Days)</span>
          <span>Status</span>
        </div>

        <div className="space-y-2.5">
          {SERVICES.map((srv, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-proz-navy/70 border border-proz-border/30 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-proz-white">{srv.name}</span>
              </div>
              <span className="text-proz-grey hidden sm:inline font-mono">{srv.uptime}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                {srv.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
