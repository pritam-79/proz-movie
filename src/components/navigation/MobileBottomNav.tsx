"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Compass, Tv, User } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Ranking', href: '/ranking', icon: Trophy },
    { label: 'Explore', href: '/explore', icon: Compass },
    { label: 'Channels', href: '/channels', icon: Tv },
    { label: 'Me', href: '/account', icon: User },
  ];

  // Don't show bottom nav inside watch page to avoid blocking player controls
  if (pathname.startsWith('/watch')) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B0609]/95 backdrop-blur-xl border-t border-rose-950/40 shadow-2xl safe-area-bottom">
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 transition-all duration-200 relative group ${
                isActive ? 'text-rose-500 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-rose-500 rounded-full shadow-[0_0_8px_#F43F5E]" />
                )}
              </div>
              <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'text-rose-500' : 'text-zinc-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
