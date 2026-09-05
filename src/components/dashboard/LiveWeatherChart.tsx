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
import { generateStationTimeSeries } from '@/data/mockData';
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
    const series = generateStationTimeSeries(selectedStationId, timeRangeHours);
    setReadings(series);
  }, [selectedStationId, timeRangeHours]);

  const selectedStation = stations.find(s => s.id === selectedStationId) || stations[0];

  const metricConfigs = {
    temperature: {
      name: 'Temperature',
      unit: '°C',
      key: 'temperature',
      color: '#00F0FF',
      gradientId: 'tempGradient',
      icon: Thermometer,
      domain: ['dataMin - 2', 'dataMax + 4']
    },
    humidity: {
      name: 'Relative Humidity',
      unit: '%',
      key: 'humidity',
      color: '#38BDF8',
      gradientId: 'humidityGradient',
      icon: Droplets,
      domain: [0, 100]
    },
    pressure: {
      name: 'Atmospheric Pressure',
      unit: 'hPa',
      key: 'pressure',
      color: '#818CF8',
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
    <GlassCard className="p-4 sm:p-5 flex flex-col">
      {/* Top Controls: Station selector & Metric Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1B2B3D] mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#101D2D] border border-[#1B2B3D]">
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
                Telemetry Stream
              </span>
              <select
                value={selectedStationId}
                onChange={(e) => setSelectedStationId(e.target.value)}
                className="bg-[#08111D] border border-[#1B2B3D] rounded px-2 py-0.5 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-400"
              >
                {stations.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.id} — {st.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Lat: {selectedStation?.latitude.toFixed(2)}°, Lon: {selectedStation?.longitude.toFixed(2)}° | {selectedStation?.sensorModel}
            </p>
          </div>
        </div>

        {/* Metric Toggles & Time Range */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Metric Selector Tabs */}
          <div className="flex items-center bg-[#08111D] p-1 rounded-lg border border-[#1B2B3D]">
            {(['temperature', 'humidity', 'pressure'] as const).map(metric => {
              const cfg = metricConfigs[metric];
              const Icon = cfg.icon;
              const isActive = activeMetric === metric;
              return (
                <button
                  key={metric}
                  onClick={() => setActiveMetric(metric)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all ${
                    isActive
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cfg.name}</span>
                </button>
              );
            })}
          </div>

          {/* Time Range */}
          <div className="flex items-center bg-[#08111D] p-1 rounded-lg border border-[#1B2B3D] text-xs font-mono">
            {[6, 12, 24].map(hours => (
              <button
                key={hours}
                onClick={() => setTimeRangeHours(hours)}
                className={`px-2 py-0.5 rounded transition-all ${
                  timeRangeHours === hours
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
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
                <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="pressureGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818CF8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#818CF8" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1B2B3D" vertical={false} opacity={0.6} />

            <XAxis
              dataKey="timeLabel"
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#1B2B3D' }}
            />

            <YAxis
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#1B2B3D' }}
              domain={currentConfig.domain as any}
              unit={currentConfig.unit}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as StationReading & { timeLabel: string };
                  return (
                    <div className="bg-[#08111D] border border-[#2D4560] p-3 rounded-lg shadow-2xl font-mono text-xs text-slate-200">
                      <div className="flex items-center justify-between gap-3 text-slate-400 border-b border-[#1B2B3D] pb-1 mb-2">
                        <span>{data.timeLabel}</span>
                        <span>{selectedStationId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
                        <span>
                          {currentConfig.name}: {data[activeMetric]} {currentConfig.unit}
                        </span>
                      </div>
                      {data.isAnomaly && (
                        <div className="mt-2 pt-1.5 border-t border-red-500/40 text-[10px] text-red-400 flex items-center gap-1.5 font-bold">
                          <AlertCircle className="w-3.5 h-3.5" />
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
                stroke="#EF4444"
                strokeDasharray="4 4"
                label={{
                  value: 'ANOMALY THRESHOLD (+31.8°C)',
                  fill: '#EF4444',
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
                      fill="#EF4444"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      className="animate-pulse"
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
