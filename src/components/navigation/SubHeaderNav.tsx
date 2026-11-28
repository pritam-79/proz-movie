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
    { label: 'Gallery & Stash', href: '/library', isVault: true, badge: 'DB' },
    { label: 'Explore', href: '/explore' },
    { label: 'Ranking', href: '/ranking' },
    { label: '18+ Vault', href: '/restricted', isAdult: true },
    { label: 'Diagnostics', href: '/settings' },
  ];

  return (
    <div className="w-full cinema-nav sticky top-14 sm:top-16 z-30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none no-scrollbar py-2.5 text-xs">
          {tabs.map((tab) => {
            const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap font-semibold transition-all flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-gradient-to-r from-proz-purple to-orange-600 text-white keep-white border-transparent shadow-purple-glow'
                    : tab.isAdult
                    ? 'bg-proz-purple/10 text-proz-purple border-proz-purple/25 hover:bg-proz-purple/20'
                    : tab.isVault
                    ? 'bg-proz-cyan/10 text-proz-cyan border-proz-cyan/25 hover:bg-proz-cyan/20'
                    : 'bg-proz-elevated/60 text-proz-grey border-proz-border/45 hover:text-proz-white hover:border-proz-border'
                }`}
              >
                {tab.isLive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-proz-cyan/20 text-proz-cyan font-bold">
                    {tab.badge}
                  </span>
                )}
                {tab.isAdult && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-proz-purple/25 text-proz-purple font-bold">
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
