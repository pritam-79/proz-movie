"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Lock, 
  Unlock,
  CheckCircle2, 
  Calendar, 
  Film,
  Zap,
  Sparkles,
  Flame,
  Globe,
  ExternalLink,
  Tv,
  Play
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { MOCK_CONTENT } from '@/lib/data/mockContent';
import ContentCard from '@/components/content/ContentCard';

// Curated Top Adult Sites & Portals
const TOP_ADULT_SITES = [
  {
    name: "Pornhub Official Vault",
    tagline: "World's largest adult video streaming hub",
    badge: "TOP TUBE",
    category: "Full HD Tubes",
    url: "https://www.pornhub.com",
    img: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop"
  },
  {
    name: "Xvideos Red Studio",
    tagline: "Millions of amateur & professional adult videos",
    badge: "GLOBAL #1",
    category: "Free Streaming",
    url: "https://www.xvideos.com",
    img: "https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=600&auto=format&fit=crop"
  },
  {
    name: "Brazzers Premium Hub",
    tagline: "High-budget cinematic scenes & iconic adult stars",
    badge: "PREMIUM STUDIO",
    category: "4K Studios",
    url: "https://www.brazzers.com",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop"
  },
  {
    name: "SpankBang 4K Ultra",
    tagline: "Ultra HD & 4K high bitrate adult video network",
    badge: "4K ULTRA HD",
    category: "HD Network",
    url: "https://spankbang.com",
    img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop"
  },
  {
    name: "Stripchat Live Network",
    tagline: "Interactive live adult webcams & private shows",
    badge: "LIVE CAMS",
    category: "Live Interactive",
    url: "https://stripchat.com",
    img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop"
  },
  {
    name: "Chaturbate Global Stream",
    tagline: "Top-rated live amateur webcam performances",
    badge: "COMMUNITY LIVE",
    category: "Cam Models",
    url: "https://chaturbate.com",
    img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop"
  }
];

export default function RestrictedZonePage() {
  const { user, verify18Plus } = useAuth();
  const [birthDate, setBirthDate] = useState('2000-01-01');
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'hot_web_series' | 'hentai' | '3d_adult' | 'movies' | 'sites'>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter 18+ content from MOCK_CONTENT
  const allAdultContent = MOCK_CONTENT.filter(c => c.isRestricted18Plus || c.is_adult);

  const hasGenre = (item: any, g: string) => {
    if (!item.genres || !Array.isArray(item.genres)) return false;
    return item.genres.some((genre: any) => {
      const name = typeof genre === 'string' ? genre : (genre?.name || '');
      return name.toLowerCase().includes(g.toLowerCase());
    });
  };

  // Tab Filtering
  const filteredItems = allAdultContent.filter(item => {
    if (selectedTab === 'hot_web_series') {
      return item.category === 'hot_web_series' || hasGenre(item, 'Hot Web Series');
    }
    if (selectedTab === 'hentai') {
      return item.category === 'hentai' || hasGenre(item, 'Hentai') || hasGenre(item, 'Anime 18+');
    }
    if (selectedTab === '3d_adult') {
      return item.category === '3d_adult' || hasGenre(item, '3D Adult');
    }
    if (selectedTab === 'movies') {
      return (item.type === 'movie' || item.content_type === 'movie') && item.category !== '3d_adult' && item.category !== 'hentai';
    }
    return true;
  });

  const handleInstantConfirm = () => {
    setIsAgeConfirmed(true);
    if (user) {
      verify18Plus('2000-01-01');
    }
    setErrorMsg(null);
  };

  const handleDateConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) return;
    const birth = new Date(birthDate);
    const now = new Date();
    if (now.getFullYear() - birth.getFullYear() >= 18) {
      setIsAgeConfirmed(true);
      if (user) {
        verify18Plus(birthDate);
      }
      setErrorMsg(null);
    } else {
      setErrorMsg('Access denied: You must be at least 18 years old.');
    }
  };

  const isUnlocked = isAgeConfirmed || user?.is18PlusVerified;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* 18+ Warning Banner */}
      <div className="p-6 rounded-3xl bg-rose-950/30 border border-rose-500/40 shadow-glass flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-rose-300 tracking-tight flex items-center gap-2">
              <span>18+ Restricted Zone</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-600 text-white">
                ADULT ONLY
              </span>
            </h1>
            <p className="text-xs text-rose-200/80 mt-0.5 max-w-2xl">
              Adults-only entertainment vault featuring Hot Web Series, Hentai, 3D Adult CGI, Erotic Cinema, and Top Tube Portals. Strictly restricted to ages 18+.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-rose-300 self-start sm:self-center">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>ADULT 18+ COMPLIANCE</span>
        </div>
      </div>

      {/* Access Gate: Age Confirmation (NO PIN REQUIRED) */}
      {!isUnlocked ? (
        <div className="max-w-md mx-auto my-12 p-8 rounded-3xl glass-card border border-rose-500/40 shadow-glass-lg space-y-6 text-center">
          
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-proz-white">
              Age Confirmation
            </h2>
            <p className="text-xs text-proz-grey">
              Confirm your age below to unlock the 18+ mature entertainment vault.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Instant 1-Click Age Confirmation */}
          <button
            onClick={handleInstantConfirm}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" />
            <span>I Am 18 Or Older (Unlock Vault)</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-rose-500/20"></div>
            <span className="flex-shrink mx-4 text-[10px] text-proz-grey uppercase tracking-widest">or enter birth date</span>
            <div className="flex-grow border-t border-rose-500/20"></div>
          </div>

          {/* Date of Birth Form */}
          <form onSubmit={handleDateConfirm} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-proz-grey">
                Your Date of Birth
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-proz-grey absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-proz-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all"
            >
              Verify Age & Unlock
            </button>
          </form>

          <div className="pt-2 text-[11px] text-proz-grey/80">
            By proceeding, you affirm that you are at least 18 years old and legally permitted to view mature content.
          </div>

        </div>
      ) : (
        /* Unlocked Catalogue */
        <div className="space-y-8">
          
          {/* Header & Category Filter Tabs */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-proz-border/40 pb-4">
            <div>
              <h3 className="text-lg font-bold text-proz-white uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                <span>18+ Adult Vault ({allAdultContent.length} Titles Available)</span>
              </h3>
              <p className="text-xs text-proz-grey mt-0.5">
                Browse Hot Web Series, Hentai Anime, 3D Adult CGI, Erotic Cinema & Top Tube Portals
              </p>
            </div>

            {/* Category Navigation Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl glass-card border border-proz-border/50 text-[11px]">
              <button
                onClick={() => setSelectedTab('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedTab === 'all'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-proz-grey hover:text-white'
                }`}
              >
                🔥 All ({allAdultContent.length})
              </button>
              <button
                onClick={() => setSelectedTab('hot_web_series')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedTab === 'hot_web_series'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-proz-grey hover:text-white'
                }`}
              >
                🌶️ Hot Web Series
              </button>
              <button
                onClick={() => setSelectedTab('hentai')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedTab === 'hentai'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-proz-grey hover:text-white'
                }`}
              >
                🌸 Hentai & 18+ Anime
              </button>
              <button
                onClick={() => setSelectedTab('3d_adult')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedTab === '3d_adult'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-proz-grey hover:text-white'
                }`}
              >
                🎮 3D Adult & CGI
              </button>
              <button
                onClick={() => setSelectedTab('movies')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedTab === 'movies'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-proz-grey hover:text-white'
                }`}
              >
                🎬 Erotic Cinema
              </button>
              <button
                onClick={() => setSelectedTab('sites')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedTab === 'sites'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-proz-grey hover:text-white'
                }`}
              >
                🌐 Top Adult Sites
              </button>
            </div>
          </div>

          {/* Top Adult Sites & Studios Grid (When 'sites' or 'all' selected) */}
          {(selectedTab === 'sites' || selectedTab === 'all') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-proz-white uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span>Top Adult Sites & Studios</span>
                </h4>
                <span className="text-[10px] text-amber-400 font-mono">DIRECT STREAM PORTALS</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {TOP_ADULT_SITES.map((site) => (
                  <a
                    key={site.name}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative p-4 rounded-2xl glass-card border border-rose-500/30 hover:border-amber-400/60 transition-all overflow-hidden flex flex-col justify-between h-36"
                  >
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-35 transition-opacity"
                      style={{ backgroundImage: `url(${site.img})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {site.badge}
                      </span>
                      <ExternalLink className="w-4 h-4 text-proz-grey group-hover:text-amber-300 transition-colors" />
                    </div>

                    <div className="relative z-10 space-y-0.5">
                      <h5 className="text-sm font-bold text-proz-white group-hover:text-amber-300 transition-colors">
                        {site.name}
                      </h5>
                      <p className="text-[11px] text-proz-grey line-clamp-1">
                        {site.tagline}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Adult Videos & Series Grid */}
          {selectedTab !== 'sites' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-proz-white uppercase tracking-wider flex items-center gap-2">
                  <Film className="w-4 h-4 text-rose-400" />
                  <span>
                    {selectedTab === 'hot_web_series' && 'Hot Web Series & Provocative Sagas'}
                    {selectedTab === 'hentai' && 'Hentai & 18+ Uncensored Anime'}
                    {selectedTab === '3d_adult' && '3D Adult & CGI Masterworks'}
                    {selectedTab === 'movies' && 'Erotic Cinema & Adult Thrillers'}
                    {selectedTab === 'all' && 'All 18+ Titles'}
                    {` (${filteredItems.length} Titles)`}
                  </span>
                </h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {filteredItems.map((item) => (
                  <ContentCard key={item.id} item={item} aspectRatio="poster" />
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
