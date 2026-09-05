'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Station } from '@/types';
import Link from 'next/link';
import { StatusBadge } from '../ui/StatusBadge';
import { ArrowUpRight, Activity, Zap } from 'lucide-react';

interface IndiaMapClientProps {
  stations: Station[];
  selectedStationId?: string;
  onSelectStation?: (station: Station) => void;
}

// Custom DivIcons for Leaflet
function createCustomMarker(status: Station['status'], isSelected: boolean) {
  const colorMap = {
    HEALTHY: '#10B981',
    DEGRADED: '#F59E0B',
    CRITICAL: '#EF4444'
  };

  const color = colorMap[status] || '#10B981';
  const isCritical = status === 'CRITICAL';
  const isDegraded = status === 'DEGRADED';

  const html = `
    <div class="relative flex items-center justify-center">
      ${
        isCritical || isDegraded || isSelected
          ? `<div class="absolute w-8 h-8 rounded-full animate-ping opacity-60" style="background-color: ${color};"></div>`
          : ''
      }
      <div class="relative w-5 h-5 rounded-full border-2 border-[#050B14] shadow-lg flex items-center justify-center transition-transform hover:scale-125" style="background-color: ${color}; box-shadow: 0 0 10px ${color};">
        <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-map-marker',
    html,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
}

// Helper to center on selected station if provided
function MapController({ selectedStation }: { selectedStation?: Station }) {
  const map = useMap();
  useEffect(() => {
    if (selectedStation) {
      map.flyTo([selectedStation.latitude, selectedStation.longitude], 7, { duration: 1.2 });
    }
  }, [selectedStation, map]);
  return null;
}

export default function IndiaMapClient({
  stations,
  selectedStationId,
  onSelectStation
}: IndiaMapClientProps) {
  const selectedStation = stations.find(s => s.id === selectedStationId);

  return (
    <div className="w-full h-full min-h-[420px] rounded-xl overflow-hidden relative border border-[#1B2B3D] bg-[#050B14]">
      {/* Map Overlay Badge */}
      <div className="absolute top-3 left-3 z-[1000] bg-[#08111D]/90 backdrop-blur-md border border-[#1B2B3D] px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg">
        <Activity className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider">
          National AWS Spatial Grid
        </span>
        <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
          {stations.length} STATIONS
        </span>
      </div>

      {/* Quick Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-[#08111D]/90 backdrop-blur-md border border-[#1B2B3D] p-2 rounded-lg text-[10px] font-mono flex items-center gap-3 shadow-lg">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-300">Healthy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-slate-300">Degraded</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-slate-300">Critical</span>
        </div>
      </div>

      <MapContainer
        center={[22.5937, 78.9629]} // Center of India
        zoom={4.6}
        scrollWheelZoom={false}
        className="w-full h-full"
        style={{ background: '#050b14' }}
      >
        <MapController selectedStation={selectedStation} />

        {/* Dark theme CartoDB basemap */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {stations.map((st) => (
          <Marker
            key={st.id}
            position={[st.latitude, st.longitude]}
            icon={createCustomMarker(st.status, st.id === selectedStationId)}
            eventHandlers={{
              click: () => onSelectStation?.(st)
            }}
          >
            <Popup className="noah-leaflet-popup">
              <div className="p-2 min-w-[200px] text-slate-100 font-sans">
                <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[#1B2B3D]">
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan-400">{st.id}</span>
                    <h4 className="text-xs font-bold text-slate-100">{st.name}</h4>
                  </div>
                  <StatusBadge status={st.status} size="sm" />
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center my-2 bg-[#050B14] p-2 rounded border border-[#1B2B3D]/70 font-mono">
                  <div>
                    <div className="text-[10px] text-slate-400">Temp</div>
                    <div className={`text-xs font-bold ${st.currentReadings.temperature > 45 ? 'text-red-400' : 'text-slate-100'}`}>
                      {st.currentReadings.temperature}°C
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">RH</div>
                    <div className="text-xs font-bold text-slate-100">
                      {st.currentReadings.humidity}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Pressure</div>
                    <div className="text-xs font-bold text-slate-100">
                      {st.currentReadings.pressure}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-3">
                  <span>Health Score</span>
                  <span className={`font-bold ${st.healthScore >= 80 ? 'text-emerald-400' : st.healthScore >= 65 ? 'text-amber-400' : 'text-red-400'}`}>
                    {st.healthScore}/100
                  </span>
                </div>

                {st.status === 'CRITICAL' && (
                  <div className="mb-2 p-1.5 rounded bg-red-950/50 border border-red-500/40 text-[10px] font-mono text-red-300 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-red-400" />
                    <span>SUDDEN SPIKE DETECTED (96% Conf)</span>
                  </div>
                )}

                <Link
                  href={`/stations/${st.id}`}
                  className="w-full mt-1 inline-flex items-center justify-center gap-1 text-xs font-mono font-medium py-1.5 px-3 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 transition-colors"
                >
                  <span>View Station Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
