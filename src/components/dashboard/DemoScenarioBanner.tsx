'use client';

import React from 'react';
import { useDemo } from '@/context/DemoContext';
import { DEMO_SCENARIOS } from '@/data/mockData';
import { Sparkles, Play, Pause, RotateCcw } from 'lucide-react';

export const DemoScenarioBanner: React.FC = () => {
  const { scenarioId, setScenario, isPlaying, togglePlay, resetDemo, currentScenario } = useDemo();

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3 sm:p-4 mb-6 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Scenario Header Info */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-blue-100 border border-blue-200 text-blue-800">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Demonstration Control Panel
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white text-blue-800 border border-blue-300 font-semibold shadow-2xs">
                {currentScenario.tagline}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-sans mt-0.5">
              {currentScenario.description}
            </p>
          </div>
        </div>

        {/* Action Controls & Scenario Buttons */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-slate-200 shadow-2xs">
            {DEMO_SCENARIOS.map((s) => {
              const isSelected = s.id === scenarioId;
              return (
                <button
                  key={s.id}
                  onClick={() => setScenario(s.id)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
              className={`p-2 rounded-md border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                isPlaying
                  ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
              }`}
              title={isPlaying ? 'Pause Simulation Stream' : 'Resume Simulation Stream'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>
            <button
              onClick={resetDemo}
              className="p-2 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer shadow-2xs"
              title="Reset to Scenario 1"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
