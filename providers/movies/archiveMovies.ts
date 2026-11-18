import { BaseAdapter, ProviderItem, PlaybackStream } from '../base';

export class ArchiveMoviesAdapter extends BaseAdapter {
  id = 'archive_org';
  name = 'Internet Archive Public Cinema';
  category = 'movies' as const;
  priority = 3;

  private baseUrl = 'https://archive.org';

  async getCatalog(page: number = 1): Promise<ProviderItem[]> {
    try {
      const url = `${this.baseUrl}/advancedsearch.php?q=mediatype:movies+AND+collection:(feature_films+OR+scifi_horror)&fl[]=identifier,title,description,year,downloads&sort[]=downloads+desc&rows=25&page=${page}&output=json`;
      const res = await fetch(url, { next: { revalidate: 86400 } });
      if (!res.ok) return [];
      const data = await res.json();
      const docs = data?.response?.docs || [];
      return docs.map((d: any) => ({
        id: `archive-${d.identifier}`,
        title: d.title,
        type: 'movie' as const,
        overview: d.description,
        posterUrl: `https://archive.org/services/img/${d.identifier}`,
        backdropUrl: `https://archive.org/services/img/${d.identifier}`,
        rating: 8.2,
        releaseYear: d.year ? parseInt(d.year, 10) : 1968,
        externalIds: { archive: d.identifier }
      }));
    } catch (err) {
      this.handleErrors(err);
      return [];
    }
  }

  async resolvePlayback(contentId: string): Promise<PlaybackStream | null> {
    const identifier = contentId.replace('archive-', '');
    if (!identifier) return null;
    try {
      const metaRes = await fetch(`${this.baseUrl}/metadata/${identifier}`);
      if (!metaRes.ok) return null;
      const data = await metaRes.json();
      const files = data?.files || [];
      const mp4File = files.find((f: any) => f.name?.endsWith('.mp4') && (f.format?.includes('h.264') || f.format?.includes('MP4')));

      if (mp4File && data.server && data.dir) {
        const streamUrl = `https://${data.server}${data.dir}/${mp4File.name}`;
        return {
          url: streamUrl,
          format: 'mp4',
          quality: '1080p',
          isValid: true
        };
      }
      return null;
    } catch (err) {
      this.handleErrors(err);
      return null;
    }
  }
}
