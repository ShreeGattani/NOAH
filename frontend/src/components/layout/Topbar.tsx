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
        now.toLocaleTimeString('en-IN', {
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
    if (pathname === '/dashboard') return 'National Weather Station Monitoring Dashboard';
    if (pathname === '/stations') return 'AWS Station Directory & Real-Time Observations';
    if (pathname.startsWith('/stations/')) return 'Station Telemetry & Sensor Diagnostics';
    if (pathname === '/anomalies') return 'Meteorological Anomaly Bulletin Feed';
    if (pathname.startsWith('/anomalies/')) return 'Anomaly Diagnostic & Spatial Cross-Check Report';
    if (pathname === '/analytics') return 'Network Reliability & Model Accuracy Analytics';
    if (pathname === '/settings') return 'Station Telemetry & System Configuration';
    return 'IMD Meteorological Center';
  };

  return (
    <header className="h-16 border-b border-sky-200/60 bg-white/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 sticky top-0 shadow-xs">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-md bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
            <Radio className="w-3 h-3 text-blue-600" />
            LIVE TELEMETRY
          </span>
          <h2 className="text-sm sm:text-base font-bold text-slate-800 font-sans truncate max-w-[220px] sm:max-w-md">
            {getPageTitle()}
          </h2>
        </div>
      </div>

      {/* Right: Clock, Live Indicator & Demo Control */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Real-time Clock */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono font-medium text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
          <Clock className="w-3.5 h-3.5 text-blue-700" />
          <span>{timeStr || '18:34:00 IST'}</span>
        </div>

        {/* Live Indicator */}
        <div className="hidden sm:block">
          <LiveIndicator label="AWS NETWORK LIVE" />
        </div>

        {/* Interactive Demo Mode Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsDemoDropdownOpen(prev => !prev)}
            className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-md bg-blue-50 border border-blue-300 text-blue-900 hover:bg-blue-100 transition-colors shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold hidden sm:inline">Scenario:</span>
            <span className="truncate max-w-[120px] sm:max-w-[160px] font-bold">
              S{scenarioId} ({currentScenario.title.split(':')[1]?.trim() || 'Scenario'})
            </span>
            <Sliders className="w-3.5 h-3.5 text-blue-500" />
          </button>

          {/* Demo Dropdown */}
          {isDemoDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDemoDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-white border border-slate-200 shadow-xl z-50 p-3 text-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                      Demonstration Scenarios
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={togglePlay}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-600" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                    <button
                      onClick={resetDemo}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      title="Reset to Scenario 1"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 mb-3 font-sans">
                  Select a scenario to verify how Noah&apos;s Ark distinguishes regional meteorological fronts from isolated sensor faults.
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
                        className={`w-full text-left p-2.5 rounded-md border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300 text-blue-900'
                            : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-bold">
                            {scenario.title}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-600 text-white font-bold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">
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
