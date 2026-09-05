'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { HealthScore } from '@/components/ui/HealthScore';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { LiveWeatherChart } from '@/components/dashboard/LiveWeatherChart';
import { StationSensorHealthBreakdown } from '@/components/stations/StationSensorHealthBreakdown';
import { useDemo } from '@/context/DemoContext';
import {
  ArrowLeft,
  Thermometer,
  Droplets,
  Gauge,
  Cpu,
  ShieldAlert,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  HardDrive
} from 'lucide-react';

interface StationPageProps {
  params: Promise<{ id: string }>;
}

export default function StationInvestigationPage({ params }: StationPageProps) {
  const resolvedParams = use(params);
  const { stations, anomalies } = useDemo();

  const station = stations.find(
    (s) => s.id.toLowerCase() === resolvedParams.id.toLowerCase()
  );

  if (!station) {
    return (
      <AppShell>
        <div className="py-20 text-center font-mono">
          <p className="text-red-700 text-base font-semibold mb-3">Weather Station {resolvedParams.id} Not Found</p>
          <Link href="/stations" className="text-blue-700 hover:text-blue-900 underline text-sm font-medium">
            &larr; Return to Station Directory
          </Link>
        </div>
      </AppShell>
    );
  }

  const stationAnomalies = anomalies.filter(
    (a) => a.stationId.toLowerCase() === station.id.toLowerCase()
  );

  // Timeline events for this station
  const timelineEvents = [
    {
      time: '18:22:31',
      date: 'Today',
      type: station.status === 'CRITICAL' ? 'SUDDEN SPIKE' : 'NORMAL TELEMETRY',
      severity: station.status === 'CRITICAL' ? 'CRITICAL' : 'LOW',
      confidence: station.status === 'CRITICAL' ? '96%' : '99%',
      details: station.status === 'CRITICAL' ? 'Temperature jumped +31.8°C within 15min. Spatial check failed.' : 'Continuous normal readings across all three channels.',
      isAnomaly: station.status === 'CRITICAL'
    },
    {
      time: '18:15:12',
      date: 'Today',
      type: 'NORMAL STREAM',
      severity: 'LOW',
      confidence: '99%',
      details: 'Baseline ambient readings within 0.3°C variance.',
      isAnomaly: false
    },
    {
      time: '17:42:03',
      date: 'Today',
      type: 'NORMAL STREAM',
      severity: 'LOW',
      confidence: '98%',
      details: 'Solar cycle transition nominal. Barometric pressure steady.',
      isAnomaly: false
    },
    {
      time: '16:21:11',
      date: 'Today',
      type: 'SENSOR DRIFT WARNING',
      severity: 'MEDIUM',
      confidence: '81%',
      details: 'Capacitive humidity film exhibited slight negative bias (-4.8%).',
      isAnomaly: true
    }
  ];

  return (
    <AppShell>
      {/* Back Navigation & Hero Header */}
      <div className="mb-6">
        <Link
          href="/stations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Station Directory</span>
        </Link>

        <GlassCard
          variant={station.status === 'CRITICAL' ? 'critical' : station.status === 'DEGRADED' ? 'warning' : 'default'}
          className="p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xl font-mono font-bold text-blue-900">{station.id}</span>
                <StatusBadge status={station.status} size="md" />
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                  {station.firmwareVersion}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 font-sans">{station.name}</h1>
              <p className="text-xs text-slate-500 font-mono mt-1">
                {station.region}, {station.state} &bull; Coordinates: {station.latitude.toFixed(4)}°N, {station.longitude.toFixed(4)}°E &bull; Elevation: {station.elevation}m ASL
              </p>
            </div>

            <div className="flex items-center gap-6 min-w-[240px]">
              <HealthScore score={station.healthScore} size="lg" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Sensor Metric Cards with Deltas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Temperature */}
        <GlassCard className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1.5 uppercase font-semibold text-slate-700">
              <Thermometer className="w-4 h-4 text-blue-700" />
              Temperature
            </span>
            <span className="text-[10px] font-mono bg-blue-50 border border-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-semibold">
              CH-1
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-3xl font-mono font-bold ${station.currentReadings.temperature > 45 ? 'text-red-700' : 'text-slate-900'}`}>
              {station.currentReadings.temperature}°C
            </span>
            <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
              (station.currentReadings.tempDelta1h || 0) > 10
                ? 'bg-red-50 text-red-700 border border-red-200 font-bold'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
              {(station.currentReadings.tempDelta1h || 0) > 0 ? '+' : ''}{station.currentReadings.tempDelta1h || 0.4}°C (1h)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-sans">
            Baseline expected: 24.5°C &bull; Sensor: Platinum RTD Pt100
          </p>
        </GlassCard>

        {/* Humidity */}
        <GlassCard className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1.5 uppercase font-semibold text-slate-700">
              <Droplets className="w-4 h-4 text-blue-700" />
              Relative Humidity
            </span>
            <span className="text-[10px] font-mono bg-blue-50 border border-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-semibold">
              CH-2
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-mono font-bold text-slate-900">
              {station.currentReadings.humidity}%
            </span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {(station.currentReadings.humidityDelta1h || 0) > 0 ? '+' : ''}{station.currentReadings.humidityDelta1h || -1.2}% (1h)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-sans">
            Capacitive Thin-Film Polymer &bull; Range: 0-100% RH
          </p>
        </GlassCard>

        {/* Pressure */}
        <GlassCard className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1.5 uppercase font-semibold text-slate-700">
              <Gauge className="w-4 h-4 text-blue-700" />
              Atmospheric Pressure
            </span>
            <span className="text-[10px] font-mono bg-blue-50 border border-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-semibold">
              CH-3
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-mono font-bold text-slate-900">
              {station.currentReadings.pressure} <span className="text-sm font-normal text-slate-500">hPa</span>
            </span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {station.currentReadings.pressureDelta1h || -0.2} hPa (1h)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-sans">
            Piezoresistive Silicon Barometer &bull; Resolution: 0.1 hPa
          </p>
        </GlassCard>
      </div>

      {/* Sub-Sensor Health & State Breakdown */}
      {station.sensors && (
        <div className="mb-6">
          <StationSensorHealthBreakdown sensors={station.sensors} stationId={station.id} />
        </div>
      )}

      {/* Primary Chart Area */}
      <div className="mb-6">
        <LiveWeatherChart stations={stations} initialStationId={station.id} />
      </div>

      {/* Bottom Grid: Anomaly Timeline & Station Hardware Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Anomaly Timeline (7 cols) */}
        <div className="lg:col-span-7">
          <GlassCard className="p-5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-700" />
                  <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800">
                    Telemetry & Anomaly Timeline
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">LAST 24 HOURS</span>
              </div>

              {/* Vertical timeline items */}
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {timelineEvents.map((evt, idx) => (
                  <div key={idx} className="relative group">
                    {/* Node Dot */}
                    <div
                      className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                        evt.isAnomaly ? 'bg-red-600 shadow-sm' : 'bg-emerald-600'
                      }`}
                    >
                      <div className="w-1 h-1 rounded-full bg-white" />
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-slate-900 flex items-center gap-2">
                          {evt.time}
                          <span className="text-[11px] font-normal text-slate-500">{evt.date}</span>
                        </span>
                        {evt.isAnomaly ? (
                          <SeverityBadge severity={evt.severity as any} size="sm" />
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            NOMINAL
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-800">{evt.type}</div>
                      <p className="text-xs text-slate-600 font-sans mt-1">{evt.details}</p>
                      <div className="mt-2 text-[11px] font-mono text-slate-500 flex items-center gap-1">
                        <span>Confidence:</span>
                        <span className="font-bold text-slate-800">{evt.confidence}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {stationAnomalies.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-200">
                <Link
                  href={`/anomalies/${stationAnomalies[0].id}`}
                  className="w-full py-2.5 px-3 rounded-lg bg-[#0F2C59] hover:bg-blue-900 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>View Root Cause Diagnostic ({stationAnomalies[0].id})</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right: Station Hardware Specifications (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 mb-4">
              <Cpu className="w-4 h-4 text-blue-700" />
              <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800">
                Hardware & Sensor Specs
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-sans">Sensor Model</span>
                <span className="text-slate-900 font-bold">{station.sensorModel}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-sans">Firmware Build</span>
                <span className="text-blue-900 font-semibold">{station.firmwareVersion}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-sans">Commission Date</span>
                <span className="text-slate-800 font-sans">{station.installedDate}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-sans">Telemetry Uplink</span>
                <span className="text-emerald-700 font-semibold">4G LTE / Satellite Fallback</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-sans">Solar Power / Batt</span>
                <span className="text-slate-900 font-semibold">13.8V DC (Nominal)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">Ingestion Pipeline</span>
                <span className="text-slate-900 font-semibold">MQTT &bull; 10s Sample Rate</span>
              </div>
            </div>
          </GlassCard>

          {/* Quick Diagnostics Action */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 pb-2 mb-2">
              <HardDrive className="w-4 h-4 text-blue-700" />
              <h4 className="text-xs font-bold text-slate-800 uppercase">
                Remote Diagnostics Command
              </h4>
            </div>
            <p className="text-xs text-slate-500 font-sans mb-3">
              Trigger remote sensor loopback test or issue firmware calibration token.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => alert(`Remote telemetry self-test initiated for ${station.id}. Response code: 0x00 OK.`)}
                className="py-2 px-2.5 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors"
              >
                Trigger Self-Test
              </button>
              <button
                onClick={() => alert(`Telemetry isolation quarantine enabled for ${station.id}. Ingestion to NWP paused.`)}
                className="py-2 px-2.5 rounded bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold text-red-700 transition-colors"
              >
                Quarantine Feed
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
