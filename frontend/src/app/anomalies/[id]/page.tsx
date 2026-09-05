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
          <p className="text-red-700 text-base font-semibold mb-3">Anomaly Event {resolvedParams.id} Not Found</p>
          <Link href="/anomalies" className="text-blue-700 hover:text-blue-900 underline text-sm font-medium">
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-900 transition-colors mb-4"
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
                <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                  isSensorFault ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}>
                  {isSensorFault ? 'SENSOR FAULT' : 'WEATHER EVENT'}
                </span>
                <span className="text-xs font-mono text-slate-500">ID: {anomaly.id}</span>
                <SeverityBadge severity={anomaly.severity} size="sm" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-sans flex items-center gap-2">
                <Zap className="w-6 h-6 text-red-600 shrink-0" />
                {anomaly.typeLabel}
              </h1>

              <div className="flex items-center gap-2 mt-2 font-mono text-xs text-slate-500">
                <span>Station:</span>
                <Link
                  href={`/stations/${anomaly.stationId}`}
                  className="font-bold text-blue-900 hover:underline flex items-center gap-1"
                >
                  {anomaly.stationId} &bull; {anomaly.stationName}
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
                <span>&bull; Timestamp: {new Date(anomaly.timestamp).toLocaleString()}</span>
              </div>
            </div>

            {/* Confidence & Severity Gauge */}
            <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono">
              <div className="text-center">
                <div className="text-[11px] text-slate-500 uppercase font-sans font-semibold">ML Confidence</div>
                <div className="text-3xl font-bold text-emerald-700">{anomaly.confidence}%</div>
              </div>
              <div className="h-8 w-px bg-slate-300" />
              <div className="text-center">
                <div className="text-[11px] text-slate-500 uppercase font-sans font-semibold">Deviation</div>
                <div className="text-lg font-bold text-red-700">{anomaly.deviation}</div>
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
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200 mb-4">
                <Cpu className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800">
                  Why Was This Flagged?
                </h3>
              </div>

              <div className="space-y-3">
                {anomaly.whyFlagged.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <CheckCircle className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                    <span className="text-xs text-slate-800 font-sans leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {anomaly.mlModelDetails && (
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-mono text-slate-600 flex items-center justify-between flex-wrap gap-2">
                <span>Model: <strong className="text-blue-900">{anomaly.mlModelDetails.modelName}</strong></span>
                {anomaly.mlModelDetails.isolationForestScore && (
                  <span>IF Score: <strong className="text-slate-900">{anomaly.mlModelDetails.isolationForestScore}</strong></span>
                )}
                {anomaly.mlModelDetails.zScore && (
                  <span>Z-Score: <strong className="text-red-700">{anomaly.mlModelDetails.zScore}σ</strong></span>
                )}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right: Observed vs Expected Gauge Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard className="p-5">
            <div className="text-xs font-bold text-slate-700 uppercase mb-3">
              Telemetry Divergence
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
                <div className="text-[11px] font-mono text-red-700 uppercase font-bold">
                  Observed
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-red-800 mt-1">
                  {anomaly.observedValue}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Channel Telemetry</div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 text-center">
                <div className="text-[11px] font-mono text-emerald-700 uppercase font-bold">
                  Expected
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-800 mt-1">
                  {anomaly.expectedValue}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Spatial Baseline</div>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-sans mt-3 leading-relaxed">
              Spatial Kriging & Autoencoder model projected expected reading based on surrounding 4 observatories within 300km radius.
            </p>
          </GlassCard>

          {/* Action Recommendation */}
          <GlassCard variant="critical" className="p-5">
            <div className="flex items-center gap-2 pb-2 mb-2 border-b border-red-200">
              <Wrench className="w-4 h-4 text-red-600" />
              <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider">
                Recommended Action
              </h4>
            </div>
            <p className="text-xs text-slate-800 font-sans leading-relaxed">
              {anomaly.recommendation}
            </p>
          </GlassCard>
        </div>
      </div>

      {/* Network Spatial Consistency Table */}
      <div className="mb-6">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-blue-700" />
              <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800">
                Network Spatial Consistency Cross-Check
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              CROSS-SENSOR VALIDATION
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                  <th className="py-2.5 px-3 font-semibold">Station ID</th>
                  <th className="py-2.5 px-3 font-semibold">Station Name / Distance</th>
                  <th className="py-2.5 px-3 font-semibold">Reading</th>
                  <th className="py-2.5 px-3 font-semibold">Spatial Delta</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Target station */}
                <tr className="bg-red-50/70 text-red-900 font-bold">
                  <td className="py-3 px-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    {anomaly.stationId}
                  </td>
                  <td className="py-3 px-3">{anomaly.stationName} (Subject)</td>
                  <td className="py-3 px-3 text-red-700">{anomaly.observedValue}</td>
                  <td className="py-3 px-3">{anomaly.deviation}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded bg-red-100 border border-red-200 text-red-800 text-[11px] font-semibold">
                      ANOMALY
                    </span>
                  </td>
                </tr>

                {/* Neighboring stations */}
                {anomaly.neighbors.map((n) => (
                  <tr key={n.id} className="text-slate-700 hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold text-blue-900">{n.id}</td>
                    <td className="py-3 px-3">{n.name}</td>
                    <td className="py-3 px-3">{n.reading}</td>
                    <td className="py-3 px-3 text-slate-500">{n.delta}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
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
