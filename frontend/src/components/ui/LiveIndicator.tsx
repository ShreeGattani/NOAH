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
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800">
      <span className="relative flex h-2 w-2">
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-emerald-600' : 'bg-slate-400'}`} />
      </span>
      <span className={`font-medium tracking-wide uppercase ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
        {label}
      </span>
    </div>
  );
};
