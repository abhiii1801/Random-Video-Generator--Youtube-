import { isBefore, parseISO } from 'date-fns';
import type { YouTubeVideo } from './youtube';

export interface VideoFilters {
  timeframe?: 'any' | 'month' | 'year' | '5years';
  sortMode?: 'recent' | 'popular';
}

export const applyFilters = (videos: YouTubeVideo[], filters: VideoFilters): YouTubeVideo[] => {
  return videos.filter((video) => {
    // 1. Timeframe
    if (filters.timeframe && filters.timeframe !== 'any') {
      const pubDate = parseISO(video.publishedAt);
      const now = new Date();
      let limitDate = new Date();

      if (filters.timeframe === 'month') {
        limitDate.setMonth(now.getMonth() - 1);
      } else if (filters.timeframe === 'year') {
        limitDate.setFullYear(now.getFullYear() - 1);
      } else if (filters.timeframe === '5years') {
        limitDate.setFullYear(now.getFullYear() - 5);
      }

      if (isBefore(pubDate, limitDate)) return false;
    }

    return true;
  });
};

export const pickRandomVideo = (videos: YouTubeVideo[]): YouTubeVideo | null => {
  if (!videos || videos.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * videos.length);
  return videos[randomIndex];
};
