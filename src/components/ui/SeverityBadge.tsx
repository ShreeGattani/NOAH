import React from 'react';
import { Severity } from '@/types';

interface SeverityBadgeProps {
  severity: Severity;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = 'md'
}) => {
  const configs = {
    LOW: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400'
    },
    MEDIUM: {
      bg: 'bg-amber-500/15',
      border: 'border-amber-500/40',
      text: 'text-amber-400'
    },
    HIGH: {
      bg: 'bg-orange-500/15',
      border: 'border-orange-500/40',
      text: 'text-orange-400'
    },
    CRITICAL: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      text: 'text-red-400'
    }
  };

  const config = configs[severity] || configs.LOW;
  const sizeClasses = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2.5 py-0.5';

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold uppercase tracking-wider rounded border ${config.bg} ${config.border} ${config.text} ${sizeClasses}`}
    >
      {severity}
    </span>
  );
};
