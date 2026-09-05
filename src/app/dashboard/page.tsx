'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { MetricCard } from '@/components/ui/MetricCard';
import { IndiaMap } from '@/components/dashboard/IndiaMap';
import { ActiveAnomaliesPanel } from '@/components/dashboard/ActiveAnomaliesPanel';
import { EventAnalysisCard } from '@/components/dashboard/EventAnalysisCard';
import { LiveWeatherChart } from '@/components/dashboard/LiveWeatherChart';
import { SensorHealthOverview } from '@/components/dashboard/SensorHealthOverview';
import { DemoScenarioBanner } from '@/components/dashboard/DemoScenarioBanner';
import { useDemo } from '@/context/DemoContext';
import { Radio, ShieldCheck, AlertCircle, AlertTriangle, Zap } from 'lucide-react';

export default function DashboardPage() {
  const { stations, anomalies, networkSummary, eventAnalysis } = useDemo();

  return (
    <AppShell>
      {/* Demo Controller Quick Banner */}
      <DemoScenarioBanner />

      {/* Network Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <MetricCard
          label="Total Stations"
          value={networkSummary.totalStations}
          icon={Radio}
          subtext="National telemetry grid"
          variant="default"
        />
        <MetricCard
          label="Healthy"
          value={networkSummary.healthyCount}
          icon={ShieldCheck}
          subtext="Operating within bounds"
          variant="healthy"
          trend={{ value: `${Math.round((networkSummary.healthyCount / networkSummary.totalStations) * 100)}%`, isPositive: true }}
        />
        <MetricCard
          label="Degraded"
          value={networkSummary.degradedCount}
          icon={AlertTriangle}
          subtext="Warning / Drift detected"
          variant="warning"
        />
        <MetricCard
          label="Critical"
          value={networkSummary.criticalCount}
          icon={AlertCircle}
          subtext="Immediate fault alert"
          variant={networkSummary.criticalCount > 0 ? 'critical' : 'default'}
        />
        <MetricCard
          label="Active Anomalies"
          value={networkSummary.activeAnomaliesCount}
          icon={Zap}
          subtext="Spatial ML flagged"
          variant={networkSummary.activeAnomaliesCount > 0 ? 'critical' : 'default'}
        />
      </div>

      {/* Primary Row: India Geospatial Map + Active Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left: Map (8 cols) */}
        <div className="lg:col-span-8 h-[460px]">
          <IndiaMap stations={stations} />
        </div>

        {/* Right: Active Anomalies Panel (4 cols) */}
        <div className="lg:col-span-4 h-[460px]">
          <ActiveAnomaliesPanel anomalies={anomalies} />
        </div>
      </div>

      {/* Secondary Row: Event Analysis (Weather vs Sensor Fault) + Sensor Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left: Spatial Event Analysis (6 cols) */}
        <div className="lg:col-span-6">
          <EventAnalysisCard analysis={eventAnalysis} />
        </div>

        {/* Right: Sensor Health Matrix (6 cols) */}
        <div className="lg:col-span-6">
          <SensorHealthOverview stations={stations} />
        </div>
      </div>

      {/* Tertiary Row: Live Weather Telemetry Chart */}
      <div className="w-full mb-6">
        <LiveWeatherChart stations={stations} initialStationId="AWS_007" />
      </div>
    </AppShell>
  );
}
