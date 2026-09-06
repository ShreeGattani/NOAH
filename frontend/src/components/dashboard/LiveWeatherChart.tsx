'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { GlassCard } from '../ui/GlassCard';

import { Station, StationReading } from '@/types';
import { Thermometer, Droplets, Gauge, Activity, AlertCircle } from 'lucide-react';

interface LiveWeatherChartProps {
  stations: Station[];
  initialStationId?: string;
}

export const LiveWeatherChart: React.FC<LiveWeatherChartProps> = ({
  stations,
  initialStationId = 'AWS_007'
}) => {
  const [selectedStationId, setSelectedStationId] = useState<string>(initialStationId);
  const [activeMetric, setActiveMetric] = useState<'temperature' | 'humidity' | 'pressure'>('temperature');
  const [timeRangeHours, setTimeRangeHours] = useState<number>(24);
  const [readings, setReadings] = useState<StationReading[]>([]);

  useEffect(() => {
    // Returning an empty array to render an empty chart frame until live telemetry buffers it
    setReadings([]);
  }, [selectedStationId, timeRangeHours]);

  const selectedStation = stations.find(s => s.id === selectedStationId) || stations[0];

  const metricConfigs = {
    temperature: {
      name: 'Temperature',
      unit: '°C',
      key: 'temperature',
      color: '#0284C7',
      gradientId: 'tempGradient',
      icon: Thermometer,
      domain: ['dataMin - 2', 'dataMax + 4']
    },
    humidity: {
      name: 'Relative Humidity',
      unit: '%',
      key: 'humidity',
      color: '#0D9488',
      gradientId: 'humidityGradient',
      icon: Droplets,
      domain: [0, 100]
    },
    pressure: {
      name: 'Atmospheric Pressure',
      unit: 'hPa',
      key: 'pressure',
      color: '#4F46E5',
      gradientId: 'pressureGradient',
      icon: Gauge,
      domain: ['dataMin - 5', 'dataMax + 5']
    }
  };

  const currentConfig = metricConfigs[activeMetric];

  const formattedData = readings.map(r => {
    const date = new Date(r.timestamp);
    return {
      ...r,
      timeLabel: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    };
  });

  return (
    <GlassCard className="p-4 sm:p-5 flex flex-col bg-white border-slate-200 shadow-xs">
      {/* Top Controls: Station selector & Metric Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-blue-50 border border-blue-200 text-blue-700">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Telemetry Stream
              </span>
              <select
                value={selectedStationId}
                onChange={(e) => setSelectedStationId(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-semibold text-blue-900 focus:outline-none focus:border-blue-500 shadow-2xs"
              >
                {stations.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.id} — {st.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
              Lat: {selectedStation?.latitude.toFixed(2)}°, Lon: {selectedStation?.longitude.toFixed(2)}° | Sensor: {selectedStation?.sensorModel}
            </p>
          </div>
        </div>

        {/* Metric Toggles & Time Range */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Metric Selector Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-200">
            {(['temperature', 'humidity', 'pressure'] as const).map(metric => {
              const cfg = metricConfigs[metric];
              const Icon = cfg.icon;
              const isActive = activeMetric === metric;
              return (
                <button
                  key={metric}
                  onClick={() => setActiveMetric(metric)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-blue-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cfg.name}</span>
                </button>
              );
            })}
          </div>

          {/* Time Range */}
          <div className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-200 text-xs font-medium">
            {[6, 12, 24].map(hours => (
              <button
                key={hours}
                onClick={() => setTimeRangeHours(hours)}
                className={`px-2.5 py-0.5 rounded transition-all cursor-pointer ${
                  timeRangeHours === hours
                    ? 'bg-blue-700 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {hours}H
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[280px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284C7" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="pressureGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />

            <XAxis
              dataKey="timeLabel"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
            />

            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
              domain={currentConfig.domain as any}
              unit={currentConfig.unit}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as StationReading & { timeLabel: string };
                  return (
                    <div className="bg-white border border-slate-200 p-3 rounded-md shadow-md text-xs text-slate-800">
                      <div className="flex items-center justify-between gap-3 text-slate-500 border-b border-slate-100 pb-1 mb-1.5 font-medium">
                        <span>{data.timeLabel}</span>
                        <span>{selectedStationId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-blue-900">
                        <span>
                          {currentConfig.name}: {data[activeMetric]} {currentConfig.unit}
                        </span>
                      </div>
                      {data.isAnomaly && (
                        <div className="mt-1.5 pt-1.5 border-t border-red-200 text-[11px] text-red-700 flex items-center gap-1.5 font-bold">
                          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>ANOMALY FLAGGED: {data.anomalyType} ({data.anomalyScore}% Conf)</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Injected reference anomaly indicator */}
            {selectedStationId === 'AWS_007' && activeMetric === 'temperature' && (
              <ReferenceLine
                y={55.2}
                stroke="#DC2626"
                strokeDasharray="4 4"
                label={{
                  value: 'ANOMALY THRESHOLD (+31.8°C)',
                  fill: '#DC2626',
                  fontSize: 10,
                  position: 'top'
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey={currentConfig.key}
              stroke={currentConfig.color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${currentConfig.gradientId})`}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (payload.isAnomaly) {
                  return (
                    <circle
                      key={`dot-${cx}-${cy}`}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="#DC2626"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  );
                }
                return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={2} fill={currentConfig.color} />;
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};
