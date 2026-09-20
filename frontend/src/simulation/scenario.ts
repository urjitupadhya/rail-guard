// ─── RAILGUARD-X Demo Scenario ───────────────────────────────────────────────
// All values marked [SIM] are simulated for demonstration purposes.

export interface Waypoint {
  x: number; // % of map width
  y: number; // % of map height
  label: string;
}

export interface HeatCell {
  col: number;
  row: number;
  basePpm: number; // concentration when source first appears
  peakPpm: number; // concentration at full demo
}

// Robot patrol waypoints (Platform 3 SVG canvas, 0-100%)
export const PATROL_WAYPOINTS: Waypoint[] = [
  { x: 15, y: 30, label: 'Entry A' },
  { x: 35, y: 30, label: 'Zone A North' },
  { x: 55, y: 30, label: 'Zone B North' },
  { x: 75, y: 30, label: 'Zone C North' },
  { x: 75, y: 70, label: 'Zone C South' },
  { x: 55, y: 70, label: 'Zone B South' },
  { x: 35, y: 70, label: 'Zone A South' },
  { x: 15, y: 70, label: 'Entry B' },
];

// Search path — moves northeast toward source
export const SEARCH_WAYPOINTS: Waypoint[] = [
  { x: 35, y: 70, label: 'Search Start' },
  { x: 45, y: 60, label: 'Reading ↑' },
  { x: 55, y: 50, label: 'Reading ↑↑' },
  { x: 65, y: 42, label: 'Reading ↑↑↑' },
  { x: 72, y: 35, label: 'Approaching' },
  { x: 76, y: 28, label: 'Source Vicinity' },
];

// Simulated source location (Restricted Locker Area)
export const SOURCE_LOCATION: Waypoint = { x: 80, y: 22, label: 'Restricted Locker Area' };

// Chemical heatmap grid (12 cols × 8 rows, origin top-left)
// Each cell: [col, row, basePpm, peakPpm]
export const HEATMAP_CELLS: HeatCell[] = [
  // Epicenter (source area — cols 9-11, rows 0-2)
  { col: 11, row: 0, basePpm: 0, peakPpm: 93 },
  { col: 10, row: 0, basePpm: 0, peakPpm: 81 },
  { col: 11, row: 1, basePpm: 0, peakPpm: 78 },
  { col: 10, row: 1, basePpm: 0, peakPpm: 68 },
  { col: 9,  row: 0, basePpm: 0, peakPpm: 61 },
  { col: 9,  row: 1, basePpm: 0, peakPpm: 54 },
  { col: 11, row: 2, basePpm: 0, peakPpm: 51 },
  { col: 10, row: 2, basePpm: 0, peakPpm: 44 },
  // Spreading plume (downwind)
  { col: 9,  row: 2, basePpm: 0, peakPpm: 39 },
  { col: 8,  row: 1, basePpm: 0, peakPpm: 34 },
  { col: 8,  row: 2, basePpm: 0, peakPpm: 28 },
  { col: 7,  row: 2, basePpm: 0, peakPpm: 22 },
  { col: 7,  row: 3, basePpm: 0, peakPpm: 18 },
  { col: 8,  row: 3, basePpm: 0, peakPpm: 15 },
  { col: 6,  row: 3, basePpm: 0, peakPpm: 12 },
  { col: 9,  row: 3, basePpm: 0, peakPpm: 10 },
];

// Sensor readings progression [SIM]
export const SENSOR_PROGRESSION = {
  chemical: [12, 14, 16, 18, 22, 26, 31, 39, 47, 57, 68, 78, 87, 93],
  localizationConfidence: [21, 24, 28, 34, 41, 48, 56, 62, 67, 74, 79, 83, 87],
  airflow: { speed: 1.8, direction: 74 }, // m/s and degrees
};

// Evidence hash [SIM]
export const EVIDENCE_HASH = '8c91a4f2d73e...72fab91c';
export const EVIDENCE_HASH_FULL = '8c91a4f2d73e9b2c5e814f3a6d7c2b9a1e8f3d7c4a2b9e1f8d3c72fab91c4e2';

// Demo timing (milliseconds)
export const DEMO_TIMING = {
  PATROL_DURATION: 14000,       // 0–14s: patrol
  ANOMALY_DELAY: 15000,         // 15s: anomaly detected
  SEARCH_START: 18000,          // 18s: search mode
  HEATMAP_BUILD: 20000,         // 20s: heatmap starts
  AIRFLOW_SHOW: 30000,          // 30s: airflow arrows
  LOCALIZE_START: 40000,        // 40s: robot moves to source
  SOURCE_LOCATED: 70000,        // 70s: source localized
  VERIFY_START: 75000,          // 75s: verification starts
  VERIFY_COMPLETE: 95000,       // 95s: verification complete
  ALERT_SENT: 100000,           // 100s: RPF alert
  EVIDENCE_RECORDED: 110000,    // 110s: evidence hash
  REPORT_READY: 125000,         // 125s: report generated
};

export const DEFAULT_SCENARIO = {
  name: 'Platform 3 — Suspicious Package',
  location: 'Platform 3, Central Railway Station',
  robot: 'ROVER-01',
  threatId: 'RGX-2026-001',
  detectionTime: '13:05:27',
  sourceLocalizedTime: '13:05:34',
  verificationTime: '13:05:36',
  alertTime: '13:05:38',
  evidenceTime: '13:05:39',
  reportTime: '13:05:42',
};
