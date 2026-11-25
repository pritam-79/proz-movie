"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Film, Tv, FolderLock, User } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Movies', href: '/movies', icon: Film },
    { label: 'Channels', href: '/channels', icon: Tv },
    { label: 'Stash', href: '/library', icon: FolderLock },
    { label: 'Me', href: '/account', icon: User },
  ];

  // Don't show bottom nav inside watch page to avoid blocking player controls
  if (pathname.startsWith('/watch')) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#07090F]/95 backdrop-blur-2xl border-t border-white/[0.08] shadow-[0_-8px_32px_rgba(0,0,0,0.65)] pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 transition-all duration-200 relative ${
                isActive ? 'text-rose-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-rose-500/15 text-rose-400 shadow-inner' : ''
                }`}
              >
                <Icon
                  className={`w-4.5 h-4.5 transition-transform duration-200 ${
                    isActive ? 'scale-105 stroke-[2.3]' : 'stroke-[1.8]'
                  }`}
                />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
