'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Station } from '@/types';
import Link from 'next/link';
import { StatusBadge } from '../ui/StatusBadge';
import { ArrowUpRight, MapPin, AlertTriangle } from 'lucide-react';

interface IndiaMapClientProps {
  stations: Station[];
  selectedStationId?: string;
  onSelectStation?: (station: Station) => void;
}

// Custom DivIcons for Leaflet (Clean Meteorological Standard)
function createCustomMarker(status: Station['status'], isSelected: boolean) {
  const colorMap = {
    HEALTHY: '#16A34A',
    DEGRADED: '#CA8A04',
    CRITICAL: '#DC2626'
  };

  const color = colorMap[status] || '#16A34A';
  const isCritical = status === 'CRITICAL';

  const html = `
    <div class="relative flex items-center justify-center">
      ${
        isCritical || isSelected
          ? `<div class="absolute w-7 h-7 rounded-full opacity-40 animate-ping" style="background-color: ${color};"></div>`
          : ''
      }
      <div class="relative w-5 h-5 rounded-full border-2 border-white shadow-md flex items-center justify-center transition-transform hover:scale-125" style="background-color: ${color};">
        <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-map-marker',
    html,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11]
  });
}

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
    <div className="w-full h-full min-h-[420px] rounded-lg overflow-hidden relative border border-slate-200 bg-white shadow-xs">
      {/* Map Overlay Badge */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs border border-slate-200 px-3 py-1.5 rounded-md flex items-center gap-2 shadow-xs">
        <MapPin className="w-4 h-4 text-blue-800" />
        <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
          National AWS Spatial Grid
        </span>
        <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
          {stations.length} OBSERVATORIES
        </span>
      </div>

      {/* Quick Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs border border-slate-200 p-2 rounded-md text-[11px] font-medium flex items-center gap-3 shadow-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          <span className="text-slate-700">Healthy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-slate-700">Degraded</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
          <span className="text-slate-700 font-semibold">Critical / Alert</span>
        </div>
      </div>

      <MapContainer
        center={[22.5937, 78.9629]} // Center of India
        zoom={4.6}
        scrollWheelZoom={false}
        className="w-full h-full"
        style={{ background: '#f8fafc' }}
      >
        <MapController selectedStation={selectedStation} />

        {/* Light clean CartoDB Positron basemap showing India state borders clearly */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
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
              <div className="p-2 min-w-[210px] text-slate-800 font-sans">
                <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-200">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-800">{st.id}</span>
                    <h4 className="text-xs font-bold text-slate-900">{st.name}</h4>
                  </div>
                  <StatusBadge status={st.status} size="sm" />
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center my-2 bg-slate-50 p-2 rounded border border-slate-200 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Temp</div>
                    <div className={`font-bold ${st.currentReadings.temperature > 45 ? 'text-red-600' : 'text-slate-800'}`}>
                      {st.currentReadings.temperature}°C
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">RH</div>
                    <div className="font-bold text-slate-800">
                      {st.currentReadings.humidity}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Pressure</div>
                    <div className="font-bold text-slate-800">
                      {st.currentReadings.pressure}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
                  <span>Health Score</span>
                  <span className={`font-bold ${st.healthScore >= 80 ? 'text-emerald-700' : st.healthScore >= 65 ? 'text-amber-700' : 'text-red-700'}`}>
                    {st.healthScore}/100
                  </span>
                </div>

                {st.status === 'CRITICAL' && (
                  <div className="mb-2 p-1.5 rounded bg-red-50 border border-red-200 text-[11px] text-red-700 flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>Sudden Spike Anomaly (96% Conf)</span>
                  </div>
                )}

                <Link
                  href={`/stations/${st.id}`}
                  className="w-full mt-1 inline-flex items-center justify-center gap-1 text-xs font-medium py-1.5 px-3 rounded bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 transition-colors"
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
