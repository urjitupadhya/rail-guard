import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useSimStore } from '../store/simulationStore';
import { SOURCE_LOCATION } from '../simulation/scenario';
import {
  Camera, Eye, Disc, Target, Volume2, VolumeX,
  FastForward, Navigation, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Flame, Crosshair
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

export type CameraMode = 'ORBIT' | 'CHASE' | 'FPV' | 'TARGET';

interface ThreeDStationSceneProps {
  height?: string;
  showControls?: boolean;
}

export default function ThreeDStationScene({
  height = '480px',
  showControls = true,
}: ThreeDStationSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    stage, robots, heatmap, showAirflow, showSourceMarker,
    simSpeed, setSimSpeed, isMuted, toggleMute, manualControl, setManualControl,
    manualMoveRover, teleportRover, injectAnomalyAt,
  } = useSimStore();

  const roverData = robots.find((r) => r.id === 'ROVER-01') || { x: 15, y: 55, battery: 94 };

  const [cameraMode, setCameraMode] = useState<CameraMode>('CHASE');
  const [hudFilter, setHudFilter] = useState<'NORMAL' | 'THERMAL' | 'NVG'>('NORMAL');
  const [clickWaypoint, setClickWaypoint] = useState<{ x: number; z: number } | null>(null);

  // Scene object refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const roverMeshRef = useRef<THREE.Group | null>(null);
  const lidarMeshRef = useRef<THREE.Mesh | null>(null);
  const plumeGroupRef = useRef<THREE.Group | null>(null);
  const airflowGroupRef = useRef<THREE.Group | null>(null);
  const sourceMarkerRef = useRef<THREE.Group | null>(null);
  const wheelsRef = useRef<THREE.Mesh[]>([]);
  const platformMeshRef = useRef<THREE.Mesh | null>(null);

  // Orbit control interaction state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const orbitAnglesRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 4, radius: 45 });
  const cameraModeRef = useRef<CameraMode>('CHASE');

  useEffect(() => {
    cameraModeRef.current = cameraMode;
  }, [cameraMode]);

  // Keyboard navigation listener (W, A, S, D and Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const step = 2.5;
      if (e.key === 'w' || e.key === 'ArrowUp') {
        manualMoveRover(step, 0);
      } else if (e.key === 's' || e.key === 'ArrowDown') {
        manualMoveRover(-step, 0);
      } else if (e.key === 'a' || e.key === 'ArrowLeft') {
        manualMoveRover(0, -step);
      } else if (e.key === 'd' || e.key === 'ArrowRight') {
        manualMoveRover(0, step);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [manualMoveRover]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ─── 1. Init Scene, Camera, Renderer ───────────────────────────
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x02050f);
    scene.fog = new THREE.FogExp2(0x02050f, 0.015);

    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(50, aspect, 0.5, 250);
    cameraRef.current = camera;
    camera.position.set(25, 20, 35);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // ─── 2. Lighting ──────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x1a263d, 1.8);
    scene.add(ambientLight);

    const mainSpot = new THREE.DirectionalLight(0x00ff9d, 1.0);
    mainSpot.position.set(10, 30, 20);
    mainSpot.castShadow = true;
    mainSpot.shadow.mapSize.width = 1024;
    mainSpot.shadow.mapSize.height = 1024;
    scene.add(mainSpot);

    const fillLight = new THREE.DirectionalLight(0x06b6d4, 0.8);
    fillLight.position.set(-20, 25, -15);
    scene.add(fillLight);

    // ─── 3. Environment & Station Architecture ───────────────────
    const baseGeo = new THREE.PlaneGeometry(120, 60);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x030712,
      roughness: 0.9,
      metalness: 0.1,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.rotation.x = -Math.PI / 2;
    baseMesh.position.y = -0.05;
    scene.add(baseMesh);

    // Floor Grid Helper
    const grid = new THREE.GridHelper(100, 40, 0x10b981, 0x0f172a);
    grid.position.y = 0.01;
    scene.add(grid);

    // Main Platform Deck
    const platGeo = new THREE.BoxGeometry(64, 0.8, 22);
    const platMat = new THREE.MeshStandardMaterial({
      color: 0x0b1426,
      roughness: 0.7,
      metalness: 0.2,
    });
    const platform = new THREE.Mesh(platGeo, platMat);
    platform.position.set(0, 0.4, 0);
    platform.receiveShadow = true;
    scene.add(platform);
    platformMeshRef.current = platform;

    // Safety Edge Line
    const edgeGeo = new THREE.BoxGeometry(64, 0.82, 0.5);
    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.5,
      metalness: 0.2,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.25,
    });
    const edgeFront = new THREE.Mesh(edgeGeo, edgeMat);
    edgeFront.position.set(0, 0.41, 10.75);
    scene.add(edgeFront);

    const edgeBack = new THREE.Mesh(edgeGeo, edgeMat);
    edgeBack.position.set(0, 0.41, -10.75);
    scene.add(edgeBack);

    // Railway Tracks (North & South)
    const createTracks = (zPos: number) => {
      const railGeo = new THREE.BoxGeometry(70, 0.3, 0.15);
      const railMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });

      const rail1 = new THREE.Mesh(railGeo, railMat);
      rail1.position.set(0, 0.15, zPos - 1.2);
      scene.add(rail1);

      const rail2 = new THREE.Mesh(railGeo, railMat);
      rail2.position.set(0, 0.15, zPos + 1.2);
      scene.add(rail2);

      const sleeperGeo = new THREE.BoxGeometry(0.5, 0.15, 3.2);
      const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
      for (let x = -34; x <= 34; x += 1.8) {
        const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
        sleeper.position.set(x, 0.08, zPos);
        sleeper.receiveShadow = true;
        scene.add(sleeper);
      }
    };
    createTracks(13.5);
    createTracks(-13.5);

    // Columns C1 to C4
    const colLocations = [
      { x: -20, z: 0, label: 'C1' },
      { x: -7, z: 0, label: 'C2' },
      { x: 7, z: 0, label: 'C3' },
      { x: 20, z: 0, label: 'C4' },
    ];
    const colGeo = new THREE.CylinderGeometry(0.8, 0.8, 12, 16);
    const colMat = new THREE.MeshStandardMaterial({ color: 0x13233f, roughness: 0.6, metalness: 0.3 });

    colLocations.forEach((loc) => {
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(loc.x, 6, loc.z);
      col.castShadow = true;
      col.receiveShadow = true;
      scene.add(col);

      const ringGeo = new THREE.TorusGeometry(1.2, 0.15, 8, 24);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x00ff9d, emissive: 0x00ff9d, emissiveIntensity: 0.4 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(loc.x, 11, loc.z);
      scene.add(ring);
    });

    // Column C4 Locker (Threat Site)
    const lockerGeo = new THREE.BoxGeometry(3.5, 5, 1.8);
    const lockerMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      metalness: 0.6,
      roughness: 0.4,
    });
    const locker = new THREE.Mesh(lockerGeo, lockerMat);
    locker.position.set(20, 3.3, -7.5);
    locker.castShadow = true;
    locker.receiveShadow = true;
    scene.add(locker);

    const lockerBorderGeo = new THREE.BoxGeometry(3.6, 5.1, 1.9);
    const lockerBorderMat = new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true });
    const lockerBorder = new THREE.Mesh(lockerBorderGeo, lockerBorderMat);
    lockerBorder.position.copy(locker.position);
    scene.add(lockerBorder);

    // ─── 4. The 3D Autonomous Robot (ROVER-01) ────────────────────
    const roverGroup = new THREE.Group();
    roverMeshRef.current = roverGroup;

    // Body
    const bodyGeo = new THREE.BoxGeometry(2.4, 0.9, 1.6);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0a1f18,
      metalness: 0.8,
      roughness: 0.3,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.7;
    body.castShadow = true;
    roverGroup.add(body);

    // Neon trim
    const trimGeo = new THREE.BoxGeometry(2.45, 0.2, 1.65);
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x00ff9d,
      emissiveIntensity: 0.5,
    });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.y = 0.95;
    roverGroup.add(trim);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.35, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.9 });
    const wheelPositions = [
      [-0.9, 0.45, 0.95],
      [0.9, 0.45, 0.95],
      [-0.9, 0.45, -0.95],
      [0.9, 0.45, -0.95],
    ];
    const wheelMeshes: THREE.Mesh[] = [];
    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      wheel.castShadow = true;
      roverGroup.add(wheel);
      wheelMeshes.push(wheel);
    });
    wheelsRef.current = wheelMeshes;

    // Sensor mast
    const mastGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.1, 8);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.set(0.6, 1.4, 0);
    roverGroup.add(mast);

    // Head
    const headGeo = new THREE.BoxGeometry(0.5, 0.35, 0.6);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.2 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0.6, 1.95, 0);
    roverGroup.add(head);

    // Lenses
    const lensGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.15, 12);
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.8 });
    const lensL = new THREE.Mesh(lensGeo, lensMat);
    lensL.rotation.z = Math.PI / 2;
    lensL.position.set(0.85, 1.95, 0.15);
    roverGroup.add(lensL);

    const lensR = new THREE.Mesh(lensGeo, lensMat);
    lensR.rotation.z = Math.PI / 2;
    lensR.position.set(0.85, 1.95, -0.15);
    roverGroup.add(lensR);

    // LiDAR
    const lidarGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.25, 16);
    const lidarMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x10b981,
      emissiveIntensity: 0.6,
    });
    const lidar = new THREE.Mesh(lidarGeo, lidarMat);
    lidar.position.set(0.6, 2.2, 0);
    roverGroup.add(lidar);
    lidarMeshRef.current = lidar;

    // SpotLight Headlight
    const headlight = new THREE.SpotLight(0x00ff9d, 3.5, 28, Math.PI / 6, 0.4);
    headlight.position.set(1.2, 1.8, 0);
    headlight.target.position.set(10, 0.8, 0);
    roverGroup.add(headlight);
    roverGroup.add(headlight.target);

    // Underlight
    const underLight = new THREE.PointLight(0x10b981, 2.0, 5);
    underLight.position.set(0, 0.4, 0);
    roverGroup.add(underLight);

    // LiDAR fan
    const fanGeo = new THREE.ConeGeometry(8, 12, 16, 1, true, -Math.PI / 3, (2 * Math.PI) / 3);
    const fanMat = new THREE.MeshBasicMaterial({
      color: 0x00ff9d,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
    });
    const lidarFan = new THREE.Mesh(fanGeo, fanMat);
    lidarFan.rotation.x = Math.PI / 2;
    lidarFan.position.set(6, 0.45, 0);
    roverGroup.add(lidarFan);

    roverGroup.position.set(-20, 0.8, 0);
    scene.add(roverGroup);

    // ─── 5. Volumetric Chemical Threat Plume Group ───────────────
    const plumeGroup = new THREE.Group();
    plumeGroupRef.current = plumeGroup;
    plumeGroup.position.set(20, 1.2, -7.5);

    const plumeMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xff3366,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.45,
      roughness: 0.2,
    });
    for (let i = 0; i < 14; i++) {
      const size = 0.8 + Math.random() * 1.5;
      const pGeo = new THREE.SphereGeometry(size, 12, 12);
      const pMesh = new THREE.Mesh(pGeo, plumeMat);
      pMesh.position.set(
        (Math.random() - 0.5) * 3,
        Math.random() * 4,
        (Math.random() - 0.5) * 3
      );
      plumeGroup.add(pMesh);
    }
    scene.add(plumeGroup);

    const plumeLight = new THREE.PointLight(0xff3366, 3.5, 18);
    plumeLight.position.set(0, 2, 0);
    plumeGroup.add(plumeLight);

    // ─── 6. 3D Airflow Vectors ──────────────────────────────────
    const airflowGroup = new THREE.Group();
    airflowGroupRef.current = airflowGroup;
    const arrowDir = new THREE.Vector3(1, 0.1, -0.6).normalize();
    for (let i = 0; i < 6; i++) {
      const arrowPos = new THREE.Vector3(-15 + i * 7, 2.5 + Math.sin(i) * 0.4, 4 - i * 2);
      const arrow = new THREE.ArrowHelper(arrowDir, arrowPos, 4.5, 0x06b6d4, 1.0, 0.5);
      airflowGroup.add(arrow);
    }
    scene.add(airflowGroup);

    // ─── 7. 3D Laser Target Lock Marker ─────────────────────────
    const targetGroup = new THREE.Group();
    sourceMarkerRef.current = targetGroup;
    targetGroup.position.set(20, 0.8, -7.5);

    const beamGeo = new THREE.CylinderGeometry(0.12, 0.12, 18, 12);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xff3366, transparent: true, opacity: 0.8 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 9;
    targetGroup.add(beam);

    const ringGeo = new THREE.RingGeometry(1.5, 1.8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff3366, side: THREE.DoubleSide });
    const tRing = new THREE.Mesh(ringGeo, ringMat);
    tRing.rotation.x = Math.PI / 2;
    tRing.position.y = 0.1;
    targetGroup.add(tRing);
    scene.add(targetGroup);

    // ─── 8. Raycasting for Click-To-Deploy Waypoints ─────────────
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      // Don't trigger waypoint if dragging or in FPV
      if (isDraggingRef.current) return;
      const rect = container.getBoundingClientRect();
      mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseCoord.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!cameraRef.current || !platformMeshRef.current) return;
      raycaster.setFromCamera(mouseCoord, cameraRef.current);
      const intersects = raycaster.intersectObject(platformMeshRef.current);

      if (intersects.length > 0) {
        const pt = intersects[0].point;
        // Convert world 3D coords (-28 to +28) into percentage (0-100%)
        const pctX = ((pt.x + 28) / 56) * 100;
        const pctY = ((pt.z + 8) / 16) * 100;

        teleportRover(pctX, pctY);
        setClickWaypoint({ x: pt.x, z: pt.z });
        setTimeout(() => setClickWaypoint(null), 1500);
      }
    };

    container.addEventListener('click', handleClick);

    // Mouse drag for Orbit mode
    const handleMouseDown = (e: MouseEvent) => {
      if (cameraModeRef.current !== 'ORBIT') return;
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || cameraModeRef.current !== 'ORBIT') return;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      orbitAnglesRef.current.theta -= dx * 0.008;
      orbitAnglesRef.current.phi = Math.max(0.15, Math.min(Math.PI / 2.2, orbitAnglesRef.current.phi - dy * 0.008));
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 50);
    };

    const handleWheel = (e: WheelEvent) => {
      if (cameraModeRef.current !== 'ORBIT') return;
      orbitAnglesRef.current.radius = Math.max(12, Math.min(80, orbitAnglesRef.current.radius + e.deltaY * 0.04));
      e.preventDefault();
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // Touch support for mobile devices
    let touchStartX = 0;
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1 && cameraModeRef.current === 'ORBIT') {
        isDraggingRef.current = true;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1 || cameraModeRef.current !== 'ORBIT') return;
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;
      orbitAnglesRef.current.theta -= dx * 0.008;
      orbitAnglesRef.current.phi = Math.max(0.15, Math.min(Math.PI / 2.2, orbitAnglesRef.current.phi - dy * 0.008));
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // ─── 9. Animation Loop ──────────────────────────────────────
    let reqId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Spin LiDAR
      if (lidarMeshRef.current) {
        lidarMeshRef.current.rotation.y += 0.08;
      }

      // Animate chemical plume
      if (plumeGroupRef.current) {
        plumeGroupRef.current.children.forEach((p, idx) => {
          if (p instanceof THREE.Mesh) {
            p.scale.setScalar(1 + 0.25 * Math.sin(elapsed * 2 + idx));
            p.position.y += Math.sin(elapsed + idx) * 0.008;
          }
        });
      }

      // Target marker pulse
      if (sourceMarkerRef.current) {
        sourceMarkerRef.current.rotation.y += 0.02;
        const scale = 1 + 0.15 * Math.sin(elapsed * 4);
        sourceMarkerRef.current.scale.set(scale, 1, scale);
      }

      // Camera view update
      if (cameraRef.current && roverMeshRef.current) {
        const mode = cameraModeRef.current;
        const roverPos = roverMeshRef.current.position;

        if (mode === 'ORBIT') {
          const { theta, phi, radius } = orbitAnglesRef.current;
          cameraRef.current.position.x = roverPos.x + radius * Math.sin(phi) * Math.sin(theta);
          cameraRef.current.position.y = radius * Math.cos(phi);
          cameraRef.current.position.z = roverPos.z + radius * Math.sin(phi) * Math.cos(theta);
          cameraRef.current.lookAt(roverPos.x, roverPos.y + 1.2, roverPos.z);
        } else if (mode === 'CHASE') {
          const targetPos = new THREE.Vector3(
            roverPos.x - 9,
            roverPos.y + 6.5,
            roverPos.z + 0
          );
          cameraRef.current.position.lerp(targetPos, 0.08);
          cameraRef.current.lookAt(roverPos.x + 6, roverPos.y + 1, roverPos.z);
        } else if (mode === 'FPV') {
          cameraRef.current.position.set(roverPos.x + 0.85, roverPos.y + 1.95, roverPos.z);
          cameraRef.current.lookAt(roverPos.x + 20, roverPos.y + 1.8, roverPos.z);
        } else if (mode === 'TARGET') {
          const lockerPos = new THREE.Vector3(20, 3.3, -7.5);
          cameraRef.current.position.lerp(new THREE.Vector3(26, 6, -2), 0.06);
          cameraRef.current.lookAt(lockerPos);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // ResizeObserver for rock-solid responsive sizing
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(reqId);
      resizeObserver.disconnect();
      container.removeEventListener('click', handleClick);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Sync 3D Rover Position with Zustand state
  useEffect(() => {
    if (!roverMeshRef.current) return;
    const target3dX = -28 + (roverData.x / 100) * 56;
    const target3dZ = -8 + (roverData.y / 100) * 16;

    const currentX = roverMeshRef.current.position.x;
    const currentZ = roverMeshRef.current.position.z;
    const deltaX = target3dX - currentX;
    const deltaZ = target3dZ - currentZ;

    roverMeshRef.current.position.x = target3dX;
    roverMeshRef.current.position.z = target3dZ;

    if (Math.hypot(deltaX, deltaZ) > 0.05) {
      const angle = Math.atan2(deltaZ, deltaX);
      roverMeshRef.current.rotation.y = -angle;
      wheelsRef.current.forEach((w) => {
        w.rotation.x += 0.3;
      });
    }
  }, [roverData.x, roverData.y]);

  // Sync Threat Plume and Markers
  useEffect(() => {
    if (plumeGroupRef.current) {
      plumeGroupRef.current.visible = heatmap.visible;
    }
    if (airflowGroupRef.current) {
      airflowGroupRef.current.visible = showAirflow;
    }
    if (sourceMarkerRef.current) {
      sourceMarkerRef.current.visible = showSourceMarker;
    }
  }, [heatmap.visible, showAirflow, showSourceMarker]);

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.9)] select-none"
      style={{ height }}
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-crosshair" />

      {/* Click Waypoint Flash Marker */}
      {clickWaypoint && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-10 h-10 border-2 border-emerald-400 rounded-full animate-ping" />
        </div>
      )}

      {/* FPV Mode HUD Overlay (Robot Eye View) */}
      {cameraMode === 'FPV' && (
        <div
          className={`absolute inset-0 pointer-events-none transition-all duration-300 ${
            hudFilter === 'THERMAL'
              ? 'bg-gradient-to-br from-indigo-900/30 via-red-900/30 to-amber-900/40 mix-blend-color-dodge'
              : hudFilter === 'NVG'
              ? 'bg-emerald-950/40 mix-blend-screen'
              : ''
          }`}
        >
          {/* Tactical Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-44 h-44 border border-emerald-400/40 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#00FF9D]" />
              <div className="absolute top-0 w-0.5 h-5 bg-emerald-400" />
              <div className="absolute bottom-0 w-0.5 h-5 bg-emerald-400" />
              <div className="absolute left-0 h-0.5 w-5 bg-emerald-400" />
              <div className="absolute right-0 h-0.5 w-5 bg-emerald-400" />
              <span className="absolute -top-6 text-[10px] font-mono font-bold text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                OPTICAL RETICLE
              </span>
            </div>
          </div>

          {/* FPV Top Status Bar */}
          <div className="absolute top-14 left-3 right-3 flex items-center justify-between text-[11px] font-mono font-bold text-emerald-400 bg-slate-950/85 p-2 rounded-lg border border-emerald-500/30 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>ROBOT EYE STREAM · OPTICAL + FLIR ARRAY</span>
            </div>
            <div className="flex items-center gap-3">
              <span>TARGET DIST: {Math.max(1.8, Math.round(100 - roverData.x * 0.95))}m</span>
              <span>BATTERY: {roverData.battery}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating 3D HUD Toolbar */}
      {showControls && (
        <div className="absolute top-2.5 left-2.5 right-2.5 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
          {/* Camera View Mode Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/90 border border-slate-700/80 backdrop-blur-xl shadow-2xl">
            <button
              onClick={() => {
                soundEffects.playBlip();
                setCameraMode('CHASE');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                cameraMode === 'CHASE'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Disc size={12} />
              <span>CHASE</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playBlip();
                setCameraMode('FPV');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                cameraMode === 'FPV'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-pulse'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Eye size={12} />
              <span>ROBOT EYE</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playBlip();
                setCameraMode('ORBIT');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                cameraMode === 'ORBIT'
                  ? 'bg-purple-950 text-purple-300 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Camera size={12} />
              <span>3D ORBIT</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playBlip();
                setCameraMode('TARGET');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                cameraMode === 'TARGET'
                  ? 'bg-red-950 text-red-300 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Target size={12} />
              <span>LOCKER</span>
            </button>
          </div>

          {/* Interactive Simulation Controls: Speed, Audio, Manual Drive */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/90 border border-slate-700 backdrop-blur-xl">
            {/* Speed Multipliers */}
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => {
                  soundEffects.playBlip();
                  setSimSpeed(spd);
                }}
                className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                  simSpeed === spd
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Simulation Speed ${spd}x`}
              >
                {spd}x
              </button>
            ))}

            <div className="w-px h-4 bg-slate-800" />

            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              className={`p-1.5 rounded text-xs transition-all ${
                isMuted ? 'text-slate-500 hover:text-slate-300' : 'text-emerald-400 hover:text-emerald-300'
              }`}
              title={isMuted ? 'Unmute Audio' : 'Mute Tactical Audio'}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>

            <div className="w-px h-4 bg-slate-800" />

            {/* Manual Drive Toggle */}
            <button
              onClick={() => setManualControl(!manualControl)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border transition-all ${
                manualControl
                  ? 'bg-amber-950 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <Navigation size={11} className={manualControl ? 'text-amber-400 animate-spin' : ''} />
              <span>{manualControl ? 'MANUAL DRIVE [ON]' : 'DRIVE'}</span>
            </button>

            {/* Inject Threat Button */}
            <button
              onClick={() => injectAnomalyAt(SOURCE_LOCATION.x, SOURCE_LOCATION.y)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 transition-all shadow-[0_0_10px_rgba(239,68,68,0.3)]"
              title="Inject Chemical Anomaly at Column C4"
            >
              <Flame size={11} className="text-red-400" />
              <span>DROP THREAT</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive On-Screen Drive Controls (Virtual D-Pad) */}
      {manualControl && (
        <div className="absolute bottom-3 left-3 p-3 rounded-2xl bg-slate-950/90 border border-amber-500/40 backdrop-blur-xl shadow-2xl flex flex-col items-center gap-1 pointer-events-auto">
          <div className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-1">
            <span>🎮 WASD / ARROWS</span>
          </div>
          <button
            onClick={() => manualMoveRover(3.5, 0)}
            className="w-10 h-10 rounded-lg bg-slate-900 hover:bg-amber-950/60 active:scale-95 border border-slate-700 hover:border-amber-500/50 flex items-center justify-center text-slate-200 hover:text-amber-300 shadow-md"
          >
            <ArrowUp size={16} />
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => manualMoveRover(0, -3.5)}
              className="w-10 h-10 rounded-lg bg-slate-900 hover:bg-amber-950/60 active:scale-95 border border-slate-700 hover:border-amber-500/50 flex items-center justify-center text-slate-200 hover:text-amber-300 shadow-md"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={() => manualMoveRover(-3.5, 0)}
              className="w-10 h-10 rounded-lg bg-slate-900 hover:bg-amber-950/60 active:scale-95 border border-slate-700 hover:border-amber-500/50 flex items-center justify-center text-slate-200 hover:text-amber-300 shadow-md"
            >
              <ArrowDown size={16} />
            </button>
            <button
              onClick={() => manualMoveRover(0, 3.5)}
              className="w-10 h-10 rounded-lg bg-slate-900 hover:bg-amber-950/60 active:scale-95 border border-slate-700 hover:border-amber-500/50 flex items-center justify-center text-slate-200 hover:text-amber-300 shadow-md"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Interactive Helper Banner in Bottom Right */}
      <div className="absolute bottom-3 right-3 hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950/85 border border-slate-800 text-[10px] font-mono text-slate-400 backdrop-blur-md pointer-events-none">
        <span className="flex items-center gap-1 text-emerald-400">
          <Crosshair size={11} /> CLICK DECK TO MOVE
        </span>
        <span>·</span>
        <span>DRAG TO ROTATE 360°</span>
        <span>·</span>
        <span>SCROLL TO ZOOM</span>
      </div>
    </div>
  );
}
