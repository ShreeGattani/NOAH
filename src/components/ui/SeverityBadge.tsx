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
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700'
    },
    MEDIUM: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700'
    },
    HIGH: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700'
    },
    CRITICAL: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700'
    }
  };

  const config = configs[severity] || configs.LOW;
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5';

  return (
    <span
      className={`inline-flex items-center font-medium uppercase rounded border ${config.bg} ${config.border} ${config.text} ${sizeClasses}`}
    >
      {severity}
    </span>
  );
};
