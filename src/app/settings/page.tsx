'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Activity,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Server,
  Database,
  Play,
  Sun,
  Moon,
  Monitor,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lock,
  Sparkles,
  Wrench,
  Film,
  Wifi,
  ChevronRight,
} from 'lucide-react';
import { useTheme, ThemePreference } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { bugDetector, DiagnosticLogEntry, DiagnosticStats } from '@/lib/diagnostics/bugDetector';
import { RESOLUTION_PRESETS } from '@/lib/utils/streamUtils';

interface DiagnosticsReport {
  success: boolean;
  checkedAt: string;
  latencyMs: number;
  version: string;
  systemHealth: 'healthy' | 'degraded';
  services: {
    apiGateway: { ok: boolean; status: string; latencyMs: number };
    cine18: { ok: boolean; status: string; channelCount: number; message?: string; latencyMs?: number };
    redgifs: { ok: boolean; status: string; message?: string };
    stashServer: {
      configured: boolean;
      ok: boolean;
      status: string;
      version?: string;
      latencyMs?: number;
      message?: string;
    };
    stashDb: {
      configured: boolean;
      ok: boolean;
      status: string;
      indexedScenesCount: number;
      message?: string;
    };
    database: { configured: boolean; status: string; message?: string };
    playbackEngine: { hlsDash: string; mpegTs: string; mp4Direct: string };
  };
  syncState: {
    lastSyncAt: string;
    totalPlayableScenes: number;
    totalGalleries: number;
    totalPerformers: number;
    totalStudios: number;
    duplicatesRemoved: number;
  };
  missingEnvVars: string[];
}

export default function SettingsAndDiagnosticsPage() {
  const { preference, resolvedTheme, setTheme } = useTheme();
  const { user } = useAuth();

  const [report, setReport] = useState<DiagnosticsReport | null>(null);
  const [loadingDiag, setLoadingDiag] = useState(true);
  const [diagError, setDiagError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const [logs, setLogs] = useState<DiagnosticLogEntry[]>([]);
  const [stats, setStats] = useState<DiagnosticStats | null>(null);
  const [autoRecover, setAutoRecover] = useState(true);

  const [seekStep, setSeekStep] = useState(10);
  const [defaultQuality, setDefaultQuality] = useState('auto');

  // Optional encrypted backend vault config (never echoed back)
  const [stashServerUrl, setStashServerUrl] = useState('');
  const [stashApiKey, setStashApiKey] = useState('');
  const [stashDbApiKey, setStashDbApiKey] = useState('');

  const refreshClientDiag = useCallback(() => {
    setLogs(bugDetector.getLogs());
    setStats(bugDetector.getStats());
    setAutoRecover(bugDetector.isAutoRecoveryEnabled());
  }, []);

  const runHealthAudit = useCallback(async () => {
    setLoadingDiag(true);
    setDiagError(null);
    try {
      const res = await fetch('/api/diagnostics', { cache: 'no-store' });
      const data = await res.json();
      if (!data.success) {
        setDiagError(data.error || 'Health audit failed');
      } else {
        setReport(data);
      }
    } catch (e: any) {
      setDiagError(e?.message || 'Unable to reach /api/diagnostics');
    } finally {
      setLoadingDiag(false);
    }
  }, []);

  useEffect(() => {
    refreshClientDiag();
    const unsub = bugDetector.subscribe(refreshClientDiag);
    runHealthAudit();
    if (typeof window !== 'undefined') {
      const savedSeek = Number(localStorage.getItem('proz_seek_step') || '10');
      if ([5, 10, 15, 30].includes(savedSeek)) setSeekStep(savedSeek);
      const savedQ = localStorage.getItem('proz_default_quality') || 'auto';
      setDefaultQuality(savedQ);
    }
    return () => unsub();
  }, [refreshClientDiag, runHealthAudit]);

  const handleSeekStepChange = (sec: number) => {
    setSeekStep(sec);
    if (typeof window !== 'undefined') {
      localStorage.setItem('proz_seek_step', String(sec));
    }
  };

  const handleDefaultQualityChange = (q: string) => {
    setDefaultQuality(q);
    if (typeof window !== 'undefined') {
      localStorage.setItem('proz_default_quality', q);
    }
  };

  const runBackendAction = async (action: 'reconnect_stash' | 'sync_library' | 'test_stashdb') => {
    setActionBusy(action);
    setActionMsg(null);
    try {
      const res = await fetch('/api/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      setActionMsg(data.message || (data.success ? `Action ${action} completed.` : data.error || 'Failed'));
      await runHealthAudit();
    } catch (e: any) {
      setActionMsg(e?.message || 'Action request failed');
    } finally {
      setActionBusy(null);
    }
  };

  const handleClearCaches = async () => {
    setActionBusy('cache');
    try {
      const n = await bugDetector.clearTransientCaches();
      setActionMsg(`Cleared ${n} transient cache buckets while preserving your account, watchlist, and settings.`);
    } finally {
      setActionBusy(null);
    }
  };

  const handleSaveVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stashServerUrl.trim() && !stashApiKey.trim() && !stashDbApiKey.trim()) return;
    setActionBusy('vault');
    setActionMsg(null);
    try {
      const res = await fetch('/api/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'configure_vault',
          stashServerUrl: stashServerUrl.trim() || undefined,
          stashApiKey: stashApiKey.trim() || undefined,
          stashDbApiKey: stashDbApiKey.trim() || undefined,
        }),
      });
      const data = await res.json();
      setActionMsg(data.message || data.error || 'Vault update finished.');
      if (data.success) {
        setStashServerUrl('');
        setStashApiKey('');
        setStashDbApiKey('');
        await runHealthAudit();
      }
    } finally {
      setActionBusy(null);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  return (
    <div className="min-h-screen bg-proz-midnight text-proz-white pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-8">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-proz-border/60 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-proz-purple/15 border border-proz-purple/30 text-proz-purple text-xs font-bold">
              <Sliders className="w-3.5 h-3.5" />
              <span>PROZ v0.09.02 Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-proz-white">
              Settings, Appearance &amp; System Diagnostics
            </h1>
            <p className="text-xs sm:text-sm text-proz-grey">
              Customize Light/Dark mode, double-tap player seek &amp; quality defaults, and inspect live API, Stash, StashDB &amp; stream auto-recovery health.
            </p>
          </div>

          <button
            type="button"
            onClick={runHealthAudit}
            disabled={loadingDiag}
            className="px-4 py-2.5 rounded-xl glass-button-primary text-xs font-bold flex items-center gap-2 shrink-0 self-start sm:self-auto disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loadingDiag ? 'animate-spin' : ''}`} />
            <span>{loadingDiag ? 'Auditing...' : 'Run Live Health Audit'}</span>
          </button>
        </div>

        {actionMsg && (
          <div className="p-3.5 rounded-2xl cinema-card border border-proz-cyan/40 text-xs font-semibold text-proz-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-proz-cyan shrink-0" />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* Section 1: Theme & Player Preferences */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="cinema-card rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {resolvedTheme === 'light' ? (
                  <Sun className="w-5 h-5 text-proz-cyan" />
                ) : (
                  <Moon className="w-5 h-5 text-proz-purple" />
                )}
                <h2 className="text-base sm:text-lg font-bold text-proz-white">Appearance Theme</h2>
              </div>
              <span className="text-[11px] font-mono text-proz-grey uppercase">
                Active: {resolvedTheme}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {(
                [
                  { id: 'dark', label: 'Obsidian Dark', icon: Moon },
                  { id: 'light', label: 'Daylight Light', icon: Sun },
                  { id: 'system', label: 'System Auto', icon: Monitor },
                ] as Array<{ id: ThemePreference; label: string; icon: any }>
              ).map((opt) => {
                const Icon = opt.icon;
                const active = preference === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTheme(opt.id)}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col gap-1.5 ${
                      active
                        ? 'bg-proz-purple/15 border-proz-purple text-proz-white shadow-purple-glow'
                        : 'bg-proz-elevated/60 border-proz-border text-proz-grey hover:text-proz-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-proz-purple' : 'text-proz-grey'}`} />
                    <span className="text-xs font-bold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="cinema-card rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-proz-purple" />
              <h2 className="text-base sm:text-lg font-bold text-proz-white">Player &amp; Recovery Controls</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-proz-grey block">
                  Double-Tap Seek Step
                </label>
                <div className="flex items-center gap-1.5">
                  {[5, 10, 15, 30].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSeekStepChange(s)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition ${
                        seekStep === s
                          ? 'bg-proz-purple text-white keep-white border-proz-purple'
                          : 'bg-proz-elevated border-proz-border text-proz-grey hover:text-proz-white'
                      }`}
                    >
                      {s}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-proz-grey block">
                  Preferred Stream Quality
                </label>
                <select
                  value={defaultQuality}
                  onChange={(e) => handleDefaultQualityChange(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  {RESOLUTION_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs font-bold text-proz-white">Automatic Bug Fixer &amp; Auto-Retry</p>
                <p className="text-[11px] text-proz-grey">
                  Retries transient HTTP 5xx/stream stalls &amp; applies image proxy fallbacks automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !autoRecover;
                  bugDetector.setAutoRecoveryEnabled(next);
                  setAutoRecover(next);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
                  autoRecover
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-proz-elevated border-proz-border text-proz-grey'
                }`}
              >
                {autoRecover ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </section>
        </div>

        {/* Section 2: Live Diagnostic Health Dashboard */}
        <section className="cinema-card rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-proz-border/60 pb-4">
            <div className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-proz-cyan" />
              <div>
                <h2 className="text-lg font-black text-proz-white">
                  Automatic Bug Detector &amp; Backend Diagnostics Dashboard
                </h2>
                <p className="text-xs text-proz-grey">
                  Live probe across API Gateway, Cine18 CDNs, RedGIFs v2, Personal Stash, StashDB GraphQL &amp; Playback Engines.
                </p>
              </div>
            </div>
            {report && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${
                  report.systemHealth === 'healthy'
                    ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400'
                    : 'bg-amber-500/15 border-amber-500/35 text-amber-400'
                }`}
              >
                {report.systemHealth.toUpperCase()} • {report.latencyMs}ms
              </span>
            )}
          </div>

          {diagError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{diagError}</span>
            </div>
          )}

          {report && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {[
                  {
                    name: 'Cine18 Channel API',
                    ok: report.services.cine18.ok,
                    detail: `${report.services.cine18.channelCount} live channels • ${report.services.cine18.latencyMs || 0}ms`,
                    icon: Film,
                  },
                  {
                    name: 'RedGIFs Public Feed',
                    ok: report.services.redgifs.ok,
                    detail: report.services.redgifs.message || report.services.redgifs.status,
                    icon: Wifi,
                  },
                  {
                    name: 'Personal Stash Server',
                    ok: report.services.stashServer.ok,
                    detail: report.services.stashServer.message || report.services.stashServer.status,
                    icon: Server,
                  },
                  {
                    name: 'StashDB GraphQL',
                    ok: report.services.stashDb.ok,
                    detail: report.services.stashDb.ok
                      ? `${report.services.stashDb.indexedScenesCount.toLocaleString()} indexed scenes`
                      : report.services.stashDb.message || 'Unconfigured',
                    icon: Database,
                  },
                  {
                    name: 'Database / Storage',
                    ok: report.services.database.configured || report.services.database.status === 'fallback_store',
                    detail: report.services.database.message || report.services.database.status,
                    icon: ShieldCheck,
                  },
                  {
                    name: 'Client Bug Fixer Stats',
                    ok: (stats?.totalErrors || 0) === 0 || (stats?.recoveriesSucceeded || 0) > 0,
                    detail: `${stats?.totalErrors || 0} errors • ${stats?.recoveriesSucceeded || 0} auto-recovered • ${stats?.imageFallbacks || 0} image proxies`,
                    icon: Wrench,
                  },
                ].map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.name}
                      className="p-4 rounded-2xl bg-proz-elevated/60 border border-proz-border/70 flex items-start gap-3"
                    >
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          card.ok ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-proz-white truncate">{card.name}</span>
                          {card.ok ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-proz-grey leading-snug">{card.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {report.missingEnvVars.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                  <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Missing Server Environment Variables: {report.missingEnvVars.join(', ')}
                  </p>
                  <p className="text-[11px] text-proz-grey">
                    Public OTT channels, IPTV-Org Live TV, RedGIFs 3D/VR/Galleries, and Cine18 streams operate without these keys. Configure optional server environment keys in your deployment dashboard (or Admin Vault below on self-hosted servers) to enable StashDB (1.13M+) &amp; Personal Stash GraphQL.
                  </p>
                </div>
              )}

              {/* Action Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => runBackendAction('reconnect_stash')}
                  disabled={actionBusy !== null}
                  className="px-3.5 py-2 rounded-xl bg-proz-elevated hover:bg-proz-purple/20 border border-proz-border text-xs font-bold text-proz-white transition disabled:opacity-50"
                >
                  {actionBusy === 'reconnect_stash' ? 'Reconnecting...' : 'Reconnect Stash Server'}
                </button>
                <button
                  type="button"
                  onClick={() => runBackendAction('sync_library')}
                  disabled={actionBusy !== null}
                  className="px-3.5 py-2 rounded-xl bg-proz-elevated hover:bg-proz-purple/20 border border-proz-border text-xs font-bold text-proz-white transition disabled:opacity-50"
                >
                  {actionBusy === 'sync_library' ? 'Syncing...' : 'Sync Library Cache'}
                </button>
                <button
                  type="button"
                  onClick={() => runBackendAction('test_stashdb')}
                  disabled={actionBusy !== null}
                  className="px-3.5 py-2 rounded-xl bg-proz-elevated hover:bg-proz-purple/20 border border-proz-border text-xs font-bold text-proz-white transition disabled:opacity-50"
                >
                  {actionBusy === 'test_stashdb' ? 'Testing...' : 'Verify StashDB Auth'}
                </button>
                <button
                  type="button"
                  onClick={handleClearCaches}
                  disabled={actionBusy !== null}
                  className="px-3.5 py-2 rounded-xl bg-proz-elevated hover:bg-rose-500/20 border border-proz-border text-xs font-bold text-proz-grey hover:text-proz-white flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Transient Caches</span>
                </button>
                <Link
                  href="/updates"
                  className="ml-auto px-3.5 py-2 rounded-xl text-xs font-bold text-proz-cyan hover:underline flex items-center gap-1"
                >
                  <span>v0.09.02 Changelog</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </>
          )}
        </section>

        {/* Section 3: Client Bug Detector Log Feed */}
        <section className="cinema-card rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-proz-white">
              Live Client Diagnostic &amp; Auto-Recovery Log ({logs.length})
            </h3>
            <button
              type="button"
              onClick={() => bugDetector.clearLogs()}
              className="px-3 py-1.5 rounded-lg bg-proz-elevated border border-proz-border text-xs text-proz-grey hover:text-proz-white"
            >
              Clear Log
            </button>
          </div>

          {logs.length === 0 ? (
            <p className="text-xs text-proz-grey py-6 text-center bg-proz-elevated/40 rounded-2xl border border-proz-border/50">
              No errors or recovery events recorded in this session — all streams and APIs healthy.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {logs.map((entry) => (
                <div
                  key={entry.id}
                  className="p-2.5 rounded-xl bg-proz-elevated/50 border border-proz-border/60 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          entry.severity === 'recovered'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : entry.severity === 'error'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {entry.severity} • {entry.category}
                      </span>
                      <span className="text-[10px] font-mono text-proz-grey truncate">{entry.source}</span>
                    </div>
                    <p className="text-proz-white">{entry.message}</p>
                  </div>
                  <span className="text-[10px] font-mono text-proz-grey shrink-0">
                    {new Date(entry.ts).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 4: Encrypted Server Vault (Admin Only) */}
        {isAdmin && (
          <section className="cinema-card rounded-3xl p-5 sm:p-6 space-y-4 border border-proz-purple/30">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-proz-purple" />
              <div>
                <h3 className="text-base font-bold text-proz-white">Encrypted Server Backend Vault (Admin)</h3>
                <p className="text-xs text-proz-grey">
                  Stores Personal Stash / StashDB credentials AES-256-GCM encrypted server-side. Secrets are never returned to the browser.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveVault} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="url"
                value={stashServerUrl}
                onChange={(e) => setStashServerUrl(e.target.value)}
                placeholder="Personal Stash URL (http://host:9999/graphql)"
                className="glass-input rounded-xl px-3 py-2 text-xs"
              />
              <input
                type="password"
                value={stashApiKey}
                onChange={(e) => setStashApiKey(e.target.value)}
                placeholder="Personal Stash API Key (optional)"
                className="glass-input rounded-xl px-3 py-2 text-xs"
              />
              <div className="flex gap-2">
                <input
                  type="password"
                  value={stashDbApiKey}
                  onChange={(e) => setStashDbApiKey(e.target.value)}
                  placeholder="StashDB API Key override"
                  className="flex-1 glass-input rounded-xl px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  disabled={actionBusy === 'vault'}
                  className="px-4 py-2 rounded-xl glass-button-primary text-xs font-bold shrink-0"
                >
                  Save
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
