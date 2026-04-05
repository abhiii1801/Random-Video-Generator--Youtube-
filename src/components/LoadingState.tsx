import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  progress: number;
  totalEstimates?: number;
  statusText: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ progress, statusText }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center py-20 space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full"></div>
        <Loader2 className="w-16 h-16 text-red-500 animate-spin relative z-10" />
      </div>
      
      <div className="text-center space-y-2">
        <h2 className="text-xl font-medium text-zinc-100 flex items-center justify-center min-w-[200px]">
          {statusText}{dots}
        </h2>
        <p className="text-zinc-500 text-sm">
          {progress > 0 && `Fetched ${progress} items so far...`}
          {progress === 0 && 'Starting up...'}
        </p>
      </div>

      {progress > 0 && (
        <div className="w-64 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-500 transition-all duration-300 ease-out" 
            style={{ width: `${Math.min(100, (progress / 100) * 10)}%` }} // Just a fake progress visual based on count
          />
        </div>
      )}
    </div>
  );
};
