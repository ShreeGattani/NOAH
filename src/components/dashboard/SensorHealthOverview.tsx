'use client';

import React from 'react';
import Link from 'next/link';
import { Station } from '@/types';
import { GlassCard } from '../ui/GlassCard';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface SensorHealthOverviewProps {
  stations: Station[];
}

export const SensorHealthOverview: React.FC<SensorHealthOverviewProps> = ({ stations }) => {
  // Sort stations by health score ascending so degraded/critical appear first
  const sorted = [...stations].sort((a, b) => a.healthScore - b.healthScore);

  const getScoreColor = (score: number) => {
    if (score >= 90) return { bar: 'bg-emerald-600', text: 'text-emerald-700' };
    if (score >= 75) return { bar: 'bg-amber-600', text: 'text-amber-700' };
    return { bar: 'bg-red-600', text: 'text-red-700' };
  };

  return (
    <GlassCard className="p-4 sm:p-5 flex flex-col h-full bg-white border-slate-200 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-blue-700" />
          <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800">
            Station Integrity Index
          </h3>
        </div>
        <span className="text-[11px] font-medium text-slate-500">
          RANKED BY HEALTH
        </span>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[300px] pr-1">
        {sorted.map((st) => {
          const colors = getScoreColor(st.healthScore);
          return (
            <Link
              key={st.id}
              href={`/stations/${st.id}`}
              className="group flex items-center justify-between gap-3 p-2 rounded-md bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-[95px]">
                <span className="text-xs font-mono font-bold text-slate-900 group-hover:text-blue-800 transition-colors">
                  {st.id}
                </span>
                <span className="text-[11px] text-slate-600 truncate max-w-[85px]">
                  {st.name.split(' ')[0]}
                </span>
              </div>

              {/* Progress bar */}
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden mx-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${st.healthScore}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${colors.bar}`}
                />
              </div>

              <div className="flex items-center gap-2 min-w-[50px] justify-end">
                <span className={`text-xs font-bold ${colors.text}`}>
                  {st.healthScore}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>
    </GlassCard>
  );
};
