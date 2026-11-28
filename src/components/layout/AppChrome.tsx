'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/navigation/Navbar';
import MobileBottomNav from '@/components/navigation/MobileBottomNav';
import Footer from '@/components/navigation/Footer';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import InAppUpdater from '@/components/common/InAppUpdater';
import { bugDetector } from '@/lib/diagnostics/bugDetector';

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const isWatchRoute = pathname.startsWith('/watch');

  useEffect(() => {
    bugDetector.attachGlobalErrorListeners();
  }, []);

  return (
    <>
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
