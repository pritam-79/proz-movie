'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Download,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { brandConfig } from '@/config/brand.config';

interface UpdateInfo {
  latestVersion: string;
  latestVersionCode: number;
  minVersionCode: number;
  appName: string;
  title: string;
  releaseDate: string;
  apkUrl: string;
  directGithubUrl: string;
  fileSize: string;
  compatiblePlatforms?: string[];
  changelog: string[];
}

const STORAGE_DISMISSED_KEY = 'proz_dismissed_update_version';
const STORAGE_ACK_KEY = 'proz_acknowledged_version';

function compareSemver(a: string, b: string): number {
  const pa = a.replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const va = pa[i] || 0;
    const vb = pb[i] || 0;
    if (va > vb) return 1;
    if (va < vb) return -1;
  }
  return 0;
}

export default function InAppUpdater({ suppressOverlay = false }: { suppressOverlay?: boolean }) {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [isAndroidApp, setIsAndroidApp] = useState(false);

  const webInstalledVer = brandConfig.version.replace(/^v/i, '');
  const [installedVersion, setInstalledVersion] = useState<string>(webInstalledVer);
  const [installedCode, setInstalledCode] = useState<number>(brandConfig.versionCode);
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    let detectedVer = webInstalledVer;
    let detectedCode = brandConfig.versionCode;

    if (typeof window !== 'undefined' && (window as any).AndroidHost) {
      setIsAndroidApp(true);
      try {
        const nativeVer = (window as any).AndroidHost.getAppVersion?.();
        const nativeCode = (window as any).AndroidHost.getVersionCode?.();
        if (nativeVer) {
          detectedVer = String(nativeVer).replace(/^v/i, '');
          setInstalledVersion(detectedVer);
        }
        if (typeof nativeCode === 'number' && !isNaN(nativeCode)) {
          detectedCode = nativeCode;
          setInstalledCode(nativeCode);
        }
      } catch {}
    }

    fetch('/api/app/update')
      .then((res) => res.json())
      .then((data: UpdateInfo) => {
        setUpdateInfo(data);

        const genuinelyNewer =
          data.latestVersionCode > detectedCode ||
          compareSemver(data.latestVersion, detectedVer) > 0;

        setHasUpdate(genuinelyNewer);

        if (genuinelyNewer) {
          let dismissedVer: string | null = null;
          let acknowledgedVer: string | null = null;
          try {
            dismissedVer = localStorage.getItem(STORAGE_DISMISSED_KEY);
            acknowledgedVer = localStorage.getItem(STORAGE_ACK_KEY);
          } catch {}

          // Only show if this newer version was NOT previously dismissed
          if (dismissedVer !== data.latestVersion && acknowledgedVer !== data.latestVersion) {
            setShowBanner(true);
            setIsOpen(true);
          }
        } else {
          // Never auto-open when already running the current or newer version
          setShowBanner(false);
          setIsOpen(false);
        }
      })
      .catch((err) => {
        console.warn('In-app update check failed:', err);
      });

    const handleManualCheck = () => {
      setIsOpen(true);
    };
    window.addEventListener('proz:check-update', handleManualCheck);
    return () => window.removeEventListener('proz:check-update', handleManualCheck);
  }, [webInstalledVer]);

  const persistDismissal = (versionStr?: string) => {
    if (!versionStr) return;
    try {
      localStorage.setItem(STORAGE_DISMISSED_KEY, versionStr);
      localStorage.setItem(STORAGE_ACK_KEY, versionStr);
    } catch {}
  };

  const handleApplyUpdate = async () => {
    if (!updateInfo) return;
    setIsUpdating(true);
    setUpdateProgress(25);

    if (typeof window !== 'undefined' && (window as any).AndroidHost?.startInAppUpdate) {
      setUpdateProgress(60);
      try {
        (window as any).AndroidHost.startInAppUpdate(updateInfo.apkUrl);
        persistDismissal(updateInfo.latestVersion);
        setUpdateProgress(100);
        setTimeout(() => {
          setIsOpen(false);
          setShowBanner(false);
          setIsUpdating(false);
        }, 1200);
        return;
      } catch {
        setIsUpdating(false);
      }
    }

    // Web / PWA safe cache refresh preserving all user localStorage settings, history, favorites
    try {
      setUpdateProgress(45);
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(
          keys.filter((k) => k.includes('proz') || k.includes('next')).map((k) => caches.delete(k))
        );
      }
      persistDismissal(updateInfo.latestVersion);
      setUpdateProgress(90);
      setTimeout(() => {
        setUpdateProgress(100);
        window.location.reload();
      }, 700);
    } catch {
      setIsUpdating(false);
    }
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    persistDismissal(updateInfo?.latestVersion);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setShowBanner(false);
    persistDismissal(updateInfo?.latestVersion);
  };

  if (!updateInfo || suppressOverlay) return null;

  return (
    <>
      {/* ─── 1. TOP IN-APP UPDATE BANNER (Shown strictly when genuinely newer update exists & not dismissed) ─── */}
      {showBanner && hasUpdate && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-purple-950/95 via-[#080B12]/95 to-cyan-950/95 border-b border-purple-500/40 backdrop-blur-xl shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="p-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                <Sparkles className="w-4 h-4" />
              </span>
              <div className="truncate">
                <span className="font-bold text-white">
                  Update v{updateInfo.latestVersion} Available
                </span>{' '}
                <span className="text-slate-300 hidden sm:inline">
                  (Installed: v{installedVersion}) • {updateInfo.title}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsOpen(true)}
                className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <span>View Update</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDismissBanner}
                className="p-1 text-slate-400 hover:text-white transition"
                title="Dismiss permanently for this release"
                aria-label="Dismiss update notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 2. UPDATE & VERSION DETAILS DIALOG ─── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0B0F1A] border border-white/15 shadow-2xl p-6 sm:p-8">
            <button
              onClick={handleCloseModal}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              title="Close"
              aria-label="Close update modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 text-white shadow-lg">
                {hasUpdate ? <Download className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {hasUpdate ? 'Update Available' : 'Version Installed'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{updateInfo.releaseDate}</span>
                </div>
                <h3 className="text-xl font-black text-white mt-1">
                  PROZ Entertainment v{updateInfo.latestVersion}
                </h3>
              </div>
            </div>

            {/* Distinct Installed vs Available Status */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 mb-5 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Installed on Device</span>
                <span className="font-mono font-bold text-slate-200 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  v{installedVersion} (Build {installedCode})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Latest Release</span>
                <span className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  {hasUpdate ? (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  v{updateInfo.latestVersion} (Build {updateInfo.latestVersionCode})
                </span>
              </div>
            </div>

            {/* Release Highlights */}
            <div className="bg-[#080B12] rounded-2xl p-4 border border-white/10 mb-5 max-h-52 overflow-y-auto">
              <h4 className="text-xs font-bold text-purple-300 mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Release Highlights v
                {updateInfo.latestVersion}
              </h4>
              <ul className="space-y-2">
                {updateInfo.changelog.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {isUpdating && (
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                    <span>Applying update safely (preserving user data)...</span>
                  </span>
                  <span className="font-bold text-cyan-400">{updateProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full transition-all duration-300"
                    style={{ width: `${updateProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              {hasUpdate ? (
                <button
                  onClick={handleApplyUpdate}
                  disabled={isUpdating}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-cyan-500 shadow-lg hover:opacity-95 transition disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isAndroidApp
                      ? 'Install Update In-App (Android)'
                      : 'Install Latest Web Build (Preserve Data)'}
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleCloseModal}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 transition"
                >
                  PROZ v{installedVersion} Is Up To Date
                </button>
              )}

              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <Link
                  href="/updates"
                  onClick={handleCloseModal}
                  className="text-purple-400 hover:text-purple-300 font-semibold"
                >
                  Full Release Notes →
                </Link>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCloseModal}
                    className="text-slate-300 hover:text-white font-semibold"
                  >
                    Dismiss
                  </button>
                  {hasUpdate && isAndroidApp && (
                    <a
                      href={updateInfo.apkUrl}
                      download={`PROZ-MOVIE-v${updateInfo.latestVersion}.apk`}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      APK File
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
