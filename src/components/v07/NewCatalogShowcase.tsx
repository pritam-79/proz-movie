'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Play,
  Radio,
  ArrowRight,
  Layers,
  ShieldCheck,
  Film,
  CheckCircle2,
} from 'lucide-react';
import { V07MediaItem } from '@/lib/providers/kitsu';
import OttQuickPlayerModal from './OttQuickPlayerModal';

export const NewCatalogShowcase: React.FC = () => {
  const [items, setItems] = useState<V07MediaItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<V07MediaItem | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/v07/catalog?category=playable_now&playableOnly=true&limit=12')
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        if (data?.success && Array.isArray(data.items)) {
          setItems(data.items);
          setStats(data.stats || null);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
      <div className="rounded-3xl cinema-card border border-proz-cyan/25 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-proz-cyan/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-proz-cyan/15 border border-proz-cyan/35 text-proz-cyan text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> Unified Live Hub
              </span>
              {stats && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  {stats.uniqueTotal} Unique • {stats.duplicatesRemoved} Duplicates Removed
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-proz-white tracking-tight">
              Playable Open Cinema, Anime &amp; Live HLS Channels
            </h2>
            <p className="text-xs sm:text-sm text-proz-grey mt-0.5">
              Deduplicated real streams from Internet Archive, PeerTube, NASA, IPTV-Org &amp; Shaka EME — zero trailer bait.
            </p>
          </div>

          <Link
            href="/ott-hub"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass-button-primary text-xs sm:text-sm font-bold shadow-purple-glow shrink-0 transition"
          >
            <Layers className="w-4 h-4" />
            <span>Open Full OTT Hub</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Horizontal Preview Strip */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] rounded-2xl bg-proz-elevated/60 animate-pulse border border-proz-border/40"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {items.slice(0, 12).map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="text-left group rounded-2xl cinema-card hover:border-proz-cyan/50 overflow-hidden transition-all duration-200 flex flex-col"
              >
                <div className="relative aspect-[16/10] w-full bg-proz-elevated overflow-hidden">
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
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/75 border border-white/15 text-[9px] font-bold uppercase text-emerald-300 keep-white flex items-center gap-1">
                    {item.playableType === 'live_hls' ? (
                      <>
                        <Radio className="w-2.5 h-2.5 text-rose-400" /> LIVE
                      </>
                    ) : item.playableType === 'drm_test' ? (
                      <>
                        <ShieldCheck className="w-2.5 h-2.5 text-proz-purple" /> DRM
                      </>
                    ) : (
                      <>
                        <Film className="w-2.5 h-2.5 text-emerald-300" /> FULL
                      </>
                    )}
                  </span>

                  <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-proz-cyan text-slate-950 flex items-center justify-center shadow-lg opacity-90 group-hover:scale-110 transition-transform">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </div>

                <div className="p-2.5 flex-1 flex flex-col justify-between gap-1">
                  <p className="text-xs font-bold text-proz-white line-clamp-2 group-hover:text-proz-cyan transition-colors">
                    {item.title}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-proz-grey">
                    <span className="truncate max-w-[110px]">{item.subCategory}</span>
                    <span className="text-proz-cyan font-bold">{item.rating.toFixed(1)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <OttQuickPlayerModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </section>
  );
};

export default NewCatalogShowcase;
