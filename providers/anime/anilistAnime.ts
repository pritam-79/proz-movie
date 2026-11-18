import { BaseAdapter, ProviderItem } from '../base';

export class AnilistAnimeAdapter extends BaseAdapter {
  id = 'anilist';
  name = 'AniList Anime GraphQL Engine';
  category = 'anime' as const;
  priority = 1;

  private endpoint = 'https://graphql.anilist.co';

  async getCatalog(page: number = 1): Promise<ProviderItem[]> {
    const query = `
      query ($page: Int) {
        Page(page: $page, perPage: 25) {
          media(type: ANIME, sort: TRENDING_DESC) {
            id
            title { romaji english native }
            description
            coverImage { large extraLarge }
            bannerImage
            averageScore
            seasonYear
            genres
            episodes
          }
        }
      }
    `;

    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { page } }),
        next: { revalidate: 3600 }
      });
      if (!res.ok) return [];
      const data = await res.json();
      const list = data?.data?.Page?.media || [];
      return list.map((m: any) => ({
        id: `anilist-${m.id}`,
        title: m.title.english || m.title.romaji,
        originalTitle: m.title.native,
        type: 'anime' as const,
        overview: m.description ? m.description.replace(/<[^>]+>/g, '') : '',
        posterUrl: m.coverImage.extraLarge || m.coverImage.large,
        backdropUrl: m.bannerImage,
        rating: m.averageScore ? m.averageScore / 10 : undefined,
        releaseYear: m.seasonYear,
        genres: m.genres || [],
        episodesCount: m.episodes || 12,
        externalIds: { anilist: m.id }
      }));
    } catch (err) {
      this.handleErrors(err);
      return [];
    }
  }

  async search(searchQuery: string): Promise<ProviderItem[]> {
    if (!searchQuery.trim()) return [];
    const query = `
      query ($search: String) {
        Page(page: 1, perPage: 20) {
          media(type: ANIME, search: $search) {
            id
            title { romaji english native }
            description
            coverImage { large extraLarge }
            bannerImage
            averageScore
            seasonYear
            genres
            episodes
          }
        }
      }
    `;

    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { search: searchQuery } })
      });
      if (!res.ok) return [];
      const data = await res.json();
      const list = data?.data?.Page?.media || [];
      return list.map((m: any) => ({
        id: `anilist-${m.id}`,
        title: m.title.english || m.title.romaji,
        originalTitle: m.title.native,
        type: 'anime' as const,
        overview: m.description ? m.description.replace(/<[^>]+>/g, '') : '',
        posterUrl: m.coverImage.extraLarge || m.coverImage.large,
        backdropUrl: m.bannerImage,
        rating: m.averageScore ? m.averageScore / 10 : undefined,
        releaseYear: m.seasonYear,
        genres: m.genres || [],
        episodesCount: m.episodes || 12,
        externalIds: { anilist: m.id }
      }));
    } catch (err) {
      this.handleErrors(err);
      return [];
    }
  }
}
