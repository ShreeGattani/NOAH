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
  const [isReplaying, setIsReplaying] = useState(false);

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

    const fetchReplayStatus = async () => {
      try {
        const res = await fetch('/api/backend/replay/status');
        if (res.ok) {
          const data = await res.json();
          setIsReplaying(data.running);
        }
      } catch (e) {
        // Ignore network errors
      }
    };

    updateTime();
    fetchReplayStatus();
    
    const timer = setInterval(() => {
      updateTime();
      fetchReplayStatus();
    }, 2000);
    
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

        {/* Live Replay Controls */}
        <div className="flex items-center gap-2">
          {!isReplaying ? (
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/backend/replay/start', { method: 'POST' });
                  if (res.ok) {
                    setIsReplaying(true);
                  } else {
                    alert('Failed to start replay');
                  }
                } catch (e) {
                  alert('Failed to start replay');
                }
              }}
              className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-900 hover:bg-emerald-100 transition-colors shadow-xs cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold hidden sm:inline">Start Replay</span>
            </button>
          ) : (
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/backend/replay/stop', { method: 'POST' });
                  if (res.ok) {
                    setIsReplaying(false);
                  } else {
                    alert('Failed to stop replay');
                  }
                } catch (e) {
                  alert('Failed to stop replay');
                }
              }}
              className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-md bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 transition-colors shadow-xs cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-semibold hidden sm:inline">Stop Replay</span>
            </button>
          )}
          
          <button
            onClick={async () => {
              try {
                await fetch('/api/backend/replay/surge-faults', { method: 'POST' });
                alert('Fault surge initiated!');
              } catch (e) {
                alert('Failed to surge faults');
              }
            }}
            className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-md bg-red-50 border border-red-300 text-red-900 hover:bg-red-100 transition-colors shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span className="font-semibold hidden sm:inline">Surge Faults</span>
          </button>
        </div>
      </div>
    </header>
  );
};
