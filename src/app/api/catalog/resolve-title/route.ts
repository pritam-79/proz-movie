import { NextRequest, NextResponse } from 'next/server';
import { getNormalizedMockContent } from '@/lib/data/mockContent';
import { cine18Adapter } from '@/lib/providers/cine18';

export const dynamic = 'force-dynamic';

/**
 * Resolves any dynamic catalog item (anilist-*, kitsu-*, tvmaze-*, tmdb-*, cine18-*, stash-*)
 * so /title/[id] and /watch/[id] never fall back to Deadpool & Wolverine when opening anime or series.
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')?.trim();
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
  }

  // 1. Check local curated catalog first
  const local = getNormalizedMockContent().find(
    (c) => c.id === id || String(c.tmdb_id) === id || c.slug === id
  );
  if (local) {
    return NextResponse.json({ success: true, item: local });
  }

  // 2. AniList GraphQL Dynamic Resolution (anilist-12345)
  if (id.startsWith('anilist-')) {
    const mediaId = parseInt(id.replace('anilist-', ''), 10);
    if (!isNaN(mediaId)) {
      try {
        const query = `
          query {
            Media(id: ${mediaId}, type: ANIME) {
              id
              title { english romaji native }
              description(asHtml: false)
              coverImage { extraLarge large }
              bannerImage
              format
              episodes
              duration
              genres
              averageScore
              seasonYear
              startDate { year }
              trailer { id site }
              characters(sort: ROLE, perPage: 6) {
                nodes {
                  name { full }
                  image { medium }
                }
              }
            }
          }
        `;
        const res = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ query }),
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          const json = await res.json();
          const m = json?.data?.Media;
          if (m) {
            const title = m.title?.english || m.title?.romaji || m.title?.native || `Anime #${mediaId}`;
            const ytId = m.trailer?.site === 'youtube' ? m.trailer.id : undefined;
            const epTotal = Math.min(m.episodes || 12, 24);
            const poster = m.coverImage?.extraLarge || m.coverImage?.large || '';
            const backdrop = m.bannerImage || poster;

            return NextResponse.json({
              success: true,
              item: {
                id,
                slug: id,
                title,
                originalTitle: m.title?.romaji || title,
                type: 'anime',
                content_type: 'anime',
                category: 'anime',
                synopsis: m.description ? String(m.description).replace(/<[^>]+>/g, '') : `Stream ${title} on PRO2 ENTERTAINMENT.`,
                description: m.description ? String(m.description).replace(/<[^>]+>/g, '') : `Stream ${title} on PRO2 ENTERTAINMENT.`,
                releaseYear: m.seasonYear || m.startDate?.year || 2024,
                runtimeMinutes: m.duration || 24,
                maturityRating: 'TV-14',
                ratingScore: m.averageScore ? Number((m.averageScore / 10).toFixed(1)) : 8.4,
                posterUrl: poster,
                poster_url: poster,
                backdropUrl: backdrop,
                backdrop_url: backdrop,
                youtubeId: ytId,
                youtube_id: ytId,
                trailerUrl: ytId ? `https://www.youtube.com/watch?v=${ytId}` : undefined,
                genres: Array.isArray(m.genres) && m.genres.length > 0 ? m.genres : ['Anime'],
                languages: ['Japanese', 'English Sub', 'English Dub'],
                cast: (m.characters?.nodes || []).map((c: any) => ({
                  name: c.name?.full || 'Character',
                  character: 'Cast',
                  avatarUrl: c.image?.medium || '',
                })),
                seasons: epTotal > 1 ? [{
                  id: `${id}-s1`,
                  seasonNumber: 1,
                  title: 'Season 1',
                  episodes: Array.from({ length: epTotal }).map((_, i) => ({
                    id: `${id}-ep-${i + 1}`,
                    episodeNumber: i + 1,
                    title: `${title} • Episode ${i + 1}`,
                    durationMinutes: m.duration || 24,
                    thumbnailUrl: backdrop || poster,
                  })),
                }] : undefined,
              },
            });
          }
        }
      } catch {
        // fall through
      }
    }
  }

  // 3. Kitsu Dynamic Resolution (kitsu-123)
  if (id.startsWith('kitsu-')) {
    const kitsuId = id.replace('kitsu-', '');
    try {
      const res = await fetch(`https://kitsu.io/api/edge/anime/${encodeURIComponent(kitsuId)}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const json = await res.json();
        const attrs = json?.data?.attributes;
        if (attrs) {
          const title = attrs.titles?.en || attrs.titles?.en_jp || attrs.canonicalTitle || 'Anime';
          const ytId = attrs.youtubeVideoId || undefined;
          const poster = attrs.posterImage?.large || attrs.posterImage?.medium || '';
          const backdrop = attrs.coverImage?.large || poster;
          return NextResponse.json({
            success: true,
            item: {
              id,
              slug: id,
              title,
              type: 'anime',
              content_type: 'anime',
              category: 'anime',
              synopsis: attrs.synopsis || '',
              releaseYear: attrs.startDate ? parseInt(String(attrs.startDate).slice(0, 4), 10) : 2024,
              runtimeMinutes: attrs.episodeLength || 24,
              maturityRating: 'TV-14',
              ratingScore: attrs.averageRating ? Number((parseFloat(attrs.averageRating) / 10).toFixed(1)) : 8.2,
              posterUrl: poster,
              poster_url: poster,
              backdropUrl: backdrop,
              backdrop_url: backdrop,
              youtubeId: ytId,
              trailerUrl: ytId ? `https://www.youtube.com/watch?v=${ytId}` : undefined,
              genres: ['Anime'],
              languages: ['Japanese', 'English'],
            },
          });
        }
      }
    } catch {}
  }

  // 4. TVmaze Dynamic Resolution (tvmaze-123)
  if (id.startsWith('tvmaze-')) {
    const showId = id.replace('tvmaze-', '');
    try {
      const [showRes, epsRes] = await Promise.all([
        fetch(`https://api.tvmaze.com/shows/${encodeURIComponent(showId)}`, { signal: AbortSignal.timeout(7000) }),
        fetch(`https://api.tvmaze.com/shows/${encodeURIComponent(showId)}/episodes`, { signal: AbortSignal.timeout(7000) }),
      ]);
      if (showRes.ok) {
        const show = await showRes.json();
        const eps = epsRes.ok ? await epsRes.json() : [];
        const poster = show.image?.original || show.image?.medium || '';
        return NextResponse.json({
          success: true,
          item: {
            id,
            slug: id,
            title: show.name || 'TV Series',
            type: 'series',
            content_type: 'series',
            category: 'international',
            synopsis: show.summary ? show.summary.replace(/<[^>]+>/g, '') : '',
            releaseYear: show.premiered ? parseInt(show.premiered.slice(0, 4), 10) : 2024,
            runtimeMinutes: show.averageRuntime || 45,
            maturityRating: 'TV-14',
            ratingScore: show.rating?.average || 8.0,
            posterUrl: poster,
            poster_url: poster,
            backdropUrl: poster,
            backdrop_url: poster,
            genres: show.genres || ['Drama'],
            languages: [show.language || 'English'],
            seasons: Array.isArray(eps) && eps.length > 0 ? [{
              id: `${id}-s1`,
              seasonNumber: 1,
              title: 'Episodes',
              episodes: eps.slice(0, 24).map((e: any) => ({
                id: `tvm-ep-${e.id}`,
                episodeNumber: e.number || 1,
                title: e.name || `Episode ${e.number || 1}`,
                synopsis: e.summary ? e.summary.replace(/<[^>]+>/g, '') : '',
                durationMinutes: e.runtime || 45,
                thumbnailUrl: e.image?.original || e.image?.medium || poster,
              })),
            }] : undefined,
          },
        });
      }
    } catch {}
  }

  // 5. TMDB Dynamic Resolution (tmdb-123) when TMDB key configured
  if (id.startsWith('tmdb-') && process.env.TMDB_API_KEY) {
    const tmdbId = id.replace('tmdb-', '');
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${encodeURIComponent(tmdbId)}?api_key=${process.env.TMDB_API_KEY}&append_to_response=videos,credits`,
        { signal: AbortSignal.timeout(7000) }
      );
      if (res.ok) {
        const m = await res.json();
        const trailer = (m.videos?.results || []).find(
          (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        );
        return NextResponse.json({
          success: true,
          item: {
            id,
            tmdb_id: m.id,
            slug: id,
            title: m.title || m.name || 'Movie',
            type: 'movie',
            content_type: 'movie',
            category: 'hollywood',
            synopsis: m.overview || '',
            releaseYear: m.release_date ? parseInt(m.release_date.slice(0, 4), 10) : 2024,
            runtimeMinutes: m.runtime || 120,
            maturityRating: m.adult ? '18+' : 'PG-13',
            ratingScore: m.vote_average ? Number(m.vote_average.toFixed(1)) : 8.0,
            posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '',
            backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : '',
            youtubeId: trailer?.key,
            trailerUrl: trailer?.key ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined,
            genres: (m.genres || []).map((g: any) => g.name),
            languages: [m.original_language || 'English'],
          },
        });
      }
    } catch {}
  }

  // 6. Cine18 video item lookup fallback
  if (id.startsWith('cine18-')) {
    const uid = id.replace('cine18-', '');
    const details = await cine18Adapter.getVideoDetails(uid);
    if (details) {
      const eps = (details.videos || []).map((v, idx) => ({
        id: v.uid,
        episodeNumber: idx + 1,
        title: v.name || `Episode ${idx + 1}`,
        streamUrl: v.video_link,
        thumbnailUrl: v.thumbnail || details.banner_img || details.portrait_img,
      }));
      return NextResponse.json({
        success: true,
        item: {
          id,
          slug: id,
          title: details.title,
          type: 'series',
          content_type: 'series',
          category: '18+ Exclusive',
          synopsis: details.description || details.preview_text || '',
          releaseYear: 2026,
          maturityRating: 'A 18+',
          ratingScore: details.rating || 8.4,
          posterUrl: details.portrait_img || details.banner_img,
          backdropUrl: details.banner_img || details.portrait_img,
          streamUrl: eps[0]?.streamUrl || '',
          seasons: eps.length > 0 ? [{ id: `s1-${uid}`, seasonNumber: 1, title: 'Season 1', episodes: eps }] : undefined,
        },
      });
    }
  }

  return NextResponse.json({ success: false, error: 'Title not found' }, { status: 404 });
}
