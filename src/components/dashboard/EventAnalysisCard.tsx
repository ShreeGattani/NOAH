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
      variant={isSensorFault ? 'critical' : isWeatherEvent ? 'accent' : 'healthy'}
      className="p-4 sm:p-5 flex flex-col justify-between"
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#1B2B3D] mb-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-200">
              Spatial Event Analysis
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300">
            Cross-Sensor ML
          </span>
        </div>

        <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wide mb-2">
          {analysis.title}
        </h4>

        {/* Station Deltas Comparison Matrix */}
        <div className="bg-[#050B14]/70 rounded-lg p-2.5 border border-[#1B2B3D] space-y-1.5 font-mono text-xs mb-3">
          {analysis.stations.map((st) => (
            <div
              key={st.id}
              className={`flex items-center justify-between px-2 py-1 rounded transition-colors ${
                st.isHighlighted
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold'
                  : 'text-slate-300 hover:bg-[#0D1826]'
              }`}
            >
              <span className="truncate max-w-[130px] sm:max-w-[180px]">{st.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-[11px]">{st.reading}</span>
                <span className={st.isHighlighted ? 'text-red-400' : 'text-cyan-400'}>
                  {st.delta}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Arrow transition */}
        <div className="flex justify-center my-1">
          <ArrowDown className="w-3.5 h-3.5 text-cyan-400/60 animate-bounce" />
        </div>
      </div>

      {/* Classification Result Banner */}
      <div className="pt-2">
        <div
          className={`p-3 rounded-lg border flex items-center gap-3 ${
            isSensorFault
              ? 'bg-red-950/40 border-red-500/50 text-red-300'
              : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
          }`}
        >
          <div className="p-2 rounded-md bg-black/40 shrink-0">
            {isSensorFault ? (
              <Wrench className="w-5 h-5 text-red-400" />
            ) : isWeatherEvent ? (
              <CloudLightning className="w-5 h-5 text-cyan-400" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div>
            <div className="text-xs font-mono font-bold tracking-wider uppercase">
              {analysis.badgeText}
            </div>
            <p className="text-[11px] text-slate-300 font-sans mt-0.5 leading-snug">
              {analysis.summary}
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
