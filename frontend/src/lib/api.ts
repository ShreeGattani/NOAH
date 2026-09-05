import { Station, Anomaly, NetworkSummary, StationReading, AnomalyFilterOptions } from '@/types';
import * as mockApi from './mockApi';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getStations(): Promise<Station[]> {
  if (USE_MOCK) return mockApi.mockGetStations();
  try {
    const res = await fetch(`${API_BASE_URL}/api/stations`, { next: { revalidate: 5 } });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('[NOAH API] Falling back to mock data:', err);
    return mockApi.mockGetStations();
  }
}

export async function getStation(id: string): Promise<Station | null> {
  if (USE_MOCK) return mockApi.mockGetStation(id);
  try {
    const res = await fetch(`${API_BASE_URL}/api/stations/${id}`, { next: { revalidate: 5 } });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('[NOAH API] Falling back to mock data:', err);
    return mockApi.mockGetStation(id);
  }
}

export async function getAnomalies(filters?: AnomalyFilterOptions): Promise<Anomaly[]> {
  if (USE_MOCK) return mockApi.mockGetAnomalies(filters);
  try {
    const query = new URLSearchParams();
    if (filters?.severity && filters.severity !== 'ALL') query.set('severity', filters.severity);
    if (filters?.type && filters.type !== 'ALL') query.set('type', filters.type);
    if (filters?.stationId) query.set('stationId', filters.stationId);
    if (filters?.search) query.set('search', filters.search);

    const res = await fetch(`${API_BASE_URL}/api/anomalies?${query.toString()}`, { next: { revalidate: 5 } });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('[NOAH API] Falling back to mock data:', err);
    return mockApi.mockGetAnomalies(filters);
  }
}

export async function getAnomaly(id: string): Promise<Anomaly | null> {
  if (USE_MOCK) return mockApi.mockGetAnomaly(id);
  try {
    const res = await fetch(`${API_BASE_URL}/api/anomalies/${id}`, { next: { revalidate: 5 } });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('[NOAH API] Falling back to mock data:', err);
    return mockApi.mockGetAnomaly(id);
  }
}

export async function getNetworkSummary(): Promise<NetworkSummary> {
  if (USE_MOCK) return mockApi.mockGetNetworkSummary();
  try {
    const res = await fetch(`${API_BASE_URL}/api/network/summary`, { next: { revalidate: 5 } });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('[NOAH API] Falling back to mock data:', err);
    return mockApi.mockGetNetworkSummary();
  }
}

export async function getStationReadings(id: string, hours: number = 24): Promise<StationReading[]> {
  if (USE_MOCK) return mockApi.mockGetStationReadings(id, hours);
  try {
    const res = await fetch(`${API_BASE_URL}/api/stations/${id}/readings?hours=${hours}`, { next: { revalidate: 5 } });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('[NOAH API] Falling back to mock data:', err);
    return mockApi.mockGetStationReadings(id, hours);
  }
}
