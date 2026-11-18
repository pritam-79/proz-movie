"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Flame, 
  TrendingUp, 
  Play, 
  Star, 
  Eye, 
  Calendar, 
  Crown,
  Medal,
  ChevronRight,
  Tv
} from 'lucide-react';
import { MOCK_CONTENT } from '@/lib/data/mockContent';
import { getAllChannels } from '@/lib/data/channelsData';

type RankingPeriod = 'day' | 'week' | 'month' | 'all';
type RankingType = 'all' | 'movies' | 'series' | 'anime' | 'channels';

export default function RankingPage() {
  const [period, setPeriod] = useState<RankingPeriod>('week');
  const [activeType, setActiveType] = useState<RankingType>('all');

  const rankedContent = useMemo(() => {
    let list = [...MOCK_CONTENT].filter((i) => !i.isRestricted18Plus);

    if (activeType === 'movies') {
      list = list.filter((i) => i.type === 'movie');
    } else if (activeType === 'series') {
      list = list.filter((i) => i.type === 'series');
    } else if (activeType === 'anime') {
      list = list.filter((i) => i.type === 'anime' || (i.genres as string[])?.includes('Anime'));
    }

    // Sort by rating score and simulated period weights
    return list.sort((a, b) => {
      const scoreA = (a.ratingScore || 8) * 1000 + (a.releaseYear || 2024);
      const scoreB = (b.ratingScore || 8) * 1000 + (b.releaseYear || 2024);
      return scoreB - scoreA;
    }).slice(0, 30);
  }, [activeType, period]);

  const rankedChannels = useMemo(() => {
    const channels = getAllChannels();
    return [...channels]
      .sort((a, b) => ((b.rating || 0) * 10000 + b.contentCount) - ((a.rating || 0) * 10000 + a.contentCount))
      .slice(0, 24);
  }, []);

  return (
    <div className="min-h-screen bg-[#07090E] text-zinc-100 pb-16">
      
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-rose-950/40 via-red-950/10 to-transparent pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-1">
              <Trophy className="w-3.5 h-3.5" />
              <span>OFFICIAL LEADERBOARDS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              PROZ Top Rankings
            </h1>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center p-1 bg-[#121620] rounded-xl border border-zinc-800 text-xs self-start sm:self-auto">
            <button
              onClick={() => setPeriod('day')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                period === 'day' ? 'bg-rose-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                period === 'week' ? 'bg-rose-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                period === 'month' ? 'bg-rose-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                period === 'all' ? 'bg-rose-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none no-scrollbar text-xs">
          {[
            { id: 'all', label: 'All Entertainment' },
            { id: 'movies', label: 'Top Movies' },
            { id: 'series', label: 'Top Web Series' },
            { id: 'anime', label: 'Top Anime' },
            { id: 'channels', label: 'Top Channels' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveType(tab.id as RankingType)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
                activeType === tab.id
                  ? 'bg-rose-600 text-white font-semibold shadow-[0_0_12px_rgba(225,29,72,0.4)]'
                  : 'bg-[#121620] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Channels Ranking View */}
        {activeType === 'channels' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rankedChannels.map((channel, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;
              const initials = channel.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

              return (
                <Link
                  key={channel.id}
                  href={`/channels/${channel.slug}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#121620] hover:bg-[#181E2C] border border-zinc-800/80 hover:border-rose-500/40 transition-all group"
                >
                  {/* Rank Badge */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 ${
                    rank === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                    rank === 2 ? 'bg-zinc-400/20 text-zinc-300 border border-zinc-400/40' :
                    rank === 3 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/40' :
                    'bg-zinc-800 text-zinc-500'
                  }`}>
                    {rank}
                  </div>

                  {/* Circular Avatar */}
                  <div 
                    className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-zinc-700"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${channel.color || '#991B1B'}ee, #0B0E14 85%)`
                    }}
                  >
                    <span className="font-extrabold text-white text-xs drop-shadow-md">
                      {initials}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-rose-400 transition-colors truncate">
                      {channel.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                      <span className="truncate">{channel.category}</span>
                      <span>•</span>
                      <span className="text-amber-400 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {channel.rating}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 shrink-0" />
                </Link>
              );
            })}
          </div>
        ) : (
          /* Movie / Series / Anime Ranking View */
          <div className="space-y-3">
            {rankedContent.map((item, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;
              const rating = item.ratingScore || 8.5;

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-xl bg-[#11151F] hover:bg-[#161C2B] border border-zinc-800/80 hover:border-zinc-700 transition-all group"
                >
                  {/* Rank Number with special gold/silver/bronze icons */}
                  <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-xl flex items-center justify-center font-black text-sm sm:text-base shrink-0 ${
                    rank === 1 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-[0_0_12px_rgba(251,191,36,0.5)]' :
                    rank === 2 ? 'bg-gradient-to-br from-zinc-300 to-zinc-500 text-black shadow-[0_0_12px_rgba(212,212,216,0.3)]' :
                    rank === 3 ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-white shadow-[0_0_12px_rgba(180,83,9,0.3)]' :
                    'bg-zinc-800/80 text-zinc-400 border border-zinc-700/50'
                  }`}>
                    #{rank}
                  </div>

                  {/* Thumbnail */}
                  <Link 
                    href={`/watch/${item.id}`}
                    className="relative w-16 sm:w-20 aspect-[2/3] rounded-lg overflow-hidden shrink-0 bg-zinc-900 shadow-md group-hover:ring-2 group-hover:ring-rose-500 transition-all"
                  >
                    <img
                      src={item.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                      <div className="w-6 h-6 rounded-full bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-3 h-3 fill-white ml-0.5" />
                      </div>
                    </div>
                  </Link>

                  {/* Information */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 uppercase">
                        {item.type || 'Movie'}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {item.releaseYear || 2024}
                      </span>
                    </div>

                    <Link href={`/watch/${item.id}`}>
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-rose-400 transition-colors truncate">
                        {item.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5 hidden sm:block">
                      {item.synopsis || item.overview}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {rating.toFixed(1)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-zinc-500" />
                        {item.ratingCount ? `${(item.ratingCount / 1000).toFixed(1)}K views` : '18.4K views'}
                      </span>
                    </div>
                  </div>

                  {/* Play Action */}
                  <div className="shrink-0">
                    <Link
                      href={`/watch/${item.id}`}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span className="hidden sm:inline">Stream</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
