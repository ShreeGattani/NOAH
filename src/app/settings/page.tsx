'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  Settings,
  Radio,
  Sliders,
  Bell,
  CheckCircle,
  Save,
  RotateCcw,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

export default function SettingsPage() {
  const [mockMode, setMockMode] = useState(true);
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [wsUrl, setWsUrl] = useState('ws://localhost:8000/ws/live');
  const [confidenceCutoff, setConfidenceCutoff] = useState(80);
  const [spatialSigma, setSpatialSigma] = useState(3.5);
  const [notifyCritical, setNotifyCritical] = useState(true);
  const [notifyDegradation, setNotifyDegradation] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AppShell>
      <PageHeader
        title="System Settings"
        tagline="Configure backend API endpoints, WebSocket streams, and ML model thresholds."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Data Layer & API settings (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#1B2B3D] mb-4">
              <Radio className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-200">
                Backend Data & Telemetry Ingestion
              </h3>
            </div>

            <div className="space-y-4 font-mono text-xs">
              {/* Mock Mode Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#08111D] border border-[#1B2B3D]">
                <div>
                  <div className="font-bold text-white">Mock Simulation Mode</div>
                  <div className="text-[11px] text-slate-400 font-sans">
                    Use high-fidelity mock data and real-time simulator
                  </div>
                </div>
                <button
                  onClick={() => setMockMode(!mockMode)}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                    mockMode
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                      : 'bg-[#101D2D] text-slate-400 border border-[#1B2B3D]'
                  }`}
                >
                  {mockMode ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              {/* FastAPI URL */}
              <div>
                <label className="block text-slate-400 mb-1">FastAPI REST Endpoint</label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  disabled={mockMode}
                  className="w-full px-3 py-2 rounded bg-[#08111D] border border-[#1B2B3D] text-slate-200 text-xs focus:outline-none focus:border-cyan-400 disabled:opacity-50"
                />
              </div>

              {/* WebSocket URL */}
              <div>
                <label className="block text-slate-400 mb-1">WebSocket Live Stream URL</label>
                <input
                  type="text"
                  value={wsUrl}
                  onChange={(e) => setWsUrl(e.target.value)}
                  disabled={mockMode}
                  className="w-full px-3 py-2 rounded bg-[#08111D] border border-[#1B2B3D] text-slate-200 text-xs focus:outline-none focus:border-cyan-400 disabled:opacity-50"
                />
              </div>
            </div>
          </GlassCard>

          {/* Notifications */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#1B2B3D] mb-4">
              <Bell className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-200">
                Alerts & Dispatch Rules
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <label className="flex items-center justify-between p-2.5 rounded bg-[#08111D] border border-[#1B2B3D] cursor-pointer">
                <div>
                  <div className="text-slate-200 font-bold">Critical Anomaly Broadcast</div>
                  <div className="text-[11px] text-slate-400 font-sans">
                    Sound alert and dispatch quarantine token on confidence &gt; 90%
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyCritical}
                  onChange={(e) => setNotifyCritical(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded bg-[#08111D] border border-[#1B2B3D] cursor-pointer">
                <div>
                  <div className="text-slate-200 font-bold">Sensor Health Degradation Alerts</div>
                  <div className="text-[11px] text-slate-400 font-sans">
                    Flag station when health score drops below 75/100
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyDegradation}
                  onChange={(e) => setNotifyDegradation(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </label>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Model Parameter Tuning (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#1B2B3D] mb-4">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-200">
                ML Anomaly Engine Thresholds
              </h3>
            </div>

            <div className="space-y-5 font-mono text-xs">
              {/* Confidence Cutoff Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300">Minimum Anomaly Confidence Threshold</span>
                  <span className="text-cyan-400 font-bold">{confidenceCutoff}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={confidenceCutoff}
                  onChange={(e) => setConfidenceCutoff(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>50% (High Sensitivity)</span>
                  <span>99% (Strict Alerts Only)</span>
                </div>
              </div>

              {/* Spatial Deviation Sigma */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300">Spatial Deviation Cutoff (Sigma)</span>
                  <span className="text-cyan-400 font-bold">{spatialSigma}σ</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="6.0"
                  step="0.1"
                  value={spatialSigma}
                  onChange={(e) => setSpatialSigma(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>1.5σ (Narrow Range)</span>
                  <span>6.0σ (Extreme Outliers Only)</span>
                </div>
              </div>

              {/* Display & Map Preferences */}
              <div className="pt-2 border-t border-[#1B2B3D]">
                <div className="text-slate-300 font-bold mb-2">Map Tile Provider</div>
                <div className="p-2.5 rounded bg-[#08111D] border border-[#1B2B3D] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>CartoDB Dark Matter (High Contrast)</span>
                  </div>
                  <span className="text-[10px] text-emerald-400">ACTIVE</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => {
                setMockMode(true);
                setConfidenceCutoff(80);
                setSpatialSigma(3.5);
              }}
              className="px-4 py-2.5 rounded-lg bg-[#101D2D] hover:bg-[#1B2B3D] border border-[#1B2B3D] text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
            >
              {saved ? <CheckCircle className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4" />}
              <span>{saved ? 'Configuration Saved' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
