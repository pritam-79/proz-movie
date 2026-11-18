import { BaseAdapter, PlaybackStream, ProviderItem } from '../base';

export class YoutubeVideoAdapter extends BaseAdapter {
  id = 'youtube';
  name = 'YouTube Official Video & Embed Engine';
  category = 'video' as const;
  priority = 2;

  async resolvePlayback(youtubeId: string): Promise<PlaybackStream | null> {
    if (!youtubeId) return null;
    return {
      url: `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&controls=1&modestbranding=1&rel=0`,
      format: 'iframe',
      quality: '1080p',
      isValid: true
    };
  }

  async search(query: string): Promise<ProviderItem[]> {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey || !query.trim()) return [];
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+full+movie&type=video&maxResults=15&key=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.items || []).map((item: any) => ({
        id: `yt-${item.id.videoId}`,
        title: item.snippet.title,
        type: 'movie' as const,
        overview: item.snippet.description,
        posterUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
        rating: 8.0,
        releaseYear: new Date(item.snippet.publishedAt).getFullYear(),
        externalIds: { youtube: item.id.videoId }
      }));
    } catch (err) {
      this.handleErrors(err);
      return [];
    }
  }
}
