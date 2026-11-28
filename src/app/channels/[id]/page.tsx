"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Tv,
  Heart,
  Share2,
  ArrowLeft,
  Star,
  Film,
  Users,
  Check,
  ExternalLink,
  Smartphone,
  Globe,
  Search,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { getChannelById } from '@/lib/data/channelsData';
import { resolveChannelProfile } from '@/lib/providers/channelRegistry';
import ContentCard from '@/components/content/ContentCard';
import { ContentItem } from '@/types/content';
import { toImageProxyFallback } from '@/lib/utils/streamUtils';

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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [logoStep, setLogoStep] = useState(0);

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
        color: '#FF2E54',
        integrationStatus: 'API Connected' as const,
      } as any;
    }
    return undefined;
  }, [staticChannel, remoteChannelMeta, channelSlug, apiVideos.length]);

  const fetchChannelVideos = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    fetch(`/api/channels/${encodeURIComponent(channelSlug)}/videos`)
      .then((res) => res.json())
      .then((data) => {
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
          if (data.error) setLoadError(data.error);
        }
      })
      .catch((err) => {
        setLoadError(err?.message || 'Failed to load channel feed.');
      })
      .finally(() => setIsLoading(false));
  }, [channelSlug]);

  useEffect(() => {
    fetchChannelVideos();
  }, [fetchChannelVideos]);

  useEffect(() => {
    if (!channel) return;
    try {
      const saved = localStorage.getItem('proz_channel_favorites');
      if (saved) {
        const list: string[] = JSON.parse(saved);
        setIsFavorite(list.includes(channel.id));
      }
    } catch {}
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
    } catch {}
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const channelContent = useMemo(() => {
    let list = [...apiVideos];
    if (activeTab === 'popular') {
      list = list.sort((a, b) => (b.ratingScore || 0) - (a.ratingScore || 0));
    }
    if (channelSearch.trim()) {
      const q = channelSearch.toLowerCase();
      return list.filter((v) => v.title.toLowerCase().includes(q));
    }
    return list;
  }, [apiVideos, activeTab, channelSearch]);

  if (!channel && isLoading) {
    return (
      <div className="min-h-screen bg-proz-midnight text-proz-white flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 rounded-full border-4 border-proz-border border-t-proz-purple animate-spin mb-3" />
        <p className="text-xs text-proz-grey">Loading channel catalog &amp; live streams...</p>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-proz-midnight text-proz-white flex flex-col items-center justify-center p-4">
        <Tv className="w-16 h-16 text-proz-grey mb-4" />
        <h2 className="text-xl font-bold text-proz-white mb-2">Channel Not Found</h2>
        <p className="text-sm text-proz-grey mb-6 text-center max-w-sm">
          The requested channel could not be located in our official directory.
        </p>
        <Link href="/channels" className="px-5 py-2.5 rounded-xl glass-button-primary text-xs font-semibold">
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

  const resolvedLogo =
    logoStep === 0
      ? channel.logo
      : logoStep === 1 && channel.logo
      ? toImageProxyFallback(channel.logo)
      : '';

  return (
    <div className="min-h-screen bg-proz-midnight text-proz-white pb-28">
      {/* Top Banner Artwork */}
      <div className="relative w-full h-48 sm:h-64 lg:h-72 overflow-hidden bg-proz-navy">
        {resolvedLogo && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35 blur-md scale-110"
            style={{ backgroundImage: `url(${resolvedLogo})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-proz-midnight via-proz-midnight/65 to-transparent" />

        <div className="absolute top-3 left-4 z-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-button-secondary text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Channels</span>
          </button>
        </div>
      </div>

      {/* Channel Header Profile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 pb-6 border-b border-proz-border/50">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-proz-elevated border-2 border-proz-border shadow-2xl shrink-0 overflow-hidden">
              {resolvedLogo ? (
                <img
                  src={resolvedLogo}
                  alt={channel.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-full object-cover"
                  onError={() => setLogoStep((s) => s + 1)}
                />
              ) : (
                <div
                  className="w-full h-full rounded-full flex items-center justify-center shadow-inner"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${channel.color || '#FF2E54'}ee, #07070A 85%)`,
                  }}
                >
                  <span className="font-extrabold text-white keep-white text-2xl sm:text-3xl tracking-wider select-none">
                    {initials}
                  </span>
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-proz-purple/15 text-proz-purple border border-proz-purple/30 uppercase tracking-wide">
                  {channel.category}
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                    channel.integrationStatus === 'API Connected'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {channel.integrationStatus || 'API Connected'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-proz-white tracking-tight">
                {channel.name}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-proz-grey mt-1">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {channel.subscribers || '1.2M'} Subscribers
                </span>
                <span className="flex items-center gap-1">
                  <Film className="w-3.5 h-3.5" />
                  {channelContent.length || channel.contentCount} Titles
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {channel.rating || 4.8}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-center">
            {channel.officialWebsite && (
              <a
                href={channel.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-button-secondary text-xs font-semibold"
              >
                <Globe className="w-3.5 h-3.5 text-proz-purple" />
                <span>Official Web</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {channel.officialAppUrl && (
              <a
                href={channel.officialAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-button-secondary text-xs font-semibold"
              >
                <Smartphone className="w-3.5 h-3.5 text-proz-cyan" />
                <span>Official App</span>
              </a>
            )}

            <button
              onClick={toggleFavorite}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isFavorite ? 'glass-button-primary border-transparent' : 'glass-button-secondary'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
              <span>{isFavorite ? 'Subscribed' : 'Subscribe'}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl glass-button-secondary"
              title="Share Channel"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Search inside channel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-proz-border/45 mt-6">
          <div className="flex items-center gap-6 text-sm">
            {(['all', 'popular', 'about'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 font-bold capitalize relative transition-colors ${
                  activeTab === tab ? 'text-proz-white' : 'text-proz-grey hover:text-proz-white'
                }`}
              >
                {tab === 'all' ? `All Videos (${channelContent.length})` : tab === 'popular' ? 'Popular' : 'About Channel'}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-proz-purple shadow-purple-glow" />
                )}
              </button>
            ))}
          </div>

          {activeTab !== 'about' && (
            <div className="relative w-full sm:w-64 pb-2 sm:pb-1">
              <Search className="w-3.5 h-3.5 text-proz-grey absolute left-3 top-2.5" />
              <input
                type="text"
                value={channelSearch}
                onChange={(e) => setChannelSearch(e.target.value)}
                placeholder={`Filter inside ${channel.name}...`}
                className="w-full glass-input rounded-xl pl-8 pr-3 py-1.5 text-xs"
              />
            </div>
          )}
        </div>

        {/* Tab Contents */}
        <div className="mt-6">
          {activeTab === 'about' ? (
            <div className="max-w-2xl cinema-card rounded-3xl p-6">
              <h3 className="text-base font-bold text-proz-white mb-2">About {channel.name}</h3>
              <p className="text-sm text-proz-grey leading-relaxed mb-6">{channel.description}</p>
              <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-proz-border/40">
                <div>
                  <span className="text-proz-grey block">Category</span>
                  <span className="text-proz-white font-semibold">{channel.category}</span>
                </div>
                <div>
                  <span className="text-proz-grey block">Available Videos</span>
                  <span className="text-proz-white font-semibold">{channelContent.length || channel.contentCount}</span>
                </div>
                <div>
                  <span className="text-proz-grey block">Audience Rating</span>
                  <span className="text-proz-white font-semibold">{channel.rating || 4.8} / 5.0</span>
                </div>
                <div>
                  <span className="text-proz-grey block">Stream Protocols</span>
                  <span className="text-proz-purple font-semibold">4K / 1080p MP4, HLS &amp; Chunked MPEG-TS</span>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-2xl bg-proz-navy border border-proz-border/40 animate-pulse" />
              ))}
            </div>
          ) : channelContent.length === 0 ? (
            <div className="py-16 text-center cinema-card rounded-3xl p-8 space-y-4">
              <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-proz-white mb-1">
                  {loadError ? 'Provider Feed Unavailable' : 'No Videos Returned'}
                </h3>
                <p className="text-xs text-proz-grey max-w-sm mx-auto">
                  {loadError || `No playable videos are currently supplied by ${channel.name}.`}
                </p>
              </div>
              <button
                onClick={fetchChannelVideos}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-button-primary text-xs font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Channel Sync</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {channelContent.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
