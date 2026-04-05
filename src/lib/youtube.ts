import axios from 'axios';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  viewCount: number;
  durationSeconds: number;
  thumbnailUrl: string;
}

export const extractYoutubeContext = (urlStr: string): { type: 'channel' | 'playlist' | 'handle' | null, id: string | null } => {
  try {
    let rawUrl = urlStr.trim();
    
    // Direct inputs without URLs
    if (rawUrl.startsWith('@')) {
      return { type: 'handle', id: rawUrl };
    }
    if (rawUrl.startsWith('UC') && rawUrl.length === 24) {
      return { type: 'channel', id: rawUrl };
    }
    if (rawUrl.startsWith('PL') && rawUrl.length >= 16) {
      return { type: 'playlist', id: rawUrl };
    }

    if (!rawUrl.startsWith('http')) {
       rawUrl = 'https://www.youtube.com/' + rawUrl;
    }
    const url = new URL(rawUrl);
    const path = url.pathname;
    
    // Playlist: youtube.com/playlist?list=ID or youtube.com/watch?list=ID
    if (url.searchParams.has('list')) {
      return { type: 'playlist', id: url.searchParams.get('list') };
    }
    
    // Channel ID: youtube.com/channel/ID
    if (path.startsWith('/channel/')) {
        const id = path.split('/channel/')[1].split('/')[0];
        return { type: 'channel', id };
    }
    
    // Handle: youtube.com/@handle
    if (path.startsWith('/@')) {
         const id = path.split('/@')[1].split('/')[0];
         return { type: 'handle', id: `@${id}` };
    }

    // Custom URL: youtube.com/c/name - Deprecated but sometimes still used
    if (path.startsWith('/c/')) {
      return { type: 'handle', id: urlStr }; // Actually youtube data api doesn't directly support /c/. We will just fail gracefully.
    }

    return { type: null, id: null };
  } catch (e) {
    return { type: null, id: null };
  }
};

export const parseDuration = (duration: string): number => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] ? match[1].replace('H', '') : '0', 10);
    const minutes = parseInt(match[2] ? match[2].replace('M', '') : '0', 10);
    const seconds = parseInt(match[3] ? match[3].replace('S', '') : '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
};

export class YouTubeService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getUploadsPlaylistId(context: { type: 'channel' | 'playlist' | 'handle' | null, id: string | null }): Promise<string> {
    if (!context.id) throw new Error("Invalid YouTube URL");
    if (context.type === 'playlist') return context.id;

    let url = `${YOUTUBE_API_BASE}/channels?part=contentDetails&key=${this.apiKey}`;
    if (context.type === 'handle') {
      url += `&forHandle=${encodeURIComponent(context.id)}`;
    } else if (context.type === 'channel') {
      url += `&id=${encodeURIComponent(context.id)}`;
    } else {
      throw new Error("Unsupported URL type");
    }

    const res = await axios.get(url);
    if (!res.data.items || res.data.items.length === 0) {
      throw new Error("Channel not found");
    }
    return res.data.items[0].contentDetails.relatedPlaylists.uploads;
  }

  async getChannelId(context: { type: 'channel' | 'playlist' | 'handle' | null, id: string | null }): Promise<string> {
    if (!context.id) throw new Error("Invalid YouTube URL");
    if (context.type === 'channel') return context.id;
    if (context.type === 'handle') {
      const url = `${YOUTUBE_API_BASE}/channels?part=id&forHandle=${encodeURIComponent(context.id)}&key=${this.apiKey}`;
      const res = await axios.get(url);
      if (!res.data.items || res.data.items.length === 0) throw new Error("Channel not found");
      return res.data.items[0].id;
    }
    // For playlist, we don't necessarily have a channel ID to search popular videos for easily
    throw new Error("Most Popular search is only supported for Channels and Handles.");
  }

  async fetchPopularVideos(channelId: string, publishedAfter?: string): Promise<string[]> {
    let url = `${YOUTUBE_API_BASE}/search?part=id&channelId=${channelId}&maxResults=50&order=viewCount&type=video&key=${this.apiKey}`;
    if (publishedAfter) {
      url += `&publishedAfter=${encodeURIComponent(publishedAfter)}`;
    }
    const res = await axios.get(url);
    const items = res.data.items || [];
    return items.map((item: any) => item.id.videoId);
  }

  async fetchAllPlaylistItems(playlistId: string, onProgress?: (fetched: number) => void, maxPages?: number): Promise<string[]> {
    let videoIds: string[] = [];
    let pageToken = '';
    let pagesFetched = 0;

    while (true) {
      const url = `${YOUTUBE_API_BASE}/playlistItems?part=contentDetails&maxResults=50&playlistId=${playlistId}&key=${this.apiKey}${pageToken ? `&pageToken=${pageToken}` : ''}`;
      const res = await axios.get(url);
      
      const items = res.data.items || [];
      videoIds = [...videoIds, ...items.map((item: any) => item.contentDetails.videoId)];
      
      if (onProgress) {
        onProgress(videoIds.length);
      }

      pagesFetched++;
      if (maxPages && pagesFetched >= maxPages) break;

      pageToken = res.data.nextPageToken;
      if (!pageToken) break;
    }

    return videoIds;
  }

  async fetchVideoDetails(videoIds: string[], onProgress?: (fetched: number) => void): Promise<YouTubeVideo[]> {
    const chunkSize = 50;
    let videos: YouTubeVideo[] = [];

    for (let i = 0; i < videoIds.length; i += chunkSize) {
      const chunk = videoIds.slice(i, i + chunkSize);
      const url = `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails,statistics&id=${chunk.join(',')}&key=${this.apiKey}`;
      const res = await axios.get(url);

      const items = res.data.items || [];
      const parsedVideos = items.map((item: any): YouTubeVideo => ({
        id: item.id,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        viewCount: parseInt(item.statistics.viewCount || '0', 10),
        durationSeconds: parseDuration(item.contentDetails.duration),
        thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url
      }));

      videos = [...videos, ...parsedVideos];
      if (onProgress) {
        onProgress(videos.length);
      }
    }

    return videos;
  }
}
