import React from 'react';
import { useSimStore } from '../store/simulationStore';
import { DEFAULT_SCENARIO, EVIDENCE_HASH_FULL } from '../simulation/scenario';
import ConfidenceBar from '../components/ConfidenceBar';
import MissionTimeline from '../components/MissionTimeline';
import { FileText, Download, Shield } from 'lucide-react';

const STATIC_TIMELINE = [
  { time: '13:05:21', icon: '🟢', label: 'ROVER-01 patrol started — Platform 3', color: 'accent' },
  { time: '13:05:27', icon: '🟠', label: 'Chemical anomaly detected (82% confidence)', color: 'warn' },
  { time: '13:05:29', icon: '🔎', label: 'Search mode activated — airflow analysis started', color: 'info' },
  { time: '13:05:31', icon: '📍', label: 'Source direction estimated: NE ↗ (68°)', color: 'info' },
  { time: '13:05:34', icon: '🎯', label: 'Source localized — 87% confidence [SIM]', color: 'danger' },
  { time: '13:05:36', icon: '📷', label: 'Visual verification completed', color: 'info' },
  { time: '13:05:37', icon: '🔴', label: 'HIGH-RISK anomaly confirmed — multimodal fusion 89%', color: 'danger' },
  { time: '13:05:38', icon: '🚨', label: 'RPF alert generated — HIGH RISK', color: 'danger' },
  { time: '13:05:39', icon: '🔐', label: `Evidence hash recorded: ${EVIDENCE_HASH_FULL.slice(0, 16)}...`, color: 'accent' },
  { time: '13:05:40', icon: '👮', label: 'RPF Officer assigned — incident acknowledged', color: 'accent' },
  { time: '13:05:42', icon: '📄', label: 'Incident dossier generated', color: 'accent' },
];

export default function ThreatPassport() {
  const { threat, stage, reportReady, generateReport } = useSimStore();
  const [showReport, setShowReport] = React.useState(false);

  const hasData = stage !== 'IDLE';
  const chm = hasData ? (threat.chemicalConfidence || 82) : 0;
  const vis = hasData ? (threat.visualConfidence || 87) : 0;
  const thm = hasData ? (threat.thermalConfidence || 81) : 0;
  const fus = hasData ? (threat.fusionConfidence || 89) : 0;
  const loc = hasData ? (threat.localizationConfidence || 87) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-fg text-base font-bold tracking-widest uppercase">Threat Passport</h1>
          <p className="text-fg-muted text-xs mt-0.5">Digital incident identity record</p>
        </div>
        <div className="flex items-center gap-2">
          {!reportReady && (
            <button onClick={generateReport} className="btn-secondary flex items-center gap-1.5">
              <FileText size={11} /> GENERATE REPORT
            </button>
          )}
          {reportReady && (
            <button onClick={() => setShowReport(true)} className="btn-primary flex items-center gap-1.5">
              <Download size={11} /> VIEW REPORT
            </button>
          )}
        </div>
      </div>

      {!hasData && (
        <div className="card text-center py-8 space-y-2">
          <Shield size={32} className="mx-auto text-fg-muted opacity-30" />
          <p className="text-fg-muted text-sm">No active threat passport</p>
          <p className="text-fg-muted text-xs">Start the demo to create a threat record</p>
        </div>
      )}

      {hasData && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Left: Passport Card */}
          <div className="space-y-3">
            <div className="card border-danger/30 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="label">Threat Passport</div>
                  <div className="text-fg font-bold text-lg tracking-widest mt-1">
                    {DEFAULT_SCENARIO.threatId}
                  </div>
                </div>
                <div className="badge-danger animate-pulse-slow">HIGH RISK</div>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-danger/40 to-transparent" />

              {/* Details */}
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Status', value: stage.replace(/_/g, ' '), bold: true },
                  { label: 'Location', value: 'Platform 3' },
                  { label: 'Detected By', value: DEFAULT_SCENARIO.robot },
                  { label: 'Detection Time', value: DEFAULT_SCENARIO.detectionTime },
                  { label: 'Source Localized', value: DEFAULT_SCENARIO.sourceLocalizedTime },
                  { label: 'Verification', value: DEFAULT_SCENARIO.verificationTime },
                  { label: 'Model Version', value: 'RGX-Fusion-v1.3' },
                ].map(({ label, value, bold }) => (
                  <div key={label} className="flex justify-between items-start gap-2">
                    <span className="text-fg-muted flex-shrink-0">{label}</span>
                    <span className={`text-right ${bold ? 'text-warn font-bold' : 'text-fg'}`}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="w-full h-px bg-border" />

              {/* Source estimate */}
              <div className="space-y-1 text-xs">
                <span className="label">Source Location [SIM]</span>
                <div className="text-fg">Platform 3 — Restricted Locker Area</div>
                <div className="text-fg-muted">Est. Error: ~1.8 m</div>
              </div>
            </div>

            {/* Chain of Custody */}
            <div className="card space-y-3">
              <span className="label flex items-center gap-1.5"><Shield size={11} /> Chain of Custody</span>
              <div className="space-y-0">
                {[
                  { label: 'Robot Detection', status: 'COMPLETE', color: 'accent' },
                  { label: 'AI Verification', status: 'COMPLETE', color: 'accent' },
                  { label: 'RPF Notification', status: loc > 0 ? 'SENT' : 'PENDING', color: loc > 0 ? 'accent' : 'fg-muted' },
                  { label: 'Officer Verification', status: 'PENDING', color: 'fg-muted' },
                  { label: 'Incident Resolution', status: 'PENDING', color: 'fg-muted' },
                ].map(({ label, status, color }, i, arr) => (
                  <div key={label} className="flex gap-3">
                    <div className="flex flex-col items-center w-4 flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full mt-1 bg-${color}`} />
                      {i < arr.length - 1 && <div className="w-px flex-1 bg-border mt-1 mb-0 min-h-[20px]" />}
                    </div>
                    <div className="pb-3 flex-1">
                      <div className="text-xs text-fg">{label}</div>
                      <div className={`text-[10px] text-${color}`}>{status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle: Confidence Bars */}
          <div className="space-y-3">
            <div className="card space-y-4">
              <span className="label">Confidence Breakdown <span className="sim-badge">[SIMULATION DATA]</span></span>

              <div className="space-y-3">
                <ConfidenceBar label="Chemical Signal" value={chm} showSim />
                <ConfidenceBar label="Visual Analysis" value={vis} showSim />
                <ConfidenceBar label="Thermal Analysis" value={thm} showSim />
                <ConfidenceBar label="Source Localization" value={loc} showSim />

                <div className="border-t border-border pt-3">
                  <ConfidenceBar label="Fused Confidence" value={fus} showSim color="danger" />
                </div>
              </div>

              {/* Verdict */}
              {fus > 0 && (
                <div className="border border-danger/30 rounded bg-danger/5 p-3 text-center">
                  <div className="text-danger font-bold text-sm tracking-widest">🔴 HIGH-RISK ANOMALY</div>
                  <div className="text-fg-muted text-[10px] mt-1">Multimodal verification complete</div>
                  <div className="text-fg-muted text-[10px]">Fused Confidence: {fus}% [SIM]</div>
                </div>
              )}
            </div>

            {/* Verification Panels */}
            <div className="card space-y-3">
              <span className="label">Multimodal Verification <span className="sim-badge">[SIMULATION]</span></span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'RGB CAMERA', value: vis, icon: '📷', active: vis > 0 },
                  { label: 'THERMAL', value: thm, icon: '🌡️', active: thm > 0 },
                  { label: 'CHEMICAL', value: chm, icon: '🧪', active: chm > 0 },
                ].map(({ label, value, icon, active }) => (
                  <div key={label} className={`rounded border p-2 text-center transition-all ${active ? 'border-info/30 bg-info/5' : 'border-border'}`}>
                    <div className="text-lg mb-1">{icon}</div>
                    <div className="label text-[9px]">{label}</div>
                    <div className={`text-sm font-bold mt-1 ${active ? 'text-fg' : 'text-fg-muted'}`}>
                      {active ? `${value}%` : '---'}
                    </div>
                  </div>
                ))}
              </div>
              {fus > 0 && (
                <div className="border-t border-border pt-2 text-center">
                  <div className="text-fg-muted text-[10px] mb-1">─── FUSED CONFIDENCE ───</div>
                  <div className="text-danger text-xl font-bold">{fus}%</div>
                  <div className="badge-danger mx-auto mt-1 w-fit">VERIFICATION COMPLETE</div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Timeline */}
          <div className="card overflow-y-auto max-h-[calc(100vh-200px)]">
            <span className="label block mb-3">Incident Timeline</span>
            <MissionTimeline events={STATIC_TIMELINE} />
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 bg-bg/90 flex items-center justify-center p-6">
          <div className="card w-full max-w-lg border-accent/30 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-accent text-xs tracking-widest uppercase font-bold">RAILGUARD-X</div>
                <div className="text-fg font-bold text-sm mt-0.5">INCIDENT DOSSIER</div>
              </div>
              <button onClick={() => setShowReport(false)} className="text-fg-muted hover:text-fg text-lg">✕</button>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent mb-4" />

            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              {[
                ['Threat ID', DEFAULT_SCENARIO.threatId],
                ['Location', 'Platform 3'],
                ['Detected', DEFAULT_SCENARIO.detectionTime],
                ['Source Localized', DEFAULT_SCENARIO.sourceLocalizedTime],
                ['Verification', DEFAULT_SCENARIO.verificationTime],
                ['Risk Level', 'HIGH'],
                ['Detected By', DEFAULT_SCENARIO.robot],
                ['Model Version', 'RGX-Fusion-v1.3'],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="text-fg-muted">{k}</div>
                  <div className="text-fg font-semibold">{v}</div>
                </div>
              ))}
            </div>

            <div className="border border-border rounded p-3 space-y-2 text-xs mb-4">
              <div className="label">Confidence Summary <span className="sim-badge">[SIM]</span></div>
              <ConfidenceBar label="Chemical" value={chm} showSim />
              <ConfidenceBar label="Visual" value={vis} showSim />
              <ConfidenceBar label="Thermal" value={thm} showSim />
              <ConfidenceBar label="Detection Confidence" value={fus} showSim color="danger" />
            </div>

            <div className="border border-border rounded p-3 mb-4">
              <div className="label mb-1">Evidence Hash (SHA-256)</div>
              <div className="text-accent font-mono text-[10px] break-all">{EVIDENCE_HASH_FULL}</div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-accent">
                <Shield size={11} />
                <span>Evidence Integrity: VERIFIED</span>
              </div>
              <button onClick={() => setShowReport(false)} className="btn-secondary">CLOSE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
