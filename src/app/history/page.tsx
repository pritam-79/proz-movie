"use client";

import React from 'react';
import Link from 'next/link';
import { History, Play, Trash2, ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { MOCK_CONTENT } from '@/lib/data/mockContent';

export default function HistoryPage() {
  const { watchHistory } = useAuth();

  const historyItems = watchHistory.map((hist) => {
    const content = MOCK_CONTENT.find((c) => c.id === hist.contentId);
    if (!content) return null;
    return {
      history: hist,
      content,
    };
  }).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      <div className="border-b border-proz-border/40 pb-4">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-proz-white tracking-tight flex items-center gap-3">
          <History className="w-7 h-7 text-proz-purple" />
          <span>Viewing History</span>
        </h1>
        <p className="text-xs sm:text-sm text-proz-grey mt-1">
          Pick up exactly where you left off across any synchronized device
        </p>
      </div>

      {historyItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {historyItems.map((item) => {
            if (!item) return null;
            const { content, history } = item;
            const percent = Math.min(100, Math.round((history.progressSeconds / (history.totalDurationSeconds || 1)) * 100));
            const minutesLeft = Math.max(1, Math.round((history.totalDurationSeconds - history.progressSeconds) / 60));

            return (
              <div
                key={`${content.id}-${history.episodeId || 'main'}`}
                className="group rounded-2xl glass-card border border-proz-border/50 hover:border-proz-cyan/50 overflow-hidden transition-all duration-300"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={content.backdropUrl}
                    alt={content.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-proz-midnight/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/watch/${content.id}${history.episodeId ? `?episode=${history.episodeId}` : ''}`}
                      className="p-3.5 rounded-full glass-button-primary shadow-cyan-glow"
                    >
                      <Play className="w-4 h-4 fill-white" />
                    </Link>
                  </div>
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-semibold glass-card border border-proz-border/50 text-proz-white">
                    {minutesLeft}m remaining
                  </div>

                  {/* Progress Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-proz-midnight/80">
                    <div
                      className="h-full bg-gradient-to-r from-proz-purple to-proz-cyan"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-proz-white truncate group-hover:text-proz-cyan transition-colors">
                    {content.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-proz-grey">
                    <span>{percent}% Completed</span>
                    <span className="capitalize">{content.category ? content.category.replace('_', ' ') : (content.content_type || 'Movie')}</span>
                  </div>
                  <Link
                    href={`/watch/${content.id}${history.episodeId ? `?episode=${history.episodeId}` : ''}`}
                    className="inline-flex items-center gap-1.5 text-xs text-proz-cyan font-semibold hover:underline pt-1"
                  >
                    <span>Resume Playback</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center glass-card rounded-3xl border border-proz-border/50 max-w-lg mx-auto p-8 space-y-3">
          <Clock className="w-12 h-12 text-proz-grey/40 mx-auto" />
          <h3 className="text-base font-bold text-proz-white">No Viewing History Yet</h3>
          <p className="text-xs text-proz-grey">
            Titles you begin watching will automatically synchronize your progress here.
          </p>
          <Link
            href="/movies"
            className="inline-block mt-2 px-6 py-2.5 rounded-full glass-button-primary text-xs font-bold"
          >
            Start Browsing
          </Link>
        </div>
      )}

    </div>
  );
}
