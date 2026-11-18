import { BaseAdapter, ChannelInfo, PlaybackStream } from '../base';

export class UserCustomM3uAdapter extends BaseAdapter {
  id = 'user_m3u';
  name = 'User Custom M3U / M3U8 Playlist Engine';
  category = 'user-configured' as const;
  priority = 1;

  parseM3u(content: string): ChannelInfo[] {
    const lines = content.split('\n');
    const channels: ChannelInfo[] = [];
    let currentName = 'Channel';
    let currentLogo = '/icons/tv-placeholder.png';
    let currentCategory = 'User Playlist';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#EXTINF:')) {
        const logoMatch = line.match(/tvg-logo="([^"]+)"/);
        if (logoMatch) currentLogo = logoMatch[1];

        const groupMatch = line.match(/group-title="([^"]+)"/);
        if (groupMatch) currentCategory = groupMatch[1];

        const commaIdx = line.lastIndexOf(',');
        if (commaIdx !== -1) {
          currentName = line.slice(commaIdx + 1).trim();
        }
      } else if (line.startsWith('http://') || line.startsWith('https://')) {
        channels.push({
          id: `custom-ch-${channels.length + 1}`,
          name: currentName,
          category: currentCategory,
          logo: currentLogo,
          streamUrl: line,
          streamFormat: line.includes('.m3u8') ? 'hls' : 'mp4',
          isOnline: true
        });
        currentName = 'Channel';
        currentLogo = '/icons/tv-placeholder.png';
        currentCategory = 'User Playlist';
      }
    }

    return channels;
  }

  async resolvePlayback(channelId: string, streamUrl?: string): Promise<PlaybackStream | null> {
    if (!streamUrl) return null;
    const isValid = await this.validateStream(streamUrl);
    return {
      url: streamUrl,
      format: streamUrl.includes('.m3u8') ? 'hls' : 'mp4',
      isValid
    };
  }
}
