import { BaseAdapter, ChannelInfo, PlaybackStream } from '../base';

export class IptvOrgAdapter extends BaseAdapter {
  id = 'iptv_org';
  name = 'IPTV-Org Live TV Directory';
  category = 'livetv' as const;
  priority = 1;

  private baseUrl = 'https://iptv-org.github.io/api';

  async getChannels(category?: string, country: string = 'IN'): Promise<ChannelInfo[]> {
    try {
      const res = await fetch(`${this.baseUrl}/channels.json`, { next: { revalidate: 86400 } });
      if (!res.ok) return [];
      const channels = await res.json();

      let filtered = (channels || []).filter((c: any) => !c.is_nsfw);
      if (country) {
        filtered = filtered.filter((c: any) => c.country?.toUpperCase() === country.toUpperCase());
      }
      if (category) {
        filtered = filtered.filter((c: any) => (c.categories || []).some((cat: string) => cat.toLowerCase().includes(category.toLowerCase())));
      }

      return filtered.slice(0, 100).map((c: any) => ({
        id: `iptv-${c.id}`,
        name: c.name,
        category: c.categories?.[0] || 'General',
        logo: c.logo || '/icons/tv-placeholder.png',
        country: c.country,
        language: c.languages?.[0] || 'English',
        isOnline: true
      }));
    } catch (err) {
      this.handleErrors(err);
      return [];
    }
  }

  async resolvePlayback(channelId: string): Promise<PlaybackStream | null> {
    const rawId = channelId.replace('iptv-', '');
    try {
      const res = await fetch(`${this.baseUrl}/streams.json`, { next: { revalidate: 3600 } });
      if (!res.ok) return null;
      const streams = await res.json();
      const match = (streams || []).find((s: any) => s.channel === rawId);
      if (match?.url) {
        return {
          url: match.url,
          format: match.url.includes('.m3u8') ? 'hls' : 'mp4',
          quality: '720p',
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
