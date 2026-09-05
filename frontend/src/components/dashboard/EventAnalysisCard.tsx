import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Network, CloudLightning, Wrench, ShieldCheck, ArrowDown } from 'lucide-react';
import { DemoScenario } from '@/types';

interface EventAnalysisCardProps {
  analysis: DemoScenario['eventAnalysis'];
}

export const EventAnalysisCard: React.FC<EventAnalysisCardProps> = ({ analysis }) => {
  const isSensorFault = analysis.type === 'SENSOR_FAULT';
  const isWeatherEvent = analysis.type === 'WEATHER_EVENT';

  return (
    <GlassCard
      className="p-4 sm:p-5 flex flex-col justify-between bg-white border-slate-200 shadow-xs"
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 mb-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-blue-700" />
            <span className="text-xs font-bold tracking-wider uppercase text-slate-800">
              Spatial Consistency Analysis
            </span>
          </div>
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800">
            Cross-Sensor Validation
          </span>
        </div>

        <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
          {analysis.title}
        </h4>

        {/* Station Deltas Comparison Matrix */}
        <div className="bg-slate-50 rounded-md p-2.5 border border-slate-200 space-y-1.5 text-xs mb-3">
          {analysis.stations.map((st) => (
            <div
              key={st.id}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded transition-colors ${
                st.isHighlighted
                  ? 'bg-red-50 text-red-900 border border-red-300 font-bold shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="truncate max-w-[140px] sm:max-w-[200px] font-medium">{st.name}</span>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-slate-500 text-[11px]">{st.reading}</span>
                <span className={st.isHighlighted ? 'text-red-700 font-bold' : 'text-blue-700 font-semibold'}>
                  {st.delta}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Arrow transition */}
        <div className="flex justify-center my-1">
          <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* Classification Result Banner */}
      <div className="pt-2">
        <div
          className={`p-3 rounded-md border flex items-center gap-3 ${
            isSensorFault
              ? 'bg-red-50 border-red-200 text-red-900'
              : isWeatherEvent
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="p-2 rounded-md bg-white shrink-0 border border-inherit shadow-2xs">
            {isSensorFault ? (
              <Wrench className="w-5 h-5 text-red-600" />
            ) : isWeatherEvent ? (
              <CloudLightning className="w-5 h-5 text-amber-600" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider">
              {analysis.badgeText}
            </div>
            <p className="text-[11px] text-slate-700 font-sans mt-0.5 leading-snug">
              {analysis.summary}
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
