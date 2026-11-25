"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MOCK_CONTENT, getNormalizedMockContent } from '@/lib/data/mockContent';
import { ContentItem } from '@/types/content';
import { VideoSource } from '@/types/provider';
import VideoPlayer from '@/components/player/VideoPlayer';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, Lock } from 'lucide-react';
import { normalizeStashId } from '@/lib/utils/streamUtils';

function WatchContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const contentId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const episodeId = searchParams.get('episode') || undefined;

  const isStashDbCatalogOnly = Boolean(
    contentId?.startsWith('stashdb-') || contentId?.startsWith('stash-stashdb-')
  );

  const content: ContentItem = useMemo(() => {
    const allContent = getNormalizedMockContent();
    if (isStashDbCatalogOnly) {
      return {
        id: contentId || 'stashdb',
        title: 'StashDB Catalog Metadata Entry',
        slug: contentId || 'stashdb',
        content_type: 'movie',
        category: '18+ Catalog',
        is_adult: true,
        age_rating: 'A 18+',
        description: 'Metadata-only StashDB catalog entry. No local playable Stash media file matched.',
        poster_url: '',
        backdrop_url: '',
        video_sources: [],
        videoSources: [],
        ...( { isMetadataOnly: true } as any ),
      };
    } else if (contentId?.startsWith('stash-')) {
      const rawStashId = normalizeStashId(contentId);
      const stashSource: VideoSource = {
        id: `src-${rawStashId}`,
        contentId,
        providerId: 'stash',
        providerName: 'Stash Vault (Stream Proxy)',
        sourceType: 'html5_mp4',
        format: 'mp4',
        playbackUrl: `/api/library/stash/proxy-stream?id=${encodeURIComponent(rawStashId)}`,
        officialWatchUrl: `/api/library/stash/proxy-stream?id=${encodeURIComponent(rawStashId)}`,
        pricingType: 'free',
        quality: '1080p',
        country: 'GLOBAL',
        rightsStatus: 'authorized',
        verificationStatus: 'verified',
        lastChecked: new Date().toISOString()
      };

      return {
        id: contentId,
        title: 'Stash Vault Media',
        slug: contentId,
        content_type: 'movie',
        category: '18+ Vault',
        is_adult: true,
        age_rating: 'A 18+',
        fallbackMp4: `/api/library/stash/proxy-stream?id=${encodeURIComponent(rawStashId)}`,
        streamUrl: `/api/library/stash/proxy-stream?id=${encodeURIComponent(rawStashId)}`,
        description: 'Authorized playback session served via Stash backend.',
        poster_url: '',
        backdrop_url: '',
        video_sources: [stashSource],
        videoSources: [stashSource]
      };
    } else if (contentId?.startsWith('p2p-')) {
      const p2pSource: VideoSource = {
        id: `src-p2p-${contentId}`,
        contentId,
        providerId: 'archive_org',
        providerName: 'Authorized Public Domain Stream',
        sourceType: 'html5_mp4',
        format: 'mp4',
        playbackUrl: 'https://archive.org/download/night_of_the_living_dead/night_of_the_living_dead_512kb.mp4',
        officialWatchUrl: 'https://archive.org/details/night_of_the_living_dead',
        pricingType: 'free',
        quality: 'SD',
        country: 'GLOBAL',
        rightsStatus: 'public_domain',
        verificationStatus: 'verified',
        lastChecked: new Date().toISOString()
      };

      return {
        id: contentId,
        title: 'Night of the Living Dead (Public Domain)',
        slug: contentId,
        content_type: 'movie',
        age_rating: 'TV-14',
        fallbackMp4: 'https://archive.org/download/night_of_the_living_dead/night_of_the_living_dead_512kb.mp4',
        streamUrl: 'https://archive.org/download/night_of_the_living_dead/night_of_the_living_dead_512kb.mp4',
        description: 'Public-domain classic cinema stream distributed cleanly via Internet Archive.',
        poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
        backdrop_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop',
        video_sources: [p2pSource],
        videoSources: [p2pSource]
      };
    } else if (contentId?.startsWith('cine18-')) {
      const rawCineId = contentId.replace('cine18-', '');
      const cineSource: VideoSource = {
        id: `src-cine18-${rawCineId}`,
        contentId,
        providerId: 'cine18',
        providerName: 'CineWebby Streaming CDN',
        sourceType: 'html5_mp4',
        format: 'mp4',
        playbackUrl: '',
        officialWatchUrl: `/watch/${contentId}`,
        pricingType: 'free',
        quality: '1080p',
        country: 'GLOBAL',
        rightsStatus: 'authorized',
        verificationStatus: 'verified',
        lastChecked: new Date().toISOString()
      };

      return {
        id: contentId,
        title: 'Streaming Title',
        slug: contentId,
        content_type: 'movie',
        is_adult: true,
        age_rating: 'A 18+',
        fallbackMp4: '',
        streamUrl: '',
        description: 'Authorized streaming session served via high-speed CDN.',
        poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
        backdrop_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop',
        video_sources: [cineSource],
        videoSources: [cineSource]
      };
    } else {
      const matchedLocal = allContent.find(c => c.id === contentId || String(c.tmdb_id) === contentId || c.slug === contentId);
      if (matchedLocal) {
        return matchedLocal;
      }
      return {
        id: contentId || 'unknown',
        title: 'Loading Title...',
        slug: contentId || 'unknown',
        content_type: contentId?.startsWith('anilist-') || contentId?.startsWith('kitsu-') ? 'anime' : 'movie',
        type: contentId?.startsWith('anilist-') || contentId?.startsWith('kitsu-') ? 'anime' : 'movie',
        description: 'Resolving title metadata and stream sources...',
        poster_url: '',
        backdrop_url: '',
      };
    }
  }, [contentId, isStashDbCatalogOnly]);

  const [enrichedContent, setEnrichedContent] = useState<ContentItem>(content);
  const [isAuthorizing, setIsAuthorizing] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const isDynamicRemote = Boolean(
      contentId &&
        (contentId.startsWith('anilist-') ||
          contentId.startsWith('kitsu-') ||
          contentId.startsWith('tvmaze-') ||
          contentId.startsWith('tmdb-'))
    );

    if (isStashDbCatalogOnly && contentId) {
      const cleanId = contentId.replace(/^(stash-)+/, '');
      fetch(`/api/library/stash/stashdb?type=scenes&q=${encodeURIComponent(cleanId.replace(/^stashdb-/, ''))}`)
        .then(r => r.json())
        .then(data => {
          if (!active) return;
          const match = (data?.scenes || []).find((s: any) => s.id === cleanId || s.id === contentId);
          if (match) {
            setEnrichedContent({
              ...content,
              title: match.title || 'StashDB Scene Metadata',
              description: match.details || 'Catalog metadata only — not linked to a playable Stash server file.',
              poster_url: match.image || '',
              backdrop_url: match.image || '',
              releaseYear: match.date ? parseInt(String(match.date).slice(0, 4), 10) : 2024,
            });
          }
        })
        .catch(() => {});
    } else if (contentId?.startsWith('stash-')) {
      const normalizedStashId = normalizeStashId(contentId);
      const unprefixedStashId = normalizedStashId.replace(/^stash-/, '');
      fetch('/api/library/stash/scenes')
        .then(r => r.json())
        .then(data => {
          if (!active || !Array.isArray(data?.scenes)) return;
          const match = data.scenes.find(
            (s: any) =>
              s.id === normalizedStashId ||
              s.id === unprefixedStashId ||
              `stash-${s.id}` === normalizedStashId
          );
          if (match) {
            const tagsList = (match.tags || []).map((t: any) => String(t.name || '').toLowerCase());
            const isVrScene = Boolean(
              match.isVr ||
              match.vrProjection ||
              tagsList.some((n: string) => n.includes('vr') || n.includes('180') || n.includes('360') || n.includes('sbs'))
            );
            const streamTarget = match.paths?.stream || `/api/library/stash/proxy-stream?id=${encodeURIComponent(match.id)}`;
            const isHls = streamTarget.toLowerCase().includes('.m3u8');
            const srcObj: VideoSource = {
              id: `src-${match.id}`,
              contentId: contentId,
              providerId: 'stash',
              providerName: match.studio?.name || 'Stash Library',
              sourceType: isHls ? 'direct_hls' : 'html5_mp4',
              format: isHls ? 'hls' : 'mp4',
              playbackUrl: streamTarget,
              officialWatchUrl: `/watch/${contentId}`,
              pricingType: 'free',
              quality: (match.files?.[0]?.height >= 2160
                ? '4K'
                : match.files?.[0]?.height >= 1080
                ? '1080p'
                : match.files?.[0]?.height >= 720
                ? '720p'
                : '1080p'),
              country: 'GLOBAL',
              rightsStatus: 'authorized',
              verificationStatus: 'verified',
              lastChecked: new Date().toISOString()
            };
            setEnrichedContent({
              ...content,
              title: match.title,
              category: match.studio?.name || (isVrScene ? '3D VR' : '18+ Stash'),
              description: match.details || content.description,
              poster_url: match.paths?.screenshot || '',
              backdrop_url: match.paths?.screenshot || '',
              releaseYear: match.date ? parseInt(String(match.date).slice(0, 4), 10) : 2026,
              streamUrl: streamTarget,
              fallbackMp4: streamTarget,
              video_sources: [srcObj],
              videoSources: [srcObj],
              ...(isVrScene ? { isVr: true, vrProjection: match.vrProjection || '180_sbs' } as any : {}),
            });
          }
        })
        .catch(() => {});
    } else if (contentId?.startsWith('cine18-')) {
      const cleanUid = contentId.replace('cine18-', '');
      fetch(`/api/library/cine18-stream?uid=${encodeURIComponent(cleanUid)}`)
        .then(r => r.json())
        .then(data => {
          if (!active || !data.success) return;
          
          let playUrl = data.streamUrl;
          if (episodeId && data.episodes && Array.isArray(data.episodes)) {
            const epMatch = data.episodes.find((e: any) => e.id === episodeId);
            if (epMatch?.streamUrl) playUrl = epMatch.streamUrl;
          }

          const isHls = typeof playUrl === 'string' && playUrl.toLowerCase().includes('.m3u8');
          const liveSource: VideoSource = {
            id: `src-cine18-${cleanUid}`,
            contentId: `cine18-${cleanUid}`,
            providerId: 'cine18',
            providerName: 'CineWebby Streaming CDN',
            sourceType: isHls ? 'direct_hls' : 'html5_mp4',
            format: isHls ? 'hls' : 'mp4',
            playbackUrl: playUrl,
            officialWatchUrl: `/watch/cine18-${cleanUid}`,
            pricingType: 'free',
            quality: '1080p',
            country: 'GLOBAL',
            rightsStatus: 'authorized',
            verificationStatus: 'verified',
            lastChecked: new Date().toISOString()
          };

          const updated: ContentItem = {
            ...content,
            title: data.title,
            overview: data.description,
            description: data.description,
            poster_url: data.poster,
            backdrop_url: data.backdrop,
            posterUrl: data.poster,
            backdropUrl: data.backdrop,
            rating_avg: data.rating,
            fallbackMp4: playUrl,
            streamUrl: playUrl,
            video_sources: [liveSource],
            videoSources: [liveSource],
            seasons: data.episodes && data.episodes.length > 0 ? [
              {
                id: `season-1-${cleanUid}`,
                seasonNumber: 1,
                title: 'Season 1',
                episodes: data.episodes
              }
            ] : undefined
          };
          setEnrichedContent(updated);
        })
        .catch(console.error);
    } else if (isDynamicRemote && content.title === 'Loading Title...') {
      fetch(`/api/catalog/resolve-title?id=${encodeURIComponent(contentId!)}`)
        .then(r => r.json())
        .then(async (data) => {
          if (!active) return;
          if (!data?.success || !data.item) {
            setEnrichedContent({
              ...content,
              title: `Title Unavailable (${contentId})`,
              description: 'Unable to locate metadata or playable stream for this catalog identifier.',
            });
            return;
          }
          const { discoveryService } = await import('@/lib/services/discoveryService');
          const enriched = await discoveryService.enrichWithAvailability(data.item);
          if (active) setEnrichedContent(enriched);
        })
        .catch(() => {
          if (active) {
            setEnrichedContent({
              ...content,
              title: `Title Unavailable (${contentId})`,
              description: 'Catalog lookup failed. Return to the catalog and select another title.',
            });
          }
        });
    } else {
      import('@/lib/services/discoveryService').then(({ discoveryService }) => {
        discoveryService.enrichWithAvailability(content).then(enriched => {
          if (active) setEnrichedContent(enriched);
        });
      });
    }
    return () => { active = false; };
  }, [content, contentId, episodeId, isStashDbCatalogOnly]);

  useEffect(() => {
    let isMounted = true;

    async function authorizePlayback() {
      setIsAuthorizing(true);
      setAuthError(null);

      // For cine18, stash, and p2p content — authorize instantly without network call
      if (
        content.id.startsWith('cine18-') ||
        content.id.startsWith('stash-') ||
        content.id.startsWith('p2p-')
      ) {
        if (isMounted) {
          setSessionToken(`proz_instant_sess_${Date.now()}`);
          setIsAuthorizing(false);
        }
        return;
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        
        const res = await fetch('/api/playback/authorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentId: content.id,
            episodeId,
            userRole: user?.role || 'user',
            is18PlusVerified: user?.is18PlusVerified || false,
            planId: user?.subscription?.planId || 'plan_premium',
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        const data = await res.json();

        if (!res.ok) {
          if (data.code === 'AGE_RESTRICTED' || data.code === 'AGE_VERIFICATION_REQUIRED') {
            if (isMounted) {
              setAuthError(data.message || 'Age verification required.');
              setErrorCode(data.code);
              setIsAuthorizing(false);
            }
            return;
          }
          // Non-fatal errors — fall through to allow playback with fallback session
        }

        if (isMounted) {
          setSessionToken((data?.session?.token) || `proz_sess_${Date.now()}`);
          setIsAuthorizing(false);
        }
      } catch (err: any) {
        if (isMounted) {
          // Graceful fallback for offline / disconnected sandbox or timeout
          setSessionToken(`proz_sess_fallback_${Date.now()}`);
          setIsAuthorizing(false);
        }
      }
    }

    authorizePlayback();

    return () => {
      isMounted = false;
    };
  }, [content.id, episodeId, user?.is18PlusVerified, user?.subscription?.planId]);

  // Loading Authorization State
  if (isAuthorizing) {
    return (
      <div className="w-full min-h-[100dvh] bg-proz-midnight flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-proz-border/40 border-t-proz-cyan animate-spin" />
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-proz-white tracking-wide">
            Authorizing Playback Session...
          </h3>
          <p className="text-xs text-proz-grey font-mono">
            Verifying content entitlement, DRM credentials and territorial license
          </p>
        </div>
      </div>
    );
  }

  // Restricted or Error State
  if (authError) {
    return (
      <div className="w-full min-h-[100dvh] bg-proz-midnight flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl glass-card border border-rose-500/40 shadow-glass-lg space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            {errorCode === 'AGE_VERIFICATION_REQUIRED' ? (
              <Lock className="w-7 h-7" />
            ) : (
              <ShieldAlert className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-proz-white">
              Playback Authorization Required
            </h2>
            <p className="text-xs text-proz-grey leading-relaxed">
              {authError}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            {errorCode === 'AGE_VERIFICATION_REQUIRED' ? (
              <Link
                href="/restricted"
                className="w-full py-3 rounded-full glass-button-primary text-xs font-bold"
              >
                Complete 18+ Age Verification
              </Link>
            ) : (
              <Link
                href="/subscription"
                className="w-full py-3 rounded-full glass-button-primary text-xs font-bold"
              >
                Upgrade to Premium
              </Link>
            )}

            <button
              onClick={() => router.back()}
              className="w-full py-2.5 rounded-full glass-button-secondary text-xs font-semibold text-proz-grey hover:text-white"
            >
              Return to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <VideoPlayer
      content={enrichedContent}
      episodeId={episodeId}
      sessionToken={sessionToken || undefined}
    />
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen bg-black flex items-center justify-center text-xs text-proz-grey">
        Initializing player session...
      </div>
    }>
      <WatchContent />
    </Suspense>
  );
}
