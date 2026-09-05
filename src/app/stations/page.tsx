'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { HealthScore } from '@/components/ui/HealthScore';
import { useDemo } from '@/context/DemoContext';
import { StationStatus } from '@/types';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowRight,
  Thermometer,
  Droplets,
  Gauge,
  AlertTriangle,
  Radio
} from 'lucide-react';

export default function StationsPage() {
  const { stations } = useDemo();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StationStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'health' | 'anomalies' | 'temp' | 'id'>('health');

  const filteredStations = useMemo(() => {
    let list = [...stations];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.region.toLowerCase().includes(q) ||
          s.state.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      list = list.filter((s) => s.status === statusFilter);
    }

    list.sort((a, b) => {
      if (sortBy === 'health') return a.healthScore - b.healthScore; // Lowest first so critical is visible
      if (sortBy === 'anomalies') return b.activeAnomalies.length - a.activeAnomalies.length;
      if (sortBy === 'temp') return b.currentReadings.temperature - a.currentReadings.temperature;
      return a.id.localeCompare(b.id);
    });

    return list;
  }, [stations, search, statusFilter, sortBy]);

  return (
    <AppShell>
      <PageHeader
        title="Weather Station Directory"
        tagline="Comprehensive inventory & real-time telemetry from 12 Automatic Weather Stations."
        badge={
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
            {filteredStations.length} of {stations.length} STATIONS
          </span>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search station ID, name, region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#08111D] border border-[#1B2B3D] text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* Filter Badges & Sort Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-between md:justify-end">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#08111D] p-1 rounded-lg border border-[#1B2B3D] text-xs font-mono">
            {(['ALL', 'HEALTHY', 'DEGRADED', 'CRITICAL'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded transition-all ${
                  statusFilter === st
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#08111D] px-2.5 py-1.5 rounded-lg border border-[#1B2B3D] text-xs font-mono text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="health" className="bg-[#08111D]">Health Score (Low to High)</option>
              <option value="anomalies" className="bg-[#08111D]">Active Anomalies</option>
              <option value="temp" className="bg-[#08111D]">Temperature</option>
              <option value="id" className="bg-[#08111D]">Station ID</option>
            </select>
          </div>
        </div>
      </div>

      {/* Station Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStations.map((station) => {
          const isCritical = station.status === 'CRITICAL';
          const isDegraded = station.status === 'DEGRADED';

          return (
            <GlassCard
              key={station.id}
              variant={isCritical ? 'critical' : isDegraded ? 'warning' : 'default'}
              className="p-5 flex flex-col justify-between"
              interactive
            >
              <div>
                {/* Card Top: ID, Region & Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-cyan-400">{station.id}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#101D2D] text-slate-400 border border-[#1B2B3D]">
                        {station.elevation}m
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-0.5">{station.name}</h3>
                    <p className="text-xs text-slate-400 font-sans">{station.region}, {station.state}</p>
                  </div>
                  <StatusBadge status={station.status} size="sm" />
                </div>

                {/* Metrics 3-Col Bar */}
                <div className="grid grid-cols-3 gap-2 bg-[#050B14]/80 p-2.5 rounded-lg border border-[#1B2B3D] my-4 font-mono text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
                      <Thermometer className="w-3 h-3 text-cyan-400" />
                      TEMP
                    </div>
                    <div className={`text-sm font-bold ${station.currentReadings.temperature > 45 ? 'text-red-400 animate-pulse' : 'text-slate-100'}`}>
                      {station.currentReadings.temperature}°C
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
                      <Droplets className="w-3 h-3 text-cyan-400" />
                      RH
                    </div>
                    <div className="text-sm font-bold text-slate-100">
                      {station.currentReadings.humidity}%
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
                      <Gauge className="w-3 h-3 text-cyan-400" />
                      PRES
                    </div>
                    <div className="text-sm font-bold text-slate-100">
                      {station.currentReadings.pressure}
                    </div>
                  </div>
                </div>

                {/* Sensor Health Progress */}
                <div className="mb-4">
                  <HealthScore score={station.healthScore} size="sm" />
                </div>

                {/* Anomaly Indicator */}
                {station.activeAnomalies.length > 0 && (
                  <div className="mb-4 p-2 rounded bg-red-950/40 border border-red-500/40 text-xs font-mono text-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{station.activeAnomalies.length} active anomaly flagged</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <Link
                href={`/stations/${station.id}`}
                className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all border ${
                  isCritical
                    ? 'bg-red-950/60 hover:bg-red-900/70 border-red-500/50 text-red-200'
                    : 'bg-[#101D2D] hover:bg-cyan-950/50 border-[#1B2B3D] hover:border-cyan-500/40 text-slate-200 hover:text-cyan-300'
                }`}
              >
                <span>Investigate Station</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </GlassCard>
          );
        })}
      </div>
    </AppShell>
  );
}
