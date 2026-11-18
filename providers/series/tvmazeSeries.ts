import { BaseAdapter, ProviderItem, SeasonInfo, EpisodeInfo } from '../base';

export class TvmazeAdapter extends BaseAdapter {
  id = 'tvmaze';
  name = 'TVmaze Public TV Directory';
  category = 'series' as const;
  priority = 2;

  private baseUrl = 'https://api.tvmaze.com';

  async getCatalog(page: number = 0): Promise<ProviderItem[]> {
    try {
      const res = await fetch(`${this.baseUrl}/shows?page=${page}`, { next: { revalidate: 7200 } });
      if (!res.ok) return [];
      const data = await res.json();
      return (data || []).slice(0, 30).map((s: any) => ({
        id: `tvmaze-${s.id}`,
        title: s.name,
        type: 'series' as const,
        overview: s.summary ? s.summary.replace(/<[^>]+>/g, '') : '',
        posterUrl: s.image?.medium || s.image?.original,
        backdropUrl: s.image?.original,
        rating: s.rating?.average,
        releaseYear: s.premiered ? new Date(s.premiered).getFullYear() : undefined,
        genres: s.genres || [],
        externalIds: { tvmaze: s.id, imdb: s.externals?.imdb, thetvdb: s.externals?.thetvdb }
      }));
    } catch (err) {
      this.handleErrors(err);
      return [];
    }
  }

  async search(query: string): Promise<ProviderItem[]> {
    if (!query.trim()) return [];
    try {
      const res = await fetch(`${this.baseUrl}/search/shows?q=${encodeURIComponent(query)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data || []).map((item: any) => {
        const s = item.show;
        return {
          id: `tvmaze-${s.id}`,
          title: s.name,
          type: 'series' as const,
          overview: s.summary ? s.summary.replace(/<[^>]+>/g, '') : '',
          posterUrl: s.image?.medium || s.image?.original,
          backdropUrl: s.image?.original,
          rating: s.rating?.average,
          releaseYear: s.premiered ? new Date(s.premiered).getFullYear() : undefined,
          genres: s.genres || [],
          externalIds: { tvmaze: s.id }
        };
      });
    } catch (err) {
      this.handleErrors(err);
      return [];
    }
  }

  async getSeasons(seriesId: string): Promise<SeasonInfo[]> {
    const numericId = seriesId.replace('tvmaze-', '');
    try {
      const res = await fetch(`${this.baseUrl}/shows/${numericId}/seasons`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data || []).map((s: any) => ({
        seasonNumber: s.number,
        title: s.name || `Season ${s.number}`,
        overview: s.summary ? s.summary.replace(/<[^>]+>/g, '') : undefined,
        episodesCount: s.episodeOrder || 0
      }));
    } catch (err) {
      this.handleErrors(err);
      return [];
    }
  }

  async getEpisodes(seriesId: string, seasonNumber: number): Promise<EpisodeInfo[]> {
    const numericId = seriesId.replace('tvmaze-', '');
    try {
      const res = await fetch(`${this.baseUrl}/shows/${numericId}/episodes`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data || [])
        .filter((ep: any) => ep.season === seasonNumber)
        .map((ep: any) => ({
          episodeNumber: ep.number,
          seasonNumber: ep.season,
          title: ep.name,
          overview: ep.summary ? ep.summary.replace(/<[^>]+>/g, '') : undefined,
          thumbnailUrl: ep.image?.medium || ep.image?.original,
          durationMinutes: ep.runtime,
          airDate: ep.airdate
        }));
    } catch (err) {
      this.handleErrors(err);
      return [];
    }
  }
}
