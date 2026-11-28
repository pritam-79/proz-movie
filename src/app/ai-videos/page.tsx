'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Play,
  ShieldAlert,
  Search,
  Wand2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Film,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { AiAdultVideoEntry, AiGenerationJob } from '@/lib/providers/aiAdultVideos';

const CATEGORIES = [
  'All',
  'AI 3D Animation',
  'AI Cinematic Videos',
  'AI VR Videos',
  'AI Short Videos',
  'Recently Added',
  'Trending AI Videos',
] as const;

export default function AiAdultVideosPage() {
  const { user } = useAuth();
  const [ageVerified, setAgeVerified] = useState(false);
  const [category, setCategory] = useState<string>('All');
  const [sort, setSort] = useState<'newest' | 'popular' | 'rating'>('newest');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [items, setItems] = useState<AiAdultVideoEntry[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [providerStatus, setProviderStatus] = useState<{ configured: boolean; provider: string }>({
    configured: false,
    provider: 'Checking...',
  });

  // AI Video Generator Panel State
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('AI 3D Animation');
  const [durationSeconds, setDurationSeconds] = useState(8);
  const [generating, setGenerating] = useState(false);
  const [activeJob, setActiveJob] = useState<AiGenerationJob | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem('proz_18plus_verified') === 'true' || user) {
        setAgeVerified(true);
      }
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const fetchCatalog = useCallback(
    async (targetPage: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const res = await fetch(
          `/api/library/ai-videos?category=${encodeURIComponent(category)}&sort=${sort}&q=${encodeURIComponent(
            debouncedQuery
          )}&page=${targetPage}`
        );
        const data = await res.json();
        if (data.success) {
          setItems((prev) => {
            if (!append) return data.items || [];
            const seen = new Set(prev.map((x) => x.id));
            return [...prev, ...(data.items || []).filter((x: AiAdultVideoEntry) => !seen.has(x.id))];
          });
          setTotalCount(data.totalCount || 0);
          setHasMore(Boolean(data.hasMore));
          if (data.generationProvider) setProviderStatus(data.generationProvider);
        }
      } catch {
        // handled cleanly
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [category, sort, debouncedQuery]
  );

  useEffect(() => {
    if (!ageVerified) return;
    setPage(1);
    fetchCatalog(1, false);
  }, [ageVerified, category, sort, debouncedQuery, fetchCatalog]);

  useEffect(() => {
    if (!ageVerified || !hasMore || loadingMore || loading) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          const next = page + 1;
          setPage(next);
          fetchCatalog(next, true);
        }
      },
      { rootMargin: '250px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ageVerified, hasMore, loadingMore, loading, page, fetchCatalog]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/library/ai-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style, durationSeconds }),
      });
      const data = await res.json();
      if (data.job) setActiveJob(data.job);
    } catch {
      setActiveJob({
        jobId: 'local-err',
        prompt,
        style,
        durationSeconds,
        status: 'failed',
        message: 'Network error dispatching AI generation job.',
        createdAt: new Date().toISOString(),
      });
    } finally {
      setGenerating(false);
    }
  };

  if (!ageVerified) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full glass-card rounded-3xl p-8 border border-proz-pink/30 text-center space-y-5">
          <ShieldAlert className="w-12 h-12 text-proz-pink mx-auto" />
          <h1 className="text-2xl font-black text-proz-white">18+ Fictional AI Adult Content</h1>
          <p className="text-xs text-proz-grey leading-relaxed">
            This section contains strictly 18+ consenting fictional AI-generated adult animations and videos. No real-person likenesses or deepfakes are permitted.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-full glass-button text-xs font-semibold"
            >
              Exit
            </Link>
            <button
              onClick={() => {
                try {
                  localStorage.setItem('proz_18plus_verified', 'true');
                } catch {}
                setAgeVerified(true);
              }}
              className="px-6 py-2.5 rounded-full glass-button-primary text-xs font-bold"
            >
              I am 18+ — Enter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-proz-grey">
            <Link href="/restricted" className="hover:text-proz-cyan inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>PRO 18+ Hub</span>
            </Link>
            <span>/</span>
            <span className="text-proz-pink font-semibold">AI Adult Videos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-proz-white flex items-center gap-2.5">
            <Wand2 className="w-7 h-7 text-proz-pink" />
            <span>AI Adult Videos ({totalCount.toLocaleString()})</span>
          </h1>
          <p className="text-xs sm:text-sm text-proz-grey">
            Strictly 18+ fictional AI 3D animations, cinematic renders, and VR clips. Verified playable MP4/HLS streams only.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-proz-grey absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search AI videos..."
              className="pl-9 pr-4 py-2 rounded-xl glass-input text-xs sm:text-sm w-56"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="px-3 py-2 rounded-xl glass-input text-xs font-semibold"
          >
            <option value="newest">Newest</option>
            <option value="popular">Popular</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Optional AI Generation Studio */}
      <div className="rounded-2xl glass-card border border-proz-purple/30 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-proz-cyan" />
            <h2 className="text-sm font-bold text-proz-white">AI Video Generation Studio (Fictional 18+ Only)</h2>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              providerStatus.configured
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
            }`}
          >
            Provider: {providerStatus.provider}
          </span>
        </div>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe a fictional 18+ 3D/cinematic scene (no real-person likenesses)..."
            className="md:col-span-6 px-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm"
          />
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="md:col-span-2 px-3 py-2.5 rounded-xl glass-input text-xs"
          >
            <option value="AI 3D Animation">AI 3D Animation</option>
            <option value="AI Cinematic Videos">AI Cinematic</option>
            <option value="AI VR Videos">AI VR 180</option>
          </select>
          <select
            value={durationSeconds}
            onChange={(e) => setDurationSeconds(Number(e.target.value))}
            className="md:col-span-2 px-3 py-2.5 rounded-xl glass-input text-xs"
          >
            <option value={6}>6s Clip</option>
            <option value={8}>8s Clip</option>
            <option value={12}>12s Clip</option>
          </select>
          <button
            type="submit"
            disabled={generating || !prompt.trim()}
            className="md:col-span-2 py-2.5 rounded-xl glass-button-primary text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            <span>Generate</span>
          </button>
        </form>

        {activeJob && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              activeJob.status === 'completed'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : activeJob.status === 'failed'
                ? 'bg-red-500/10 border-red-500/30 text-red-200'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            }`}
          >
            {activeJob.status === 'completed' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">
                Job {activeJob.jobId} — {activeJob.status.toUpperCase()}
              </p>
              <p className="opacity-90 mt-0.5">{activeJob.message}</p>
            </div>
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
              category === cat
                ? 'bg-proz-pink text-white keep-white border-proz-pink'
                : 'bg-proz-elevated text-proz-grey border-proz-border hover:text-proz-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-video rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center space-y-2 border border-proz-border">
          <Film className="w-8 h-8 text-proz-grey mx-auto" />
          <p className="text-sm font-semibold text-proz-white">No matching AI videos found</p>
          <p className="text-xs text-proz-grey">Try clearing your search filter or switching AI video categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl overflow-hidden bg-white/[0.03] border border-proz-border hover:border-proz-pink/60 transition flex flex-col justify-between"
            >
              <div>
                <div className="aspect-video relative bg-slate-900">
                  {item.cover ? (
                    <img
                      src={item.cover}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                      {item.creator}
                    </div>
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-proz-pink/90 text-[10px] font-bold text-white">
                    {item.category}
                  </span>
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-[10px] font-semibold text-emerald-300">
                    {item.resolution}
                  </span>
                </div>
                <div className="p-3.5 space-y-1">
                  <h3 className="text-sm font-bold text-proz-white line-clamp-1">{item.title}</h3>
                  <p className="text-[11px] text-proz-cyan truncate">{item.creator}</p>
                  <p className="text-xs text-proz-grey line-clamp-2">{item.promptSummary}</p>
                </div>
              </div>
              <div className="px-3.5 pb-3.5">
                <Link
                  href={item.watchHref}
                  className="w-full py-2 rounded-xl bg-proz-pink hover:bg-proz-pink/90 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Play Inside PROZ</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="py-4 flex justify-center">
        {loadingMore && (
          <div className="inline-flex items-center gap-2 text-xs text-proz-grey">
            <Loader2 className="w-4 h-4 animate-spin text-proz-pink" />
            <span>Loading more AI videos...</span>
          </div>
        )}
      </div>
    </div>
  );
}
