# 🛡️ RAILGUARD-X — Command Center

> **Detect → Locate → Verify → Respond**  
> *Autonomous CBRN Defense & Atmospheric Chemical Anomaly Detection Robot Command Center for Indian Railways (Smart India Hackathon 2026)*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb?logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20WebGL-black?logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📌 Project Overview

**RAILGUARD-X Command Center** is an operational control-room software suite built for the **Smart India Hackathon (SIH 2026)**. It visualizes and orchestrates autonomous multi-modal CBRN (Chemical, Biological, Radiological, Nuclear) defense units deployed across railway stations.

When autonomous robots patrol station platforms, RAILGUARD-X provides real-time atmospheric digital-twin monitoring, pinpoints anomalous chemical sources using ventilation airflow triangulation, triggers multi-modal optical/thermal verification, dispatches encrypted tactical alerts to the Railway Protection Force (RPF), and generates tamper-evident blockchain evidence hashes.

---

## ✨ Key Features

### 🎮 1. Real-Time Interactive 3D WebGL Digital Twin
* **True 3D Spatial Environment**: Features an elevated concrete station deck, dual railway tracks, structural pillars (Columns C1–C4), safety hazard markings, and restricted locker areas.
* **Autonomous 3D Robot (ROVER-01)**: Fully animated robot chassis with rotating all-terrain wheels, forward-sweeping LiDAR laser fan, and dynamic 3D headlight beams.
* **4 Camera Perspectives**:
  * 👁️ **Robot Eye (FPV Cam)**: Ride along in first-person with crosshair HUD, optical rangefinder, and multi-spectrum thermal/night-vision filters.
  * 🤖 **Chase Cam**: Third-person follow camera tracking smoothly behind the rover.
  * 🛰️ **3D Free Orbit**: Drag to inspect the station 360°, scroll to zoom.
  * 🎯 **Locker Target Cam**: Cinematic close-up on the anomaly source at Column C4.
* **Click-to-Deploy Waypoints**: Click anywhere on the 3D platform deck to send the robot to that exact location using raycasting.
* **Manual Driving (WASD / D-Pad)**: Take manual control and drive the rover around the station using your keyboard or on-screen touch joystick.

### 💨 2. Atmospheric & Chemical Plume Localization
* **Ventilation Triangulation**: Ingests 3D airflow vectors (1.8 m/s @ 74° NE) to track chemical gradient dispersion back to its physical origin.
* **Volumetric 3D Chemical Plume**: Billowing 3D particles that dynamically expand and glow red/amber based on real-time PPM concentration.
* **Proximity Sniffing**: Live sensor telemetry spikes realistically ($e^{-\text{distance}}$) as the robot nears the chemical leak, climbing up to **92 PPM**.

### 🔊 3. Zero-Asset Tactical Web Audio Engine
* Real-time synthesized procedural sound effects powered by the **Web Audio API** (no MP3 files or external assets required):
  * 🚨 **Tactical CBRN Siren**: Dual-tone emergency alert klaxon.
  * ☢️ **Geiger Sniffer**: Accelerating discharge clicks proportional to gas concentration.
  * 🎯 **Target Lock Chime**: 4-note ascending cyber arpeggio.
  * 📷 **Camera Shutter**: Mechanical dual-click during visual verification.
  * 📻 **RPF Radio Squelch**: Tactical handshake chirp and static burst.
  * 🔐 **Blockchain Seal**: Heavy sub-bass impact drop and crystalline chord.
  * 🛰️ **Floor Sonar Ping**: Resonant sonar pulse when dropping waypoints.
* Dedicated **Tactical Sound FX Console** (`SOUND FX` button in top bar) to test each sound and tune volume.

### 🔐 4. Cryptographic Evidence Ledger & Threat Passport
* **Tamper-Evident Ledger**: Computes and commits SHA-256 evidence blocks containing device signatures, timestamps, model version (`RGX-Fusion-v1.3`), and location data.
* **Threat Passport**: Complete incident dossier including multi-sensor confidence breakdowns (chemical, optical, thermal, and fused confidence scores).
* **Automated Incident Dossier**: One-click printable incident dossier ready for RPF dispatch.

---

## 🏗️ System Architecture

```
[ ROVER-01 (Quadruped Unit) ]       [ STATION ATMOSPHERIC MESH ]
       │                                       │
       ├── Multi-Modal Sensors (PID/MOX/IR)    ├── Anemometer Array (Airflow)
       ├── Forward LiDAR & Depth Camera        └── Column C1-C4 Sensors
       ▼                                       ▼
 ┌───────────────────────────────────────────────────────────────┐
 │               RAILGUARD-X SIMULATION ENGINE                  │
 │      (Zustand State Machine + Three.js Spatial Twin)          │
 └───────────────────────────────┬───────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
  [ 3D WebGL Canvas ]   [ Sensor Analytics ]    [ Cryptographic Ledger ]
  • Robot Eye FPV Cam   • Dynamic Area Charts   • SHA-256 Audit Trail
  • Interactive WASD    • Ventilation Compass   • Threat Passport Dossier
  • Plume Volumetrics   • Multi-Sensor Fusion   • RPF Tactical Dispatch
```

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18 or higher recommended)
* npm or yarn

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Railguard-X.git
   cd Railguard-X/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🎮 How to Demo (Judge Walkthrough)

1. **Auto Demo Mode**: Click **`▶ START DEMO`** on the top bar or sidebar.
   * Watch the robot patrol the platform.
   * Chemical plume appears on the threat map.
   * Airflow vectors orient towards Column C4.
   * Robot navigates to the locker and locks target.
   * Camera shutter triggers multi-modal optical verification.
   * Tactical siren alerts RPF command and generates a cryptographic evidence hash.
2. **Interactive Manual Control**:
   * Click **`DRIVE`** or press **`W`**, **`A`**, **`S`**, **`D`** to drive the robot anywhere.
   * Click on the 3D railway platform to deploy custom waypoints.
   * Click **`DROP THREAT`** to inject a chemical leak on demand.
3. **Robot Camera FPV**: Click **`ROBOT EYE`** to see what the robot sees with thermal & night-vision reticles.
4. **Sound FX Matrix**: Click **`SOUND FX`** in the top bar to test every procedural sound effect live.

---

## 🛠️ Technology Stack

* **Framework**: React 19, TypeScript
* **3D Visualization**: Three.js (Hardware-accelerated WebGL)
* **Styling**: Tailwind CSS (Tactical glassmorphic dark ops theme)
* **State Management**: Zustand
* **Charts & Telemetry**: Recharts
* **Icons**: Lucide React
* **Audio**: Native Web Audio API (real-time procedural synthesis)
* **Build Tool**: Vite 8

---

## 📄 License
This project is developed for the Smart India Hackathon (SIH 2026). Distributed under the MIT License.
