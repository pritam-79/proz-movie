'use client';

import React, { useState, useEffect } from 'react';
import { Download, Sparkles, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface UpdateInfo {
  latestVersion: string;
  latestVersionCode: number;
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAndroidApp, setIsAndroidApp] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string>('0.01');

  useEffect(() => {
    // Detect native Android app
    if (typeof window !== 'undefined' && (window as any).AndroidHost) {
      setIsAndroidApp(true);
      try {
        const ver = (window as any).AndroidHost.getAppVersion();
        if (ver) setCurrentVersion(ver);
      } catch (e) {
        // Ignore
      }
    }

    // Fetch latest update info
    fetch('/api/app/update')
      .then((res) => res.json())
      .then((data: UpdateInfo) => {
        setUpdateInfo(data);
      })
      .catch(() => {});
  }, []);

  const handleUpdate = () => {
    if (!updateInfo) return;
    setIsUpdating(true);

    if (typeof window !== 'undefined' && (window as any).AndroidHost?.startInAppUpdate) {
      (window as any).AndroidHost.startInAppUpdate(updateInfo.apkUrl);
      setTimeout(() => {
        setIsOpen(false);
        setIsUpdating(false);
      }, 2000);
    } else {
      window.location.href = updateInfo.apkUrl;
      setTimeout(() => {
        setIsOpen(false);
        setIsUpdating(false);
      }, 2000);
    }
  };

  if (!updateInfo) return null;

  return (
    <>
      {/* Floating Pill for Quick Access */}
      <div className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-proz-navy/90 hover:bg-proz-navy border border-proz-purple/40 hover:border-proz-purple text-proz-white text-xs font-semibold shadow-lg shadow-proz-purple/20 backdrop-blur-md transition-all hover:scale-105 active:scale-95 group"
          title="App Version & Updates"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>v{currentVersion}</span>
          <Download className="w-3.5 h-3.5 text-proz-purple group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* In-App Update Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-proz-card border border-white/10 rounded-2xl p-6 shadow-2xl shadow-rose-950/30 overflow-hidden">
            {/* Top gradient glow */}
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-proz-purple/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-proz-red/25 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-proz-grey hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-proz-red to-proz-purple text-white shadow-md shadow-proz-red/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {updateInfo.appName}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-proz-purple/20 border border-proz-purple/40 text-proz-purple font-mono">
                    v{updateInfo.latestVersion}
                  </span>
                </h3>
                <p className="text-xs text-proz-grey">
                  {isAndroidApp ? 'Android In-App Direct Update' : 'Live Platform & APK Engine'} • {updateInfo.fileSize}
                </p>
              </div>
            </div>

            {/* Changelog */}
            <div className="bg-proz-midnight/70 rounded-xl p-3.5 border border-white/5 mb-5">
              <h4 className="text-xs font-semibold text-proz-white mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> What's New in v{updateInfo.latestVersion}:
              </h4>
              <ul className="space-y-1.5">
                {updateInfo.changelog.map((item, idx) => (
                  <li key={idx} className="text-xs text-proz-grey flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-proz-purple mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-proz-red via-proz-purple to-proz-cyan shadow-lg shadow-proz-red/30 hover:opacity-95 active:scale-98 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isUpdating
                  ? isAndroidApp
                    ? 'Launching In-App Installer...'
                    : 'Downloading APK...'
                  : isAndroidApp
                  ? 'Update Now (In-App)'
                  : 'Download Latest APK (v0.01)'}
              </button>

              <a
                href={updateInfo.directGithubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2 text-xs text-proz-grey hover:text-proz-white transition-colors"
              >
                View release on GitHub →
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
