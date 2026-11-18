"use client";

import React from 'react';
import Link from 'next/link';
import { Tv, ChevronRight } from 'lucide-react';
import { getAllChannels } from '@/lib/data/channelsData';

export const PopularChannelsRow: React.FC = () => {
  const allChannels = getAllChannels();
  const topChannels = allChannels.slice(0, 18);

  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Popular Channels & Networks
            </h2>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Stream exclusive series and movies from top creators and studios
            </p>
          </div>
        </div>

        <Link
          href="/channels"
          className="flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
        >
          <span>View All ({allChannels.length})</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Horizontal Circular Logos Row */}
      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-3 pt-1 scrollbar-none no-scrollbar">
        {topChannels.map((channel) => {
          const initials = channel.name
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase();

          return (
            <Link
              key={channel.id}
              href={`/channels/${channel.slug}`}
              className="flex flex-col items-center text-center shrink-0 group transition-transform active:scale-95"
            >
              {/* Circular Avatar */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-b from-zinc-700/40 via-zinc-800/20 to-zinc-900 border border-zinc-800 group-hover:border-rose-500/80 transition-all duration-300 shadow-md group-hover:shadow-[0_0_12px_rgba(225,29,72,0.3)]">
                <div 
                  className="w-full h-full rounded-full overflow-hidden flex items-center justify-center relative shadow-inner"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${channel.color || '#991B1B'}dd, #0B0E14 85%)`
                  }}
                >
                  <span className="font-extrabold text-white text-xs sm:text-sm tracking-wider drop-shadow-md select-none">
                    {initials}
                  </span>
                </div>
              </div>

              {/* Title below circle */}
              <div className="mt-2 w-20 sm:w-24 px-0.5">
                <p className="text-xs font-semibold text-zinc-200 group-hover:text-rose-400 transition-colors truncate">
                  {channel.name}
                </p>
                <span className="text-[10px] text-zinc-500 block truncate">
                  {channel.category}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default PopularChannelsRow;
