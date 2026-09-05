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
        return <Thermometer className="w-4 h-4 text-blue-700" />;
      case 'humidity':
        return <Droplets className="w-4 h-4 text-blue-700" />;
      case 'pressure':
        return <Gauge className="w-4 h-4 text-blue-700" />;
    }
  };

  const getStateBadge = (sensor: SensorChannelHealth) => {
    switch (sensor.state) {
      case 'NOMINAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            NOMINAL
          </span>
        );
      case 'FAULT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 border border-red-200 text-red-700">
            <AlertOctagon className="w-3 h-3 text-red-600" />
            CRITICAL FAULT
          </span>
        );
      case 'FROZEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 border border-amber-200 text-amber-700">
            <Snowflake className="w-3 h-3 text-amber-600" />
            FROZEN SENSOR
          </span>
        );
      case 'DRIFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 border border-amber-200 text-amber-700">
            <TrendingDown className="w-3 h-3 text-amber-600" />
            SENSOR DRIFT
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 border border-amber-200 text-amber-700">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            DEGRADED
          </span>
        );
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return { bar: 'bg-emerald-600', text: 'text-emerald-700' };
    if (score >= 75) return { bar: 'bg-amber-600', text: 'text-amber-700' };
    return { bar: 'bg-red-600', text: 'text-red-700' };
  };

  return (
    <GlassCard className="p-5 bg-white border-slate-200 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-700" />
          <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800">
            Sub-Sensor Health & Diagnostic Breakdown
          </h3>
        </div>
        <span className="text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
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
              className={`p-4 rounded-lg border transition-all ${
                sensor.state === 'FAULT'
                  ? 'bg-red-50/50 border-red-200'
                  : isIssue
                  ? 'bg-amber-50/50 border-amber-200'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              {/* Header: Icon, Channel Name, State Badge */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-white border border-slate-200 shadow-2xs">
                    {getSensorIcon(sensor.type)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 uppercase block">
                      {sensor.type}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate max-w-[120px]">
                      {sensor.model}
                    </span>
                  </div>
                </div>
                {getStateBadge(sensor)}
              </div>

              {/* Health Score Progress */}
              <div className="my-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500 text-[11px]">Sensor Integrity</span>
                  <span className={`font-bold ${colors.text}`}>
                    {sensor.healthScore}
                    <span className="text-slate-400 text-[10px]">/100</span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${sensor.healthScore}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${colors.bar}`}
                  />
                </div>
              </div>

              {/* State & Diagnostic Note */}
              <div className="bg-white p-2.5 rounded border border-slate-200 text-xs shadow-2xs">
                <div className="text-[11px] font-bold text-slate-800 mb-0.5">
                  State: <span className={isIssue ? 'text-amber-700' : 'text-emerald-700'}>{sensor.stateLabel}</span>
                </div>
                {sensor.diagnosticNote && (
                  <p className="text-[11px] text-slate-600 font-sans leading-tight mt-1">
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
