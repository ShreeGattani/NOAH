import React from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, ShieldCheck, Radio, Sparkles, Cpu, Satellite } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050B14] text-slate-100 flex flex-col justify-between relative overflow-hidden bg-grid-pattern">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#08111D] rounded-[7px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <span className="font-mono font-bold text-lg tracking-wider text-white">NOAH</span>
            <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
              AWS INTELLIGENCE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            SYSTEM OPERATIONAL
          </span>
          <Link
            href="/dashboard"
            className="text-xs font-mono font-bold px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-1.5"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-12 sm:py-20 flex flex-col items-center text-center z-10">
        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0D1826] border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-6 shadow-lg shadow-cyan-950/40">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Networked Observation & Anomaly Intelligence</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 font-sans">
          Making Weather Data{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent text-glow-cyan">
            Trustworthy.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-300 max-w-2xl font-sans mb-10 leading-relaxed">
          Real-time mission-control intelligence for Automatic Weather Stations (AWS).
          Instantly classify true meteorological fronts from isolated sensor degradation.
        </p>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-sm tracking-wider uppercase transition-all shadow-xl shadow-cyan-500/30 hover:scale-105 flex items-center justify-center gap-3"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Enter Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/stations"
            className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#0D1826] hover:bg-[#101D2D] border border-[#1B2B3D] hover:border-slate-500 text-slate-200 font-mono font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Explore 12 AWS Stations</span>
          </Link>
        </div>

        {/* Key Features Triad */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full text-left">
          <div className="p-5 rounded-xl bg-[#0D1826]/80 border border-[#1B2B3D] backdrop-blur-md">
            <div className="w-9 h-9 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center mb-3">
              <Satellite className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-sm font-bold font-mono text-white mb-1">Spatial & Cross-Sensor ML</h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Compares neighboring observatories in real-time to detect whether anomalous shifts are regional or isolated.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0D1826]/80 border border-[#1B2B3D] backdrop-blur-md">
            <div className="w-9 h-9 rounded-lg bg-red-950/60 border border-red-500/30 flex items-center justify-center mb-3">
              <Cpu className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-sm font-bold font-mono text-white mb-1">Root Cause Explanation</h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Provides actionable diagnostics for sudden spikes, frozen sensors, capacitive drift, and multivariate errors.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0D1826]/80 border border-[#1B2B3D] backdrop-blur-md">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold font-mono text-white mb-1">Sensor Health Tracking</h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Automated scoring (0-100) tracks long-term telemetry degradation and triggers maintenance dispatches.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-[#1B2B3D]/80 text-center text-xs font-mono text-slate-500 z-10">
        NOAH Platform &bull; Networked Observation & Anomaly Intelligence &bull; Hackathon Edition
      </footer>
    </div>
  );
}
