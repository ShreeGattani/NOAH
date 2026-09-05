export type StationStatus = 'HEALTHY' | 'DEGRADED' | 'CRITICAL';

export type AnomalyType =
  | 'SUDDEN_SPIKE'
  | 'FROZEN_SENSOR'
  | 'SENSOR_DRIFT'
  | 'INVALID_DATA'
  | 'COMMUNICATION_FAILURE'
  | 'MULTIVARIATE_INCONSISTENCY';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AnomalyClassification = 'WEATHER_EVENT' | 'SENSOR_FAULT';

export interface StationReading {
  timestamp: string; // ISO string
  temperature: number; // in °C
  humidity: number; // in %
  pressure: number; // in hPa
  isAnomaly?: boolean;
  anomalyType?: AnomalyType;
  anomalyScore?: number; // 0 to 100
}

export interface Station {
  id: string; // e.g. "AWS_001"
  name: string; // e.g. "Safdarjung Met Observatory"
  region: string; // e.g. "Delhi NCR"
  state: string; // e.g. "Delhi"
  latitude: number;
  longitude: number;
  elevation: number; // in meters
  status: StationStatus;
  healthScore: number; // 0 - 100
  lastUpdated: string; // ISO or relative
  currentReadings: {
    temperature: number;
    humidity: number;
    pressure: number;
    tempDelta1h?: number;
    humidityDelta1h?: number;
    pressureDelta1h?: number;
  };
  anomalyCount: number;
  activeAnomalies: string[]; // Anomaly IDs
  installedDate: string;
  firmwareVersion: string;
  sensorModel: string;
}

export interface NeighborReading {
  id: string;
  name: string;
  distanceKm: number;
  reading: string;
  delta: string;
  isNormal: boolean;
}

export interface Anomaly {
  id: string; // e.g. "ANM_2026_007"
  stationId: string;
  stationName: string;
  stationRegion: string;
  type: AnomalyType;
  typeLabel: string;
  severity: Severity;
  confidence: number; // 0 - 100 percentage
  timestamp: string;
  metric: 'temperature' | 'humidity' | 'pressure' | 'multivariate' | 'communication';
  observedValue: string;
  expectedValue: string;
  deviation: string;
  classification: AnomalyClassification;
  classificationReason: string;
  whyFlagged: string[];
  neighbors: NeighborReading[];
  recommendation: string;
  status: 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED';
  mlModelDetails?: {
    modelName: string;
    isolationForestScore?: number;
    autoencoderReconError?: number;
    zScore?: number;
    spatialDeviationSigma?: number;
  };
}

export interface NetworkSummary {
  totalStations: number;
  healthyCount: number;
  degradedCount: number;
  criticalCount: number;
  activeAnomaliesCount: number;
  avgHealthScore: number;
  detectionAccuracy: number;
  falsePositiveRate: number;
  lastUpdated: string;
  status: 'OPTIMAL' | 'DEGRADED' | 'ALERT';
}

export interface AnomalyFilterOptions {
  status?: string;
  severity?: Severity | 'ALL';
  type?: AnomalyType | 'ALL';
  stationId?: string;
  search?: string;
}

export interface DemoScenario {
  id: number;
  title: string;
  tagline: string;
  description: string;
  activeStations: {
    [stationId: string]: Partial<Station>;
  };
  activeAnomalies: Anomaly[];
  eventAnalysis: {
    title: string;
    type: 'WEATHER_EVENT' | 'SENSOR_FAULT';
    badgeText: string;
    summary: string;
    stations: Array<{
      id: string;
      name: string;
      delta: string;
      reading: string;
      isHighlighted?: boolean;
    }>;
  };
}
