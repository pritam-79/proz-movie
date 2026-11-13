/**
 * PROZ MOVIE — TMDB Metadata Integration Client
 * 
 * Commercial Notice & Attribution:
 * "This product uses the TMDB API but is not endorsed or certified by TMDB."
 * Metadata and images provided by TMDB do not grant streaming rights or video distribution licenses.
 */

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export class TmdbClient {
  private apiKey: string | null;

  constructor() {
    this.apiKey = process.env.TMDB_API_KEY || null;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey !== 'your_tmdb_api_key_here');
  }

  async fetchMovieDetails(tmdbId: number) {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const res = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${this.apiKey}&append_to_response=credits,videos`, {
        next: { revalidate: 3600 }
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('TMDB fetch error:', e);
      return null;
    }
  }

  getImageUrl(path: string | null, size: 'w500' | 'w780' | 'original' = 'original'): string {
    if (!path) return '';
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  }
}

export const tmdbClient = new TmdbClient();
