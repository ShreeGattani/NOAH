'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Menu,
  Clock,
  Radio,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { LiveIndicator } from '../ui/LiveIndicator';
import { useDemo } from '@/context/DemoContext';
import { DEMO_SCENARIOS } from '@/data/mockData';

interface TopbarProps {
  onOpenMobile: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobile }) => {
  const pathname = usePathname();
  const { scenarioId, setScenario, isPlaying, togglePlay, resetDemo, currentScenario } = useDemo();
  const [timeStr, setTimeStr] = useState<string>('');
  const [isDemoDropdownOpen, setIsDemoDropdownOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) + ' IST'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'National Meteorological Network Overview';
    if (pathname === '/stations') return 'AWS Station Directory & Telemetry';
    if (pathname.startsWith('/stations/')) return 'Weather Station Diagnostic Inspection';
    if (pathname === '/anomalies') return 'Real-Time Anomaly Intelligence Feed';
    if (pathname.startsWith('/anomalies/')) return 'Anomaly Root Cause & Spatial Diagnostic';
    if (pathname === '/analytics') return 'Spatial & Temporal Model Analytics';
    if (pathname === '/settings') return 'System Configuration & Stream Parameters';
    return 'Command Center';
  };

  return (
    <header className="h-16 border-b border-[#1B2B3D] bg-[#08111D]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 sticky top-0">
      {/* Left: Mobile Toggle & Breadcrumb/Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-lg bg-[#0D1826] border border-[#1B2B3D] text-slate-300 hover:text-white"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded">
            <Radio className="w-3 h-3 animate-pulse" />
            LIVE OPS
          </span>
          <h2 className="text-sm sm:text-base font-semibold text-slate-100 font-sans truncate max-w-[200px] sm:max-w-md">
            {getPageTitle()}
          </h2>
        </div>
      </div>

      {/* Right: Clock, Live Indicator & Demo Control */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Real-time Clock */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-[#0D1826] border border-[#1B2B3D] px-2.5 py-1 rounded-md">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{timeStr || '18:34:00 IST'}</span>
        </div>

        {/* Live Indicator */}
        <div className="hidden sm:block">
          <LiveIndicator label="STREAM LIVE" />
        </div>

        {/* Interactive Demo Mode Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsDemoDropdownOpen(prev => !prev)}
            className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 hover:text-white transition-all shadow-sm shadow-cyan-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-semibold hidden sm:inline">DEMO:</span>
            <span className="truncate max-w-[110px] sm:max-w-[150px]">
              S{scenarioId} ({currentScenario.title.split(':')[1]?.trim() || 'Scenario'})
            </span>
            <Sliders className="w-3.5 h-3.5 opacity-70" />
          </button>

          {/* Demo Dropdown */}
          {isDemoDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDemoDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#0D1826] border border-[#2D4560] shadow-2xl shadow-black/80 z-50 p-3 text-slate-100">
                <div className="flex items-center justify-between pb-2 border-b border-[#1B2B3D] mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
                      Hackathon Demo Controller
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={togglePlay}
                      className="p-1 rounded bg-[#101D2D] hover:bg-[#1B2B3D] text-slate-300"
                      title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                    <button
                      onClick={resetDemo}
                      className="p-1 rounded bg-[#101D2D] hover:bg-[#1B2B3D] text-slate-300"
                      title="Reset to Scenario 1"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mb-3 font-sans">
                  Switch scenarios to demonstrate how NOAH distinguishes real weather fronts from isolated sensor faults.
                </p>

                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {DEMO_SCENARIOS.map((scenario) => {
                    const isSelected = scenario.id === scenarioId;
                    return (
                      <button
                        key={scenario.id}
                        onClick={() => {
                          setScenario(scenario.id);
                          setIsDemoDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-100'
                            : 'bg-[#101D2D]/60 border-[#1B2B3D] text-slate-300 hover:bg-[#101D2D] hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-mono font-bold">
                            {scenario.title}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-400 text-slate-950 font-bold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          {scenario.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
