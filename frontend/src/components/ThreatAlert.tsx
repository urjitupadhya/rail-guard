import React from 'react';
import { useSimStore } from '../store/simulationStore';
import { useNavigate } from 'react-router-dom';
import { X, Eye, CheckCircle } from 'lucide-react';
import { DEFAULT_SCENARIO } from '../simulation/scenario';

export default function ThreatAlert() {
  const { dismissAlert, threat, stage } = useSimStore();
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-6 pointer-events-none">
      <div className="pointer-events-auto animate-scale-in w-80">
        <div className="card border-danger/50 alert-flash bg-surface relative overflow-hidden">
          {/* Red glow header */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-danger/50 via-danger to-danger/50" />

          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="text-danger text-lg">🚨</span>
              </div>
              <div>
                <div className="text-danger font-bold text-sm tracking-widest">THREAT ALERT</div>
                <div className="text-fg-muted text-[10px] tracking-wider">CHEMICAL ANOMALY DETECTED</div>
              </div>
            </div>
            <button onClick={dismissAlert} className="text-fg-muted hover:text-fg transition-colors p-1">
              <X size={14} />
            </button>
          </div>

          <div className="space-y-1.5 mb-4 text-xs">
            <div className="flex justify-between">
              <span className="text-fg-muted">Threat ID</span>
              <span className="text-fg font-mono font-semibold">{DEFAULT_SCENARIO.threatId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">Location</span>
              <span className="text-fg">{DEFAULT_SCENARIO.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">Device</span>
              <span className="text-fg">{DEFAULT_SCENARIO.robot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">Detected</span>
              <span className="text-fg">{DEFAULT_SCENARIO.detectionTime}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-border">
              <span className="text-fg-muted">Risk Level</span>
              <span className="badge-danger font-bold">{threat.riskLevel}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-fg-muted">Confidence</span>
              <span className="text-warn font-bold">{threat.chemicalConfidence}% <span className="text-[10px] text-fg-muted">[SIM]</span></span>
            </div>
          </div>

          {/* Stage note */}
          <div className="text-[10px] text-warn/80 bg-warn/5 border border-warn/20 rounded px-2 py-1 mb-3 text-center tracking-wider">
            {stage === 'SOURCE_LOCATED' ? '🎯 SOURCE LOCALIZED — SEARCH COMPLETE' :
             stage === 'VERIFIED' || stage === 'ALERT_SENT' ? '✓ MULTIMODAL VERIFICATION COMPLETE' :
             '🔎 SEARCH MODE ACTIVATED — LOCATING SOURCE'}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { navigate('/threat-passport'); dismissAlert(); }}
              className="flex-1 flex items-center justify-center gap-1.5 btn-danger"
            >
              <Eye size={11} /> VIEW THREAT
            </button>
            <button
              onClick={() => { navigate('/sensors'); dismissAlert(); }}
              className="flex-1 flex items-center justify-center gap-1.5 btn-secondary"
            >
              <CheckCircle size={11} /> VERIFY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
