import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Sparkles, RotateCcw, X, Eye, Volume2, MapPin, Compass } from 'lucide-react';

export default function VRPreviewModal({ memory, isOpen, onClose }) {
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState('awakening'); // 'awakening' (0-1s), 'materialization' (1-2.5s), 'anchoring' (2.5-3.2s), 'cue' (3.2-4s)
  const canvasContainerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const photoMeshRef = useRef(null);
  const particlesMeshRef = useRef(null);

  // Play subtle warm spatial chime at 2.5s
  const playPreviewChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.3); // E5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  };

  // Reset and play the 4-second preview sequence
  const startPreview = () => {
    setElapsed(0);
    setPhase('awakening');
    startTimeRef.current = performance.now();

    if (photoMeshRef.current) {
      photoMeshRef.current.position.y = -1.2;
      photoMeshRef.current.material.opacity = 0;
      photoMeshRef.current.scale.set(0.7, 0.7, 0.7);
    }
  };

  useEffect(() => {
    if (!isOpen || !memory) return;

    const container = canvasContainerRef.current;
    if (!container) return;

    // 1. Initialize Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0f172a); // Deep tranquil slate
    scene.fog = new THREE.FogExp2(0x0f172a, 0.12);

    const width = container.clientWidth || 720;
    const height = container.clientHeight || 460;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Lighting (Warm ambient + soft golden sunbeam)
    const ambientLight = new THREE.AmbientLight(0xffecd2, 0.9);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xfef3c7, 1.2);
    directionalLight.position.set(2, 4, 3);
    scene.add(directionalLight);

    const floorLight = new THREE.PointLight(0x38bdf8, 0.5, 8);
    floorLight.position.set(0, -2, 1);
    scene.add(floorLight);

    // 3. Floating Memory Photo Mesh
    const loader = new THREE.TextureLoader();
    const photoTexture = loader.load(
      memory.imageUrl || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800',
      () => {
        renderer.render(scene, camera);
      }
    );

    // Aspect ratio plane (4:3)
    const planeGeo = new THREE.PlaneGeometry(2.0, 1.4);
    const planeMat = new THREE.MeshStandardMaterial({
      map: photoTexture,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0
    });
    const photoMesh = new THREE.Mesh(planeGeo, planeMat);
    photoMesh.position.set(0, -1.2, -0.4);
    photoMesh.scale.set(0.7, 0.7, 0.7);
    scene.add(photoMesh);
    photoMeshRef.current = photoMesh;

    // Wooden / Golden picture frame border
    const frameGeo = new THREE.BoxGeometry(2.1, 1.5, 0.05);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.4,
      metalness: 0.3,
      transparent: true,
      opacity: 0.9
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.set(0, 0, -0.03);
    photoMesh.add(frameMesh);

    // 4. Subtle ambient particles
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 6;
      particlePos[i + 1] = (Math.random() - 0.5) * 4;
      particlePos[i + 2] = (Math.random() - 0.5) * 4;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.04,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesMeshRef.current = particles;

    let chimePlayed = false;
    startPreview();

    // 5. Animation Loop tracking exact 4.0 seconds
    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const curElapsed = (timestamp - startTimeRef.current) / 1000;
      setElapsed(Math.min(4.0, curElapsed));

      // Phase transitions
      if (curElapsed < 1.0) {
        setPhase('awakening');
        // Ambient room warms up
        if (photoMeshRef.current) {
          photoMeshRef.current.material.opacity = curElapsed * 0.4;
        }
      } else if (curElapsed < 2.5) {
        setPhase('materialization');
        const p = (curElapsed - 1.0) / 1.5; // 0 to 1
        if (photoMeshRef.current) {
          // Smooth rise and settle with easeOutCubic
          const ease = 1 - Math.pow(1 - p, 3);
          photoMeshRef.current.position.y = -1.2 + ease * 1.35; // from -1.2 to +0.15
          photoMeshRef.current.position.z = -0.4 + ease * 0.4; // settles at 0.0
          photoMeshRef.current.scale.set(0.7 + ease * 0.3, 0.7 + ease * 0.3, 0.7 + ease * 0.3);
          photoMeshRef.current.material.opacity = Math.min(1.0, 0.4 + ease * 0.6);
        }
      } else if (curElapsed < 3.2) {
        setPhase('anchoring');
        if (!chimePlayed) {
          playPreviewChime();
          chimePlayed = true;
        }
        if (photoMeshRef.current) {
          // Gentle floating oscillation
          photoMeshRef.current.position.y = 0.15 + Math.sin(curElapsed * 2) * 0.03;
          photoMeshRef.current.rotation.y = Math.sin(curElapsed * 1.5) * 0.02;
        }
      } else {
        setPhase('cue');
        if (photoMeshRef.current) {
          photoMeshRef.current.position.y = 0.15 + Math.sin(curElapsed * 2) * 0.03;
          photoMeshRef.current.rotation.y = Math.sin(curElapsed * 1.5) * 0.02;
        }
      }

      // Drift particles gently
      if (particlesMeshRef.current) {
        particlesMeshRef.current.rotation.y += 0.001;
      }

      renderer.render(scene, camera);

      if (curElapsed < 4.0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, [isOpen, memory]);

  if (!isOpen || !memory) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem'
    }}>
      <div style={{
        background: '#0F172A',
        border: '2px solid rgba(148, 163, 184, 0.25)',
        borderRadius: '28px',
        width: '100%',
        maxWidth: '860px',
        overflow: 'hidden',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Top Header Bar */}
        <div style={{
          padding: '1rem 1.75rem',
          borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(30, 41, 59, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              background: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: '800',
              letterSpacing: '0.08em',
              padding: '6px 14px',
              borderRadius: '20px',
              boxShadow: '0 0 16px rgba(79, 70, 229, 0.5)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Eye size={16} />
              VR EXPERIENCE PREVIEW
            </span>
            <span style={{ fontSize: '14px', color: '#94A3B8' }}>
              4-Second Spatial Viewport Simulation
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              borderRadius: '8px',
              transition: 'all 0.2s'
            }}
            aria-label="Close Preview"
          >
            <X size={22} />
          </button>
        </div>

        {/* 3D Viewport Simulation Container */}
        <div style={{ position: 'relative', width: '100%', height: '480px', background: '#0F172A' }}>
          <div ref={canvasContainerRef} style={{ width: '100%', height: '100%' }} />

          {/* Spatial Vignette Overlay (Simulating VR Lens) */}
          <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            boxShadow: 'inset 0 0 100px rgba(15, 23, 42, 0.95), inset 0 0 40px rgba(0, 0, 0, 0.8)',
            borderRadius: '16px'
          }} />

          {/* Second 2.5 – 3.2: Contextual Anchoring Overlay */}
          {elapsed >= 2.5 && (
            <div style={{
              position: 'absolute',
              top: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(251, 191, 36, 0.5)',
              backdropFilter: 'blur(8px)',
              borderRadius: '16px',
              padding: '8px 20px',
              textAlign: 'center',
              animation: 'fadeIn 0.5s ease-out forwards',
              zIndex: 10
            }}>
              <h4 style={{ fontSize: '18px', color: '#F8FAFC', margin: '0 0 2px 0', fontWeight: '700' }}>
                {memory.title}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', color: '#FBBF24' }}>
                <MapPin size={13} />
                <span>{memory.location || memory.state || 'North Eastern Region'}</span>
                {memory.datePeriod && <span>• {memory.datePeriod}</span>}
              </div>
            </div>
          )}

          {/* Second 3.2 – 4.0: Interaction Cue Overlay (High-Contrast Large-Type Question) */}
          {elapsed >= 3.2 && (
            <div style={{
              position: 'absolute',
              bottom: '28px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: '640px',
              background: 'rgba(15, 23, 42, 0.88)',
              border: '2px solid #10B981',
              boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
              borderRadius: '20px',
              padding: '16px 24px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              animation: 'slideUpFade 0.6s ease-out forwards',
              zIndex: 10
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#6EE7B7',
                fontSize: '13px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '4px'
              }}>
                <Volume2 size={16} />
                <span>Elder Viewport Interaction Cue</span>
              </div>
              <p style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#FFFFFF',
                margin: 0,
                lineHeight: 1.3
              }}>
                "{memory.questionPrompt || 'Who is standing beside you in this photo?'}"
              </p>
            </div>
          )}

          {/* Headset Viewport Frame Indicators */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '8px',
            padding: '4px 10px',
            fontSize: '11px',
            color: '#94A3B8',
            fontWeight: '600',
            letterSpacing: '0.04em'
          }}>
            STEREO FOV 110°
          </div>
        </div>

        {/* 4-Second Timeline Progress Bar */}
        <div style={{
          padding: '1rem 1.75rem',
          background: 'rgba(30, 41, 59, 0.85)',
          borderTop: '1px solid rgba(148, 163, 184, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          flexWrap: 'wrap'
        }}>
          {/* Progress Timeline */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>
              <span>0.0s Spatial Awakening</span>
              <span>1.0s Materialize</span>
              <span>2.5s Anchor</span>
              <span>3.2s Question Cue</span>
              <strong style={{ color: '#38BDF8' }}>{elapsed.toFixed(1)}s / 4.0s</strong>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '4px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                width: `${(elapsed / 4.0) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #4F46E5, #06B6D4, #10B981)',
                transition: 'width 0.05s linear'
              }} />
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={startPreview}
              style={{
                background: 'rgba(79, 70, 229, 0.2)',
                color: '#A5B4FC',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: '12px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <RotateCcw size={16} />
              <span>Replay 4s Preview</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#334155',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '8px 18px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
