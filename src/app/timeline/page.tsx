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
    <div className="min-h-screen bg-proz-midnight text-proz-white pt-10 sm:pt-14 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="border-b border-proz-border/60 pb-6 mb-8">
          <Link 
            href="/library" 
            className="inline-flex items-center gap-1.5 text-xs text-proz-purple hover:text-proz-cyan mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Library
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-proz-white via-proz-purple to-proz-cyan bg-clip-text text-transparent">
            Vault Activity &amp; Timeline
          </h1>
          <p className="text-sm text-proz-grey mt-1">
            Chronological progression of synchronized scenes, viewings, and personal ratings.
          </p>
        </div>

        {/* Timeline Items */}
        <div className="relative border-l border-proz-purple/40 ml-4 space-y-8 pb-12">
          {scenes.map((scene) => (
            <div key={scene.id} className="relative pl-8">
              {/* Timeline Marker */}
              <div className="absolute -left-2.5 top-1.5 w-5 h-5 rounded-full bg-proz-midnight border-2 border-proz-purple flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-proz-cyan" />
              </div>

              {/* Card */}
              <div className="cinema-card hover:border-proz-purple/50 rounded-2xl p-5 transition">
                <div className="flex items-center justify-between text-xs text-proz-grey mb-2">
                  <span className="flex items-center gap-1.5 text-proz-purple font-semibold">
                    <Calendar className="w-3.5 h-3.5" /> {scene.date}
                  </span>
                  <span>{scene.studio?.name}</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="relative w-full sm:w-48 aspect-video rounded-xl overflow-hidden bg-proz-elevated flex-shrink-0">
                    <img
                      src={scene.paths.screenshot || scene.paths.webp}
                      alt={scene.title}
                      className="w-full h-full object-cover"
                    />
                    <Link
                      href={toStashWatchPath(scene.id)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition"
                    >
                      <Play className="w-8 h-8 text-white keep-white fill-white" />
                    </Link>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-base font-bold text-proz-white mb-1">{scene.title}</h3>
                    <p className="text-xs text-proz-grey line-clamp-2 mb-3">{scene.details}</p>
                    <div className="flex items-center gap-4 text-xs text-proz-grey">
                      <span>{scene.playCount || 0} plays</span>
                      {scene.rating && (
                        <span className="flex items-center gap-1 text-proz-cyan">
                          <Star className="w-3 h-3 fill-current" /> {scene.rating}
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
