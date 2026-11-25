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
  FolderLock,
  Layers,
  Zap,
  Info
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
  changelog: string[];
}

export default function InAppUpdater() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [isAndroidApp, setIsAndroidApp] = useState(false);
  const installedVer = brandConfig.version.replace(/^v/, '');
  const [currentVersion, setCurrentVersion] = useState<string>(installedVer);
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    // 1. Detect native Android host wrapper
    if (typeof window !== 'undefined' && (window as any).AndroidHost) {
      setIsAndroidApp(true);
      try {
        const ver = (window as any).AndroidHost.getAppVersion();
        if (ver) setCurrentVersion(ver.replace(/^v/, ''));
      } catch {
        // Fallback
      }
    }

    // 2. Fetch latest update metadata
    fetch('/api/app/update')
      .then((res) => res.json())
      .then((data: UpdateInfo) => {
        setUpdateInfo(data);

        // Check if there is genuinely a newer version than current
        const acknowledged = localStorage.getItem('proz_acknowledged_version');
        const seenPopupVer = localStorage.getItem('proz_whats_new_popup_seen');
        const isNewer = data.latestVersionCode > brandConfig.versionCode || (data.latestVersion !== currentVersion && data.latestVersion !== installedVer);

        if (isNewer) {
          setHasUpdate(true);
          if (acknowledged !== data.latestVersion) {
            setShowBanner(true);
            setIsOpen(true);
          }
        } else {
          setHasUpdate(false);
          setShowBanner(false);
          // Important: Show informative What's New update popup once per newly installed release
          if (seenPopupVer !== brandConfig.version) {
            setIsOpen(true);
          }
        }
      })
      .catch((err) => {
        console.warn('In-app update check failed:', err);
      });

    // 3. Listen for manual "Check for Updates" trigger from Account or Settings
    const handleManualCheck = () => {
      setIsOpen(true);
    };

    window.addEventListener('proz:check-update', handleManualCheck);
    return () => window.removeEventListener('proz:check-update', handleManualCheck);
  }, [currentVersion]);

  const handleApplyUpdate = async () => {
    if (!updateInfo) return;
    setIsUpdating(true);
    setUpdateProgress(15);

    // If native Android app with injected host
    if (typeof window !== 'undefined' && (window as any).AndroidHost?.startInAppUpdate) {
      setUpdateProgress(40);
      try {
        (window as any).AndroidHost.startInAppUpdate(updateInfo.apkUrl);
        setUpdateProgress(100);
        setTimeout(() => {
          setIsOpen(false);
          setIsUpdating(false);
        }, 1500);
      } catch {
        window.location.href = updateInfo.apkUrl;
      }
      return;
    }

    // If Web / PWA: Execute Safe Service-Worker & Cache Refresh Lifecycle
    try {
      setUpdateProgress(35);
      if ('caches' in window) {
        // Clear old runtime asset caches safely while preserving user data in localStorage
        const keys = await caches.keys();
        await Promise.all(
          keys.filter(k => k.includes('proz') || k.includes('next')).map(k => caches.delete(k))
        );
      }
      setUpdateProgress(70);

      // Save acknowledged version & mark popup seen
      localStorage.setItem('proz_acknowledged_version', updateInfo.latestVersion);
      localStorage.setItem('proz_whats_new_popup_seen', brandConfig.version);
      setUpdateProgress(95);

      setTimeout(() => {
        setUpdateProgress(100);
        // Clean reload to pull fresh bundle
        window.location.reload();
      }, 1000);
    } catch {
      window.location.href = updateInfo.apkUrl;
      setIsUpdating(false);
    }
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    if (updateInfo) {
      localStorage.setItem('proz_acknowledged_version', updateInfo.latestVersion);
    }
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    try {
      localStorage.setItem('proz_whats_new_popup_seen', brandConfig.version);
      if (updateInfo && !hasUpdate) {
        localStorage.setItem('proz_acknowledged_version', updateInfo.latestVersion);
      }
    } catch {}
  };

  if (!updateInfo) return null;

  return (
    <>
      {/* ─── 1. TOP IN-APP UPDATE BANNER (Auto-notifies when v0.02 is available) ─── */}
      {showBanner && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-purple-950/95 via-[#080B12]/95 to-cyan-950/95 border-b border-purple-500/40 backdrop-blur-xl shadow-2xl animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="p-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 flex-shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4" />
              </span>
              <div className="truncate">
                <span className="font-bold text-white">PRO2 ENTERTAINMENT v{updateInfo.latestVersion} Available:</span>{' '}
                <span className="text-slate-300 hidden sm:inline">
                  {updateInfo.title}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsOpen(true)}
                className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition flex items-center gap-1.5"
              >
                <span>What&apos;s New</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDismissBanner}
                className="p-1 text-slate-400 hover:text-white transition"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 2. FLOATING UPDATE PILL REMOVED TO PREVENT CARD & NAV OVERLAPPING (PDF BUGS 1-16) ─── */}

      {/* ─── 3. IN-APP UPDATE MODAL ─── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0F1420] border border-purple-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-purple-950/50 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute -top-16 -left-16 w-44 h-44 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close update information"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 text-white shadow-lg shadow-purple-600/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white tracking-tight">
                    {updateInfo.appName}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono font-bold">
                    v{updateInfo.latestVersion}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Released on {updateInfo.releaseDate} • {updateInfo.fileSize}
                </p>
              </div>
            </div>

            {/* Version Comparison Card */}
            <div className="grid grid-cols-2 gap-3 mb-5 p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Installed Build</span>
                <span className="font-mono font-bold text-slate-200">v{currentVersion}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Available Release</span>
                <span className="font-mono font-bold text-cyan-400 flex items-center gap-1">
                  v{updateInfo.latestVersion}
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                </span>
              </div>
            </div>

            {/* What's New Changelog */}
            <div className="bg-[#080B12]/80 rounded-2xl p-4 border border-white/5 mb-6 max-h-56 overflow-y-auto custom-scrollbar">
              <h4 className="text-xs font-bold text-purple-300 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> What&apos;s New in v{updateInfo.latestVersion}:
              </h4>
              <ul className="space-y-2">
                {updateInfo.changelog.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Update Progress Indicator */}
            {isUpdating && (
              <div className="mb-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                    <span>Applying in-app update...</span>
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

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleApplyUpdate}
                disabled={isUpdating}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 shadow-xl shadow-purple-600/30 hover:opacity-95 active:scale-98 transition-all disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Upgrading Application...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>
                      {isAndroidApp ? 'Update Now (In-App APK)' : 'Update Now (Reload Assets)'}
                    </span>
                  </>
                )}
              </button>

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
                    Continue
                  </button>
                  <a
                    href={updateInfo.apkUrl}
                    download={`PROZ-MOVIE-v${updateInfo.latestVersion}.apk`}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Direct APK File</span>
                    <Download className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
