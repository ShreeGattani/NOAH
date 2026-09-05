'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Station } from '@/types';
import { Loader2 } from 'lucide-react';

interface IndiaMapProps {
  stations: Station[];
  selectedStationId?: string;
  onSelectStation?: (station: Station) => void;
}

const IndiaMapClient = dynamic(() => import('./IndiaMapClient'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] rounded-xl border border-[#1B2B3D] bg-[#08111D] flex flex-col items-center justify-center gap-3 text-slate-400">
      <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
      <span className="text-xs font-mono">Initializing National Geospatial Grid...</span>
    </div>
  )
});

export const IndiaMap: React.FC<IndiaMapProps> = (props) => {
  return <IndiaMapClient {...props} />;
};
