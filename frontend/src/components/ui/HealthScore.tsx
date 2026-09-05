import React from 'react';
import { motion } from 'framer-motion';

interface HealthScoreProps {
  score: number; // 0 to 100
  showBar?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const HealthScore: React.FC<HealthScoreProps> = ({
  score,
  showBar = true,
  size = 'md'
}) => {
  const getHealthColor = (val: number) => {
    if (val >= 90) return { text: 'text-emerald-700', bar: 'bg-emerald-600' };
    if (val >= 75) return { text: 'text-amber-700', bar: 'bg-amber-600' };
    return { text: 'text-red-700', bar: 'bg-red-600' };
  };

  const colors = getHealthColor(score);

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Health</span>
        <span className={`font-bold ${colors.text} ${size === 'lg' ? 'text-lg' : size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {score}
          <span className="text-slate-400 text-xs font-normal">/100</span>
        </span>
      </div>
      {showBar && (
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${colors.bar}`}
          />
        </div>
      )}
    </div>
  );
};
