"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Tv, 
  Heart, 
  Share2, 
  Play, 
  ArrowLeft, 
  Star, 
  Film, 
  Users, 
  Info,
  Check
} from 'lucide-react';
import { getChannelById, getAllChannels } from '@/lib/data/channelsData';
import { resolveChannelProfile } from '@/lib/providers/channelRegistry';
import { MOCK_CONTENT } from '@/lib/data/mockContent';
import ContentCard from '@/components/content/ContentCard';
import { ExternalLink, Smartphone, Globe, Search } from 'lucide-react';
import { ContentItem } from '@/types/content';

export default function ChannelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const channelSlug = params?.id as string;

  const staticChannel = useMemo(() => {
    const raw = getChannelById(channelSlug);
    return raw ? resolveChannelProfile(raw) : undefined;
  }, [channelSlug]);

  const [remoteChannelMeta, setRemoteChannelMeta] = useState<{
    name: string;
    logo?: string;
    totalVideos?: number;
  } | null>(null);
  const [channelSearch, setChannelSearch] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'popular' | 'about'>('all');
  const [copied, setCopied] = useState(false);
  const [apiVideos, setApiVideos] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);

  const channel = useMemo(() => {
    if (staticChannel) return staticChannel;
    if (remoteChannelMeta) {
      return {
        id: channelSlug,
        slug: channelSlug,
        name: remoteChannelMeta.name,
        category: 'OTT Channel',
        logo: remoteChannelMeta.logo || '',
        bannerUrl: remoteChannelMeta.logo || '',
        description: `Official streaming catalog for ${remoteChannelMeta.name}.`,
        contentCount: remoteChannelMeta.totalVideos || apiVideos.length,
        subscribers: '1.2M',
        rating: 4.7,
        color: '#E11D48',
        integrationStatus: 'API Connected' as const,
      } as any;
    }
    return undefined;
  }, [staticChannel, remoteChannelMeta, channelSlug, apiVideos.length]);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    fetch(`/api/channels/${encodeURIComponent(channelSlug)}/videos`)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data.channelName) {
          setRemoteChannelMeta({
            name: data.channelName,
            logo: data.channelLogo,
            totalVideos: data.totalVideos,
          });
        }
        if (data.videos && Array.isArray(data.videos) && data.videos.length > 0) {
          setApiVideos(data.videos);
        } else {
          setApiVideos([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load channel videos:', err);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [channelSlug]);

  useEffect(() => {
    if (!channel) return;
    try {
      const saved = localStorage.getItem('proz_channel_favorites');
      if (saved) {
        const list: string[] = JSON.parse(saved);
        setIsFavorite(list.includes(channel.id));
      }
    } catch {
      // Ignore
    }
  }, [channel]);

  const toggleFavorite = () => {
    if (!channel) return;
    try {
      const saved = localStorage.getItem('proz_channel_favorites');
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (list.includes(channel.id)) {
        list = list.filter((id) => id !== channel.id);
        setIsFavorite(false);
      } else {
        list.push(channel.id);
        setIsFavorite(true);
      }
      localStorage.setItem('proz_channel_favorites', JSON.stringify(list));
    } catch {
      // Ignore
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Associated content from live Cine18 / provider discovery
  const channelContent = useMemo(() => {
    if (apiVideos.length > 0) {
      if (channelSearch.trim()) {
        const q = channelSearch.toLowerCase();
        return apiVideos.filter((v) => v.title.toLowerCase().includes(q));
      }
      return apiVideos;
    }
    return [];
  }, [apiVideos, channelSearch]);

  if (!channel && isLoading) {
    return (
      <div className="min-h-screen bg-[#07090E] text-zinc-100 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 rounded-full border-4 border-zinc-800 border-t-rose-500 animate-spin mb-3" />
        <p className="text-xs text-zinc-400">Loading channel catalog &amp; live streams...</p>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-[#07090E] text-zinc-100 flex flex-col items-center justify-center p-4">
        <Tv className="w-16 h-16 text-zinc-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Channel Not Found</h2>
        <p className="text-sm text-zinc-400 mb-6 text-center max-w-sm">
          The requested channel could not be located in our official directory.
        </p>
        <Link
          href="/channels"
          className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 transition-colors"
        >
          Back to All Channels
        </Link>
      </div>
    );
  }

  const initials = String(channel.name || '')
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0] || '')
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#07090E] text-zinc-100 pb-28">
      
      {/* Top Banner Artwork */}
      <div className="relative w-full h-48 sm:h-64 lg:h-72 overflow-hidden bg-zinc-900">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 blur-sm scale-105"
          style={{ backgroundImage: `url(${channel.bannerUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/60 to-transparent" />
        
        {/* Top Back Button with safe clearance */}
        <div className="absolute top-3 left-4 z-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-zinc-700/60 text-zinc-200 hover:text-white text-xs font-medium transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Channels</span>
          </button>
        </div>
      </div>

      {/* Channel Header Profile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 pb-6 border-b border-zinc-800">
          
          {/* Avatar and Channel Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            
            {/* Big Circular Avatar matching screenshot style */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 border-2 border-zinc-700 shadow-2xl shrink-0 overflow-hidden">
              {channel.logo && !logoError ? (
                <img
                  src={channel.logo}
                  alt={channel.name}
                  className="w-full h-full rounded-full object-cover"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div 
                  className="w-full h-full rounded-full flex items-center justify-center shadow-inner"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${channel.color || '#991B1B'}ee, #0B0E14 85%)`
                  }}
                >
                  <span className="font-extrabold text-white text-2xl sm:text-3xl tracking-wider select-none drop-shadow-md">
                    {initials}
                  </span>
                </div>
              )}
            </div>

            {/* Titles & Meta */}
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wide">
                  {channel.category}
                </span>

                {/* Integration Status Badge */}
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                  channel.integrationStatus === 'API Connected'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : channel.integrationStatus === 'Official Website Available'
                    ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                    : channel.integrationStatus === 'Official App Available'
                    ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                    : channel.integrationStatus === 'Partner API Required'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : channel.integrationStatus === 'Playback Restricted'
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}>
                  {channel.integrationStatus || 'Awaiting Verification'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {channel.name}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-zinc-400 mt-1">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-zinc-500" />
                  {channel.subscribers || '1.2M'} Subscribers
                </span>
                <span className="flex items-center gap-1">
                  <Film className="w-3.5 h-3.5 text-zinc-500" />
                  {channel.contentCount} Titles
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {channel.rating || 4.8}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-center">
            {channel.officialWebsite && (
              <a
                href={channel.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 text-xs font-semibold transition-all shadow-sm"
              >
                <Globe className="w-3.5 h-3.5 text-rose-400" />
                <span>Official Web</span>
                <ExternalLink className="w-3 h-3 text-zinc-400" />
              </a>
            )}

            {channel.officialAppUrl && (
              <a
                href={channel.officialAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 text-xs font-semibold transition-all shadow-sm"
              >
                <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                <span>Official App</span>
              </a>
            )}

            <button
              onClick={toggleFavorite}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isFavorite
                  ? 'bg-rose-600 text-white border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                  : 'bg-zinc-900 text-zinc-200 border-zinc-700 hover:border-zinc-500 hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
              <span>{isFavorite ? 'Subscribed' : 'Subscribe'}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-700 transition-colors"
              title="Share Channel"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-6 border-b border-zinc-800/80 mt-6 text-sm">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 font-semibold relative transition-colors ${
              activeTab === 'all' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            All Videos ({channelContent.length})
            {activeTab === 'all' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_8px_#F43F5E]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('popular')}
            className={`pb-3 font-semibold relative transition-colors ${
              activeTab === 'popular' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Popular
            {activeTab === 'popular' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_8px_#F43F5E]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`pb-3 font-semibold relative transition-colors ${
              activeTab === 'about' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            About Channel
            {activeTab === 'about' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_8px_#F43F5E]" />
            )}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="mt-6">
          {activeTab === 'about' ? (
            <div className="max-w-2xl bg-[#10141D] rounded-2xl p-6 border border-zinc-800">
              <h3 className="text-base font-bold text-white mb-2">About {channel.name}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                {channel.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-zinc-800/80">
                <div>
                  <span className="text-zinc-500 block">Category</span>
                  <span className="text-zinc-200 font-semibold">{channel.category}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Total Titles</span>
                  <span className="text-zinc-200 font-semibold">{channel.contentCount} Available</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Audience Rating</span>
                  <span className="text-zinc-200 font-semibold">{channel.rating || 4.8} / 5.0</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Stream Quality</span>
                  <span className="text-rose-400 font-semibold">4K UHD & 1080p FHD</span>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-xl bg-zinc-900/60 border border-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : channelContent.length === 0 ? (
            <div className="py-16 text-center bg-[#10141D]/50 border border-zinc-800/80 rounded-2xl p-8">
              <Tv className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white mb-1">Catalog Synchronizing</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Episodes and playable streams for {channel.name} are currently being indexed by our discovery engine.
              </p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {channelContent.map((item) => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
