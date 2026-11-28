/**
 * PROZ MOVIE v0.09.02 — Automatic Bug Detector & Auto-Recovery Diagnostics Bus
 * Collects client/API/player errors, slow requests, buffering loops, and image failures,
 * executes safe automatic recoveries (retries, cache eviction, URL proxy fallback),
 * and feeds real-time telemetry to /settings Diagnostic Dashboard.
 */

export type DiagnosticSeverity = 'info' | 'warn' | 'error' | 'recovered';
export type DiagnosticCategory =
  | 'api'
  | 'playback'
  | 'buffering'
  | 'stash'
  | 'stashdb'
  | 'image'
  | 'database'
  | 'env'
  | 'runtime';

export interface DiagnosticLogEntry {
  id: string;
  ts: string;
  severity: DiagnosticSeverity;
  category: DiagnosticCategory;
  source: string;
  message: string;
  recovered?: boolean;
  recoveryAction?: string;
  latencyMs?: number;
}

export interface DiagnosticStats {
  totalErrors: number;
  totalWarnings: number;
  recoveryAttempts: number;
  recoveriesSucceeded: number;
  slowRequests: number;
  bufferingEvents: number;
  imageFallbacks: number;
  lastUpdated: string;
}

const MAX_LOGS = 120;
const STORAGE_KEY_AUTORECOVER = 'proz_diag_auto_recover';
const listeners = new Set<() => void>();

class BugDetectorService {
  private logs: DiagnosticLogEntry[] = [];
  private stats: DiagnosticStats = {
    totalErrors: 0,
    totalWarnings: 0,
    recoveryAttempts: 0,
    recoveriesSucceeded: 0,
    slowRequests: 0,
    bufferingEvents: 0,
    imageFallbacks: 0,
    lastUpdated: new Date().toISOString(),
  };
  private initializedGlobalListeners = false;

  public isAutoRecoveryEnabled(): boolean {
    if (typeof window === 'undefined') return true;
    try {
      const val = localStorage.getItem(STORAGE_KEY_AUTORECOVER);
      return val !== 'false';
    } catch {
      return true;
    }
  }

  public setAutoRecoveryEnabled(enabled: boolean) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_AUTORECOVER, enabled ? 'true' : 'false');
    } catch {}
    this.emit();
  }

  public attachGlobalErrorListeners() {
    if (typeof window === 'undefined' || this.initializedGlobalListeners) return;
    this.initializedGlobalListeners = true;

    window.addEventListener('error', (ev) => {
      this.report({
        severity: 'error',
        category: 'runtime',
        source: ev.filename ? `${ev.filename}:${ev.lineno}` : 'window.onerror',
        message: ev.message || 'Unhandled frontend runtime error',
      });
    });

    window.addEventListener('unhandledrejection', (ev) => {
      const reason = ev.reason instanceof Error ? ev.reason.message : String(ev.reason || 'Unhandled rejection');
      this.report({
        severity: 'warn',
        category: 'runtime',
        source: 'unhandledrejection',
        message: reason,
      });
    });
  }

  public report(entry: Omit<DiagnosticLogEntry, 'id' | 'ts'>) {
    const item: DiagnosticLogEntry = {
      id: `diag-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ts: new Date().toISOString(),
      ...entry,
    };

    this.logs = [item, ...this.logs].slice(0, MAX_LOGS);

    if (entry.severity === 'error') this.stats.totalErrors++;
    if (entry.severity === 'warn') this.stats.totalWarnings++;
    if (entry.severity === 'recovered' || entry.recovered) {
      this.stats.recoveryAttempts++;
      this.stats.recoveriesSucceeded++;
    }
    if (entry.category === 'buffering') this.stats.bufferingEvents++;
    if (entry.category === 'image' && entry.recovered) this.stats.imageFallbacks++;
    if (entry.latencyMs && entry.latencyMs > 2500) this.stats.slowRequests++;
    this.stats.lastUpdated = item.ts;

    this.emit();
    return item;
  }

  public recordRecoveryAttempt(succeeded: boolean, category: DiagnosticCategory, source: string, action: string) {
    this.stats.recoveryAttempts++;
    if (succeeded) this.stats.recoveriesSucceeded++;
    this.report({
      severity: succeeded ? 'recovered' : 'error',
      category,
      source,
      message: succeeded ? `Auto-recovered via ${action}` : `Auto-recovery failed during ${action}`,
      recovered: succeeded,
      recoveryAction: action,
    });
  }

  public getLogs(): DiagnosticLogEntry[] {
    return this.logs;
  }

  public getStats(): DiagnosticStats {
    return { ...this.stats };
  }

  public clearLogs() {
    this.logs = [];
    this.emit();
  }

  public async clearTransientCaches(): Promise<number> {
    let cleared = 0;
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const keys = await caches.keys();
        for (const k of keys) {
          if (k.includes('next') || k.includes('api') || k.includes('image') || k.includes('proz')) {
            await caches.delete(k);
            cleared++;
          }
        }
      } catch {}
    }
    this.report({
      severity: 'recovered',
      category: 'api',
      source: 'BugFixer',
      message: `Cleared ${cleared} transient cache buckets (preserved user account, history & settings).`,
      recovered: true,
      recoveryAction: 'cache_eviction',
    });
    return cleared;
  }

  public subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }

  private emit() {
    listeners.forEach((fn) => {
      try {
        fn();
      } catch {}
    });
  }
}

export const bugDetector = new BugDetectorService();

/**
 * Drop-in diagnostic fetch with latency tracking & bounded automatic retry on transient HTTP/network failures.
 */
export async function diagnosticFetch(
  url: string,
  init?: RequestInit & { retries?: number; category?: DiagnosticCategory }
): Promise<Response> {
  const maxRetries = init?.retries ?? (bugDetector.isAutoRecoveryEnabled() ? 2 : 0);
  const category = init?.category ?? 'api';
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const start = Date.now();
    try {
      const res = await fetch(url, init);
      const latency = Date.now() - start;

      if (latency > 2500) {
        bugDetector.report({
          severity: 'warn',
          category,
          source: url,
          message: `Slow API response (${latency}ms)`,
          latencyMs: latency,
        });
      }

      if (res.ok || res.status < 500 || attempt === maxRetries) {
        if (!res.ok) {
          bugDetector.report({
            severity: res.status >= 500 ? 'error' : 'warn',
            category,
            source: url,
            message: `HTTP ${res.status} (${res.statusText || 'request failed'})`,
            latencyMs: latency,
          });
        } else if (attempt > 0) {
          bugDetector.recordRecoveryAttempt(true, category, url, `retry #${attempt}`);
        }
        return res;
      }

      await new Promise((r) => setTimeout(r, 350 * (attempt + 1)));
    } catch (err: any) {
      lastError = err;
      if (attempt === maxRetries) {
        bugDetector.report({
          severity: 'error',
          category,
          source: url,
          message: err?.message || 'Network request failed',
        });
        throw err;
      }
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }

  throw lastError || new Error(`Request failed: ${url}`);
}
