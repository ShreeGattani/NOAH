import { Station, Anomaly, NetworkSummary, StationReading, DemoScenario, AnomalyType } from '@/types';

export const INITIAL_STATIONS: Station[] = [
  {
    id: 'AWS_001',
    name: 'Safdarjung Observatory',
    region: 'Delhi NCR',
    state: 'Delhi',
    latitude: 28.5847,
    longitude: 77.2066,
    elevation: 216,
    status: 'HEALTHY',
    healthScore: 96,
    lastUpdated: 'Just now',
    currentReadings: {
      temperature: 24.2,
      humidity: 52,
      pressure: 1012.4,
      tempDelta1h: +0.4,
      humidityDelta1h: -1.2,
      pressureDelta1h: -0.2,
    },
    anomalyCount: 0,
    activeAnomalies: [],
    installedDate: '2023-04-12',
    firmwareVersion: 'v3.8.2-rtos',
    sensorModel: 'Vaisala WXT536'
  },
  {
    id: 'AWS_002',
    name: 'Santacruz Met Complex',
    region: 'Mumbai Coastal',
    state: 'Maharashtra',
    latitude: 19.0896,
    longitude: 72.8656,
    elevation: 14,
    status: 'HEALTHY',
    healthScore: 94,
    lastUpdated: '12s ago',
    currentReadings: {
      temperature: 30.1,
      humidity: 78,
      pressure: 1009.8,
      tempDelta1h: +0.2,
      humidityDelta1h: +2.1,
      pressureDelta1h: -0.1,
    },
    anomalyCount: 0,
    activeAnomalies: [],
    installedDate: '2022-11-19',
    firmwareVersion: 'v3.8.2-rtos',
    sensorModel: 'Vaisala WXT536'
  },
  {
    id: 'AWS_003',
    name: 'HAL Airport Station',
    region: 'Bengaluru Urban',
    state: 'Karnataka',
    latitude: 12.9500,
    longitude: 77.6682,
    elevation: 887,
    status: 'HEALTHY',
    healthScore: 91,
    lastUpdated: '34s ago',
    currentReadings: {
      temperature: 22.8,
      humidity: 64,
      pressure: 916.2,
      tempDelta1h: -0.5,
      humidityDelta1h: +3.0,
      pressureDelta1h: +0.4,
    },
    anomalyCount: 0,
    activeAnomalies: [],
    installedDate: '2023-01-08',
    firmwareVersion: 'v3.7.9-rtos',
    sensorModel: 'Campbell CR1000X'
  },
  {
    id: 'AWS_004',
    name: 'Meenambakkam Station',
    region: 'Chennai Coast',
    state: 'Tamil Nadu',
    latitude: 13.0067,
    longitude: 80.1849,
    elevation: 16,
    status: 'HEALTHY',
    healthScore: 89,
    lastUpdated: '50s ago',
    currentReadings: {
      temperature: 31.4,
      humidity: 82,
      pressure: 1010.5,
      tempDelta1h: +0.6,
      humidityDelta1h: -1.0,
      pressureDelta1h: -0.3,
    },
    anomalyCount: 0,
    activeAnomalies: [],
    installedDate: '2022-08-14',
    firmwareVersion: 'v3.8.2-rtos',
    sensorModel: 'Vaisala WXT536'
  },
  {
    id: 'AWS_005',
    name: 'Alipore Meteorological Center',
    region: 'Kolkata Delta',
    state: 'West Bengal',
    latitude: 22.5326,
    longitude: 88.3300,
    elevation: 9,
    status: 'HEALTHY',
    healthScore: 92,
    lastUpdated: '1m ago',
    currentReadings: {
      temperature: 27.6,
      humidity: 71,
      pressure: 1011.8,
      tempDelta1h: +0.3,
      humidityDelta1h: +0.5,
      pressureDelta1h: -0.1,
    },
    anomalyCount: 0,
    activeAnomalies: [],
    installedDate: '2023-06-20',
    firmwareVersion: 'v3.8.2-rtos',
    sensorModel: 'Campbell CR1000X'
  },
  {
    id: 'AWS_006',
    name: 'Sanganer Airport',
    region: 'Jaipur Semi-Arid',
    state: 'Rajasthan',
    latitude: 26.8242,
    longitude: 75.8034,
    elevation: 385,
    status: 'DEGRADED',
    healthScore: 78,
    lastUpdated: '1m ago',
    currentReadings: {
      temperature: 26.5,
      humidity: 35,
      pressure: 972.1,
      tempDelta1h: +2.1,
      humidityDelta1h: -4.8,
      pressureDelta1h: -0.7,
    },
    anomalyCount: 1,
    activeAnomalies: ['ANM_2026_006'],
    installedDate: '2021-12-05',
    firmwareVersion: 'v3.6.1-rtos',
    sensorModel: 'Gill MetPak Pro'
  },
  {
    id: 'AWS_007',
    name: 'Palam Field Observatory',
    region: 'Delhi NCR',
    state: 'Delhi',
    latitude: 28.5665,
    longitude: 77.1132,
    elevation: 237,
    status: 'CRITICAL',
    healthScore: 61,
    lastUpdated: '2s ago',
    currentReadings: {
      temperature: 55.2,
      humidity: 78,
      pressure: 1009.0,
      tempDelta1h: +31.8,
      humidityDelta1h: +4.2,
      pressureDelta1h: -8.2,
    },
    anomalyCount: 2,
    activeAnomalies: ['ANM_2026_007', 'ANM_2026_008'],
    installedDate: '2022-03-30',
    firmwareVersion: 'v3.7.0-legacy',
    sensorModel: 'Vaisala WXT536'
  },
  {
    id: 'AWS_008',
    name: 'Leh High Altitude Lab',
    region: 'Ladakh Trans-Himalaya',
    state: 'Ladakh',
    latitude: 34.1526,
    longitude: 77.5771,
    elevation: 3500,
    status: 'HEALTHY',
    healthScore: 98,
    lastUpdated: '18s ago',
    currentReadings: {
      temperature: -2.4,
      humidity: 31,
      pressure: 668.5,
      tempDelta1h: -0.8,
      humidityDelta1h: +1.1,
      pressureDelta1h: +0.2,
    },
    anomalyCount: 0,
    activeAnomalies: [],
    installedDate: '2023-09-10',
    firmwareVersion: 'v3.8.2-rtos',
    sensorModel: 'Campbell CR1000X Rugged'
  },
  {
    id: 'AWS_009',
    name: 'Borjhar Met Station',
    region: 'Guwahati Valley',
    state: 'Assam',
    latitude: 26.1061,
    longitude: 91.5859,
    elevation: 54,
    status: 'DEGRADED',
    healthScore: 74,
    lastUpdated: '4m ago',
    currentReadings: {
      temperature: 21.0,
      humidity: 89,
      pressure: 1008.2,
      tempDelta1h: 0.0,
      humidityDelta1h: 0.0,
      pressureDelta1h: 0.0,
    },
    anomalyCount: 1,
    activeAnomalies: ['ANM_2026_009'],
    installedDate: '2022-05-18',
    firmwareVersion: 'v3.5.4-rtos',
    sensorModel: 'Vaisala WXT520'
  },
  {
    id: 'AWS_010',
    name: 'Sardar Vallabhbhai Met Lab',
    region: 'Ahmedabad Plains',
    state: 'Gujarat',
    latitude: 23.0772,
    longitude: 72.6347,
    elevation: 58,
    status: 'HEALTHY',
    healthScore: 93,
    lastUpdated: '22s ago',
    currentReadings: {
      temperature: 29.8,
      humidity: 42,
      pressure: 1007.4,
      tempDelta1h: +0.7,
      humidityDelta1h: -2.3,
      pressureDelta1h: -0.4,
    },
    anomalyCount: 0,
    activeAnomalies: [],
    installedDate: '2023-02-14',
    firmwareVersion: 'v3.8.2-rtos',
    sensorModel: 'Gill MetPak Pro'
  },
  {
    id: 'AWS_011',
    name: 'Begumpet Aerodrome Station',
    region: 'Hyderabad Deccan',
    state: 'Telangana',
    latitude: 17.4475,
    longitude: 78.4716,
    elevation: 531,
    status: 'HEALTHY',
    healthScore: 95,
    lastUpdated: '40s ago',
    currentReadings: {
      temperature: 27.3,
      humidity: 58,
      pressure: 954.1,
      tempDelta1h: +0.3,
      humidityDelta1h: -0.8,
      pressureDelta1h: -0.2,
    },
    anomalyCount: 0,
    activeAnomalies: [],
    installedDate: '2022-10-01',
    firmwareVersion: 'v3.8.2-rtos',
    sensorModel: 'Campbell CR1000X'
  },
  {
    id: 'AWS_012',
    name: 'Shivajinagar Research Unit',
    region: 'Pune Plateau',
    state: 'Maharashtra',
    latitude: 18.5314,
    longitude: 73.8446,
    elevation: 560,
    status: 'HEALTHY',
    healthScore: 87,
    lastUpdated: '15s ago',
    currentReadings: {
      temperature: 25.9,
      humidity: 61,
      pressure: 948.3,
      tempDelta1h: -0.1,
      humidityDelta1h: +1.4,
      pressureDelta1h: +0.1,
    },
    anomalyCount: 0,
    activeAnomalies: [],
    installedDate: '2021-07-22',
    firmwareVersion: 'v3.6.0-rtos',
    sensorModel: 'Vaisala WXT536'
  }
];

export const INITIAL_ANOMALIES: Anomaly[] = [
  {
    id: 'ANM_2026_007',
    stationId: 'AWS_007',
    stationName: 'Palam Field Observatory',
    stationRegion: 'Delhi NCR',
    type: 'SUDDEN_SPIKE',
    typeLabel: 'Sudden Spike',
    severity: 'CRITICAL',
    confidence: 96,
    timestamp: '2026-09-05T18:22:31+05:30',
    metric: 'temperature',
    observedValue: '55.2°C',
    expectedValue: '24.5°C',
    deviation: '+30.7°C (4.8σ)',
    classification: 'SENSOR_FAULT',
    classificationReason: 'Extreme single-sensor temperature jump of +31.8°C in 15 minutes. Adjacent regional stations (Safdarjung, Jaipur) remain nominal with <0.5°C variation.',
    whyFlagged: [
      'Temperature increased by 31.8°C within 15 minutes',
      'Reading is far above historical and recent seasonal baseline (55.2°C vs max 44°C)',
      'Neighboring stations (Safdarjung AWS_001 at 12km) remain completely normal at 24.2°C',
      'ML Spatial-Temporal Autoencoder reconstruction error exceeded 99.8th percentile',
      'Temporal physical gradient consistency check failed (dT/dt > 2.1°C/min)'
    ],
    neighbors: [
      { id: 'AWS_001', name: 'Safdarjung Observatory (12km)', distanceKm: 12, reading: '24.2°C', delta: '+0.4°C', isNormal: true },
      { id: 'AWS_006', name: 'Jaipur Sanganer (240km)', distanceKm: 240, reading: '26.5°C', delta: '+2.1°C', isNormal: true },
      { id: 'AWS_010', name: 'Ahmedabad Plains (750km)', distanceKm: 750, reading: '29.8°C', delta: '+0.7°C', isNormal: true }
    ],
    recommendation: 'Immediate on-site inspection recommended. Thermistor circuit bridge degradation or thermocouple short-circuit detected. Suppress automated numerical model ingestion.',
    status: 'ACTIVE',
    mlModelDetails: {
      modelName: 'ST-Autoencoder + Spatial Isolation Forest v2.4',
      isolationForestScore: 0.964,
      autoencoderReconError: 14.82,
      zScore: 4.81,
      spatialDeviationSigma: 5.12
    }
  },
  {
    id: 'ANM_2026_009',
    stationId: 'AWS_009',
    stationName: 'Borjhar Met Station',
    stationRegion: 'Guwahati Valley',
    type: 'FROZEN_SENSOR',
    typeLabel: 'Frozen Sensor',
    severity: 'MEDIUM',
    confidence: 91,
    timestamp: '2026-09-05T17:45:10+05:30',
    metric: 'temperature',
    observedValue: '21.000°C (Flatline)',
    expectedValue: '23.4°C ± 1.5°C',
    deviation: '0.000°C variation over 180 mins',
    classification: 'SENSOR_FAULT',
    classificationReason: 'Sensor output variance dropped to 0.000 for 12 consecutive cycles despite diurnal sun angle transitions.',
    whyFlagged: [
      'Zero variance recorded across 36 consecutive sampling cycles (3 hours)',
      'Diurnal solar radiation transition failed to register expected thermodynamic delta',
      'ADC converter registers repeat identical bitstream 0x3F800000',
      'Rolling entropy calculation dropped to absolute 0.00 bits'
    ],
    neighbors: [
      { id: 'AWS_005', name: 'Alipore Met Center (520km)', distanceKm: 520, reading: '27.6°C', delta: '+0.3°C', isNormal: true }
    ],
    recommendation: 'Soft reboot telemetry board via remote uplink or schedule field technician for ADC pin inspection.',
    status: 'ACTIVE',
    mlModelDetails: {
      modelName: 'Temporal Entropy & Variance Analyzer',
      isolationForestScore: 0.912,
      zScore: 3.24
    }
  },
  {
    id: 'ANM_2026_006',
    stationId: 'AWS_006',
    stationName: 'Sanganer Airport',
    stationRegion: 'Jaipur Semi-Arid',
    type: 'SENSOR_DRIFT',
    typeLabel: 'Sensor Drift',
    severity: 'MEDIUM',
    confidence: 83,
    timestamp: '2026-09-05T16:15:20+05:30',
    metric: 'humidity',
    observedValue: '35% RH',
    expectedValue: '46% RH',
    deviation: '-11% RH continuous drift',
    classification: 'SENSOR_FAULT',
    classificationReason: 'Capacitive relative humidity polymer degradation causing persistent negative offset against psychrometric reference calculations.',
    whyFlagged: [
      'Linear negative bias drift of -0.8% RH per 24 hours over past 7 days',
      'Significant cross-sensor divergence against pressure/temperature dewpoint model',
      'Spatial correlation with neighboring regional grid fell below 0.62'
    ],
    neighbors: [
      { id: 'AWS_001', name: 'Safdarjung Observatory (240km)', distanceKm: 240, reading: '52% RH', delta: '-1.2%', isNormal: true },
      { id: 'AWS_010', name: 'Ahmedabad Plains (580km)', distanceKm: 580, reading: '42% RH', delta: '-2.3%', isNormal: true }
    ],
    recommendation: 'Recalibrate capacitive hygrometer sensor film during next scheduled maintenance cycle.',
    status: 'ACTIVE',
    mlModelDetails: {
      modelName: 'Kalman Filter Bias Estimator',
      isolationForestScore: 0.835,
      spatialDeviationSigma: 2.76
    }
  },
  {
    id: 'ANM_2026_008',
    stationId: 'AWS_007',
    stationName: 'Palam Field Observatory',
    stationRegion: 'Delhi NCR',
    type: 'MULTIVARIATE_INCONSISTENCY',
    typeLabel: 'Multivariate Inconsistency',
    severity: 'HIGH',
    confidence: 88,
    timestamp: '2026-09-05T18:25:00+05:30',
    metric: 'multivariate',
    observedValue: 'T: 55.2°C | RH: 78% | P: 1009 hPa',
    expectedValue: 'T: 24.5°C | RH: 52% | P: 1012 hPa',
    deviation: 'Physically impossible vapor pressure state',
    classification: 'SENSOR_FAULT',
    classificationReason: 'Thermodynamic impossibility: 55.2°C combined with 78% relative humidity implies dew point > 50°C and vapor pressure violating Clausius-Clapeyron limits for ambient pressure.',
    whyFlagged: [
      'Clausius-Clapeyron physical equation validation failed',
      'Calculated wet-bulb temperature exceeds 48°C (physically incompatible with surrounding atmosphere)',
      'Barometric pressure dropped 8.2 hPa without corresponding barometric wave at nearby stations'
    ],
    neighbors: [
      { id: 'AWS_001', name: 'Safdarjung Observatory (12km)', distanceKm: 12, reading: 'Normal T/RH', delta: '0.0', isNormal: true }
    ],
    recommendation: 'Sensor board multiplexer failure suspected. Quarantine all station data streams immediately.',
    status: 'ACTIVE',
    mlModelDetails: {
      modelName: 'Thermodynamic Consistency Checker v1.2',
      isolationForestScore: 0.884
    }
  },
  {
    id: 'ANM_2026_004',
    stationId: 'AWS_004',
    stationName: 'Meenambakkam Station',
    stationRegion: 'Chennai Coast',
    type: 'SUDDEN_SPIKE',
    typeLabel: 'Sudden Spike (Resolved)',
    severity: 'LOW',
    confidence: 65,
    timestamp: '2026-09-04T14:10:00+05:30',
    metric: 'humidity',
    observedValue: '98% RH',
    expectedValue: '80% RH',
    deviation: '+18% RH transient',
    classification: 'WEATHER_EVENT',
    classificationReason: 'Coincident coastal sea-breeze front passage verified across 5 maritime stations.',
    whyFlagged: [
      'Sudden +18% RH surge coincided with 180° wind direction shift from sea',
      'Neighboring coastal buoys and coastal stations exhibited identical synchronous spikes'
    ],
    neighbors: [
      { id: 'AWS_004', name: 'Meenambakkam', distanceKm: 0, reading: '98% RH', delta: '+18%', isNormal: true }
    ],
    recommendation: 'No hardware fault. Classified as genuine micro-climate sea breeze frontal boundary.',
    status: 'RESOLVED',
    mlModelDetails: {
      modelName: 'Spatial Ensemble Correlator',
      isolationForestScore: 0.65
    }
  }
];

export const INITIAL_NETWORK_SUMMARY: NetworkSummary = {
  totalStations: 12,
  healthyCount: 9,
  degradedCount: 2,
  criticalCount: 1,
  activeAnomaliesCount: 3,
  avgHealthScore: 88,
  detectionAccuracy: 98.4,
  falsePositiveRate: 1.2,
  lastUpdated: '2026-09-05T18:34:00+05:30',
  status: 'ALERT'
};

// 24-hour historical readings generator for each station
export function generateStationTimeSeries(stationId: string, hours: number = 24): StationReading[] {
  const station = INITIAL_STATIONS.find(s => s.id === stationId) || INITIAL_STATIONS[0];
  const now = new Date();
  const readings: StationReading[] = [];

  const baseTemp = stationId === 'AWS_008' ? -2.0 : stationId === 'AWS_004' ? 31.0 : stationId === 'AWS_002' ? 30.0 : 25.0;
  const baseHumidity = stationId === 'AWS_004' ? 80 : stationId === 'AWS_006' ? 35 : 55;
  const basePressure = station.elevation > 1000 ? 670 : station.elevation > 400 ? 950 : 1011;

  for (let i = hours - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600 * 1000);
    const hourOfDay = time.getHours();
    
    // Diurnal variation sine wave
    const diurnalTemp = Math.sin(((hourOfDay - 6) / 24) * 2 * Math.PI) * 4.5;
    const diurnalHumidity = -Math.sin(((hourOfDay - 6) / 24) * 2 * Math.PI) * 12;
    const diurnalPressure = Math.cos(((hourOfDay - 9) / 12) * 2 * Math.PI) * 1.5;

    let temp = Number((baseTemp + diurnalTemp + (Math.sin(i * 1.3) * 0.4)).toFixed(1));
    let humidity = Math.min(100, Math.max(10, Math.round(baseHumidity + diurnalHumidity + (Math.cos(i * 0.9) * 2))));
    let pressure = Number((basePressure + diurnalPressure + (Math.sin(i * 0.5) * 0.3)).toFixed(1));

    let isAnomaly = false;
    let anomalyType: AnomalyType | undefined = undefined;
    let anomalyScore: number | undefined = undefined;

    // Inject anomalies for specific stations in the last few hours
    if (stationId === 'AWS_007' && i <= 2) {
      temp = 55.2;
      humidity = 78;
      pressure = 1009.0;
      isAnomaly = true;
      anomalyType = 'SUDDEN_SPIKE';
      anomalyScore = 96;
    } else if (stationId === 'AWS_009' && i <= 4) {
      temp = 21.0;
      humidity = 89;
      pressure = 1008.2;
      isAnomaly = i <= 2;
      anomalyType = 'FROZEN_SENSOR';
      anomalyScore = 91;
    } else if (stationId === 'AWS_006' && i <= 8) {
      humidity = Math.max(20, humidity - 11);
      if (i <= 3) {
        isAnomaly = true;
        anomalyType = 'SENSOR_DRIFT';
        anomalyScore = 83;
      }
    }

    readings.push({
      timestamp: time.toISOString(),
      temperature: temp,
      humidity: humidity,
      pressure: pressure,
      isAnomaly,
      anomalyType,
      anomalyScore
    });
  }

  return readings;
}

// Demo Scenarios for live demonstration
export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 1,
    title: 'Scenario 1: Nominal Network Operation',
    tagline: 'All Stations Operating Nominally',
    description: 'All 12 Automatic Weather Stations transmitting within expected baseline bounds across India.',
    activeStations: {
      AWS_007: { status: 'HEALTHY', healthScore: 97, currentReadings: { temperature: 24.5, humidity: 53, pressure: 1012.1 } },
      AWS_009: { status: 'HEALTHY', healthScore: 94, currentReadings: { temperature: 22.8, humidity: 82, pressure: 1009.4 } },
      AWS_006: { status: 'HEALTHY', healthScore: 92, currentReadings: { temperature: 27.1, humidity: 44, pressure: 973.5 } }
    },
    activeAnomalies: [],
    eventAnalysis: {
      title: 'REGIONAL STABILITY CHECK',
      type: 'WEATHER_EVENT',
      badgeText: 'NETWORK STABLE',
      summary: 'All spatial and temporal gradients across 12 observatories remain within 1.2σ of climatological norms.',
      stations: [
        { id: 'AWS_001', name: 'Delhi Safdarjung', delta: '+0.3°C', reading: '24.2°C' },
        { id: 'AWS_007', name: 'Delhi Palam', delta: '+0.4°C', reading: '24.5°C' },
        { id: 'AWS_006', name: 'Jaipur Sanganer', delta: '+0.5°C', reading: '27.1°C' },
        { id: 'AWS_010', name: 'Ahmedabad Met', delta: '+0.2°C', reading: '29.8°C' }
      ]
    }
  },
  {
    id: 2,
    title: 'Scenario 2: Regional Weather Front Passage',
    tagline: 'Coincident Regional Shift (Genuine Weather Event)',
    description: '4 neighboring stations in Western India detect a synchronized +3.2°C temperature rise with gust front passage.',
    activeStations: {
      AWS_001: { status: 'HEALTHY', healthScore: 95, currentReadings: { temperature: 27.3, humidity: 48, pressure: 1008.2, tempDelta1h: +3.1 } },
      AWS_007: { status: 'HEALTHY', healthScore: 94, currentReadings: { temperature: 27.9, humidity: 46, pressure: 1007.9, tempDelta1h: +3.4 } },
      AWS_006: { status: 'HEALTHY', healthScore: 91, currentReadings: { temperature: 30.1, humidity: 32, pressure: 970.0, tempDelta1h: +3.0 } },
      AWS_010: { status: 'HEALTHY', healthScore: 93, currentReadings: { temperature: 33.0, humidity: 38, pressure: 1004.8, tempDelta1h: +3.2 } }
    },
    activeAnomalies: [],
    eventAnalysis: {
      title: 'REGIONAL CHANGE CORRELATION',
      type: 'WEATHER_EVENT',
      badgeText: 'LIKELY WEATHER EVENT',
      summary: '4 nearby stations shifted synchronously within a 15-minute window. Spatial autoencoder confirms wide-area meteorological front.',
      stations: [
        { id: 'AWS_001', name: 'Delhi Safdarjung', delta: '+3.1°C', reading: '27.3°C' },
        { id: 'AWS_007', name: 'Delhi Palam', delta: '+3.4°C', reading: '27.9°C' },
        { id: 'AWS_006', name: 'Jaipur Sanganer', delta: '+3.0°C', reading: '30.1°C' },
        { id: 'AWS_010', name: 'Ahmedabad Met', delta: '+3.2°C', reading: '33.0°C' }
      ]
    }
  },
  {
    id: 3,
    title: 'Scenario 3: Severe Sudden Spike (Sensor Fault)',
    tagline: 'Isolated Single-Station Anomaly (55.2°C)',
    description: 'AWS_007 jumps from 24.2°C to 55.2°C while all surrounding stations remain strictly normal.',
    activeStations: {
      AWS_007: {
        status: 'CRITICAL',
        healthScore: 61,
        currentReadings: { temperature: 55.2, humidity: 78, pressure: 1009.0, tempDelta1h: +31.8 }
      }
    },
    activeAnomalies: [INITIAL_ANOMALIES[0], INITIAL_ANOMALIES[3]],
    eventAnalysis: {
      title: 'ISOLATED DEVIATION ANALYSIS',
      type: 'SENSOR_FAULT',
      badgeText: 'LIKELY SENSOR FAULT',
      summary: 'AWS_007 exhibited a +31.8°C instantaneous jump while 3 adjacent regional observatories remained unchanged.',
      stations: [
        { id: 'AWS_001', name: 'Delhi Safdarjung', delta: '+0.4°C', reading: '24.2°C' },
        { id: 'AWS_007', name: 'Delhi Palam', delta: '+31.8°C', reading: '55.2°C', isHighlighted: true },
        { id: 'AWS_006', name: 'Jaipur Sanganer', delta: '+0.3°C', reading: '26.5°C' },
        { id: 'AWS_010', name: 'Ahmedabad Met', delta: '+0.5°C', reading: '29.8°C' }
      ]
    }
  },
  {
    id: 4,
    title: 'Scenario 4: Frozen Sensor Telemetry',
    tagline: 'Station Flatline & Zero Variance (Guwahati AWS_009)',
    description: 'AWS_009 enters frozen ADC state with 0.000°C variation over 3 consecutive hours.',
    activeStations: {
      AWS_009: {
        status: 'DEGRADED',
        healthScore: 74,
        currentReadings: { temperature: 21.0, humidity: 89, pressure: 1008.2, tempDelta1h: 0.0 }
      }
    },
    activeAnomalies: [INITIAL_ANOMALIES[1]],
    eventAnalysis: {
      title: 'ENTROPY & VARIANCE FAILURE',
      type: 'SENSOR_FAULT',
      badgeText: 'FROZEN SENSOR FAULT',
      summary: 'ADC hardware register locked on AWS_009. Sensor output entropy dropped to 0.00 bits during peak solar cycle.',
      stations: [
        { id: 'AWS_009', name: 'Guwahati Borjhar', delta: '0.000°C (3h flatline)', reading: '21.0°C', isHighlighted: true },
        { id: 'AWS_005', name: 'Kolkata Alipore', delta: '+0.8°C (Normal cycle)', reading: '27.6°C' }
      ]
    }
  },
  {
    id: 5,
    title: 'Scenario 5: Repeated Faults & Sensor Degradation',
    tagline: 'Progressive Sensor Health Deterioration',
    description: 'AWS_007 health degrades (95 → 87 → 74 → 61). Automatic quarantine and maintenance dispatch triggered.',
    activeStations: {
      AWS_007: {
        status: 'CRITICAL',
        healthScore: 61,
        currentReadings: { temperature: 55.2, humidity: 78, pressure: 1009.0, tempDelta1h: +31.8 }
      },
      AWS_006: {
        status: 'DEGRADED',
        healthScore: 78,
        currentReadings: { temperature: 26.5, humidity: 35, pressure: 972.1 }
      },
      AWS_009: {
        status: 'DEGRADED',
        healthScore: 74,
        currentReadings: { temperature: 21.0, humidity: 89, pressure: 1008.2 }
      }
    },
    activeAnomalies: INITIAL_ANOMALIES.filter(a => a.status === 'ACTIVE'),
    eventAnalysis: {
      title: 'HEALTH DEGRADATION PATTERN',
      type: 'SENSOR_FAULT',
      badgeText: 'MAINTENANCE RECOMMENDED',
      summary: 'Cumulative failure rate for AWS_007 crossed critical threshold. Automated numerical weather model feed isolated.',
      stations: [
        { id: 'AWS_007', name: 'Palam Field Observatory', delta: 'Health: 61/100 (CRITICAL)', reading: '55.2°C', isHighlighted: true },
        { id: 'AWS_009', name: 'Guwahati Borjhar', delta: 'Health: 74/100 (DEGRADED)', reading: '21.0°C' },
        { id: 'AWS_006', name: 'Jaipur Sanganer', delta: 'Health: 78/100 (DEGRADED)', reading: '35% RH' }
      ]
    }
  }
];
