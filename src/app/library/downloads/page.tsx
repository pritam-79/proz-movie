"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Download, 
  ArrowLeft, 
  Pause, 
  Play, 
  X, 
  CheckCircle2, 
  HardDrive, 
  AlertCircle,
  FileVideo,
  Clock
} from 'lucide-react';
import { DownloadItem } from '@/types/library';

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  useEffect(() => {
    fetch('/api/library/downloads')
      .then(r => r.json())
      .then(d => {
        if (d.success) setDownloads(d.downloads);
      });
  }, []);

  const handleAction = async (id: string, action: 'pause' | 'resume' | 'cancel') => {
    const res = await fetch('/api/library/downloads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action })
    }).then(r => r.json());

    if (res.success) {
      if (action === 'cancel') {
        setDownloads(downloads.filter(d => d.id !== id));
      } else {
        setDownloads(downloads.map(d => d.id === id ? res.download : d));
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
          <div>
            <Link 
              href="/library" 
              className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 mb-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Library
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-transparent">
              Authorized Download Manager
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Permission-governed offline media caching with storage quota enforcement.
            </p>
          </div>

          {/* Storage Quota Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Offline Storage Quota</div>
              <div className="text-sm font-bold text-white">2.45 GB / 50.0 GB</div>
              <div className="w-32 bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-purple-500 h-full w-[5%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Download Queue */}
        <div className="space-y-4">
          {downloads.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] border border-white/10 rounded-2xl p-8">
              <Download className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-300">No active downloads</h3>
              <p className="text-sm text-slate-500 mt-1">
                You can download authorized media scenes directly from your library or player.
              </p>
            </div>
          ) : (
            downloads.map(item => {
              const progress = Math.round((item.downloadedBytes / item.fileSizeBytes) * 100);
              return (
                <div
                  key={item.id}
                  className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <FileVideo className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                        <span>{item.fileName}</span>
                        <span>•</span>
                        <span>{(item.fileSizeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB</span>
                        <span>•</span>
                        <span className="capitalize text-purple-300 font-medium">{item.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress & Speed */}
                  <div className="flex-1 max-w-xs px-2">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>{progress}%</span>
                      {item.speedBytesPerSec && (
                        <span>{(item.speedBytesPerSec / (1024 * 1024)).toFixed(1)} MB/s</span>
                      )}
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2">
                    {item.status === 'downloading' ? (
                      <button
                        onClick={() => handleAction(item.id, 'pause')}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition"
                        title="Pause"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(item.id, 'resume')}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition"
                        title="Resume"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(item.id, 'cancel')}
                      className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
