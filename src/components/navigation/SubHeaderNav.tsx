"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const SubHeaderNav: React.FC = () => {
  const pathname = usePathname();

  const tabs = [
    { label: 'Recommend', href: '/' },
    { label: 'Live TV', href: '/live', isLive: true },
    { label: 'Movies', href: '/movies' },
    { label: 'TV Shows', href: '/series' },
    { label: 'Anime', href: '/anime' },
    { label: 'Asian Dramas', href: '/drama' },
    { label: 'Channels', href: '/channels' },
    { label: 'Explore', href: '/explore' },
    { label: 'Ranking', href: '/ranking' },
    { label: '18+', href: '/restricted', isAdult: true },
  ];

  return (
    <div className="w-full bg-[#0A0D14]/90 backdrop-blur-md border-b border-zinc-800/60 sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none no-scrollbar py-2.5 text-xs sm:text-sm">
          {tabs.map((tab) => {
            const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
            
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative py-1 whitespace-nowrap font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'text-white font-bold'
                    : tab.isAdult
                    ? 'text-rose-400 hover:text-rose-300'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.isLive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
                <span>{tab.label}</span>
                {tab.isAdult && (
                  <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    ADULT
                  </span>
                )}
                {isActive && (
                  <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-rose-500 rounded-full shadow-[0_0_8px_#F43F5E]" />
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
