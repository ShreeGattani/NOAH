import React from 'react';
import { GlassCard } from './GlassCard';
import { AnimatedNumber } from './AnimatedNumber';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  precision?: number;
  icon: LucideIcon;
  subtext?: string;
  variant?: 'default' | 'elevated' | 'critical' | 'warning' | 'healthy' | 'accent';
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  suffix = '',
  prefix = '',
  precision = 0,
  icon: Icon,
  subtext,
  variant = 'default',
  trend
}) => {
  const iconColors = {
    default: 'text-slate-600 bg-slate-100 border-slate-200',
    elevated: 'text-blue-700 bg-blue-50 border-blue-200',
    critical: 'text-red-700 bg-red-50 border-red-200',
    warning: 'text-amber-700 bg-amber-50 border-amber-200',
    healthy: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    accent: 'text-blue-700 bg-blue-50 border-blue-200'
  };

  return (
    <GlassCard variant={variant} className="p-4 sm:p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <div className={`p-2 rounded-md border ${iconColors[variant]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2 my-1">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          <AnimatedNumber value={value} precision={precision} prefix={prefix} suffix={suffix} />
        </span>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${
              trend.isPositive ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-red-700 bg-red-50 border border-red-200'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtext && (
        <p className="text-xs text-slate-500 mt-1 font-sans flex items-center gap-1.5">
          {subtext}
        </p>
      )}
    </GlassCard>
  );
};
