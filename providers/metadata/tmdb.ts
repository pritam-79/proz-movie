import { BaseAdapter, ProviderItem } from '../base';

export class TmdbMetadataAdapter extends BaseAdapter {
  id = 'tmdb';
  name = 'The Movie Database (TMDB)';
  category = 'metadata' as const;
  priority = 1;

  private apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
  private baseUrl = 'https://api.themoviedb.org/3';

  async initialize(): Promise<boolean> {
    return true;
  }

  async authenticate(): Promise<boolean> {
    return !!this.apiKey;
  }

  async getCatalog(page: number = 1, filter?: Record<string, any>): Promise<ProviderItem[]> {
    if (!this.apiKey) return [];
    try {
      const type = filter?.type === 'series' ? 'tv' : 'movie';
      const res = await fetch(`${this.baseUrl}/trending/${type}/week?api_key=${this.apiKey}&page=${page}`, {
        next: { revalidate: 3600 }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.results || []).map((r: any) => ({
        id: `tmdb-${r.id}`,
        title: r.title || r.name,
        originalTitle: r.original_title || r.original_name,
        type: type === 'tv' ? 'series' : 'movie',
        overview: r.overview,
        posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : undefined,
        backdropUrl: r.backdrop_path ? `https://image.tmdb.org/t/p/original${r.backdrop_path}` : undefined,
        rating: r.vote_average,
        releaseYear: (r.release_date || r.first_air_date) ? new Date(r.release_date || r.first_air_date).getFullYear() : undefined,
        externalIds: { tmdb: r.id }
      }));
    } catch (err) {
      this.handleErrors(err);
      return [];
    }
  }

  async search(query: string): Promise<ProviderItem[]> {
    if (!this.apiKey || !query.trim()) return [];
    try {
      const res = await fetch(`${this.baseUrl}/search/multi?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.results || [])
        .filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv')
        .map((r: any) => ({
          id: `tmdb-${r.id}`,
          title: r.title || r.name,
          type: r.media_type === 'tv' ? 'series' : 'movie',
          overview: r.overview,
          posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : undefined,
          backdropUrl: r.backdrop_path ? `https://image.tmdb.org/t/p/original${r.backdrop_path}` : undefined,
          rating: r.vote_average,
          releaseYear: (r.release_date || r.first_air_date) ? new Date(r.release_date || r.first_air_date).getFullYear() : undefined,
          externalIds: { tmdb: r.id }
        }));
    } catch (err) {
      this.handleErrors(err);
      return [];
    }
  }

  async getDetails(id: string): Promise<ProviderItem | null> {
    const numericId = id.replace('tmdb-', '');
    if (!this.apiKey || !numericId) return null;
    try {
      const res = await fetch(`${this.baseUrl}/movie/${numericId}?api_key=${this.apiKey}&append_to_response=videos,credits`);
      if (!res.ok) return null;
      const r = await res.json();
      return {
        id: `tmdb-${r.id}`,
        title: r.title,
        type: 'movie',
        overview: r.overview,
        posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : undefined,
        backdropUrl: r.backdrop_path ? `https://image.tmdb.org/t/p/original${r.backdrop_path}` : undefined,
        rating: r.vote_average,
        releaseYear: r.release_date ? new Date(r.release_date).getFullYear() : undefined,
        genres: (r.genres || []).map((g: any) => g.name),
        externalIds: { tmdb: r.id, imdb: r.imdb_id }
      };
    } catch (err) {
      this.handleErrors(err);
      return null;
    }
  }
}
