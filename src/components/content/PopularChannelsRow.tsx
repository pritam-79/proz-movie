"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Tv, ChevronRight } from 'lucide-react';
import { getAllChannels } from '@/lib/data/channelsData';
import { Channel } from '@/types/channel';

function ChannelCircleAvatar({ channel, initials }: { channel: Channel; initials: string }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div
      className="w-full h-full rounded-full overflow-hidden flex items-center justify-center relative shadow-inner"
      style={{
        background: `radial-gradient(circle at 30% 30%, ${channel.color || '#991B1B'}dd, #0B0E14 85%)`,
      }}
    >
      {channel.logo && !imgErr ? (
        <img
          src={channel.logo}
          alt={channel.name}
          loading="lazy"
          className="w-full h-full object-cover rounded-full"
          onError={() => setImgErr(true)}
        />
      ) : (
        <span className="font-extrabold text-white text-xs sm:text-sm tracking-wider drop-shadow-md select-none">
          {initials}
        </span>
      )}
    </div>
  );
}

export const PopularChannelsRow: React.FC = () => {
  const allChannels = getAllChannels();
  const topChannels = allChannels.slice(0, 18);

  return (
    <section className="py-2 sm:py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/25">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
              Popular Channels &amp; Networks
            </h2>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Stream exclusive series and channels directly from verified OTT networks
            </p>
          </div>
        </div>

        <Link
          href="/channels"
          className="flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20"
        >
          <span>All ({allChannels.length})</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Horizontal Circular Logos Row */}
      <div className="flex items-center gap-3.5 sm:gap-5 overflow-x-auto pb-3 pt-1 scrollbar-none no-scrollbar">
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
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 bg-gradient-to-tr from-rose-600/60 via-purple-500/40 to-zinc-700 group-hover:from-rose-500 group-hover:to-cyan-400 transition-all duration-300 shadow-lg">
                <ChannelCircleAvatar channel={channel} initials={initials} />
              </div>

              <div className="mt-2 w-18 sm:w-22 max-w-[84px] px-0.5">
                <p className="text-[11px] sm:text-xs font-semibold text-zinc-200 group-hover:text-rose-400 transition-colors truncate">
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
