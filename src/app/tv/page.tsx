"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Tv, 
  ArrowLeft, 
  Play, 
  Maximize, 
  Volume2, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Layers,
  Star
} from 'lucide-react';
import { StashScene } from '@/types/library';
import { toStashWatchPath } from '@/lib/utils/streamUtils';

export default function TVModePage() {
  const [scenes, setScenes] = useState<StashScene[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    fetch('/api/library/stash/scenes')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.scenes.length > 0) setScenes(d.scenes);
      });
  }, []);

  // Keyboard navigation for TV remotes (Left, Right, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (scenes.length === 0) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setSelectedIndex(prev => (prev + 1) % scenes.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setSelectedIndex(prev => (prev - 1 + scenes.length) % scenes.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scenes]);

  const activeScene = scenes[selectedIndex];

  return (
    <div className="fixed inset-0 bg-[#07070A] text-white keep-white z-50 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Cinematic Backdrop */}
      {activeScene && (
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 blur-sm opacity-20 scale-105"
          style={{ backgroundImage: `url(${activeScene.paths.screenshot || activeScene.paths.webp})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07070A] via-[#07070A]/80 to-transparent" />

      {/* TV Header Bar */}
      <div className="relative z-10 px-8 py-6 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link
            href="/library"
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition flex items-center gap-2 text-sm font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Exit TV Mode</span>
          </Link>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-proz-purple/20 border border-proz-purple/40 text-proz-purple font-bold text-sm">
            <Tv className="w-4 h-4 text-proz-cyan" />
            <span>PROZ 10-FOOT INTERFACE</span>
          </div>
        </div>

        <div className="text-right text-xs text-slate-400">
          Use Remote <span className="text-white keep-white font-mono font-bold">← →</span> or <span className="text-white keep-white font-mono font-bold">ENTER</span>
        </div>
      </div>

      {/* Featured Hero Card for TV */}
      {activeScene && (
        <div className="relative z-10 px-12 max-w-4xl py-6">
          <div className="flex items-center gap-3 text-sm text-proz-cyan font-bold mb-2">
            <span>{activeScene.studio?.name || 'Studio Vault'}</span>
            <span>•</span>
            <span>{activeScene.date}</span>
            {activeScene.rating && (
              <span className="flex items-center gap-1 text-proz-cyan ml-2">
                <Star className="w-4 h-4 fill-current" /> {activeScene.rating}
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white keep-white tracking-tight drop-shadow-lg mb-4">
            {activeScene.title}
          </h1>
          <p className="text-base text-slate-300 line-clamp-3 mb-6 max-w-2xl leading-relaxed">
            {activeScene.details}
          </p>

          <div className="flex items-center gap-4">
            <Link
              href={toStashWatchPath(activeScene.id)}
              className="px-8 py-4 rounded-2xl glass-button-primary font-bold text-lg flex items-center gap-3 shadow-purple-glow transform hover:scale-105 transition"
            >
              <Play className="w-6 h-6 fill-white" />
              <span>Watch Now</span>
            </Link>
          </div>
        </div>
      )}

      {/* Horizontal TV Carousel */}
      <div className="relative z-10 px-8 pb-10">
        <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-3 px-4">
          Vault Queue ({selectedIndex + 1} / {scenes.length})
        </h3>
        <div className="flex items-center gap-5 overflow-x-auto py-2 px-4 no-scrollbar">
          {scenes.map((scene, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={scene.id}
                onClick={() => setSelectedIndex(idx)}
                className={`relative flex-shrink-0 w-64 aspect-video rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                  isSelected 
                    ? 'ring-4 ring-proz-purple scale-105 shadow-purple-glow' 
                    : 'opacity-60 hover:opacity-90'
                }`}
              >
                <img
                  src={scene.paths.screenshot || scene.paths.webp}
                  alt={scene.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <div className="text-xs font-bold text-white truncate">{scene.title}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
