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
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-800">
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
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors shadow-2xs"
          />
        </div>

        {/* Filter Badges & Sort Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-between md:justify-end">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs text-xs">
            {(['ALL', 'HEALTHY', 'DEGRADED', 'CRITICAL'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded transition-all font-semibold ${
                  statusFilter === st
                    ? 'bg-[#0F2C59] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs text-xs text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-700" />
            <span className="text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="health">Health Score (Low to High)</option>
              <option value="anomalies">Active Anomalies</option>
              <option value="temp">Temperature</option>
              <option value="id">Station ID</option>
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
                      <span className="text-sm font-mono font-bold text-blue-900">{station.id}</span>
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {station.elevation}m
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{station.name}</h3>
                    <p className="text-xs text-slate-500 font-sans">{station.region}, {station.state}</p>
                  </div>
                  <StatusBadge status={station.status} size="sm" />
                </div>

                {/* Metrics 3-Col Bar */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 my-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 mb-0.5 font-medium">
                      <Thermometer className="w-3 h-3 text-blue-700" />
                      TEMP
                    </div>
                    <div className={`text-sm font-bold ${station.currentReadings.temperature > 45 ? 'text-red-700' : 'text-slate-900'}`}>
                      {station.currentReadings.temperature}°C
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 mb-0.5 font-medium">
                      <Droplets className="w-3 h-3 text-blue-700" />
                      RH
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {station.currentReadings.humidity}%
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 mb-0.5 font-medium">
                      <Gauge className="w-3 h-3 text-blue-700" />
                      PRES
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {station.currentReadings.pressure}
                    </div>
                  </div>
                </div>

                {/* Sensor Health Progress */}
                <div className="mb-3">
                  <HealthScore score={station.healthScore} size="sm" />
                </div>

                {/* Individual Sub-Sensors Health Pills */}
                {station.sensors && (
                  <div className="grid grid-cols-3 gap-1.5 mb-3 text-[11px] font-mono">
                    {station.sensors.map((s) => (
                      <div
                        key={s.type}
                        className={`px-1.5 py-1 rounded border text-center font-semibold truncate ${
                          s.state === 'FAULT'
                            ? 'bg-red-50 text-red-700 border-red-200 font-bold'
                            : s.state !== 'NOMINAL'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 font-bold'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                        title={`${s.name}: ${s.healthScore}/100 (${s.stateLabel})`}
                      >
                        <span className="text-slate-500 font-normal mr-0.5">
                          {s.type === 'temperature' ? 'T' : s.type === 'humidity' ? 'RH' : 'P'}:
                        </span>
                        {s.state === 'NOMINAL' ? 'OK' : s.state}
                      </div>
                    ))}
                  </div>
                )}

                {/* Anomaly Indicator */}
                {station.activeAnomalies.length > 0 && (
                  <div className="mb-4 p-2.5 rounded bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>{station.activeAnomalies.length} active anomaly flagged</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <Link
                href={`/stations/${station.id}`}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                  isCritical
                    ? 'bg-red-600 hover:bg-red-700 border-red-700 text-white'
                    : 'bg-slate-100 hover:bg-blue-50 border-slate-200 hover:border-blue-300 text-slate-800 hover:text-blue-900'
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
