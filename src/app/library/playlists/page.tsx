"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  Plus, 
  Play, 
  Trash2, 
  Share2, 
  Shuffle, 
  Lock, 
  Globe, 
  ArrowLeft,
  Clock,
  CheckCircle2,
  ListMusic
} from 'lucide-react';
import { PrivatePlaylist } from '@/types/library';
import { toStashWatchPath } from '@/lib/utils/streamUtils';

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<PrivatePlaylist[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    fetch('/api/library/playlists')
      .then(r => r.json())
      .then(d => {
        if (d.success) setPlaylists(d.playlists);
      });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const res = await fetch('/api/library/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTitle, description: newDesc, isPrivate: true })
    }).then(r => r.json());

    if (res.success) {
      setPlaylists([...playlists, res.playlist]);
      setNewTitle('');
      setNewDesc('');
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/library/playlists?id=${id}`, { method: 'DELETE' }).then(r => r.json());
    if (res.success) {
      setPlaylists(playlists.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-proz-midnight text-proz-white pt-10 sm:pt-14 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-proz-border/60 pb-6 mb-8">
          <div>
            <Link 
              href="/library" 
              className="inline-flex items-center gap-1.5 text-xs text-proz-purple hover:text-proz-cyan mb-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Library
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-proz-white via-proz-purple to-proz-cyan bg-clip-text text-transparent">
              Playlists &amp; Group Collections
            </h1>
            <p className="text-sm text-proz-grey mt-1">
              Organize private media queues with granular group-sharing permissions.
            </p>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2.5 rounded-xl glass-button-primary text-sm font-semibold flex items-center gap-2 shadow-purple-glow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Playlist</span>
          </button>
        </div>

        {/* Create Modal */}
        {isCreating && (
          <form onSubmit={handleCreate} className="mb-8 p-6 rounded-2xl cinema-card border border-proz-purple/40">
            <h3 className="text-base font-bold text-proz-white mb-4">New Private Playlist</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-proz-grey mb-1">Playlist Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midnight Cyber Romance Vol. 1"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl glass-input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-proz-grey mb-1">Description (Optional)</label>
                <textarea
                  placeholder="Notes about this curated collection..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl glass-input text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-proz-grey hover:text-proz-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl glass-button-primary text-xs font-semibold"
              >
                Save Playlist
              </button>
            </div>
          </form>
        )}

        {/* Playlists List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map(pl => (
            <div
              key={pl.id}
              className="cinema-card hover:border-proz-purple/50 rounded-2xl p-5 flex flex-col justify-between transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2 rounded-lg bg-proz-purple/15 text-proz-purple border border-proz-purple/30">
                    <ListMusic className="w-5 h-5" />
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-proz-grey">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Private</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-proz-white group-hover:text-proz-purple transition">
                  {pl.name}
                </h3>
                {pl.description && (
                  <p className="text-xs text-proz-grey mt-1 line-clamp-2">{pl.description}</p>
                )}
                <div className="text-xs text-proz-grey mt-3 flex items-center gap-2">
                  <span>{pl.itemCount} items</span>
                  <span>•</span>
                  <span>Updated recently</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-proz-border/40">
                <Link
                  href={toStashWatchPath(pl.items[0]?.mediaId || 'stash-sc-001')}
                  className="px-3.5 py-1.5 rounded-lg glass-button-primary text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Play All</span>
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(pl.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition"
                    title="Delete Playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
