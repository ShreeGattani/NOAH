import {
  INITIAL_STATIONS,
  INITIAL_ANOMALIES,
  INITIAL_NETWORK_SUMMARY,
  generateStationTimeSeries
} from '@/data/mockData';
import { Station, Anomaly, NetworkSummary, StationReading, AnomalyFilterOptions } from '@/types';

// In-memory state for mock API
let currentStations: Station[] = JSON.parse(JSON.stringify(INITIAL_STATIONS));
let currentAnomalies: Anomaly[] = JSON.parse(JSON.stringify(INITIAL_ANOMALIES));
let currentSummary: NetworkSummary = JSON.parse(JSON.stringify(INITIAL_NETWORK_SUMMARY));

export async function mockGetStations(): Promise<Station[]> {
  await new Promise(resolve => setTimeout(resolve, 80));
  return currentStations;
}

export async function mockGetStation(id: string): Promise<Station | null> {
  await new Promise(resolve => setTimeout(resolve, 60));
  const station = currentStations.find(s => s.id.toLowerCase() === id.toLowerCase());
  return station || null;
}

export async function mockGetAnomalies(filters?: AnomalyFilterOptions): Promise<Anomaly[]> {
  await new Promise(resolve => setTimeout(resolve, 80));
  let list = [...currentAnomalies];

  if (filters) {
    if (filters.severity && filters.severity !== 'ALL') {
      list = list.filter(a => a.severity === filters.severity);
    }
    if (filters.type && filters.type !== 'ALL') {
      list = list.filter(a => a.type === filters.type);
    }
    if (filters.status && filters.status !== 'ALL') {
      list = list.filter(a => a.status === filters.status);
    }
    if (filters.stationId) {
      list = list.filter(a => a.stationId.toLowerCase() === filters.stationId?.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(a =>
        a.stationName.toLowerCase().includes(q) ||
        a.stationId.toLowerCase().includes(q) ||
        a.typeLabel.toLowerCase().includes(q) ||
        a.classificationReason.toLowerCase().includes(q)
      );
    }
  }

  return list;
}

export async function mockGetAnomaly(id: string): Promise<Anomaly | null> {
  await new Promise(resolve => setTimeout(resolve, 60));
  const anomaly = currentAnomalies.find(a => a.id.toLowerCase() === id.toLowerCase());
  return anomaly || null;
}

export async function mockGetNetworkSummary(): Promise<NetworkSummary> {
  await new Promise(resolve => setTimeout(resolve, 50));
  const healthy = currentStations.filter(s => s.status === 'HEALTHY').length;
  const degraded = currentStations.filter(s => s.status === 'DEGRADED').length;
  const critical = currentStations.filter(s => s.status === 'CRITICAL').length;
  const activeAnomalies = currentAnomalies.filter(a => a.status === 'ACTIVE').length;

  return {
    ...currentSummary,
    totalStations: currentStations.length,
    healthyCount: healthy,
    degradedCount: degraded,
    criticalCount: critical,
    activeAnomaliesCount: activeAnomalies,
    status: critical > 0 ? 'ALERT' : degraded > 0 ? 'DEGRADED' : 'OPTIMAL',
    lastUpdated: new Date().toISOString()
  };
}

export async function mockGetStationReadings(id: string, hours: number = 24): Promise<StationReading[]> {
  await new Promise(resolve => setTimeout(resolve, 80));
  return generateStationTimeSeries(id, hours);
}

export function updateMockStationState(stationId: string, partial: Partial<Station>) {
  const idx = currentStations.findIndex(s => s.id === stationId);
  if (idx !== -1) {
    currentStations[idx] = { ...currentStations[idx], ...partial };
  }
}

export function resetMockData() {
  currentStations = JSON.parse(JSON.stringify(INITIAL_STATIONS));
  currentAnomalies = JSON.parse(JSON.stringify(INITIAL_ANOMALIES));
  currentSummary = JSON.parse(JSON.stringify(INITIAL_NETWORK_SUMMARY));
}
