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
    if (score >= 90) return { bar: 'bg-emerald-500', text: 'text-emerald-400' };
    if (score >= 75) return { bar: 'bg-amber-500', text: 'text-amber-400' };
    return { bar: 'bg-red-500', text: 'text-red-400' };
  };

  return (
    <GlassCard className="p-4 sm:p-5 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-[#1B2B3D] mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-200">
            Sensor Health Matrix
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          RANKED BY INTEGRITY
        </span>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[300px] pr-1">
        {sorted.map((st) => {
          const colors = getScoreColor(st.healthScore);
          return (
            <Link
              key={st.id}
              href={`/stations/${st.id}`}
              className="group flex items-center justify-between gap-3 p-2 rounded-lg bg-[#08111D]/80 border border-[#1B2B3D]/70 hover:border-cyan-500/40 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-[90px]">
                <span className="text-xs font-mono font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {st.id}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                  {st.name.split(' ')[0]}
                </span>
              </div>

              {/* Progress bar */}
              <div className="flex-1 h-2 bg-[#101D2D] rounded-full overflow-hidden mx-2 border border-[#1B2B3D]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${st.healthScore}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${colors.bar}`}
                />
              </div>

              <div className="flex items-center gap-2 min-w-[50px] justify-end">
                <span className={`text-xs font-mono font-bold ${colors.text}`}>
                  {st.healthScore}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>
    </GlassCard>
  );
};
