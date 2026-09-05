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
    <div className="w-full h-full min-h-[420px] rounded-lg border border-slate-200 bg-white flex flex-col items-center justify-center gap-3 text-slate-500">
      <Loader2 className="w-6 h-6 animate-spin text-blue-700" />
      <span className="text-xs font-medium">Loading National Geospatial Grid...</span>
    </div>
  )
});

export const IndiaMap: React.FC<IndiaMapProps> = (props) => {
  return <IndiaMapClient {...props} />;
};
