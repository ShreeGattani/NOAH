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
    default: 'text-slate-400 bg-slate-800/40 border-slate-700/50',
    elevated: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/50',
    critical: 'text-red-400 bg-red-950/40 border-red-800/50',
    warning: 'text-amber-400 bg-amber-950/40 border-amber-800/50',
    healthy: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50',
    accent: 'text-cyan-300 bg-cyan-950/40 border-cyan-700/50'
  };

  return (
    <GlassCard variant={variant} className="p-4 sm:p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-mono tracking-wider uppercase text-slate-400 font-medium">
          {label}
        </span>
        <div className={`p-2 rounded-lg border ${iconColors[variant]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2 my-1">
        <span className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-white">
          <AnimatedNumber value={value} precision={precision} prefix={prefix} suffix={suffix} />
        </span>
        {trend && (
          <span
            className={`text-xs font-mono font-medium px-1.5 py-0.5 rounded ${
              trend.isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtext && (
        <p className="text-xs text-slate-400/90 mt-1 font-sans flex items-center gap-1.5">
          {subtext}
        </p>
      )}
    </GlassCard>
  );
};
