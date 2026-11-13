"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Flame, 
  Rocket, 
  HeartHandshake, 
  Zap, 
  Sparkles, 
  Tv, 
  ShieldAlert, 
  Film, 
  Laugh, 
  Shield, 
  Compass 
} from 'lucide-react';
import { GENRE_LIST } from '@/lib/data/mockContent';

const ICON_MAP: Record<string, React.ReactNode> = {
  Flame: <Flame className="w-4 h-4 text-orange-400" />,
  Rocket: <Rocket className="w-4 h-4 text-proz-cyan" />,
  HeartHandshake: <HeartHandshake className="w-4 h-4 text-rose-400" />,
  Zap: <Zap className="w-4 h-4 text-amber-400" />,
  Sparkles: <Sparkles className="w-4 h-4 text-proz-purple" />,
  Tv: <Tv className="w-4 h-4 text-emerald-400" />,
  ShieldAlert: <ShieldAlert className="w-4 h-4 text-red-400" />,
  Film: <Film className="w-4 h-4 text-sky-400" />,
  Laugh: <Laugh className="w-4 h-4 text-yellow-400" />,
  Shield: <Shield className="w-4 h-4 text-indigo-400" />,
};

export const GenreGrid: React.FC = () => {
  return (
    <section className="relative my-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Compass className="w-4 h-4 text-proz-purple" />
        <h2 className="text-lg sm:text-xl font-bold text-proz-white tracking-tight">
          Browse by Genre
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {GENRE_LIST.map((g) => (
          <Link
            key={g.id}
            href={`/movies?genre=${g.id}`}
            className="flex items-center gap-3 p-3.5 rounded-2xl glass-card hover:bg-proz-navy/70 border border-proz-border/50 hover:border-proz-cyan/40 transition-all duration-200 group"
          >
            <div className="p-2 rounded-xl bg-proz-midnight/80 border border-proz-border/40 group-hover:scale-110 transition-transform">
              {ICON_MAP[g.icon] || <Film className="w-4 h-4 text-proz-cyan" />}
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-proz-white group-hover:text-proz-cyan transition-colors">
                {g.name}
              </h4>
              <p className="text-[10px] text-proz-grey">Stream Now</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default GenreGrid;
