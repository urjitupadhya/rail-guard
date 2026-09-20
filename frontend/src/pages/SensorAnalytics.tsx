import React from 'react';
import { useSimStore } from '../store/simulationStore';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
  AreaChart, Area,
} from 'recharts';
import ConfidenceBar from '../components/ConfidenceBar';
import { Wind, Compass, Target } from 'lucide-react';

const TOOLTIP_STYLE = {
  backgroundColor: '#0F172A',
  border: '1px solid #334155',
  borderRadius: '4px',
  fontSize: '11px',
  fontFamily: 'JetBrains Mono',
};

export default function SensorAnalytics() {
  const { sensors, stage, showAirflow, threat } = useSimStore();
  const data = sensors.history;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-fg text-base font-bold tracking-widest uppercase">Sensor Analytics</h1>
        <p className="text-fg-muted text-xs mt-0.5">Real-time chemical sensor readings & source estimation <span className="sim-badge">[SIMULATION DATA]</span></p>
      </div>

      {/* Sensor Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sensor 1 — highest reading (upwind proxy) */}
        <SensorChart
          title="Sensor 1 — Chemical (Upwind Reference)"
          data={data.map((d) => ({ t: d.t, v: d.c1 }))}
          color="#22C55E"
          current={sensors.chemical1}
          note="Highest reading — closest to source direction"
        />
        {/* Sensor 2 */}
        <SensorChart
          title="Sensor 2 — Chemical (Zone B)"
          data={data.map((d) => ({ t: d.t, v: d.c2 }))}
          color="#3B82F6"
          current={sensors.chemical2}
          note="Second highest — downwind from source"
        />
        {/* Sensor 3 */}
        <SensorChart
          title="Sensor 3 — Chemical (Zone A)"
          data={data.map((d) => ({ t: d.t, v: d.c3 }))}
          color="#F59E0B"
          current={sensors.chemical3}
          note="Lower reading — further from source"
        />
        {/* Sensor 4 */}
        <SensorChart
          title="Sensor 4 — Chemical (Baseline)"
          data={data.map((d) => ({ t: d.t, v: d.c4 }))}
          color="#94A3B8"
          current={sensors.chemical4}
          note="Baseline reference — minimal concentration"
        />
      </div>

      {/* Bottom Panel: Airflow + Source Estimation + Fusion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Airflow */}
        <div className="card space-y-3">
          <div className="flex items-center gap-2">
            <Wind size={13} className="text-info" />
            <span className="label">Airflow Analysis</span>
          </div>
          <div className="flex items-center justify-center py-4">
            {/* Compass */}
            <div className="relative w-24 h-24">
              <div className="w-full h-full rounded-full border-2 border-border flex items-center justify-center relative">
                {['N','E','S','W'].map((d, i) => (
                  <div key={d}
                    className="absolute text-[9px] text-fg-muted"
                    style={{
                      top: i === 0 ? '-2px' : i === 2 ? 'auto' : '50%',
                      bottom: i === 2 ? '-2px' : 'auto',
                      left: i === 3 ? '-4px' : i === 1 ? 'auto' : '50%',
                      right: i === 1 ? '-4px' : 'auto',
                      transform: [0, 2].includes(i) ? 'translateX(-50%)' : [1, 3].includes(i) ? 'translateY(-50%)' : '',
                    }}
                  >{d}</div>
                ))}
                {/* Arrow */}
                <div className="w-2 h-10 relative" style={{ transform: `rotate(${sensors.airflowDirection}deg)` }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0"
                    style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: '12px solid #3B82F6' }} />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 bg-info/40 rounded-b" style={{ height: '28px' }} />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-fg-muted">Direction</span><span className="text-info">74° → NE</span></div>
            <div className="flex justify-between"><span className="text-fg-muted">Speed</span><span className="text-info">{sensors.airflowSpeed} m/s</span></div>
            <div className="flex justify-between"><span className="text-fg-muted">Humidity</span><span className="text-fg">{sensors.humidity}%</span></div>
            <div className="flex justify-between"><span className="text-fg-muted">Temperature</span><span className="text-fg">{sensors.temperature}°C</span></div>
          </div>

          {/* Animated airflow arrows */}
          <div className="border-t border-border pt-2">
            <div className="label mb-2">Airflow Visualization</div>
            <div className="flex gap-1 justify-center py-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="text-info text-base airflow-arrow">→</span>
              ))}
            </div>
          </div>
        </div>

        {/* Source Estimation */}
        <div className="card space-y-3">
          <div className="flex items-center gap-2">
            <Target size={13} className="text-danger" />
            <span className="label">Source Estimation</span>
          </div>

          <div className="border border-info/20 rounded bg-info/5 p-3 space-y-2">
            <div className="label text-center">Why Robot Moves Northeast</div>
            <div className="text-xs space-y-2 text-center">
              <div className="text-fg-muted">Sensor 1 (upwind) reading:</div>
              <div className="text-accent font-bold text-xl">{sensors.chemical1} <span className="text-xs text-fg-muted">ppm</span></div>
              <div className="text-fg-muted text-[10px]">vs baseline Sensor 4:</div>
              <div className="text-fg text-sm">{sensors.chemical4} ppm</div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-fg-muted">Gradient Direction</span><span className="text-warn">↗ NE (68°)</span></div>
            <div className="flex justify-between"><span className="text-fg-muted">Algorithm</span><span className="text-fg">Chemotaxis + Airflow</span></div>
            <div className="flex justify-between"><span className="text-fg-muted">Est. Distance</span><span className="text-fg">12.4 m <span className="text-fg-muted">[SIM]</span></span></div>
          </div>

          <ConfidenceBar label="Source Confidence" value={threat.localizationConfidence || 45} showSim color="danger" />

          {threat.localizationConfidence >= 80 && (
            <div className="border border-danger/30 rounded bg-danger/5 p-2 text-center text-xs">
              <div className="text-danger font-bold">SOURCE DIRECTION</div>
              <div className="text-warn text-lg font-bold">↗ NORTH-EAST</div>
              <div className="text-fg-muted text-[10px]">LOCALIZATION CONFIDENCE: {threat.localizationConfidence}% [SIM]</div>
            </div>
          )}
        </div>

        {/* Sensor Fusion */}
        <div className="card space-y-3">
          <span className="label">Sensor Fusion</span>
          <div className="space-y-2">
            <ConfidenceBar label="Chemical" value={sensors.chemical1 > 50 ? 82 : sensors.chemical1 > 20 ? 55 : 12} showSim />
            <ConfidenceBar label="Airflow" value={showAirflow ? 76 : 0} showSim color="info" />
            <ConfidenceBar label="Visual" value={threat.visualConfidence || 0} showSim />
            <ConfidenceBar label="Thermal" value={threat.thermalConfidence || 0} showSim />
          </div>

          <div className="border-t border-border pt-3">
            <div className="label mb-2">FUSED ANOMALY SCORE</div>
            <div className={`text-3xl font-bold text-center ${threat.fusionConfidence > 0 ? 'text-danger' : 'text-fg-muted'}`}>
              {threat.fusionConfidence || (sensors.chemical1 > 50 ? 79 : sensors.chemical1 > 20 ? 44 : 0)}%
              <span className="text-[10px] text-fg-muted ml-1">[SIM]</span>
            </div>
          </div>

          <div className="border border-border rounded p-2 text-[10px] text-fg-muted space-y-1">
            <div className="text-fg font-medium mb-1">Why Sensor Fusion?</div>
            <div>A single sensor can produce false positives. Combining chemical gradient, airflow direction, and visual/thermal data reduces false alarm rate and improves source localization accuracy.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SensorChart({
  title, data, color, current, note,
}: {
  title: string;
  data: { t: number; v: number }[];
  color: string;
  current: number;
  note: string;
}) {
  return (
    <div className="card space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-fg text-xs font-semibold">{title}</span>
        <div className="flex items-center gap-2">
          <span className="text-fg-muted text-[10px]">[SIM]</span>
          <span className="font-bold text-sm" style={{ color }}>{current} <span className="text-fg-muted text-[10px]">ppm</span></span>
        </div>
      </div>
      <p className="text-fg-muted text-[10px]">{note}</p>
      <div style={{ height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="t" hide />
            <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#94A3B8' }} itemStyle={{ color }} />
            {current > 20 && <ReferenceLine y={20} stroke="#F59E0B" strokeDasharray="3 3" strokeWidth={0.8} label={{ value: 'THRESHOLD', fill: '#F59E0B', fontSize: 7 }} />}
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
              fill={`url(#grad-${color})`} dot={false} activeDot={{ r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
