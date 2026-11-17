"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { MOCK_CONTENT } from '@/lib/data/mockContent';

export const ContinueWatchingRow: React.FC = () => {
  const router = useRouter();
  const { watchHistory } = useAuth();

  if (!watchHistory || watchHistory.length === 0) return null;

  // Map history to content items
  const historyItems = watchHistory.map((hist) => {
    const content = MOCK_CONTENT.find((c) => c.id === hist.contentId);
    if (!content) return null;
    return {
      history: hist,
      content,
    };
  }).filter(Boolean);

  if (historyItems.length === 0) return null;

  return (
    <section className="relative my-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-proz-cyan" />
        <h2 className="text-lg sm:text-xl font-bold text-proz-white tracking-tight">
          Continue Watching
        </h2>
      </div>

      <div className="flex items-start gap-4 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
        {historyItems.map((item) => {
          if (!item) return null;
          const { content, history } = item;
          const percent = Math.min(100, Math.round((history.progressSeconds / (history.totalDurationSeconds || 1)) * 100));
          const minutesRemaining = Math.max(1, Math.round((history.totalDurationSeconds - history.progressSeconds) / 60));

          return (
            <div
              key={`${content.id}-${history.episodeId || 'main'}`}
              className="group shrink-0 w-64 sm:w-72 md:w-80 select-none cursor-pointer"
              onClick={() => router.push(`/watch/${content.id}${history.episodeId ? `?episode=${history.episodeId}` : ''}`)}
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden glass-card group-hover:border-proz-cyan/50 transition-all duration-300">
                <img
                  src={content.backdropUrl || content.backdrop_url || content.posterUrl || content.poster_url}
                  alt={content.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-proz-midnight/40 flex items-center justify-center">
                  <div className="p-3 rounded-full glass-button-primary shadow-cyan-glow group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-white" />
                  </div>
                </div>

                {/* Remaining Time Badge */}
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md glass-card text-[10px] font-semibold text-proz-white border border-proz-border/50">
                  {minutesRemaining}m left
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-proz-midnight/80">
                  <div
                    className="h-full bg-gradient-to-r from-proz-purple to-proz-cyan"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <div className="mt-2 space-y-0.5">
                <h4 className="text-xs sm:text-sm font-semibold text-proz-white truncate group-hover:text-proz-cyan transition-colors">
                  {content.title}
                </h4>
                <p className="text-[11px] text-proz-grey">
                  {history.episodeId ? `Episode • ${percent}% watched` : `${percent}% watched`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ContinueWatchingRow;
