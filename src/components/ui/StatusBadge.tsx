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
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      dot: 'bg-emerald-600',
      label: 'HEALTHY'
    },
    DEGRADED: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      dot: 'bg-amber-600',
      label: 'DEGRADED'
    },
    CRITICAL: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      dot: 'bg-red-600',
      label: 'CRITICAL'
    }
  };

  const config = configs[status] || configs.HEALTHY;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold'
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border ${config.bg} ${config.border} ${config.text} ${sizeClasses[size]}`}
    >
      <span className={`inline-block rounded-full ${dotSizes[size]} ${config.dot}`} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};
