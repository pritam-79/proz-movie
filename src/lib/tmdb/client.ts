/**
 * PROZ MOVIE — Comprehensive TMDB Metadata Integration Client
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

  private async request(endpoint: string, params: Record<string, string> = {}) {
    if (!this.isConfigured()) return null;

    try {
      const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
      url.searchParams.set('api_key', this.apiKey as string);
      Object.entries(params).forEach(([key, val]) => {
        if (val) url.searchParams.set(key, val);
      });

      const res = await fetch(url.toString(), {
        next: { revalidate: 3600 }
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('TMDB API request failure:', e);
      return null;
    }
  }

  // Movies
  async fetchMovieDetails(tmdbId: number) {
    return this.request(`/movie/${tmdbId}`, { append_to_response: 'credits,videos,similar' });
  }

  async searchMovies(query: string, page = 1) {
    return this.request('/search/movie', { query, page: String(page) });
  }

  async getPopularMovies(page = 1) {
    return this.request('/movie/popular', { page: String(page) });
  }

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'day') {
    return this.request(`/trending/movie/${timeWindow}`);
  }

  async getTopRatedMovies(page = 1) {
    return this.request('/movie/top_rated', { page: String(page) });
  }

  // TV & Web Series
  async fetchTVDetails(tmdbId: number) {
    return this.request(`/tv/${tmdbId}`, { append_to_response: 'credits,videos,similar' });
  }

  async searchTV(query: string, page = 1) {
    return this.request('/search/tv', { query, page: String(page) });
  }

  async getPopularTV(page = 1) {
    return this.request('/tv/popular', { page: String(page) });
  }

  async getTrendingTV(timeWindow: 'day' | 'week' = 'day') {
    return this.request(`/trending/tv/${timeWindow}`);
  }

  async fetchSeasonDetails(tvId: number, seasonNumber: number) {
    return this.request(`/tv/${tvId}/season/${seasonNumber}`);
  }

  // Discovery
  async discoverMovies(params: Record<string, string> = {}) {
    return this.request('/discover/movie', params);
  }

  async discoverTV(params: Record<string, string> = {}) {
    return this.request('/discover/tv', params);
  }

  // Images
  getImageUrl(path: string | null, size: 'w300' | 'w500' | 'w780' | 'original' = 'original'): string {
    if (!path) return '';
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  }
}

export const tmdbClient = new TmdbClient();
