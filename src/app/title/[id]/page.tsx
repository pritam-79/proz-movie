"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Play, 
  Bookmark, 
  Check, 
  Star, 
  Clock, 
  Sparkles, 
  Share2, 
  Shield, 
  Languages, 
  Subtitles, 
  ChevronRight,
  Tv,
  Film
} from 'lucide-react';
import { MOCK_CONTENT, getNormalizedMockContent, normalizeContentItem } from '@/lib/data/mockContent';
import { useAuth } from '@/context/AuthContext';
import ContentRow from '@/components/content/ContentRow';

export default function TitleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useAuth();
  
  const contentId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const allContent = getNormalizedMockContent();
  const rawContent = allContent.find(c => c.id === contentId || String(c.tmdb_id) === contentId || c.slug === contentId);
  const isDynamicId = Boolean(
    contentId &&
      !rawContent &&
      (contentId.startsWith('cine18-') ||
        contentId.startsWith('anilist-') ||
        contentId.startsWith('kitsu-') ||
        contentId.startsWith('tvmaze-') ||
        contentId.startsWith('tmdb-'))
  );

  const [dynamicContent, setDynamicContent] = useState<any>(null);
  const [loadingDynamic, setLoadingDynamic] = useState(isDynamicId);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let active = true;
    if (!contentId || rawContent) {
      setLoadingDynamic(false);
      return;
    }

    if (contentId.startsWith('cine18-')) {
      const cleanUid = contentId.replace(/^cine18-/, '');
      setLoadingDynamic(true);
      fetch(`/api/library/cine18-stream?uid=${encodeURIComponent(cleanUid)}`)
        .then(res => res.json())
        .then(data => {
          if (!active) return;
          if (data && data.success) {
            setDynamicContent({
              id: `cine18-${cleanUid}`,
              title: data.title,
              synopsis: data.description || `Watch ${data.title} in high definition on PRO2 ENTERTAINMENT.`,
              tagline: data.tags ? data.tags.split(',').slice(0, 3).join(' • ') : 'Stream in Ultra HD',
              releaseYear: 2026,
              runtimeMinutes: 45,
              maturityRating: 'A 18+',
              ratingScore: data.rating || 8.0,
              posterUrl: data.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
              backdropUrl: data.backdrop || data.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop',
              type: 'series',
              category: '18+ Exclusive',
              genres: data.tags ? data.tags.split(',').map((t: string) => t.trim()) : ['Drama', 'Romance', 'Web Series'],
              seasons: [
                {
                  id: `season-1-${cleanUid}`,
                  seasonNumber: 1,
                  title: 'Season 1',
                  episodes: (data.episodes || []).map((ep: any, idx: number) => ({
                    id: ep.id || `ep-${cleanUid}-${idx + 1}`,
                    episodeNumber: ep.episodeNumber || idx + 1,
                    title: ep.title || `Episode ${idx + 1}`,
                    durationMinutes: 28,
                    thumbnailUrl: ep.thumbnailUrl || data.poster,
                    streamUrl: ep.streamUrl
                  }))
                }
              ]
            });
          }
          setLoadingDynamic(false);
        })
        .catch(() => {
          if (active) setLoadingDynamic(false);
        });
    } else if (isDynamicId) {
      setLoadingDynamic(true);
      fetch(`/api/catalog/resolve-title?id=${encodeURIComponent(contentId)}`)
        .then(res => res.json())
        .then(data => {
          if (!active) return;
          if (data?.success && data.item) {
            setDynamicContent(data.item);
          }
          setLoadingDynamic(false);
        })
        .catch(() => {
          if (active) setLoadingDynamic(false);
        });
    }
    return () => { active = false; };
  }, [contentId, rawContent, isDynamicId]);

  if (loadingDynamic && !dynamicContent) {
    return (
      <div className="min-h-screen bg-proz-midnight flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-proz-border/40 border-t-proz-cyan animate-spin" />
        <p className="text-xs text-proz-grey">Loading title details &amp; stream metadata...</p>
      </div>
    );
  }

  const activeContent = dynamicContent || (rawContent ? normalizeContentItem(rawContent) : normalizeContentItem(allContent[0])) as any;
  const content = activeContent;

  const inWatchlist = isInWatchlist(content.id);

  const toggleWatchlist = () => {
    if (inWatchlist) {
      removeFromWatchlist(content.id);
    } else {
      addToWatchlist(content.id);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Similar Titles
  const similarTitles = allContent.filter(c => 
    c.id !== content.id && 
    (c.category === content.category || (Array.isArray(c.genres) && Array.isArray(content.genres) && c.genres.some((g: any) => content.genres.includes(g))))
  ).slice(0, 8);

  const currentSeason = content.seasons?.find((s: any) => s.seasonNumber === selectedSeasonNumber) || content.seasons?.[0];

  return (
    <div className="pb-20 space-y-12">
      
      {/* Hero Backdrop Banner */}
      <div className="relative w-full h-[60vh] min-h-[480px] max-h-[700px] overflow-hidden">
        <img
          src={content.backdropUrl}
          alt={content.title}
          className="w-full h-full object-cover filter brightness-75 scale-102"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-proz-midnight via-proz-midnight/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-proz-midnight/90 via-proz-midnight/40 to-transparent" />

        {/* Content Floating Details */}
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 flex flex-col md:flex-row gap-8 items-end">
          
          {/* Main Poster */}
          <div className="hidden sm:block w-48 lg:w-56 rounded-2xl overflow-hidden glass-card border border-proz-border/60 shadow-glass-lg shrink-0 aspect-[2/3]">
            <img
              src={content.posterUrl}
              alt={content.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Metadata Block */}
          <div className="flex-1 space-y-4">
            
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              {content.isOriginal && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-proz-purple to-proz-cyan text-white shadow-purple-glow text-[10px] uppercase">
                  <Sparkles className="w-3 h-3" />
                  PROZ Original
                </span>
              )}
              <span className="px-2 py-0.5 rounded-md glass-card border border-proz-border/50 text-proz-white">
                {content.maturityRating}
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-bold px-2 py-0.5 rounded-md glass-card border border-proz-border/50">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {content.ratingScore}
              </span>
              <span className="text-proz-grey">{content.releaseYear}</span>
              <span className="text-proz-grey">•</span>
              <span className="text-proz-grey">
                {content.runtimeMinutes ? `${content.runtimeMinutes} min` : `${content.seasons?.length || 1} Seasons`}
              </span>
              <span className="text-proz-grey">•</span>
              <span className="text-proz-cyan capitalize">{(content.category || 'movie').replace('_', ' ')}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-proz-white tracking-tight">
              {content.title}
            </h1>

            {content.tagline && (
              <p className="text-sm font-medium text-proz-cyan/90 italic">
                &quot;{content.tagline}&quot;
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {(() => {
                const isTrailerOnly =
                  content.playableType === 'trailer' ||
                  (!content.streamUrl &&
                    !content.fallbackMp4 &&
                    (!content.videoSources?.length ||
                      content.videoSources.every((s: any) => s.sourceType === 'youtube_trailer')));
                return (
                  <>
                    <Link
                      href={`/watch/${content.id}`}
                      className="flex items-center gap-2 px-7 py-3.5 rounded-full glass-button-primary text-sm font-bold shadow-cyan-glow"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>{isTrailerOnly ? 'Watch Official Trailer' : 'Start Watching'}</span>
                    </Link>
                    {isTrailerOnly && (
                      <span className="px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-[11px] font-semibold text-amber-300">
                        Trailer Only — Full Episode Unavailable
                      </span>
                    )}
                  </>
                );
              })()}

              <button
                onClick={toggleWatchlist}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-full glass-button-secondary text-sm font-semibold transition-all ${
                  inWatchlist ? 'text-proz-cyan border-proz-cyan/60 bg-proz-cyan/15' : ''
                }`}
              >
                {inWatchlist ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-3.5 rounded-full glass-button-secondary hover:text-proz-cyan transition-colors"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {copiedLink && (
                <span className="text-xs text-proz-cyan animate-in fade-in">
                  Link copied to clipboard!
                </span>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Main Body Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column (Synopsis, Episodes, Cast) */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Synopsis */}
          <div className="space-y-3">
            <h3 className="text-base font-bold uppercase tracking-wider text-proz-grey">
              Storyline
            </h3>
            <p className="text-sm sm:text-base text-proz-white/90 leading-relaxed">
              {content.synopsis}
            </p>
            
            <div className="flex flex-wrap gap-2 pt-2">
              {content.genres?.map((g: any) => (
                <Link
                  key={typeof g === 'string' ? g : g.name}
                  href={`/movies?genre=${(typeof g === 'string' ? g : g.slug || g.name).toLowerCase()}`}
                  className="px-3 py-1 rounded-full text-xs glass-pill text-proz-grey hover:text-proz-cyan hover:border-proz-cyan/40 transition-all"
                >
                  {typeof g === 'string' ? g : g.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Episodes Section (If Series) */}
          {content.type === 'series' && content.seasons && (
            <div className="space-y-5">
              
              <div className="flex items-center justify-between border-b border-proz-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-proz-cyan" />
                  <h3 className="text-base font-bold text-proz-white">
                    Episodes
                  </h3>
                </div>

                {/* Season Tabs */}
                {content.seasons.length > 1 && (
                  <div className="flex items-center gap-2">
                    {content.seasons.map((s: any) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSeasonNumber(s.seasonNumber)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          selectedSeasonNumber === s.seasonNumber
                            ? 'bg-proz-cyan text-proz-midnight font-bold'
                            : 'glass-pill text-proz-grey hover:text-white'
                        }`}
                      >
                        Season {s.seasonNumber}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Episodes List */}
              <div className="space-y-3">
                {currentSeason?.episodes?.map((ep: any) => (
                  <div
                    key={ep.id}
                    onClick={() => router.push(`/watch/${content.id}?episode=${ep.id}`)}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 rounded-2xl glass-card hover:border-proz-cyan/50 hover:bg-proz-navy/70 transition-all cursor-pointer group"
                  >
                    <div className="relative w-full sm:w-44 aspect-video rounded-xl overflow-hidden shrink-0">
                      <img
                        src={ep.thumbnailUrl}
                        alt={ep.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-proz-midnight/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="p-2.5 rounded-full glass-button-primary">
                          <Play className="w-3.5 h-3.5 fill-white" />
                        </div>
                      </div>
                      <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-proz-midnight/80 text-proz-grey">
                        {ep.durationMinutes}m
                      </span>
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-proz-white group-hover:text-proz-cyan transition-colors">
                          {ep.title}
                        </h4>
                      </div>
                      <p className="text-xs text-proz-grey line-clamp-2">
                        {ep.synopsis}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* Cast Members */}
          <div className="space-y-4">
            <h3 className="text-base font-bold uppercase tracking-wider text-proz-grey">
              Top Cast
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {content.cast?.map((c: any) => (
                <div key={c.name} className="flex items-center gap-3 p-2.5 rounded-2xl glass-card border border-proz-border/40">
                  <img
                    src={c.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100"}
                    alt={c.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-proz-purple/50"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-proz-white truncate">{c.name}</p>
                    <p className="text-[10px] text-proz-grey truncate">{c.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Sidebar Info */}
        <div className="space-y-6">
          
          <div className="p-6 rounded-3xl glass-card border border-proz-border/50 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-proz-white pb-2 border-b border-proz-border/40">
              Media Specifications
            </h3>

            {/* Audio Tracks */}
            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-proz-cyan">
                <Languages className="w-3.5 h-3.5" />
                Audio Languages
              </span>
              <div className="flex flex-wrap gap-1.5">
                {content.languages?.map((l: any) => (
                  <span key={l} className="px-2 py-0.5 rounded text-[11px] glass-pill text-proz-white">
                    {l}
                  </span>
                ))}
              </div>
            </div>

            {/* Subtitles */}
            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-proz-purple">
                <Subtitles className="w-3.5 h-3.5" />
                Subtitles
              </span>
              <div className="flex flex-wrap gap-1.5">
                {content.subtitles?.map((sub: any) => (
                  <span key={sub.id || sub.label} className="px-2 py-0.5 rounded text-[11px] glass-pill text-proz-white">
                    {sub.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Quality & Streams */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-proz-grey">Stream Quality</span>
              <p className="text-xs text-proz-white font-medium">
                4K Ultra HD • HDR10 • Dolby Atmos 5.1
              </p>
            </div>

            {/* License & Rights */}
            <div className="space-y-1.5 pt-2 border-t border-proz-border/40 text-[11px] text-proz-grey">
              <div className="flex items-center gap-1 text-emerald-400">
                <Shield className="w-3.5 h-3.5" />
                <span>Authorized Digital Distribution Rights</span>
              </div>
              <p>Licensor: {content.license?.licensor || 'PROZ Global Studios & Distribution Ltd.'}</p>
              <p>Territories: {Array.isArray(content.license?.territories) ? content.license.territories.join(', ') : 'Global Multi-Territory (Worldwide)'}</p>
              <p>License Valid: Through {content.license?.expiryDate || '2030-12-31'}</p>
            </div>

          </div>

        </div>

      </div>

      {/* Similar Titles Carousel */}
      <ContentRow
        title="More Like This"
        subtitle="Recommended titles based on genre and creator connections"
        items={similarTitles}
        aspectRatio="poster"
      />

    </div>
  );
}
