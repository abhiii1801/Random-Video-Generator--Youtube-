import React from 'react';
import type { VideoFilters } from '../lib/videoFilters';
import { Calendar, Zap } from 'lucide-react';

interface FilterPanelProps {
  filters: VideoFilters;
  setFilters: (filters: VideoFilters) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, setFilters }) => {
  const handleChange = (key: keyof VideoFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const timeframes = [
    { id: 'any', label: 'Any Time' },
    { id: 'month', label: 'Last Month' },
    { id: 'year', label: 'Last Year' },
    { id: '5years', label: 'Last 5 Years' }
  ];

  const strategies = [
    { id: 'recent', label: 'Most Recent' },
    { id: 'popular', label: 'Most Popular' }
  ];

  return (
    <div className="w-full text-left bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-6 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-500">
      
      {/* Search Strategy & Timeframe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Strategy Pills */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
            <Zap size={16} className="text-yellow-500/80" />
            <span>Search Strategy (Top 50)</span>
          </div>
          <div className="flex bg-zinc-950/80 p-1 rounded-xl border border-zinc-800/80 w-full">
            {strategies.map(s => (
              <button
                key={s.id}
                onClick={() => handleChange('sortMode', s.id)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  (filters.sortMode || 'recent') === s.id 
                    ? 'bg-zinc-800 text-white shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeframe Pills */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
            <Calendar size={16} className="text-red-500/80" />
            <span>Post Date</span>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full">
            {timeframes.map(t => (
              <button
                key={t.id}
                onClick={() => handleChange('timeframe', t.id)}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  (filters.timeframe || 'any') === t.id 
                    ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                    : 'bg-zinc-950/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


