'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Navbar from '@/components/navigation/Navbar';
import MobileBottomNav from '@/components/navigation/MobileBottomNav';
import Footer from '@/components/navigation/Footer';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import InAppUpdater from '@/components/common/InAppUpdater';
import { bugDetector } from '@/lib/diagnostics/bugDetector';
import { brandConfig } from '@/config/brand.config';

const SCROLL_MAP_KEY = 'proz_scroll_positions_v1';
const SPLASH_SEEN_KEY = 'proz_splash_seen_v0903';

function readScrollMap(): Record<string, number> {
  try {
    const raw = sessionStorage.getItem(SCROLL_MAP_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeScrollPosition(routeKey: string, y: number) {
  try {
    const map = readScrollMap();
    map[routeKey] = Math.max(0, Math.round(y));
    const keys = Object.keys(map);
    if (keys.length > 40) {
      delete map[keys[0]];
    }
    sessionStorage.setItem(SCROLL_MAP_KEY, JSON.stringify(map));
  } catch {}
}

function AppChromeInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const routeKey = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;
  const isWatchRoute = pathname.startsWith('/watch');
  const [showSplash, setShowSplash] = useState(false);
  const lastSavedKeyRef = useRef<string>(routeKey);
  const isPopNavRef = useRef(false);

  useEffect(() => {
    bugDetector.attachGlobalErrorListeners();
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      try {
        if (!sessionStorage.getItem(SPLASH_SEEN_KEY)) {
          setShowSplash(true);
          sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
          const t = setTimeout(() => setShowSplash(false), 520);
          return () => clearTimeout(t);
        }
      } catch {}
    }
  }, []);

  // Track popstate (back/forward) vs forward link click & save scroll smoothly
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPopState = () => {
      isPopNavRef.current = true;
    };
    const onScroll = () => {
      writeScrollPosition(lastSavedKeyRef.current, window.scrollY);
    };
    window.addEventListener('popstate', onPopState);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Restore scroll position cleanly on back-navigation without overriding normal top navigation
  useEffect(() => {
    lastSavedKeyRef.current = routeKey;
    if (typeof window === 'undefined' || isWatchRoute) return;

    const map = readScrollMap();
    const savedY = map[routeKey];
    if (isPopNavRef.current && typeof savedY === 'number' && savedY > 0) {
      isPopNavRef.current = false;
      requestAnimationFrame(() => {
        window.scrollTo({ top: savedY, behavior: 'instant' as ScrollBehavior });
      });
    } else {
      isPopNavRef.current = false;
    }
  }, [routeKey, isWatchRoute]);

  return (
    <>
      {showSplash && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[100] bg-proz-midnight flex flex-col items-center justify-center gap-4 transition-opacity duration-300"
        >
          <div className="w-16 h-16 rounded-2xl bg-proz-navy border border-proz-purple/40 shadow-purple-glow flex items-center justify-center">
            <svg viewBox="0 0 80 80" className="w-12 h-12">
              <defs>
                <linearGradient id="splashEmblem" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF2E54" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
              <path
                d="M 24 18 L 48 18 C 60 18, 64 26, 64 36 C 64 46, 58 52, 48 52 L 34 52 L 34 62 L 24 62 Z"
                fill="url(#splashEmblem)"
              />
              <path d="M 36 28 L 36 44 L 50 36 Z" fill="#07070A" />
            </svg>
          </div>
          <div className="text-center space-y-1">
            <p className="text-lg font-black tracking-wider text-proz-white">
              PROZ MOVIE — {brandConfig.version}
            </p>
            <p className="text-[11px] text-proz-grey uppercase tracking-[0.25em]">
              {brandConfig.tagline}
            </p>
          </div>
          <div className="w-36 h-1 rounded-full bg-proz-elevated overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-proz-purple to-proz-cyan animate-pulse" />
          </div>
        </div>
      )}

      {!isWatchRoute && <Navbar />}

      <main
        className={
          isWatchRoute
            ? 'flex-1 w-full min-h-[100dvh] bg-black pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] flex flex-col justify-center'
            : 'flex-1 w-full pt-14 sm:pt-16 pb-24 md:pb-12'
        }
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>

      {!isWatchRoute && <Footer />}
      {!isWatchRoute && <MobileBottomNav />}
      <InAppUpdater suppressOverlay={isWatchRoute} />
    </>
  );
}

export default function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AppChromeInner>{children}</AppChromeInner>
    </Suspense>
  );
}
