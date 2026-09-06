'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Station, Anomaly, NetworkSummary, DemoScenario } from '@/types';

import { getStations, getAnomalies } from '@/lib/api';
import { wsClient, TelemetryPacket } from '@/lib/websocket';

interface DemoContextType {
  currentScenario: DemoScenario | null;
  scenarioId: number;
  isPlaying: boolean;
  setScenario: (id: number) => void;
  togglePlay: () => void;
  resetDemo: () => void;
  stations: Station[];
  anomalies: Anomaly[];
  networkSummary: NetworkSummary;
  eventAnalysis: any;
  lastStreamTick: string;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [stations, setStations] = useState<Station[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [lastStreamTick, setLastStreamTick] = useState<string>(new Date().toISOString());

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      const initialStations = await getStations();
      const initialAnomalies = await getAnomalies(initialStations);
      setStations(initialStations);
      setAnomalies(initialAnomalies);
    }
    loadData();
  }, []);

  // Connect to live backend and listen for WebSocket telemetry
  useEffect(() => {
    wsClient.connect();

    const unsubscribe = wsClient.subscribe((packet: TelemetryPacket) => {
      setLastStreamTick(packet.timestamp || new Date().toISOString());

      if ((packet.type === 'READING_UPDATE' || packet.type === 'ANOMALY_DETECTED') && packet.data?.reading) {
        const r = packet.data.reading;
        setStations((prev) => {
          const exists = prev.find(s => s.id.toLowerCase() === packet.stationId.toLowerCase());
          if (!exists) {
            getStations().then(setStations);
            return prev;
          }
          return prev.map((s) => {
            if (s.id.toLowerCase() === packet.stationId.toLowerCase()) {
              const analysis = packet.data?.analysis;
              let newHealthScore = s.healthScore;
              let newStatus = s.status;
              let newSensors = s.sensors;
              
              if (analysis) {
                 const score = analysis.anomaly_score || 0;
                 if (analysis.is_anomaly) {
                    newHealthScore = Math.max(0, 100 - score);
                    newStatus = score >= 85 ? 'CRITICAL' : (score >= 50 ? 'DEGRADED' : 'HEALTHY');
                 } else {
                    newHealthScore = 98;
                    newStatus = 'HEALTHY';
                 }
                 
                 newSensors = s.sensors.map(sensor => {
                    const isTargeted = analysis.sensor_types?.includes(sensor.type);
                    if (isTargeted && analysis.is_anomaly) {
                        return { ...sensor, healthScore: newHealthScore, status: newStatus, state: newStatus === 'CRITICAL' ? 'FAULT' : 'DEGRADED', stateLabel: newStatus === 'CRITICAL' ? 'Sensor Fault' : 'Telemetry Drift' };
                    }
                    if (!analysis.is_anomaly) {
                        return { ...sensor, healthScore: 98, status: 'HEALTHY', state: 'NOMINAL', stateLabel: 'Operational' };
                    }
                    return sensor;
                 });
              }

              return {
                ...s,
                lastUpdated: 'Just now',
                healthScore: newHealthScore,
                status: newStatus,
                sensors: newSensors,
                currentReadings: {
                  ...s.currentReadings,
                  temperature: r.temperature != null ? Number(r.temperature) : s.currentReadings.temperature,
                  humidity: r.humidity != null ? Number(r.humidity) : s.currentReadings.humidity,
                  pressure: r.pressure != null ? Number(r.pressure) : s.currentReadings.pressure
                }
              };
            }
            return s;
          });
        });
      }
      
      if (packet.type === 'ANOMALY_DETECTED') {
        getAnomalies().then(setAnomalies);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Compute live network summary
  const healthyCount = stations.filter(s => s.status === 'HEALTHY').length;
  const degradedCount = stations.filter(s => s.status === 'DEGRADED').length;
  const criticalCount = stations.filter(s => s.status === 'CRITICAL').length;
  const activeAnomaliesCount = anomalies.filter(a => a.status === 'ACTIVE').length;

  const networkSummary: NetworkSummary = {
    totalStations: stations.length,
    healthyCount,
    degradedCount,
    criticalCount,
    activeAnomaliesCount,
    avgHealthScore: stations.length > 0 ? Math.round(stations.reduce((acc, s) => acc + s.healthScore, 0) / stations.length) : 100,
    status: criticalCount > 0 ? 'ALERT' : degradedCount > 0 ? 'DEGRADED' : 'OPTIMAL',
    lastUpdated: lastStreamTick
  };

  return (
    <DemoContext.Provider
      value={{
        currentScenario: null,
        scenarioId: 1,
        isPlaying: true,
        setScenario: () => {},
        togglePlay: () => {},
        resetDemo: () => {},
        stations,
        anomalies,
        networkSummary,
        eventAnalysis: null,
        lastStreamTick
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
