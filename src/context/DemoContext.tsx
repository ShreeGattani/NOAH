'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Station, Anomaly, NetworkSummary, DemoScenario } from '@/types';
import { INITIAL_STATIONS, INITIAL_ANOMALIES, INITIAL_NETWORK_SUMMARY, DEMO_SCENARIOS } from '@/data/mockData';

interface DemoContextType {
  currentScenario: DemoScenario;
  scenarioId: number;
  isPlaying: boolean;
  setScenario: (id: number) => void;
  togglePlay: () => void;
  resetDemo: () => void;
  stations: Station[];
  anomalies: Anomaly[];
  networkSummary: NetworkSummary;
  eventAnalysis: DemoScenario['eventAnalysis'];
  lastStreamTick: string;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [scenarioId, setScenarioId] = useState<number>(3); // Default to Scenario 3 (Critical Spike) for maximum initial impact
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [lastStreamTick, setLastStreamTick] = useState<string>(new Date().toISOString());

  const currentScenario = DEMO_SCENARIOS.find(s => s.id === scenarioId) || DEMO_SCENARIOS[2];

  // Derive stations by overlaying current scenario
  const getDerivedStations = useCallback((): Station[] => {
    return INITIAL_STATIONS.map(st => {
      const override = currentScenario.activeStations[st.id];
      if (!override) return st;
      return {
        ...st,
        ...override,
        currentReadings: {
          ...st.currentReadings,
          ...(override.currentReadings || {})
        }
      };
    });
  }, [currentScenario]);

  const [stations, setStations] = useState<Station[]>(getDerivedStations);
  const [anomalies, setAnomalies] = useState<Anomaly[]>(currentScenario.activeAnomalies);

  // Sync state when scenario changes
  useEffect(() => {
    const updatedStations = getDerivedStations();
    setStations(updatedStations);
    setAnomalies(currentScenario.activeAnomalies);
  }, [scenarioId, currentScenario, getDerivedStations]);

  // Periodic simulation tick to make live telemetry feel organic
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setLastStreamTick(new Date().toISOString());

      setStations(prev =>
        prev.map(st => {
          // If station is AWS_007 in scenario 3, keep it critical 55.2
          if (st.id === 'AWS_007' && scenarioId === 3) {
            const jitter = (Math.random() * 0.4 - 0.2);
            return {
              ...st,
              lastUpdated: 'Just now',
              currentReadings: {
                ...st.currentReadings,
                temperature: Number((55.2 + jitter).toFixed(1))
              }
            };
          }
          // If AWS_009 in scenario 4, keep it completely flatline
          if (st.id === 'AWS_009' && scenarioId === 4) {
            return {
              ...st,
              lastUpdated: 'Just now'
            };
          }

          // Gentle ambient jitter on normal stations
          const tempJitter = (Math.random() * 0.2 - 0.1);
          const newTemp = Number((st.currentReadings.temperature + tempJitter).toFixed(1));
          return {
            ...st,
            lastUpdated: 'Just now',
            currentReadings: {
              ...st.currentReadings,
              temperature: newTemp
            }
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, scenarioId]);

  // Compute live network summary
  const healthyCount = stations.filter(s => s.status === 'HEALTHY').length;
  const degradedCount = stations.filter(s => s.status === 'DEGRADED').length;
  const criticalCount = stations.filter(s => s.status === 'CRITICAL').length;
  const activeAnomaliesCount = anomalies.filter(a => a.status === 'ACTIVE').length;

  const networkSummary: NetworkSummary = {
    ...INITIAL_NETWORK_SUMMARY,
    totalStations: stations.length,
    healthyCount,
    degradedCount,
    criticalCount,
    activeAnomaliesCount,
    avgHealthScore: Math.round(stations.reduce((acc, s) => acc + s.healthScore, 0) / stations.length),
    status: criticalCount > 0 ? 'ALERT' : degradedCount > 0 ? 'DEGRADED' : 'OPTIMAL',
    lastUpdated: lastStreamTick
  };

  const setScenario = (id: number) => {
    setScenarioId(id);
  };

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const resetDemo = () => {
    setScenarioId(1);
    setIsPlaying(true);
  };

  return (
    <DemoContext.Provider
      value={{
        currentScenario,
        scenarioId,
        isPlaying,
        setScenario,
        togglePlay,
        resetDemo,
        stations,
        anomalies,
        networkSummary,
        eventAnalysis: currentScenario.eventAnalysis,
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
