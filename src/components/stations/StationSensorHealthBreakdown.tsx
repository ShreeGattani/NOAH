'use client';

import React from 'react';
import { SensorChannelHealth } from '@/types';
import { GlassCard } from '../ui/GlassCard';
import {
  Thermometer,
  Droplets,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Snowflake,
  TrendingDown,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StationSensorHealthBreakdownProps {
  sensors: SensorChannelHealth[];
  stationId: string;
}

export const StationSensorHealthBreakdown: React.FC<StationSensorHealthBreakdownProps> = ({
  sensors,
  stationId
}) => {
  const getSensorIcon = (type: SensorChannelHealth['type']) => {
    switch (type) {
      case 'temperature':
        return <Thermometer className="w-4 h-4 text-cyan-400" />;
      case 'humidity':
        return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'pressure':
        return <Gauge className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getStateBadge = (sensor: SensorChannelHealth) => {
    switch (sensor.state) {
      case 'NOMINAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            NOMINAL
          </span>
        );
      case 'FAULT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 border border-red-500/50 text-red-300 animate-pulse">
            <AlertOctagon className="w-3 h-3 text-red-400" />
            CRITICAL FAULT
          </span>
        );
      case 'FROZEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 border border-amber-500/50 text-amber-300">
            <Snowflake className="w-3 h-3 text-amber-400" />
            FROZEN / ZERO VARIANCE
          </span>
        );
      case 'DRIFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 border border-amber-500/50 text-amber-300">
            <TrendingDown className="w-3 h-3 text-amber-400" />
            SENSOR DRIFT
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 border border-amber-500/50 text-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            DEGRADED
          </span>
        );
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return { bar: 'bg-emerald-500', text: 'text-emerald-400' };
    if (score >= 75) return { bar: 'bg-amber-500', text: 'text-amber-400' };
    return { bar: 'bg-red-500', text: 'text-red-400' };
  };

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#1B2B3D] mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-200">
            Sub-Sensor Health & State Breakdown
          </h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
          {stationId} &bull; 3 CHANNELS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sensors.map((sensor) => {
          const colors = getHealthColor(sensor.healthScore);
          const isIssue = sensor.state !== 'NOMINAL';

          return (
            <div
              key={sensor.type}
              className={`p-4 rounded-xl border transition-all ${
                sensor.state === 'FAULT'
                  ? 'bg-red-950/30 border-red-500/40'
                  : isIssue
                  ? 'bg-amber-950/25 border-amber-500/40'
                  : 'bg-[#08111D]/80 border-[#1B2B3D]'
              }`}
            >
              {/* Header: Icon, Channel Name, State Badge */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#101D2D] border border-[#1B2B3D]">
                    {getSensorIcon(sensor.type)}
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-white uppercase block">
                      {sensor.type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block truncate max-w-[120px]">
                      {sensor.model}
                    </span>
                  </div>
                </div>
                {getStateBadge(sensor)}
              </div>

              {/* Health Score Progress */}
              <div className="my-3">
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400 text-[11px]">Sensor Integrity</span>
                  <span className={`font-bold ${colors.text}`}>
                    {sensor.healthScore}
                    <span className="text-slate-500 text-[10px]">/100</span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#101D2D] rounded-full overflow-hidden border border-[#1B2B3D]/70">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${sensor.healthScore}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${colors.bar}`}
                  />
                </div>
              </div>

              {/* State & Diagnostic Note */}
              <div className="bg-[#050B14]/80 p-2.5 rounded-lg border border-[#1B2B3D]/80 font-mono text-xs">
                <div className="text-[11px] font-bold text-slate-200 mb-0.5">
                  State: <span className={isIssue ? 'text-amber-300' : 'text-emerald-400'}>{sensor.stateLabel}</span>
                </div>
                {sensor.diagnosticNote && (
                  <p className="text-[10px] text-slate-400 font-sans leading-tight mt-1">
                    {sensor.diagnosticNote}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};
