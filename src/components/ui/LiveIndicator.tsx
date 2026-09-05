import React from 'react';

interface LiveIndicatorProps {
  label?: string;
  isLive?: boolean;
  size?: 'sm' | 'md';
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({
  label = 'SYSTEM LIVE',
  isLive = true,
  size = 'md'
}) => {
  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">
      <span className="relative flex h-2 w-2">
        {isLive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-cyan-400' : 'bg-slate-500'}`} />
      </span>
      <span className={`font-mono font-semibold tracking-wider ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
        {label}
      </span>
    </div>
  );
};
