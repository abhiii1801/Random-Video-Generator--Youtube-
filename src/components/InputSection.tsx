import React from 'react';
import { Search } from 'lucide-react';

interface InputSectionProps {
  url: string;
  setUrl: (url: string) => void;
  onPick: () => void;
  loading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({
  url, setUrl, onPick, loading
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">      <div className="flex gap-2">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-red-500 transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all text-lg"
            placeholder="Channel URL, @handle, or Playlist URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && onPick()}
          />
        </div>
      </div>

      <button
        onClick={onPick}
        disabled={loading || !url}
        className="w-full py-4 px-6 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl font-bold text-lg transition-all active:scale-[0.98] disabled:active:scale-100"
      >
        {loading ? 'Processing...' : 'Pick Random Video'}
      </button>
    </div>
  );
};
