import {
  adaptBackendStation,
  adaptBackendReading,
  adaptBackendAnomaly,
  computeNetworkSummary
} from './adapter';
import { Station, Anomaly, StationReading, NetworkSummary } from '@/types';
import {
  INITIAL_STATIONS,
  INITIAL_ANOMALIES,
  INITIAL_NETWORK_SUMMARY,
  generateStationTimeSeries
} from '@/data/mockData';

// If in browser, use Next.js internal proxy `/api/backend` which avoids any CORS issues.
// If in server-side render, use backend URL directly.
const BASE_URL =
  typeof window !== 'undefined'
    ? '/api/backend'
    : (process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:8000');

const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

async function safeFetch<T>(endpoint: string): Promise<T | null> {
  if (isMockMode) return null;

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      console.warn(`[NOAH API] Request to ${endpoint} failed with status: ${res.status}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[NOAH API] Network error on ${endpoint}, falling back to local dataset.`, err);
    return null;
  }
}

/**
 * Fetches all weather stations
 */
export async function getStations(): Promise<Station[]> {
  const data = await safeFetch<any[]>('/stations');

  if (!data || !Array.isArray(data) || data.length === 0) {
    return INITIAL_STATIONS;
  }

  return data.map((raw) => adaptBackendStation(raw));
}

/**
 * Fetches a single weather station by ID
 */
export async function getStation(stationId: string): Promise<Station | null> {
  const data = await safeFetch<any>(`/stations/${stationId}`);

  if (!data) {
    const fallback = INITIAL_STATIONS.find(
      (s) => s.id.toLowerCase() === stationId.toLowerCase()
    );
    return fallback || null;
  }

  return adaptBackendStation(data);
}

/**
 * Fetches recent historical readings for a station (LiveWeatherChart)
 */
export async function getStationReadings(
  stationId: string,
  hours: number = 24
): Promise<StationReading[]> {
  const data = await safeFetch<any[]>(`/stations/${stationId}/readings?hours=${hours}`);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return generateStationTimeSeries(stationId, hours);
  }

  return data.map((raw) => adaptBackendReading(raw));
}

/**
 * Fetches all active & flagged anomalies
 */
export async function getAnomalies(stations: Station[] = []): Promise<Anomaly[]> {
  const data = await safeFetch<any[]>('/anomalies');

  if (!data || !Array.isArray(data) || data.length === 0) {
    return INITIAL_ANOMALIES;
  }

  return data.map((raw) => adaptBackendAnomaly(raw, stations));
}

/**
 * Fetches a single anomaly by ID (numeric or string)
 */
export async function getAnomaly(
  anomalyId: string | number,
  stations: Station[] = []
): Promise<Anomaly | null> {
  // Extract numeric id if passed as ANM_2026_007 or 7
  let numericId = anomalyId;
  if (typeof anomalyId === 'string' && anomalyId.startsWith('ANM_')) {
    const parts = anomalyId.split('_');
    const last = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(last)) numericId = last;
  }

  const data = await safeFetch<any>(`/anomalies/${numericId}`);

  if (!data) {
    const fallback = INITIAL_ANOMALIES.find(
      (a) => a.id.toLowerCase() === String(anomalyId).toLowerCase()
    );
    return fallback || null;
  }

  return adaptBackendAnomaly(data, stations);
}

/**
 * Computes or retrieves the NetworkSummary
 */
export function getNetworkSummary(stations: Station[], anomalies: Anomaly[]): NetworkSummary {
  if (stations.length === 0) {
    return INITIAL_NETWORK_SUMMARY;
  }
  return computeNetworkSummary(stations, anomalies);
}
