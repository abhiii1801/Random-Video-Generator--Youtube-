import { useState } from 'react';
import { Sparkles, PlaySquare, AlertCircle } from 'lucide-react';
import { InputSection } from './components/InputSection';
import { FilterPanel } from './components/FilterPanel';
import { LoadingState } from './components/LoadingState';
import { VideoResult } from './components/VideoResult';
import { YouTubeService, extractYoutubeContext, type YouTubeVideo } from './lib/youtube';
import { applyFilters, pickRandomVideo, type VideoFilters } from './lib/videoFilters';

function App() {
  const [url, setUrl] = useState('');
  const [filters, setFilters] = useState<VideoFilters>({
    sortMode: 'recent',
    timeframe: 'any'
  });
  
  const [viewMode, setViewMode] = useState<'input' | 'loading' | 'result'>('input');
  const [loadingStatus, setLoadingStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [allVideos, setAllVideos] = useState<YouTubeVideo[]>([]);
  const [filteredPool, setFilteredPool] = useState<YouTubeVideo[]>([]);
  const [currentVideo, setCurrentVideo] = useState<YouTubeVideo | null>(null);
  const [lastFetchedUrl, setLastFetchedUrl] = useState('');

  const fetchAndPick = async () => {
    try {
      setError(null);
      
      let videosToUse = allVideos;

      // If URL changed, fetch fresh data
      if (url !== lastFetchedUrl || allVideos.length === 0) {
        setViewMode('loading');
        setLoadingStatus('Analyzing URL...');
        setProgress(0);

        const context = extractYoutubeContext(url);
        if (!context.type || !context.id) {
          throw new Error('Could not understand the URL. Please provide a valid Channel URL, @handle, or Playlist URL.');
        }

        const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY || '';
        if (!apiKey) {
          throw new Error('Missing VITE_YOUTUBE_API_KEY. Please provide it in a .env file.');
        }

        const yt = new YouTubeService(apiKey);
        let videoIds: string[] = [];

        const getTimeframeISO = (tf: string) => {
          if (tf === 'any') return undefined;
          const now = new Date();
          if (tf === 'month') now.setMonth(now.getMonth() - 1);
          if (tf === 'year') now.setFullYear(now.getFullYear() - 1);
          if (tf === '5years') now.setFullYear(now.getFullYear() - 5);
          return now.toISOString();
        };

        const timeframeOrder: ('month' | 'year' | '5years' | 'any')[] = ['month', 'year', '5years', 'any'];
        let startIndex = timeframeOrder.indexOf(filters.timeframe as any);
        if (startIndex === -1) startIndex = 3; // any

        // Fallback loop for fetching video IDs
        for (let i = startIndex; i < timeframeOrder.length; i++) {
          const currentTF = timeframeOrder[i];
          const publishedAfter = getTimeframeISO(currentTF);
          
          if (filters.sortMode === 'popular') {
            setLoadingStatus(i === startIndex ? 'Searching most popular...' : `Widening search to ${currentTF}...`);
            const channelId = await yt.getChannelId(context);
            videoIds = await yt.fetchPopularVideos(channelId, publishedAfter);
          } else {
            setLoadingStatus(i === startIndex ? 'Fetching recent uploads...' : `Widening search to ${currentTF}...`);
            let playlistId = context.id;
            if (context.type === 'channel' || context.type === 'handle') {
              playlistId = await yt.getUploadsPlaylistId(context);
            }
            // For recent uploads, we can't easily filter by date in the API, so we just take the first page (50 items)
            videoIds = await yt.fetchAllPlaylistItems(playlistId, (count) => { setProgress(count); }, 1);
          }

          if (videoIds.length > 0) {
            break;
          }
        }

        if (videoIds.length === 0) {
          throw new Error('No videos found in this channel/playlist.');
        }

        const cappedIds = videoIds.slice(0, 50);
        setProgress(0);
        setLoadingStatus(`Analyzing ${cappedIds.length} videos...`);
        
        videosToUse = await yt.fetchVideoDetails(cappedIds, (count) => {
          setProgress(count);
        });

        setAllVideos(videosToUse);
        setLastFetchedUrl(url);
      }

      // Apply Filters with Relaxation
      let pool = applyFilters(videosToUse, filters);
      
      if (pool.length === 0) {
        // Final fallback: any video from the pool
        pool = videosToUse;
      }

      setFilteredPool(pool);
      
      // Pick random
      const picked = pickRandomVideo(pool);
      if (picked) {
        setCurrentVideo(picked);
        setViewMode('result');
      }

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setViewMode('input');
    }
  };

  const pickAnother = () => {
    if (!currentVideo) return;
    
    // Remove current video from pool to avoid immediate re-pick
    const newPool = filteredPool.filter(v => v.id !== currentVideo.id);
    
    if (newPool.length === 0) {
        setError("You've seen all videos that match these filters!");
        setViewMode('input');
        return;
    }
    
    setFilteredPool(newPool);
    const picked = pickRandomVideo(newPool);
    if (picked) {
      setCurrentVideo(picked);
    }
  };

  const reset = () => {
    setViewMode('input');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans selection:bg-red-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-900/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 md:px-10 md:pt-10 md:pb-4 flex items-center justify-between">
        <button 
          onClick={reset}
          className="flex items-center gap-3 group hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="bg-red-600 p-2.5 rounded-2xl shadow-lg shadow-red-600/20 group-hover:scale-105 transition-transform">
            <PlaySquare size={26} className="text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white uppercase italic">
            YT Roulette
          </span>
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 md:px-8 pb-32 pt-2 flex flex-col items-center min-h-[calc(100vh-120px)]">
        
        {viewMode === 'input' && (
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center mt-4 md:mt-8 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mb-4">
                <Sparkles size={16} />
                <span>Discover Forgotten Gems</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
                Random Video <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                  Generator
                </span>
              </h1>
              <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                Paste a channel or playlist URL, apply your filters, and let fate decide what you watch next.
              </p>
            </div>

            {error && (
              <div className="w-full p-4 bg-red-950/50 border border-red-900 rounded-xl flex items-start gap-3 text-left">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <div className="w-full">
              <InputSection 
                url={url} 
                setUrl={setUrl} 
                onPick={fetchAndPick}
                loading={false}
              />
              <div className="mt-4">
                <FilterPanel filters={filters} setFilters={setFilters} />
              </div>
            </div>
            
          </div>
        )}

        {viewMode === 'loading' && (
          <div className="mt-10 w-full">
            <LoadingState progress={progress} statusText={loadingStatus} />
          </div>
        )}

        {viewMode === 'result' && currentVideo && (
          <div className="w-full mt-2">
            <VideoResult 
              video={currentVideo} 
              onPickAnother={pickAnother} 
              onReset={reset}
              remainingPool={filteredPool.length}
            />
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
