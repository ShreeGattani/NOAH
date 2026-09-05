'use client';

import React from 'react';
import { useDemo } from '@/context/DemoContext';
import { DEMO_SCENARIOS } from '@/data/mockData';
import { Sparkles, Play, Pause, RotateCcw } from 'lucide-react';

export const DemoScenarioBanner: React.FC = () => {
  const { scenarioId, setScenario, isPlaying, togglePlay, resetDemo, currentScenario } = useDemo();

  return (
    <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-[#091B2A]/90 via-[#0D1826]/90 to-[#08111D]/90 p-3 sm:p-4 backdrop-blur-md mb-6 shadow-lg shadow-cyan-950/20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Scenario Header Info */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                Interactive Hackathon Demo Controller
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700/60 font-semibold">
                {currentScenario.tagline}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              {currentScenario.description}
            </p>
          </div>
        </div>

        {/* Action Controls & Scenario Buttons */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="flex items-center gap-1 bg-[#050B14] p-1 rounded-lg border border-[#1B2B3D]">
            {DEMO_SCENARIOS.map((s) => {
              const isSelected = s.id === scenarioId;
              return (
                <button
                  key={s.id}
                  onClick={() => setScenario(s.id)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-[#101D2D]'
                  }`}
                >
                  S{s.id}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={togglePlay}
              className={`p-2 rounded-lg border text-xs font-mono flex items-center gap-1 transition-colors ${
                isPlaying
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/40'
                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
              }`}
              title={isPlaying ? 'Pause Simulation Stream' : 'Resume Simulation Stream'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="hidden sm:inline">{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>
            <button
              onClick={resetDemo}
              className="p-2 rounded-lg bg-[#101D2D] border border-[#1B2B3D] text-slate-300 hover:text-white hover:border-slate-500"
              title="Reset Demo"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
