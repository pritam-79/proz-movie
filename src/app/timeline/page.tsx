"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  Calendar, 
  ArrowLeft, 
  Play, 
  Star, 
  Eye, 
  CheckCircle2,
  FolderLock
} from 'lucide-react';
import { StashScene } from '@/types/library';
import { toStashWatchPath } from '@/lib/utils/streamUtils';

export default function TimelinePage() {
  const [scenes, setScenes] = useState<StashScene[]>([]);

  useEffect(() => {
    fetch('/api/library/stash/scenes?sort=date')
      .then(r => r.json())
      .then(d => {
        if (d.success) setScenes(d.scenes);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="border-b border-white/10 pb-6 mb-8">
          <Link 
            href="/library" 
            className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Library
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-transparent">
            Vault Activity & Timeline
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Chronological progression of synchronized scenes, viewings, and personal ratings.
          </p>
        </div>

        {/* Timeline Items */}
        <div className="relative border-l border-purple-500/30 ml-4 space-y-8 pb-12">
          {scenes.map((scene, idx) => (
            <div key={scene.id} className="relative pl-8">
              {/* Timeline Marker */}
              <div className="absolute -left-2.5 top-1.5 w-5 h-5 rounded-full bg-[#080B12] border-2 border-purple-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
              </div>

              {/* Card */}
              <div className="bg-white/[0.03] border border-white/10 hover:border-purple-500/40 rounded-2xl p-5 transition">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
                    <Calendar className="w-3.5 h-3.5" /> {scene.date}
                  </span>
                  <span>{scene.studio?.name}</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="relative w-full sm:w-48 aspect-video rounded-xl overflow-hidden bg-slate-900 flex-shrink-0">
                    <img
                      src={scene.paths.screenshot || scene.paths.webp}
                      alt={scene.title}
                      className="w-full h-full object-cover"
                    />
                    <Link
                      href={toStashWatchPath(scene.id)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition"
                    >
                      <Play className="w-8 h-8 text-white fill-white" />
                    </Link>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-base font-bold text-white mb-1">{scene.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">{scene.details}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{scene.playCount || 0} plays</span>
                      {scene.rating && (
                        <span className="flex items-center gap-1 text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" /> {scene.rating}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
