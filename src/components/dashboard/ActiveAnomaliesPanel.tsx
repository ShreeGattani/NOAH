'use client';

import React from 'react';
import Link from 'next/link';
import { Anomaly } from '@/types';
import { GlassCard } from '../ui/GlassCard';
import { SeverityBadge } from '../ui/SeverityBadge';
import { AlertOctagon, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActiveAnomaliesPanelProps {
  anomalies: Anomaly[];
}

export const ActiveAnomaliesPanel: React.FC<ActiveAnomaliesPanelProps> = ({ anomalies }) => {
  const activeAnomalies = anomalies.filter(a => a.status === 'ACTIVE');

  return (
    <GlassCard className="p-4 sm:p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1B2B3D] mb-4">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-red-400" />
          <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-200">
            Active Anomalies
          </h3>
        </div>
        <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
          activeAnomalies.length > 0
            ? 'bg-red-500/15 text-red-400 border border-red-500/40'
            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
        }`}>
          {activeAnomalies.length} ACTIVE
        </span>
      </div>

      {/* List */}
      <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px] pr-1">
        <AnimatePresence mode="popLayout">
          {activeAnomalies.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 flex flex-col items-center justify-center text-center text-slate-400"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-slate-300">All Weather Stations Nominal</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Spatial consistency checks & temporal ML algorithms detect no active anomalies.
              </p>
            </motion.div>
          ) : (
            activeAnomalies.map((anomaly) => {
              const isCritical = anomaly.severity === 'CRITICAL';
              return (
                <motion.div
                  key={anomaly.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`p-3.5 rounded-lg border transition-all ${
                    isCritical
                      ? 'bg-red-950/25 border-red-500/40 hover:border-red-500/70'
                      : 'bg-[#101D2D]/70 border-[#1B2B3D] hover:border-slate-600'
                  }`}
                >
                  {/* Top: Station & Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-amber-400'}`} />
                      <span className="text-xs font-mono font-bold text-white">
                        {anomaly.stationId}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                        {anomaly.stationName}
                      </span>
                    </div>
                    <SeverityBadge severity={anomaly.severity} size="sm" />
                  </div>

                  {/* Type and Metric */}
                  <div className="mb-2">
                    <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      {anomaly.typeLabel}
                    </div>
                    <div className="text-[11px] font-mono text-cyan-300 mt-0.5">
                      Observed: <span className="font-bold text-red-300">{anomaly.observedValue}</span> (Expected: {anomaly.expectedValue})
                    </div>
                  </div>

                  {/* Confidence & Spatial status */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-[#08111D]/80 px-2.5 py-1.5 rounded border border-[#1B2B3D]/70 mb-3">
                    <div>
                      Confidence: <span className="text-emerald-400 font-bold">{anomaly.confidence}%</span>
                    </div>
                    <div className="text-slate-300">
                      {anomaly.classification === 'SENSOR_FAULT' ? 'Isolated Deviation' : 'Regional Shift'}
                    </div>
                  </div>

                  {/* Action Link */}
                  <Link
                    href={`/anomalies/${anomaly.id}`}
                    className="w-full inline-flex items-center justify-between text-xs font-mono text-cyan-400 hover:text-cyan-300 font-medium group pt-1 border-t border-[#1B2B3D]/50"
                  >
                    <span>View Investigation</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Footer link to all anomalies */}
      {activeAnomalies.length > 0 && (
        <div className="pt-3 border-t border-[#1B2B3D] mt-3 text-center">
          <Link
            href="/anomalies"
            className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
          >
            <span>View all anomalies archive</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </GlassCard>
  );
};
