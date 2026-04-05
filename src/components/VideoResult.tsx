import React from 'react';
import type { YouTubeVideo } from '../lib/youtube';
import { ExternalLink, RefreshCw, Eye, Calendar, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface VideoResultProps {
  video: YouTubeVideo;
  onPickAnother: () => void;
  onReset: () => void;
  remainingPool: number;
}

export const VideoResult: React.FC<VideoResultProps> = ({ 
  video, onPickAnother, onReset, remainingPool 
}) => {

  const formattedViews = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(video.viewCount);

  const formattedDate = format(parseISO(video.publishedAt), 'MMM d, yyyy');
  
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-[90rem] mx-auto animate-in fade-in zoom-in-95 duration-500 space-y-8 px-4 md:px-0">
      
      {/* Video Player Container */}
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-[0_0_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 group">
        <iframe
          src={`https://www.youtube.com/embed/${video.id}`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>

      {/* Metadata & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Info */}
        <div className="lg:col-span-2 space-y-4">
          <h1 className="text-2xl font-bold text-zinc-100 leading-tight">
            {video.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
            <span className="text-zinc-200 font-medium">{video.channelTitle}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
            
            <div className="flex items-center gap-1.5">
              <Eye size={16} />
              <span>{formattedViews} views</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
            
            <div className="flex items-center gap-1.5">
              <Calendar size={16} />
              <span>{formattedDate}</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>

            <div className="flex items-center gap-1.5">
              <Clock size={16} />
              <span>{formatDuration(video.durationSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onPickAnother}
            className="flex items-center justify-center gap-2 w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all active:scale-[0.98]"
          >
            <RefreshCw size={20} />
            Pick Another
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 rounded-xl text-sm font-medium transition-all"
            >
              <ExternalLink size={16} />
              Open in YT
            </a>
            <button
              onClick={onReset}
              className="flex items-center justify-center py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-xl text-sm font-medium transition-all"
            >
              Start Over
            </button>
          </div>

          <div className="text-center text-xs text-zinc-500 mt-2">
            {remainingPool} videos remaining in filtered pool
          </div>
        </div>

      </div>
    </div>
  );
};
