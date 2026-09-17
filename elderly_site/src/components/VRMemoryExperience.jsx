import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import {
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  Heart,
  ArrowRight,
  RotateCcw,
  Shield,
  HelpCircle,
  Eye,
  X
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { GAME_UI } from '../i18n/gameUI';
import { emitTelemetry } from '../socket';

export default function VRMemoryExperience({
  onSessionComplete,
  apiUrl,
  lang = 'en',
  selectedLanguage,
  t,
  presetMemories = null
}) {
  const activeLang = selectedLanguage || lang;
  const ui = useMemo(() => GAME_UI[activeLang] || GAME_UI.en, [activeLang]);

  // Memories queue: fetched from /api/memories?selectedOnly=true or fallback to all
  const [memories, setMemories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Session state
  const [phase, setPhase] = useState('presenting'); // 'presenting', 'listening', 'hint', 'success', 'supportive_next', 'complete'
  const [attemptCount, setAttemptCount] = useState(1);
  const [hintsDelivered, setHintsDelivered] = useState(0);
  const [currentHintText, setCurrentHintText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [supportiveFeedback, setSupportiveFeedback] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [startTime] = useState(Date.now());
  const [memoryStartTime, setMemoryStartTime] = useState(Date.now());

  // Refs for 3D canvas and WebSockets
  const canvasContainerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const photoMeshRef = useRef(null);
  const particlesRef = useRef(null);
  const animationFrameRef = useRef(null);
  const wsRef = useRef(null);
  const recognitionRef = useRef(null);

  // 1. Fetch Selected Memories from Shared Backend Database
  useEffect(() => {
    const fetchMemories = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${apiUrl}/api/memories`);
        if (res.ok) {
          const all = await res.json();
          // Filter to selected memories if any are selected, else use all
          const selected = all.filter((m) => m.isSelectedForSession);
          const queue = selected.length > 0 ? selected : all;
          setMemories(queue);
        }
      } catch (err) {
        console.warn('Memory fetch notice:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (presetMemories && presetMemories.length > 0) {
      setMemories(presetMemories);
      setIsLoading(false);
    } else {
      fetchMemories();
    }
  }, [apiUrl, presetMemories]);

  // Current active memory
  const currentMemory = memories[currentIndex] || null;

  // 2. Initialize WebSocket Connection for Live Telemetry Stream
  useEffect(() => {
    let reconnectTimeout = null;

    const connectWebSocket = () => {
      try {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = apiUrl
          ? apiUrl.replace(/^http(s?):\/\//, '')
          : (window.location.hostname ? `${window.location.hostname}:5050` : 'localhost:5050');
        const wsUrl = `${wsProtocol}//${wsHost}/ws`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          ws.send(JSON.stringify({
            type: 'IDENTIFY',
            role: 'headset',
            client: 'ElderlyVRViewport'
          }));
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'VR_CONTROL_EVENT') {
              if (msg.action === 'SKIP') {
                handleAdvanceMemory(true);
              } else if (msg.action === 'PAUSE' || msg.action === 'FORCE_EXIT' || msg.action === 'TERMINATE') {
                setIsPaused(true);
                speechService.stop();
                if (onSessionComplete) onSessionComplete();
              } else if (msg.action === 'RESUME') {
                setIsPaused(false);
              }
            } else if (msg.type === 'VR_SESSION_START' && msg.memories?.length) {
              setMemories(msg.memories);
              setCurrentIndex(0);
              setPhase('presenting');
            }
          } catch (e) {
            console.warn('WS receive parse notice:', e);
          }
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connectWebSocket, 4000);
        };
      } catch (err) {
        reconnectTimeout = setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, [apiUrl]);

  // Helper to send telemetry over WebSockets and Socket.IO to Caregiver Dashboard
  const sendTelemetry = (status, evaluation = null) => {
    if (!currentMemory) return;

    const elapsedSeconds = +((Date.now() - memoryStartTime) / 1000).toFixed(1);

    // 1. Socket.IO high-frequency emission
    emitTelemetry({
      memoryId: currentMemory._id,
      memoryTitle: currentMemory.title,
      imageUrl: currentMemory.imageUrl,
      userStatus: status,
      status: status,
      responseEvaluation: evaluation,
      responseTimeSec: elapsedSeconds,
      hintsDelivered: hintsDelivered,
      attempts: attemptCount,
      userVoiceTranscript: recognizedText,
      sessionProgress: `${currentIndex + 1} / ${memories.length}`
    });

    // 2. WebSocket fallback emission
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'VR_TELEMETRY_UPDATE',
        role: 'headset',
        data: {
          activeMemoryId: currentMemory._id,
          activeMemoryTitle: currentMemory.title,
          imageUrl: currentMemory.imageUrl,
          userStatus: status,
          responseEvaluation: evaluation,
          responseTimeSeconds: elapsedSeconds,
          hintsDelivered: hintsDelivered,
          attempts: attemptCount,
          sessionProgress: `${currentIndex + 1} / ${memories.length}`
        }
      }));
    }
  };

  // Play gentle affirmative spatial audio chime
  const playAffirmativeChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.75);
      });
    } catch (e) {}
  };

  // 3. Initialize Three.js 3D VR Spatial Canvas
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container || !currentMemory) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    // Deep, tranquil spatial twilight palette
    scene.background = new THREE.Color(0x0c1322);
    scene.fog = new THREE.FogExp2(0x0c1322, 0.08);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.4);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Warm Ambient Horizon Lighting
    const ambientLight = new THREE.AmbientLight(0xfef3c7, 1.1);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfde68a, 1.4);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const softFloorGlow = new THREE.PointLight(0x0284c7, 0.6, 10);
    softFloorGlow.position.set(0, -2.5, 1);
    scene.add(softFloorGlow);

    // 3D Floating Picture Frame
    const textureLoader = new THREE.TextureLoader();
    const photoTexture = textureLoader.load(currentMemory.imageUrl, () => {
      renderer.render(scene, camera);
    });

    const photoGeo = new THREE.PlaneGeometry(2.2, 1.55);
    const photoMat = new THREE.MeshStandardMaterial({
      map: photoTexture,
      roughness: 0.25,
      metalness: 0.1
    });
    const photoMesh = new THREE.Mesh(photoGeo, photoMat);
    photoMesh.position.set(0, 0.15, 0);
    scene.add(photoMesh);
    photoMeshRef.current = photoMesh;

    // Wooden / Golden picture frame
    const frameGeo = new THREE.BoxGeometry(2.32, 1.67, 0.06);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.4,
      metalness: 0.25
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.set(0, 0, -0.035);
    photoMesh.add(frameMesh);

    // Subtle floating stardust particles
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 8;
      particlePositions[i + 1] = (Math.random() - 0.5) * 6;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfde68a,
      size: 0.035,
      transparent: true,
      opacity: 0.65
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // Gentle Animation Loop
    let startTimestamp = null;
    const animate = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const tSec = (timestamp - startTimestamp) / 1000;

      // Gentle floating oscillation
      if (photoMeshRef.current) {
        photoMeshRef.current.position.y = 0.15 + Math.sin(tSec * 1.2) * 0.035;
        photoMeshRef.current.rotation.y = Math.sin(tSec * 0.8) * 0.025;
      }

      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.0008;
      }

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
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
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, [currentMemory]);

  // 4. Memory Transition Lifecycle & Voice Narration
  useEffect(() => {
    if (!currentMemory) return;

    setMemoryStartTime(Date.now());
    setAttemptCount(1);
    setHintsDelivered(0);
    setCurrentHintText('');
    setRecognizedText('');
    setSupportiveFeedback('');
    setPhase('presenting');

    sendTelemetry('User viewing memory in VR...');

    // Automatically speak the calm memory prompt aloud
    const promptText = currentMemory.questionPrompt || 'Who is standing beside you in this photo?';
    speechService.stop();
    speechService.speak(promptText, activeLang, 0.82);

    // Automatically start voice recognition after prompt
    const timer = setTimeout(() => {
      setPhase('listening');
      startVoiceListening();
      sendTelemetry('Listening for voice response...');
    }, 2800);

    return () => {
      clearTimeout(timer);
      stopVoiceListening();
      speechService.stop();
    };
  }, [currentIndex, currentMemory]);

  // 5. Voice Recognition Engine (Web Speech API)
  const startVoiceListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser.');
      setIsListening(false);
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const rec = new SpeechRecognition();
      recognitionRef.current = rec;
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = activeLang === 'as' ? 'as-IN' : activeLang === 'bn' ? 'bn-IN' : activeLang === 'ne' ? 'ne-NP' : 'en-IN';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        setRecognizedText(transcript);
        evaluateResponse(transcript);
      };

      rec.onerror = (event) => {
        console.warn('Speech recognition notice:', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.start();
    } catch (e) {
      console.warn('Voice start exception:', e);
      setIsListening(false);
    }
  };

  const stopVoiceListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // 6. Response Evaluation with Scaffolded Hinting
  const evaluateResponse = (spokenText) => {
    stopVoiceListening();
    if (!currentMemory) return;

    const cleanInput = spokenText.toLowerCase();
    const expected = (currentMemory.expectedAnswers || []).map((a) => a.toLowerCase());
    const people = (currentMemory.people || []).map((p) => p.toLowerCase());
    const relationship = (currentMemory.relationship || '').toLowerCase();
    const location = (currentMemory.location || '').toLowerCase();

    // Check if spoken words match expected answer keywords
    const isMatch =
      expected.some((k) => cleanInput.includes(k)) ||
      people.some((p) => cleanInput.includes(p)) ||
      (relationship && cleanInput.includes(relationship)) ||
      (location && cleanInput.includes(location));

    if (isMatch) {
      // SUCCESS!
      handleSuccess();
    } else {
      // ATTEMPT STRUGGLE — HIERARCHICAL GENTLE HINTING
      handleStruggle();
    }
  };

  const handleSuccess = () => {
    setPhase('success');
    playAffirmativeChime();

    const successMsg = ui.wellDone || 'Wonderful! You remembered correctly.';
    setSupportiveFeedback(successMsg);
    speechService.speak(successMsg, activeLang);

    sendTelemetry('Recall Completed Successfully', 'Success');
    logSessionToBackend('Successful', attemptCount, hintsDelivered);

    setTimeout(() => {
      handleAdvanceMemory();
    }, 3200);
  };

  const handleStruggle = () => {
    if (attemptCount === 1) {
      // Attempt 1 -> Deliver Tier 1 Gentle Relational Cue
      setAttemptCount(2);
      setHintsDelivered(1);
      setPhase('hint');

      const cue = currentMemory.hints?.tier1 || 'She is your daughter or granddaughter who loves visiting you.';
      setCurrentHintText(cue);
      const encouragement = ui.gentleEncouragement || 'That is close, take a slow look again.';
      setSupportiveFeedback(encouragement);

      speechService.speak(`${encouragement}. ${cue}`, activeLang);
      sendTelemetry('Hint 1 Delivered', 'Assistance needed');

      // Restart listening after clue
      setTimeout(() => {
        setPhase('listening');
        startVoiceListening();
      }, 3500);
    } else if (attemptCount === 2) {
      // Attempt 2 -> Deliver Tier 2 Direct / Phonetic Clue
      setAttemptCount(3);
      setHintsDelivered(2);
      setPhase('hint');

      const clue = currentMemory.hints?.tier2 || 'Take a close look at her warm smile and familiar eyes.';
      setCurrentHintText(clue);

      speechService.speak(clue, activeLang);
      sendTelemetry('Hint 2 Delivered', 'Assistance needed');

      // Restart listening after clue
      setTimeout(() => {
        setPhase('listening');
        startVoiceListening();
      }, 3500);
    } else {
      // Persistent struggle after attempts: Never say "Wrong" or "Failed"
      // Calm, supportive, dignified transition
      setPhase('supportive_next');
      const dignityMessage = 'That is quite alright, let us look at another lovely memory together.';
      setSupportiveFeedback(dignityMessage);
      speechService.speak(dignityMessage, activeLang);

      sendTelemetry('Transitioning With Care', 'Assistance needed');
      logSessionToBackend('Needed assistance', attemptCount, 2);

      setTimeout(() => {
        handleAdvanceMemory();
      }, 3800);
    }
  };

  // Advance to next memory or complete session
  const handleAdvanceMemory = (isManualSkip = false) => {
    stopVoiceListening();
    speechService.stop();

    if (isManualSkip) {
      logSessionToBackend('Needed assistance', attemptCount, hintsDelivered);
    }

    if (currentIndex < memories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setPhase('complete');
      sendTelemetry('VR Session Completed', 'Success');
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'VR_SESSION_COMPLETE',
          role: 'headset',
          data: {
            sessionId: `session_${Date.now()}`,
            summary: `Completed ${memories.length} memories with calm engagement.`
          }
        }));
      }
    }
  };

  // Log session record to backend database
  const logSessionToBackend = async (recallStatus, attempts, hints) => {
    if (!currentMemory || !apiUrl) return;
    try {
      const responseTime = Math.round((Date.now() - memoryStartTime) / 1000);
      await fetch(`${apiUrl}/api/memories/${currentMemory._id}/record-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recallStatus,
          attempts,
          hintsDelivered: hints,
          responseTimeSeconds: responseTime,
          observationalNotes: recallStatus === 'Successful'
            ? 'Warm joyful recall; comfortable pace observed.'
            : 'Needed gentle assistance; transition remained tranquil.'
        })
      });
    } catch (err) {
      console.warn('Session record log notice:', err);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Sparkles size={48} color="#FBBF24" style={{ animation: 'spin 3s linear infinite' }} />
          <h3 style={{ fontSize: '28px', marginTop: '1rem' }}>Entering Calm Spatial VR Memory...</h3>
        </div>
      </div>
    );
  }

  if (!currentMemory || phase === 'complete') {
    return (
      <div className="focus-card" style={{ maxWidth: '800px', textAlign: 'center', padding: '3.5rem 2rem' }}>
        <div style={{
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          background: 'var(--affirm-green)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <Heart size={48} />
        </div>
        <h2 style={{ fontSize: '36px', color: '#065F46', marginBottom: '12px' }}>
          A Peaceful Memory Session Completed
        </h2>
        <p style={{ fontSize: '24px', color: '#047857', marginBottom: '2.5rem', lineHeight: '1.5' }}>
          Thank you for sharing your precious memories and spending this calm, joyful time with us today.
        </p>

        <button
          type="button"
          className="btn-large btn-sage"
          onClick={onSessionComplete}
          style={{ margin: '0 auto' }}
        >
          <span>Return to Activities</span>
          <ArrowRight size={24} />
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      maxWidth: '100%',
      background: '#0C1322',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 3D WebGL Canvas Layer */}
      <div
        ref={canvasContainerRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          width: '100%',
          height: '100%'
        }}
      />

      {/* Spatial Lens Vignette Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2,
        boxShadow: 'inset 0 0 160px rgba(12, 19, 34, 0.95), inset 0 0 80px rgba(0, 0, 0, 0.85)'
      }} />

      {/* Top Quiet Meta Bar */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '1.25rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(180deg, rgba(12, 19, 34, 0.8) 0%, rgba(12, 19, 34, 0) 100%)'
      }}>
        {/* Left: Memory Title & Hometown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'rgba(251, 191, 36, 0.2)',
            border: '2px solid #FCD34D',
            color: '#FCD34D',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '18px',
            fontWeight: '700',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Eye size={20} />
            <span>VR Memory Space</span>
          </div>

          <span style={{ fontSize: '20px', color: '#F8FAFC', fontWeight: '700' }}>
            {currentMemory.title}
          </span>
          {currentMemory.location && (
            <span style={{ fontSize: '18px', color: '#94A3B8' }}>
              • {currentMemory.location}
            </span>
          )}
        </div>

        {/* Right: Progress & Return */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '18px', color: '#F8FAFC', fontWeight: '700' }}>
            Memory {currentIndex + 1} of {memories.length}
          </span>

          <button
            type="button"
            onClick={onSessionComplete}
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              border: '2px solid #475569',
              color: '#FFFFFF',
              borderRadius: '16px',
              padding: '8px 18px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Exit VR
          </button>
        </div>
      </div>

      {/* Main Spatial Center Viewport (Spacer) */}
      <div style={{ flex: 1, position: 'relative', zIndex: 10 }} />

      {/* Bottom Voice-First Spatial Prompt & Interaction Console */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '1.5rem 2rem 2.5rem',
        background: 'linear-gradient(0deg, rgba(12, 19, 34, 0.96) 0%, rgba(12, 19, 34, 0.85) 75%, rgba(12, 19, 34, 0) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '1rem'
      }}>
        {/* Tiered Hint Banner (Fades in on attempt 2 or 3) */}
        {currentHintText && (
          <div style={{
            background: 'rgba(251, 191, 36, 0.15)',
            border: '2px solid #FCD34D',
            borderRadius: '20px',
            padding: '12px 28px',
            fontSize: '24px',
            color: '#FEF08A',
            fontWeight: '700',
            maxWidth: '850px',
            boxShadow: '0 8px 24px rgba(251, 191, 36, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <HelpCircle size={28} color="#FBBF24" />
            <span>{currentHintText}</span>
          </div>
        )}

        {/* Supportive Feedback (Dignity-first reassurance) */}
        {supportiveFeedback && (
          <div style={{
            fontSize: '24px',
            color: phase === 'success' ? '#34D399' : '#FCD34D',
            fontWeight: '700'
          }}>
            {supportiveFeedback}
          </div>
        )}

        {/* Large 36px+ High-Contrast Conversational Prompt */}
        <h2 style={{
          fontSize: '38px',
          fontWeight: '800',
          color: '#FFFFFF',
          margin: '4px 0',
          lineHeight: '1.3',
          maxWidth: '960px',
          textShadow: '0 4px 16px rgba(0, 0, 0, 0.8)'
        }}>
          "{currentMemory.questionPrompt || 'Who is standing beside you in this photo?'}"
        </h2>

        {/* Voice-First Listening Indicator / Mic Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
          <button
            type="button"
            onClick={() => {
              if (isListening) stopVoiceListening();
              else startVoiceListening();
            }}
            style={{
              background: isListening ? '#DC2626' : 'linear-gradient(135deg, #4F46E5, #0284C7)',
              color: '#FFFFFF',
              border: isListening ? '3px solid #FCA5A5' : '3px solid #38BDF8',
              borderRadius: '24px',
              padding: '16px 36px',
              fontSize: '24px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '14px',
              boxShadow: isListening ? '0 0 25px rgba(220, 38, 38, 0.7)' : '0 10px 25px rgba(79, 70, 229, 0.5)',
              transition: 'all 0.2s'
            }}
          >
            {isListening ? (
              <>
                <MicOff size={30} />
                <span>Listening... (Speak Now)</span>
              </>
            ) : (
              <>
                <Mic size={30} />
                <span>Tap & Speak Your Answer</span>
              </>
            )}
          </button>

          {/* Repeat Question Audio Button */}
          <button
            type="button"
            onClick={() => speechService.speak(currentMemory.questionPrompt, activeLang)}
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              border: '2px solid #475569',
              borderRadius: '20px',
              width: '64px',
              height: '64px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              cursor: 'pointer'
            }}
            title="Listen to question again"
          >
            🔊
          </button>
        </div>

        {/* Recognized Transcript Display */}
        {recognizedText && (
          <div style={{ fontSize: '20px', color: '#94A3B8' }}>
            Heard: <strong style={{ color: '#F8FAFC' }}>"{recognizedText}"</strong>
          </div>
        )}

        {/* Accessible One-Tap Answer Affirmation (Fallback for elder convenience) */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: '6px',
          maxWidth: '850px'
        }}>
          {currentMemory.people?.[0] && (
            <button
              type="button"
              onClick={() => evaluateResponse(currentMemory.people[0])}
              style={{
                background: 'rgba(30, 41, 59, 0.85)',
                border: '2px solid rgba(148, 163, 184, 0.4)',
                color: '#F8FAFC',
                borderRadius: '16px',
                padding: '12px 22px',
                fontSize: '20px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              👤 {currentMemory.people[0]}
            </button>
          )}

          {currentMemory.relationship && (
            <button
              type="button"
              onClick={() => evaluateResponse(currentMemory.relationship)}
              style={{
                background: 'rgba(30, 41, 59, 0.85)',
                border: '2px solid rgba(148, 163, 184, 0.4)',
                color: '#F8FAFC',
                borderRadius: '16px',
                padding: '12px 22px',
                fontSize: '20px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              ❤️ {currentMemory.relationship}
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSuccess()}
            style={{
              background: 'rgba(16, 185, 129, 0.2)',
              border: '2px solid #10B981',
              color: '#6EE7B7',
              borderRadius: '16px',
              padding: '12px 22px',
              fontSize: '20px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            ✓ Yes, I Remember Warmly
          </button>
        </div>
      </div>
    </div>
  );
}
