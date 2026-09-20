// ─── RAILGUARD-X Tactical Web Audio Synthesizer (0 External Assets) ─────────
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let ambientOsc: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;
let isMuted = false;
let currentVolume = 0.75;
let isAmbientPlaying = false;

function getAudioContext(): { ctx: AudioContext; gain: GainNode } | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(isMuted ? 0 : currentVolume, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    if (audioCtx && masterGain) {
      return { ctx: audioCtx, gain: masterGain };
    }
  } catch (err) {
    console.warn('AudioContext initialization error:', err);
  }
  return null;
}

export const soundEffects = {
  // Volume & State Controls
  setVolume: (vol: number) => {
    currentVolume = Math.max(0, Math.min(1, vol));
    const inst = getAudioContext();
    if (inst) {
      inst.gain.gain.setValueAtTime(isMuted ? 0 : currentVolume, inst.ctx.currentTime);
    }
    return currentVolume;
  },
  getVolume: () => currentVolume,

  toggleMute: () => {
    isMuted = !isMuted;
    const inst = getAudioContext();
    if (inst) {
      inst.gain.gain.setValueAtTime(isMuted ? 0 : currentVolume, inst.ctx.currentTime);
    }
    return isMuted;
  },
  getIsMuted: () => isMuted,

  // 1. UI Button Blip / Selection
  playBlip: () => {
    if (isMuted) return;
    const inst = getAudioContext();
    if (!inst) return;
    const { ctx, gain } = inst;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.04);
    g.gain.setValueAtTime(0.06, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(g);
    g.connect(gain);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  },

  // 2. Micro-Click (Subtle Hover)
  playHoverTick: () => {
    if (isMuted) return;
    const inst = getAudioContext();
    if (!inst) return;
    const { ctx, gain } = inst;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1800, ctx.currentTime);
    g.gain.setValueAtTime(0.015, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.015);
    osc.connect(g);
    g.connect(gain);
    osc.start();
    osc.stop(ctx.currentTime + 0.015);
  },

  // 3. Tactical Emergency CBRN Alert Siren (Dual Tone Warble)
  playAlertSiren: () => {
    if (isMuted) return;
    const inst = getAudioContext();
    if (!inst) return;
    const { ctx, gain } = inst;

    // Siren pulse 1
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(650, ctx.currentTime);
    osc1.frequency.linearRampToValueAtTime(950, ctx.currentTime + 0.18);
    osc1.frequency.linearRampToValueAtTime(650, ctx.currentTime + 0.36);
    g1.gain.setValueAtTime(0.09, ctx.currentTime);
    g1.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.36);
    osc1.connect(g1);
    g1.connect(gain);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.36);

    // Harmonic layer
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(325, ctx.currentTime);
    osc2.frequency.linearRampToValueAtTime(475, ctx.currentTime + 0.18);
    osc2.frequency.linearRampToValueAtTime(325, ctx.currentTime + 0.36);
    g2.gain.setValueAtTime(0.04, ctx.currentTime);
    g2.gain.linearRampToValueAtTime(0.005, ctx.currentTime + 0.36);
    osc2.connect(g2);
    g2.connect(gain);
    osc2.start();
    osc2.stop(ctx.currentTime + 0.36);
  },

  // 4. Geiger Counter Click (Spikes near chemical plume)
  playGeigerClick: () => {
    if (isMuted) return;
    const inst = getAudioContext();
    if (!inst) return;
    const { ctx, gain } = inst;
    const bufferSize = ctx.sampleRate * 0.0025;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2400 + Math.random() * 800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.07, ctx.currentTime);
    noise.connect(filter);
    filter.connect(g);
    g.connect(gain);
    noise.start();
  },

  // 5. Target Lock Chime (4-Note Ascending Cyber Arpeggio)
  playLockChime: () => {
    if (isMuted) return;
    const inst = getAudioContext();
    if (!inst) return;
    const { ctx, gain } = inst;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      g.gain.setValueAtTime(0.07, now + idx * 0.07);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.3);
      osc.connect(g);
      g.connect(gain);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.3);
    });
  },

  // 6. Camera Shutter Snapshot (Visual Verification Photo)
  playCameraShutter: () => {
    if (isMuted) return;
    const inst = getAudioContext();
    if (!inst) return;
    const { ctx, gain } = inst;
    const now = ctx.currentTime;

    // Click 1 (Curtain opens)
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(1200, now);
    osc1.frequency.exponentialRampToValueAtTime(300, now + 0.03);
    g1.gain.setValueAtTime(0.08, now);
    g1.gain.linearRampToValueAtTime(0.001, now + 0.03);
    osc1.connect(g1);
    g1.connect(gain);
    osc1.start(now);
    osc1.stop(now + 0.03);

    // Click 2 (Curtain closes)
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(800, now + 0.07);
    osc2.frequency.exponentialRampToValueAtTime(200, now + 0.11);
    g2.gain.setValueAtTime(0.09, now + 0.07);
    g2.gain.linearRampToValueAtTime(0.001, now + 0.11);
    osc2.connect(g2);
    g2.connect(gain);
    osc2.start(now + 0.07);
    osc2.stop(now + 0.11);
  },

  // 7. Tactical RPF Radio Squelch / Chirp
  playRadioSquelch: () => {
    if (isMuted) return;
    const inst = getAudioContext();
    if (!inst) return;
    const { ctx, gain } = inst;
    const now = ctx.currentTime;

    // Radio handshake tone
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1750, now);
    osc.frequency.setValueAtTime(2200, now + 0.04);
    g.gain.setValueAtTime(0.05, now);
    g.gain.linearRampToValueAtTime(0.001, now + 0.09);
    osc.connect(g);
    g.connect(gain);
    osc.start(now);
    osc.stop(now + 0.09);

    // Noise burst
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1800;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.04, now + 0.09);
    ng.gain.linearRampToValueAtTime(0.001, now + 0.14);
    noise.connect(filter);
    filter.connect(ng);
    ng.connect(gain);
    noise.start(now + 0.09);
  },

  // 8. Cryptographic Blockchain Seal (Deep Sub-Bass Lock + Sparkle)
  playBlockchainSeal: () => {
    if (isMuted) return;
    const inst = getAudioContext();
    if (!inst) return;
    const { ctx, gain } = inst;
    const now = ctx.currentTime;

    // Sub-bass heavy thump
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, now);
    subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.28);
    subGain.gain.setValueAtTime(0.12, now);
    subGain.gain.linearRampToValueAtTime(0.001, now + 0.28);
    subOsc.connect(subGain);
    subGain.connect(gain);
    subOsc.start(now);
    subOsc.stop(now + 0.28);

    // Shimmering crystalline chime
    [1046.5, 1318.5, 1567.98].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.04, now + 0.06 + i * 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.06 + i * 0.04 + 0.35);
      osc.connect(g);
      g.connect(gain);
      osc.start(now + 0.06 + i * 0.04);
      osc.stop(now + 0.06 + i * 0.04 + 0.35);
    });
  },

  // 9. Sonar / Waypoint Ping (When clicking on the 3D floor)
  playSonarPing: () => {
    if (isMuted) return;
    const inst = getAudioContext();
    if (!inst) return;
    const { ctx, gain } = inst;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1180, now);
    osc.frequency.exponentialRampToValueAtTime(820, now + 0.25);
    g.gain.setValueAtTime(0.07, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(g);
    g.connect(gain);
    osc.start(now);
    osc.stop(now + 0.25);
  },

  // 10. Rover Stepper Motor Hum (When moving in 3D)
  playRoverMotor: () => {
    if (isMuted) return;
    const inst = getAudioContext();
    if (!inst) return;
    const { ctx, gain } = inst;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.06);
    osc.frequency.linearRampToValueAtTime(110, now + 0.12);
    g.gain.setValueAtTime(0.025, now);
    g.gain.linearRampToValueAtTime(0.001, now + 0.12);
    osc.connect(g);
    g.connect(gain);
    osc.start(now);
    osc.stop(now + 0.12);
  },

  // 11. Dossier Report Ready Chime
  playReportChime: () => {
    if (isMuted) return;
    const inst = getAudioContext();
    if (!inst) return;
    const { ctx, gain } = inst;
    const now = ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      g.gain.setValueAtTime(0.06, now + idx * 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
      osc.connect(g);
      g.connect(gain);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.25);
    });
  },

  // 12. Ambient Command Center Hum
  toggleAmbientHum: () => {
    const inst = getAudioContext();
    if (!inst) return false;
    const { ctx, gain } = inst;

    if (isAmbientPlaying && ambientOsc && ambientGain) {
      ambientGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      setTimeout(() => {
        ambientOsc?.stop();
        ambientOsc?.disconnect();
        ambientOsc = null;
        ambientGain = null;
        isAmbientPlaying = false;
      }, 500);
      return false;
    } else {
      ambientOsc = ctx.createOscillator();
      ambientGain = ctx.createGain();
      ambientOsc.type = 'sine';
      ambientOsc.frequency.value = 58; // 58Hz sub-drone
      ambientGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      ambientGain.gain.linearRampToValueAtTime(0.018, ctx.currentTime + 1.0);
      ambientOsc.connect(ambientGain);
      ambientGain.connect(gain);
      ambientOsc.start();
      isAmbientPlaying = true;
      return true;
    }
  },
  getIsAmbientPlaying: () => isAmbientPlaying,
};
