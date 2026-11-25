"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const SubHeaderNav: React.FC = () => {
  const pathname = usePathname();

  const tabs: Array<{
    label: string;
    href: string;
    isLive?: boolean;
    isVault?: boolean;
    isAdult?: boolean;
    badge?: string;
  }> = [
    { label: 'Recommend', href: '/' },
    { label: 'Movies', href: '/movies' },
    { label: 'TV Shows', href: '/series' },
    { label: 'Anime', href: '/anime' },
    { label: 'Asian Dramas', href: '/drama' },
    { label: 'Live TV', href: '/live', isLive: true },
    { label: 'Channels', href: '/channels' },
    { label: 'Stash', href: '/library', isVault: true, badge: 'DB' },
    { label: 'Explore', href: '/explore' },
    { label: 'Ranking', href: '/ranking' },
    { label: '18+ Vault', href: '/restricted', isAdult: true },
  ];

  return (
    <div className="w-full bg-[#07090F]/92 backdrop-blur-xl border-b border-white/[0.08] sticky top-14 sm:top-16 z-30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none no-scrollbar py-2.5 text-xs">
          {tabs.map((tab) => {
            const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-lg shadow-rose-600/25'
                    : tab.isAdult
                    ? 'bg-rose-500/10 text-rose-300 border border-rose-500/25 hover:bg-rose-500/20'
                    : tab.isVault
                    ? 'bg-purple-500/10 text-purple-300 border border-purple-500/25 hover:bg-purple-500/20'
                    : 'bg-white/[0.04] text-zinc-300 border border-white/[0.07] hover:bg-white/[0.09] hover:text-white'
                }`}
              >
                {tab.isLive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 font-bold">
                    {tab.badge}
                  </span>
                )}
                {tab.isAdult && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/30 text-rose-200 font-bold">
                    18+
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubHeaderNav;
