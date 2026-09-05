import React from 'react';
import { StationStatus } from '@/types';

interface StatusBadgeProps {
  status: StationStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showLabel = true
}) => {
  const configs = {
    HEALTHY: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      dot: 'bg-emerald-400',
      pulse: false,
      label: 'HEALTHY'
    },
    DEGRADED: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      dot: 'bg-amber-400',
      pulse: true,
      label: 'DEGRADED'
    },
    CRITICAL: {
      bg: 'bg-red-500/15',
      border: 'border-red-500/40',
      text: 'text-red-400',
      dot: 'bg-red-500',
      pulse: true,
      label: 'CRITICAL'
    }
  };

  const config = configs[status] || configs.HEALTHY;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5 font-mono',
    md: 'text-xs px-2.5 py-1 gap-2 font-mono font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-mono font-semibold'
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-colors ${config.bg} ${config.border} ${config.text} ${sizeClasses[size]}`}
    >
      <span className="relative flex items-center justify-center">
        {config.pulse && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${config.dot} opacity-75`}
          />
        )}
        <span className={`relative inline-flex rounded-full ${dotSizes[size]} ${config.dot}`} />
      </span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};
