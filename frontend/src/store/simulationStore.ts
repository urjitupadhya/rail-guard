// ─── RAILGUARD-X Enhanced Live Simulation Store (Zustand) ────────────────────
import { create } from 'zustand';
import {
  PATROL_WAYPOINTS,
  SEARCH_WAYPOINTS,
  SOURCE_LOCATION,
  HEATMAP_CELLS,
  SENSOR_PROGRESSION,
  DEMO_TIMING,
  DEFAULT_SCENARIO,
  EVIDENCE_HASH,
} from '../simulation/scenario';
import { soundEffects } from '../utils/audio';

export type DemoStage =
  | 'IDLE'
  | 'PATROLLING'
  | 'ANOMALY_DETECTED'
  | 'SEARCHING'
  | 'LOCALIZING'
  | 'SOURCE_LOCATED'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'ALERT_SENT'
  | 'EVIDENCE_RECORDED'
  | 'REPORT_GENERATED';

export interface RobotState {
  id: string;
  name: string;
  type: 'quadruped' | 'handheld';
  x: number;
  y: number;
  heading: number; // in degrees
  battery: number;
  mode: 'IDLE' | 'PATROL' | 'SEARCH' | 'VERIFY' | 'MANUAL' | 'READY';
  status: 'ONLINE' | 'OFFLINE' | 'WARNING';
  connectivity: 'GOOD' | 'FAIR' | 'POOR';
  sensors: { chemical: boolean; airflow: boolean; rgb: boolean; thermal: boolean; lidar: boolean };
}

export interface SensorData {
  chemical1: number;
  chemical2: number;
  chemical3: number;
  chemical4: number;
  temperature: number;
  humidity: number;
  airflowSpeed: number;
  airflowDirection: number;
  history: { t: number; c1: number; c2: number; c3: number; c4: number }[];
}

export interface ThreatState {
  id: string;
  status: DemoStage;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: string;
  detectedAt: string | null;
  localizedAt: string | null;
  verifiedAt: string | null;
  chemicalConfidence: number;
  visualConfidence: number;
  thermalConfidence: number;
  fusionConfidence: number;
  localizationConfidence: number;
  sourceX: number;
  sourceY: number;
}

export interface HeatmapState {
  cells: { col: number; row: number; ppm: number }[];
  visible: boolean;
}

export interface TimelineEvent {
  time: string;
  icon: string;
  label: string;
  color: string;
}

export interface SimulationStore {
  // State
  stage: DemoStage;
  isRunning: boolean;
  simSpeed: number; // 1x, 2x, 4x
  isMuted: boolean;
  isSidebarOpen: boolean;
  manualControl: boolean;
  robots: RobotState[];
  sensors: SensorData;
  threat: ThreatState;
  heatmap: HeatmapState;
  showAirflow: boolean;
  showSourceMarker: boolean;
  showThreatAlert: boolean;
  showVerification: boolean;
  timeline: TimelineEvent[];
  evidenceHash: string | null;
  reportReady: boolean;
  patrolIndex: number;
  searchIndex: number;

  // Actions
  startDemo: () => void;
  resetDemo: () => void;
  setStage: (stage: DemoStage) => void;
  setSimSpeed: (speed: number) => void;
  toggleMute: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setManualControl: (manual: boolean) => void;
  manualMoveRover: (dx: number, dy: number) => void;
  teleportRover: (x: number, y: number) => void;
  injectAnomalyAt: (x?: number, y?: number) => void;
  injectAnomaly: () => void;
  startSearch: () => void;
  localizeSource: () => void;
  verifyThreat: () => void;
  recordEvidence: () => void;
  generateReport: () => void;
  dismissAlert: () => void;
  updateRobotPosition: (id: string, x: number, y: number) => void;
  updateSensors: (delta: Partial<SensorData>) => void;
  updateHeatmap: (progress: number) => void;
  addTimelineEvent: (event: TimelineEvent) => void;
}

const INITIAL_ROBOTS: RobotState[] = [
  {
    id: 'ROVER-01',
    name: 'ROVER-01',
    type: 'quadruped',
    x: PATROL_WAYPOINTS[0].x,
    y: PATROL_WAYPOINTS[0].y,
    heading: 0,
    battery: 94,
    mode: 'IDLE',
    status: 'ONLINE',
    connectivity: 'GOOD',
    sensors: { chemical: true, airflow: true, rgb: true, thermal: true, lidar: true },
  },
  {
    id: 'ROVER-02',
    name: 'ROVER-02',
    type: 'quadruped',
    x: 20,
    y: 55,
    heading: 90,
    battery: 91,
    mode: 'PATROL',
    status: 'ONLINE',
    connectivity: 'GOOD',
    sensors: { chemical: true, airflow: true, rgb: true, thermal: true, lidar: true },
  },
  {
    id: 'HANDHELD-A',
    name: 'HANDHELD-A',
    type: 'handheld',
    x: 0,
    y: 0,
    heading: 0,
    battery: 84,
    mode: 'READY',
    status: 'ONLINE',
    connectivity: 'GOOD',
    sensors: { chemical: true, airflow: false, rgb: true, thermal: true, lidar: false },
  },
  {
    id: 'HANDHELD-B',
    name: 'HANDHELD-B',
    type: 'handheld',
    x: 0,
    y: 0,
    heading: 0,
    battery: 67,
    mode: 'READY',
    status: 'ONLINE',
    connectivity: 'FAIR',
    sensors: { chemical: true, airflow: false, rgb: true, thermal: true, lidar: false },
  },
];

const INITIAL_THREAT: ThreatState = {
  id: DEFAULT_SCENARIO.threatId,
  status: 'IDLE',
  riskLevel: 'LOW',
  location: 'Platform 3',
  detectedAt: null,
  localizedAt: null,
  verifiedAt: null,
  chemicalConfidence: 0,
  visualConfidence: 0,
  thermalConfidence: 0,
  fusionConfidence: 0,
  localizationConfidence: 0,
  sourceX: SOURCE_LOCATION.x,
  sourceY: SOURCE_LOCATION.y,
};

const INITIAL_SENSORS: SensorData = {
  chemical1: 4.2, chemical2: 3.1, chemical3: 2.5, chemical4: 1.8,
  temperature: 27.4, humidity: 54,
  airflowSpeed: 1.8, airflowDirection: 74,
  history: Array.from({ length: 20 }, (_, i) => ({
    t: i, c1: 4.2 + Math.sin(i) * 0.4, c2: 3.1, c3: 2.5, c4: 1.8,
  })),
};

let demoTimer: ReturnType<typeof setTimeout> | null = null;
let moveTimer: ReturnType<typeof setInterval> | null = null;
let sensorTimer: ReturnType<typeof setInterval> | null = null;
let ambientTicker: ReturnType<typeof setInterval> | null = null;

function clearTimers() {
  if (demoTimer) { clearTimeout(demoTimer); demoTimer = null; }
  if (moveTimer) { clearInterval(moveTimer); moveTimer = null; }
  if (sensorTimer) { clearInterval(sensorTimer); sensorTimer = null; }
}

export const useSimStore = create<SimulationStore>((set, get) => ({
  stage: 'IDLE',
  isRunning: false,
  simSpeed: 1,
  isMuted: false,
  isSidebarOpen: false,
  manualControl: false,
  robots: INITIAL_ROBOTS,
  sensors: INITIAL_SENSORS,
  threat: INITIAL_THREAT,
  heatmap: { cells: [], visible: false },
  showAirflow: false,
  showSourceMarker: false,
  showThreatAlert: false,
  showVerification: false,
  timeline: [],
  evidenceHash: null,
  reportReady: false,
  patrolIndex: 0,
  searchIndex: 0,

  setStage: (stage) => set({ stage }),

  setSimSpeed: (simSpeed) => set({ simSpeed }),

  toggleMute: () => {
    const isMuted = soundEffects.toggleMute();
    set({ isMuted });
  },

  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),

  setManualControl: (manualControl) => {
    soundEffects.playBlip();
    set((s) => ({
      manualControl,
      robots: s.robots.map((r) =>
        r.id === 'ROVER-01' ? { ...r, mode: manualControl ? 'MANUAL' : 'IDLE' } : r
      ),
    }));
  },

  // Manual Keyboard / D-Pad Movement
  manualMoveRover: (dx, dy) => {
    const { robots, threat, heatmap } = get();
    const rover = robots.find((r) => r.id === 'ROVER-01');
    if (!rover) return;

    // Boundaries of Platform 3 (in percentage 5% to 95%)
    soundEffects.playRoverMotor();
    const newX = Math.max(6, Math.min(94, rover.x + dx));
    const newY = Math.max(12, Math.min(88, rover.y + dy));

    // Calculate heading in degrees
    const heading = Math.round((Math.atan2(dy, dx) * 180) / Math.PI);

    // Distance to threat source
    const dist = Math.hypot(newX - threat.sourceX, newY - threat.sourceY);

    // Dynamic Chemical Sniffing based on distance
    let proximityPpm = 4;
    if (heatmap.visible || ['ANOMALY_DETECTED', 'SEARCHING', 'LOCALIZING', 'SOURCE_LOCATED'].includes(threat.status)) {
      proximityPpm = Math.max(4, Math.round(92 * Math.exp(-dist / 22)));
      if (proximityPpm > 35) {
        soundEffects.playGeigerClick();
      }
    }

    set((s) => ({
      robots: s.robots.map((r) =>
        r.id === 'ROVER-01' ? { ...r, x: newX, y: newY, heading } : r
      ),
    }));

    get().updateSensors({
      chemical1: proximityPpm,
      chemical2: Math.round(proximityPpm * 0.75),
      chemical3: Math.round(proximityPpm * 0.5),
      chemical4: Math.round(proximityPpm * 0.3),
    });
  },

  // Click-To-Deploy Waypoint
  teleportRover: (x, y) => {
    soundEffects.playSonarPing();
    const cleanX = Math.max(6, Math.min(94, x));
    const cleanY = Math.max(12, Math.min(88, y));
    get().updateRobotPosition('ROVER-01', cleanX, cleanY);
    get().addTimelineEvent({
      time: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      icon: '📍',
      label: `ROVER-01 manual waypoint deployed: [${Math.round(cleanX)}%, ${Math.round(cleanY)}%]`,
      color: 'accent',
    });
  },

  updateRobotPosition: (id, x, y) =>
    set((s) => ({
      robots: s.robots.map((r) => (r.id === id ? { ...r, x, y } : r)),
    })),

  updateSensors: (delta) =>
    set((s) => {
      const next = { ...s.sensors, ...delta };
      const last = s.sensors.history[s.sensors.history.length - 1];
      const t = (last?.t ?? 0) + 1;
      const newHistory = [
        ...s.sensors.history.slice(-49),
        { t, c1: next.chemical1, c2: next.chemical2, c3: next.chemical3, c4: next.chemical4 },
      ];
      return { sensors: { ...next, history: newHistory } };
    }),

  updateHeatmap: (progress) => {
    const cells = HEATMAP_CELLS.map((c) => ({
      col: c.col,
      row: c.row,
      ppm: Math.round(c.peakPpm * progress),
    })).filter((c) => c.ppm > 0);
    set({ heatmap: { cells, visible: true } });
  },

  addTimelineEvent: (event) =>
    set((s) => ({ timeline: [...s.timeline, event] })),

  dismissAlert: () => set({ showThreatAlert: false }),

  // Custom Threat Injection
  injectAnomalyAt: (customX, customY) => {
    soundEffects.playAlertSiren();
    const x = customX ?? SOURCE_LOCATION.x;
    const y = customY ?? SOURCE_LOCATION.y;
    const now = new Date().toLocaleTimeString('en-IN', { hour12: false });

    set((s) => ({
      stage: 'ANOMALY_DETECTED',
      showThreatAlert: true,
      threat: {
        ...s.threat,
        status: 'ANOMALY_DETECTED',
        riskLevel: 'HIGH',
        detectedAt: now,
        chemicalConfidence: 85,
        sourceX: x,
        sourceY: y,
      },
      robots: s.robots.map((r) =>
        r.id === 'ROVER-01' ? { ...r, mode: 'SEARCH' } : r
      ),
    }));
    get().updateHeatmap(0.65);
    get().addTimelineEvent({
      time: now,
      icon: '🟠',
      label: `CBRN anomaly detected (85% confidence) at [${Math.round(x)}%, ${Math.round(y)}%]`,
      color: 'warn',
    });
  },

  injectAnomaly: () => {
    get().injectAnomalyAt(SOURCE_LOCATION.x, SOURCE_LOCATION.y);
  },

  startSearch: () => {
    const { addTimelineEvent } = get();
    soundEffects.playBlip();
    set({ stage: 'SEARCHING' });
    const now = new Date().toLocaleTimeString('en-IN', { hour12: false });
    addTimelineEvent({ time: now, icon: '🔎', label: 'Airflow triangulation active (1.8 m/s @ 74° NE)', color: 'info' });
    setTimeout(() => {
      set({ showAirflow: true });
      get().addTimelineEvent({ time: new Date().toLocaleTimeString('en-IN', { hour12: false }), icon: '📍', label: 'Gradient tracking pointing towards Column C4', color: 'info' });
    }, 2000 / get().simSpeed);
  },

  localizeSource: () => {
    const { addTimelineEvent } = get();
    soundEffects.playLockChime();
    const now = new Date().toLocaleTimeString('en-IN', { hour12: false });
    set((s) => ({
      stage: 'SOURCE_LOCATED',
      showSourceMarker: true,
      threat: {
        ...s.threat,
        status: 'SOURCE_LOCATED',
        riskLevel: 'HIGH',
        localizedAt: now,
        localizationConfidence: 89,
      },
    }));
    addTimelineEvent({ time: now, icon: '🎯', label: 'Threat source isolated: Column C4 Lockers [SIM]', color: 'danger' });
  },

  verifyThreat: () => {
    const { addTimelineEvent } = get();
    soundEffects.playCameraShutter();
    const now = new Date().toLocaleTimeString('en-IN', { hour12: false });
    set((s) => ({
      stage: 'VERIFYING',
      showVerification: true,
      threat: {
        ...s.threat,
        status: 'VERIFYING',
        verifiedAt: now,
        visualConfidence: 88,
        thermalConfidence: 82,
        fusionConfidence: 91,
      },
    }));
    addTimelineEvent({ time: now, icon: '📷', label: 'Optical + Thermal neural verification active', color: 'info' });
    setTimeout(() => {
      soundEffects.playLockChime();
      set((s) => ({ stage: 'VERIFIED', threat: { ...s.threat, status: 'VERIFIED', riskLevel: 'HIGH' } }));
      get().addTimelineEvent({ time: new Date().toLocaleTimeString('en-IN', { hour12: false }), icon: '🔴', label: 'CBRN Threat Confirmed — Multimodal Fusion 91%', color: 'danger' });
    }, 2500 / get().simSpeed);
  },

  recordEvidence: () => {
    const { addTimelineEvent } = get();
    soundEffects.playBlockchainSeal();
    const now = new Date().toLocaleTimeString('en-IN', { hour12: false });
    set((s) => ({
      stage: 'EVIDENCE_RECORDED',
      evidenceHash: EVIDENCE_HASH,
      threat: { ...s.threat, status: 'EVIDENCE_RECORDED' },
    }));
    addTimelineEvent({ time: now, icon: '🔐', label: `Cryptographic Audit Block: ${EVIDENCE_HASH}`, color: 'accent' });
    setTimeout(() => {
      soundEffects.playRadioSquelch();
      addTimelineEvent({ time: new Date().toLocaleTimeString('en-IN', { hour12: false }), icon: '👮', label: 'RPF Tactical Dispatch acknowledged', color: 'accent' });
    }, 1200 / get().simSpeed);
  },

  generateReport: () => {
    soundEffects.playReportChime();
    const now = new Date().toLocaleTimeString('en-IN', { hour12: false });
    set({ stage: 'REPORT_GENERATED', reportReady: true });
    get().addTimelineEvent({ time: now, icon: '📄', label: 'Incident dossier generated for RPF Command', color: 'accent' });
  },

  startDemo: () => {
    clearTimers();
    soundEffects.playBlip();
    get().resetDemo();

    const speed = get().simSpeed;

    setTimeout(() => {
      set({ isRunning: true, stage: 'PATROLLING' });
      const now = new Date().toLocaleTimeString('en-IN', { hour12: false });
      get().addTimelineEvent({ time: now, icon: '🟢', label: 'ROVER-01 autonomous patrol started', color: 'accent' });

      // Continuous robot patrol movement
      let pIdx = 0;
      moveTimer = setInterval(() => {
        const { stage } = get();
        if (stage === 'IDLE') { clearInterval(moveTimer!); return; }

        if (stage === 'PATROLLING') {
          pIdx = (pIdx + 1) % PATROL_WAYPOINTS.length;
          const wp = PATROL_WAYPOINTS[pIdx];
          get().updateRobotPosition('ROVER-01', wp.x, wp.y);
        }
      }, 1800 / speed);

      // Sensor progression
      let sensorStep = 0;
      sensorTimer = setInterval(() => {
        const { stage } = get();
        if (stage === 'IDLE') { clearInterval(sensorTimer!); return; }
        sensorStep++;
        const prog = SENSOR_PROGRESSION;
        const stepIdx = Math.min(sensorStep, prog.chemical.length - 1);
        if (['SEARCHING', 'LOCALIZING', 'SOURCE_LOCATED', 'VERIFYING', 'VERIFIED', 'ALERT_SENT', 'EVIDENCE_RECORDED', 'REPORT_GENERATED'].includes(stage)) {
          const c1 = prog.chemical[stepIdx];
          const c2 = Math.round(c1 * 0.76);
          const c3 = Math.round(c1 * 0.52);
          const c4 = Math.round(c1 * 0.33);
          get().updateSensors({ chemical1: c1, chemical2: c2, chemical3: c3, chemical4: c4 });
          const heatProgress = Math.min(stepIdx / (prog.chemical.length - 1), 1);
          get().updateHeatmap(heatProgress);
        }
      }, 1500 / speed);

      // Progression Schedule scaled by speed
      setTimeout(() => get().injectAnomaly(), DEMO_TIMING.ANOMALY_DELAY / speed);
      setTimeout(() => get().startSearch(), DEMO_TIMING.SEARCH_START / speed);

      setTimeout(() => {
        let sIdx = 0;
        const searchMove = setInterval(() => {
          if (sIdx >= SEARCH_WAYPOINTS.length) { clearInterval(searchMove); return; }
          const wp = SEARCH_WAYPOINTS[sIdx++];
          get().updateRobotPosition('ROVER-01', wp.x, wp.y);
        }, 3500 / speed);
      }, DEMO_TIMING.LOCALIZE_START / speed);

      setTimeout(() => get().localizeSource(), DEMO_TIMING.SOURCE_LOCATED / speed);

      setTimeout(() => {
        soundEffects.playAlertSiren();
        set({ stage: 'ALERT_SENT', showThreatAlert: true });
        get().addTimelineEvent({
          time: new Date().toLocaleTimeString('en-IN', { hour12: false }),
          icon: '🚨',
          label: 'RPF tactical alert dispatched — HIGH PRIORITY',
          color: 'danger',
        });
      }, DEMO_TIMING.VERIFY_START / speed);

      setTimeout(() => get().verifyThreat(), DEMO_TIMING.VERIFY_COMPLETE / speed);
      setTimeout(() => get().recordEvidence(), DEMO_TIMING.EVIDENCE_RECORDED / speed);
      setTimeout(() => get().generateReport(), DEMO_TIMING.REPORT_READY / speed);
    }, 100);
  },

  resetDemo: () => {
    clearTimers();
    soundEffects.playBlip();
    set({
      stage: 'IDLE',
      isRunning: false,
      manualControl: false,
      robots: INITIAL_ROBOTS,
      sensors: INITIAL_SENSORS,
      threat: INITIAL_THREAT,
      heatmap: { cells: [], visible: false },
      showAirflow: false,
      showSourceMarker: false,
      showThreatAlert: false,
      showVerification: false,
      timeline: [],
      evidenceHash: null,
      reportReady: false,
      patrolIndex: 0,
      searchIndex: 0,
    });
  },
}));

// ─── Ambient Live Telemetry Heartbeat (Runs continually) ──────────────────────
if (typeof window !== 'undefined' && !ambientTicker) {
  ambientTicker = setInterval(() => {
    const store = useSimStore.getState();
    const { stage, isRunning, manualControl, robots } = store;

    // Ambient micro-fluctuations on sensors
    if (stage === 'IDLE' || stage === 'PATROLLING') {
      const jitter = (Math.random() - 0.5) * 0.4;
      const c1 = Math.max(2, +(4.2 + jitter).toFixed(1));
      store.updateSensors({
        chemical1: c1,
        temperature: +(27.3 + (Math.random() - 0.5) * 0.2).toFixed(1),
        humidity: Math.round(54 + (Math.random() - 0.5) * 2),
      });
    }

    // Passive battery consumption
    const rover = robots.find((r) => r.id === 'ROVER-01');
    if (rover && Math.random() < 0.2) {
      store.updateRobotPosition(
        'ROVER-01',
        rover.x,
        rover.y
      );
    }
  }, 1000);
}
