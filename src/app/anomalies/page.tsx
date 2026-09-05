'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { useDemo } from '@/context/DemoContext';
import { AnomalyType, Severity } from '@/types';
import {
  AlertTriangle,
  Search,
  ArrowRight,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers
} from 'lucide-react';

export default function AnomaliesPage() {
  const { anomalies } = useDemo();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<AnomalyType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredAnomalies = useMemo(() => {
    let list = [...anomalies];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.stationName.toLowerCase().includes(q) ||
          a.stationId.toLowerCase().includes(q) ||
          a.typeLabel.toLowerCase().includes(q) ||
          a.classificationReason.toLowerCase().includes(q)
      );
    }

    if (severityFilter !== 'ALL') {
      list = list.filter((a) => a.severity === severityFilter);
    }

    if (typeFilter !== 'ALL') {
      list = list.filter((a) => a.type === typeFilter);
    }

    if (statusFilter !== 'ALL') {
      list = list.filter((a) => a.status === statusFilter);
    }

    return list;
  }, [anomalies, search, severityFilter, typeFilter, statusFilter]);

  return (
    <AppShell>
      <PageHeader
        title="Anomaly Intelligence Feed"
        tagline="Real-time multi-sensor anomaly detection feed across temporal, spatial, and thermodynamic checks."
        badge={
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-red-950/60 border border-red-500/40 text-red-300">
            {filteredAnomalies.length} Flagged Events
          </span>
        }
      />

      {/* Filter and Search Controls */}
      <div className="space-y-3 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search station, anomaly type, reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#08111D] border border-[#1B2B3D] text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 bg-[#08111D] p-1 rounded-lg border border-[#1B2B3D] text-xs font-mono">
            {['ALL', 'ACTIVE', 'RESOLVED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded transition-all ${
                  statusFilter === st
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-Filters: Severity & Fault Types */}
        <div className="flex items-center gap-3 flex-wrap text-xs font-mono">
          {/* Severity */}
          <div className="flex items-center gap-1.5 bg-[#08111D] px-2.5 py-1.5 rounded-lg border border-[#1B2B3D]">
            <span className="text-slate-500">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#08111D]">All Severities</option>
              <option value="CRITICAL" className="bg-[#08111D]">Critical</option>
              <option value="HIGH" className="bg-[#08111D]">High</option>
              <option value="MEDIUM" className="bg-[#08111D]">Medium</option>
              <option value="LOW" className="bg-[#08111D]">Low</option>
            </select>
          </div>

          {/* Type */}
          <div className="flex items-center gap-1.5 bg-[#08111D] px-2.5 py-1.5 rounded-lg border border-[#1B2B3D]">
            <span className="text-slate-500">Fault Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#08111D]">All Fault Types</option>
              <option value="SUDDEN_SPIKE" className="bg-[#08111D]">Sudden Spike</option>
              <option value="FROZEN_SENSOR" className="bg-[#08111D]">Frozen Sensor</option>
              <option value="SENSOR_DRIFT" className="bg-[#08111D]">Sensor Drift</option>
              <option value="MULTIVARIATE_INCONSISTENCY" className="bg-[#08111D]">Multivariate Inconsistency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        {filteredAnomalies.length === 0 ? (
          <GlassCard className="py-16 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-white">No anomalies matching current criteria</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting filters or adjusting search keywords.</p>
          </GlassCard>
        ) : (
          filteredAnomalies.map((anomaly) => {
            const isCritical = anomaly.severity === 'CRITICAL';
            const isWeather = anomaly.classification === 'WEATHER_EVENT';

            return (
              <GlassCard
                key={anomaly.id}
                variant={isCritical ? 'critical' : 'default'}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5"
                interactive
              >
                <div className="space-y-2 flex-1">
                  {/* Top Bar: Anomaly ID, Station ID, Severity Badge */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-mono font-bold text-red-400 bg-red-950/40 border border-red-500/40 px-2 py-0.5 rounded">
                      {anomaly.id}
                    </span>
                    <Link
                      href={`/stations/${anomaly.stationId}`}
                      className="text-xs font-mono font-bold text-cyan-400 hover:underline"
                    >
                      {anomaly.stationId} &bull; {anomaly.stationName}
                    </Link>
                    <SeverityBadge severity={anomaly.severity} size="sm" />
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      isWeather
                        ? 'bg-blue-950/60 text-blue-300 border border-blue-500/30'
                        : 'bg-red-950/60 text-red-300 border border-red-500/30'
                    }`}>
                      {isWeather ? 'WEATHER EVENT' : 'SENSOR FAULT'}
                    </span>
                  </div>

                  {/* Anomaly Title */}
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-red-400" />
                    {anomaly.typeLabel}
                  </h3>

                  {/* Reason */}
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {anomaly.classificationReason}
                  </p>

                  {/* Diagnostic Badges */}
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400 pt-1 flex-wrap">
                    <span className="bg-[#050B14] px-2 py-1 rounded border border-[#1B2B3D]">
                      Observed: <strong className="text-red-400">{anomaly.observedValue}</strong>
                    </span>
                    <span className="bg-[#050B14] px-2 py-1 rounded border border-[#1B2B3D]">
                      Expected: <strong className="text-emerald-400">{anomaly.expectedValue}</strong>
                    </span>
                    <span className="bg-[#050B14] px-2 py-1 rounded border border-[#1B2B3D]">
                      ML Confidence: <strong className="text-cyan-400">{anomaly.confidence}%</strong>
                    </span>
                  </div>
                </div>

                {/* Right Action Link */}
                <div className="flex items-center justify-end shrink-0">
                  <Link
                    href={`/anomalies/${anomaly.id}`}
                    className="px-4 py-2.5 rounded-lg bg-[#101D2D] hover:bg-cyan-950/60 border border-[#1B2B3D] hover:border-cyan-500/50 text-cyan-300 text-xs font-mono font-medium flex items-center gap-2 transition-all group"
                  >
                    <span>Inspect Root Cause</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
