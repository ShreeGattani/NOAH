'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { useDemo } from '@/context/DemoContext';
import {
  ArrowLeft,
  Zap,
  CheckCircle,
  AlertTriangle,
  Network,
  Wrench,
  Cpu,
  BarChart,
  Radio,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

interface AnomalyPageProps {
  params: Promise<{ id: string }>;
}

export default function AnomalyExplanationPage({ params }: AnomalyPageProps) {
  const resolvedParams = use(params);
  const { anomalies } = useDemo();

  const anomaly = anomalies.find(
    (a) => a.id.toLowerCase() === resolvedParams.id.toLowerCase()
  );

  if (!anomaly) {
    return (
      <AppShell>
        <div className="py-20 text-center font-mono">
          <p className="text-red-400 text-lg mb-4">Anomaly Event {resolvedParams.id} Not Found</p>
          <Link href="/anomalies" className="text-cyan-400 underline text-sm">
            &larr; Return to Anomalies Feed
          </Link>
        </div>
      </AppShell>
    );
  }

  const isSensorFault = anomaly.classification === 'SENSOR_FAULT';
  const isCritical = anomaly.severity === 'CRITICAL';

  return (
    <AppShell>
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/anomalies"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Anomalies Feed</span>
        </Link>

        {/* Hero Diagnosis Banner */}
        <GlassCard
          variant={isCritical ? 'critical' : 'default'}
          className="p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                  isSensorFault ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                }`}>
                  {isSensorFault ? 'SENSOR FAULT' : 'WEATHER EVENT'}
                </span>
                <span className="text-xs font-mono text-slate-400">ID: {anomaly.id}</span>
                <SeverityBadge severity={anomaly.severity} size="sm" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans flex items-center gap-2">
                <Zap className="w-6 h-6 text-red-400 shrink-0" />
                {anomaly.typeLabel}
              </h1>

              <div className="flex items-center gap-2 mt-2 font-mono text-xs text-slate-400">
                <span>Station:</span>
                <Link
                  href={`/stations/${anomaly.stationId}`}
                  className="font-bold text-cyan-400 hover:underline flex items-center gap-1"
                >
                  {anomaly.stationId} &bull; {anomaly.stationName}
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
                <span>&bull; Timestamp: {new Date(anomaly.timestamp).toLocaleString()}</span>
              </div>
            </div>

            {/* Confidence & Severity Gauge */}
            <div className="flex items-center gap-6 bg-[#050B14]/80 p-4 rounded-xl border border-[#1B2B3D] font-mono">
              <div className="text-center">
                <div className="text-[10px] text-slate-400 uppercase">ML Confidence</div>
                <div className="text-3xl font-bold text-emerald-400">{anomaly.confidence}%</div>
              </div>
              <div className="h-8 w-px bg-[#1B2B3D]" />
              <div className="text-center">
                <div className="text-[10px] text-slate-400 uppercase">Deviation</div>
                <div className="text-lg font-bold text-red-400">{anomaly.deviation}</div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Grid: Why Was This Flagged + Observed vs Expected */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left: Why Was This Flagged Checklist (7 cols) */}
        <div className="lg:col-span-7">
          <GlassCard className="p-5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-[#1B2B3D] mb-4">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-200">
                  Why Was This Flagged?
                </h3>
              </div>

              <div className="space-y-3">
                {anomaly.whyFlagged.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg bg-[#08111D]/80 border border-[#1B2B3D]/70">
                    <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <span className="text-xs text-slate-200 font-sans leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ML Algorithm telemetry summary */}
            {anomaly.mlModelDetails && (
              <div className="mt-4 pt-3 border-t border-[#1B2B3D] text-[11px] font-mono text-slate-400 flex items-center justify-between flex-wrap gap-2">
                <span>Model: <strong className="text-cyan-300">{anomaly.mlModelDetails.modelName}</strong></span>
                {anomaly.mlModelDetails.isolationForestScore && (
                  <span>IF Score: <strong className="text-white">{anomaly.mlModelDetails.isolationForestScore}</strong></span>
                )}
                {anomaly.mlModelDetails.zScore && (
                  <span>Z-Score: <strong className="text-red-400">{anomaly.mlModelDetails.zScore}σ</strong></span>
                )}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right: Observed vs Expected Gauge Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard className="p-5">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase mb-3">
              Telemetry Divergence
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#180F16] p-4 rounded-lg border border-red-500/40 text-center">
                <div className="text-[10px] font-mono text-red-400 uppercase font-semibold">
                  Observed
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-red-300 mt-1">
                  {anomaly.observedValue}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-1">Channel Telemetry</div>
              </div>

              <div className="bg-[#0A1A17] p-4 rounded-lg border border-emerald-500/30 text-center">
                <div className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                  Expected
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-300 mt-1">
                  {anomaly.expectedValue}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-1">Spatial Baseline</div>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-sans mt-3 leading-relaxed">
              Spatial Kriging & Autoencoder model projected expected reading based on surrounding 4 observatories within 300km radius.
            </p>
          </GlassCard>

          {/* Action Recommendation */}
          <GlassCard variant="critical" className="p-5">
            <div className="flex items-center gap-2 pb-2 mb-2 border-b border-red-500/30">
              <Wrench className="w-4 h-4 text-red-400" />
              <h4 className="text-xs font-mono font-bold text-red-300 uppercase tracking-wider">
                Recommended Action
              </h4>
            </div>
            <p className="text-xs text-slate-200 font-sans leading-relaxed">
              {anomaly.recommendation}
            </p>
          </GlassCard>
        </div>
      </div>

      {/* Network Spatial Consistency Table */}
      <div className="mb-6">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1B2B3D] mb-4">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-200">
                Network Spatial Consistency Cross-Check
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              CROSS-SENSOR VALIDATION
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#1B2B3D] text-slate-400 uppercase text-[10px]">
                  <th className="py-2 px-3">Station ID</th>
                  <th className="py-2 px-3">Station Name / Distance</th>
                  <th className="py-2 px-3">Reading</th>
                  <th className="py-2 px-3">Spatial Delta</th>
                  <th className="py-2 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B2B3D]/60">
                {/* Target station */}
                <tr className="bg-red-950/20 text-red-300 font-bold">
                  <td className="py-3 px-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    {anomaly.stationId}
                  </td>
                  <td className="py-3 px-3">{anomaly.stationName} (Subject)</td>
                  <td className="py-3 px-3 text-red-400">{anomaly.observedValue}</td>
                  <td className="py-3 px-3">{anomaly.deviation}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-[10px]">
                      ANOMALY
                    </span>
                  </td>
                </tr>

                {/* Neighboring stations */}
                {anomaly.neighbors.map((n) => (
                  <tr key={n.id} className="text-slate-300 hover:bg-[#08111D]">
                    <td className="py-3 px-3 font-semibold text-cyan-400">{n.id}</td>
                    <td className="py-3 px-3">{n.name}</td>
                    <td className="py-3 px-3">{n.reading}</td>
                    <td className="py-3 px-3 text-slate-400">{n.delta}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px]">
                        NORMAL
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
