'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { useDemo } from '@/context/DemoContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import {
  BarChart3,
  ShieldCheck,
  Target,
  Zap,
  Activity,
  Cpu,
  CheckCircle2,
  TrendingDown
} from 'lucide-react';

export default function AnalyticsPage() {
  const { networkSummary, stations } = useDemo();

  const anomalyTypeData = [
    { type: 'Sudden Spike', count: 18, fill: '#EF4444' },
    { type: 'Frozen Sensor', count: 12, fill: '#F59E0B' },
    { type: 'Sensor Drift', count: 9, fill: '#38BDF8' },
    { type: 'Multivariate', count: 6, fill: '#818CF8' },
    { type: 'Comm Failure', count: 3, fill: '#64748B' }
  ];

  const temporalTrendData = [
    { hour: '00:00', events: 1, baseline: 0.8 },
    { hour: '04:00', events: 0, baseline: 0.5 },
    { hour: '08:00', events: 2, baseline: 1.2 },
    { hour: '12:00', events: 5, baseline: 2.1 },
    { hour: '16:00', events: 4, baseline: 1.9 },
    { hour: '18:00', events: 3, baseline: 1.4 },
    { hour: '22:00', events: 1, baseline: 0.9 }
  ];

  const healthBuckets = [
    { range: '90-100 (Optimal)', stations: stations.filter(s => s.healthScore >= 90).length, fill: '#10B981' },
    { range: '75-89 (Degraded)', stations: stations.filter(s => s.healthScore >= 75 && s.healthScore < 90).length, fill: '#F59E0B' },
    { range: '<75 (Critical)', stations: stations.filter(s => s.healthScore < 75).length, fill: '#EF4444' }
  ];

  return (
    <AppShell>
      <PageHeader
        title="Model & Network Analytics"
        tagline="Evaluation metrics, anomaly classification distributions, and spatial network health."
        badge={
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-800">
            MODEL v2.4 EVAL
          </span>
        }
      />

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Detection Accuracy"
          value={networkSummary.detectionAccuracy}
          suffix="%"
          precision={1}
          icon={Target}
          subtext="Spatial-temporal validation"
          variant="healthy"
        />
        <MetricCard
          label="False Positive Rate"
          value={networkSummary.falsePositiveRate}
          suffix="%"
          precision={1}
          icon={ShieldCheck}
          subtext="Cross-sensor checked"
          variant="default"
        />
        <MetricCard
          label="Avg Model Confidence"
          value={91.8}
          suffix="%"
          precision={1}
          icon={Cpu}
          subtext="Ensemble isolation score"
          variant="elevated"
        />
        <MetricCard
          label="Avg Sensor Health"
          value={networkSummary.avgHealthScore}
          suffix="/100"
          precision={0}
          icon={Activity}
          subtext="12 national stations"
          variant={networkSummary.avgHealthScore >= 80 ? 'healthy' : 'warning'}
        />
      </div>

      {/* Primary Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left: Anomalies by Fault Type (6 cols) */}
        <div className="lg:col-span-6">
          <GlassCard className="p-5 flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800">
                  Anomalies by Fault Type
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">PAST 30 DAYS</span>
            </div>

            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={anomalyTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="type" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '11px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Right: Anomaly Timeline Density (6 cols) */}
        <div className="lg:col-span-6">
          <GlassCard className="p-5 flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800">
                  Anomaly Detection Frequency (24H)
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">HOURLY INCIDENCE</span>
            </div>

            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={temporalTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaEvents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F2C59" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0F2C59" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '11px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                  />
                  <Area type="monotone" dataKey="events" stroke="#0F2C59" strokeWidth={2} fill="url(#areaEvents)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Secondary Analytics: Station Health Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800">
                  Network Health Score Distribution
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">12 STATIONS</span>
            </div>

            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={healthBuckets} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis type="number" stroke="#64748B" fontSize={11} />
                  <YAxis dataKey="range" type="category" stroke="#64748B" fontSize={11} tickLine={false} width={110} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '11px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                  />
                  <Bar dataKey="stations" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-6">
          <GlassCard className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-700" />
                  <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800">
                    Model Verification Matrix
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  CROSS-VALIDATED
                </span>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 font-sans">Spatial Kriging Correlation (R²)</span>
                  <span className="text-emerald-700 font-bold">0.964</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 font-sans">Temporal Autoencoder Latency</span>
                  <span className="text-blue-900 font-bold">14.2 ms / sample</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 font-sans">Clausius-Clapeyron Constraint Violations</span>
                  <span className="text-red-700 font-bold">2 flagged (AWS_007)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 font-sans">Telemetry Ingestion Throughput</span>
                  <span className="text-slate-900 font-bold">1,200 msg / sec</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-sans mt-3">
              Algorithms continuously recalibrate against rolling 7-day climatological baselines and spatial neighbor matrices.
            </p>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
