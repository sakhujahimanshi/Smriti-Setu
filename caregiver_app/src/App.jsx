import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import MemoryAlbum from './components/MemoryAlbum';
import FamilyManager from './components/FamilyManager';
import RoutineBuilder from './components/RoutineBuilder';
import ReminderManager from './components/ReminderManager';
import ProfileSettings from './components/ProfileSettings';
import AICulturePlayground from './components/AICulturePlayground';
import MobileConnectModal from './components/MobileConnectModal';
import LiveSessionMonitor from './components/LiveSessionMonitor';
import AssessmentManager from './components/AssessmentManager';
import { getSocket } from './socket';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const [profile, setProfile] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [memories, setMemories] = useState([]);

  // Live VR telemetry state synchronized via WebSockets
  const [liveSessionData, setLiveSessionData] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const wsRef = useRef(null);

  // Use Vite proxy for seamless routing on both localhost and mobile LAN IP
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const fetchAll = async () => {
    try {
      const [pRes, mRes, sRes, fRes, rRes, remRes, memRes] = await Promise.all([
        fetch(`${apiUrl}/api/profile`),
        fetch(`${apiUrl}/api/metrics`),
        fetch(`${apiUrl}/api/sessions`),
        fetch(`${apiUrl}/api/family`),
        fetch(`${apiUrl}/api/routines`),
        fetch(`${apiUrl}/api/reminders`),
        fetch(`${apiUrl}/api/memories`)
      ]);

      if (pRes.ok) setProfile(await pRes.json());
      if (mRes.ok) setMetrics(await mRes.json());
      if (sRes.ok) setSessions(await sRes.json());
      if (fRes.ok) setFamilyMembers(await fRes.json());
      if (rRes.ok) setRoutines(await rRes.json());
      if (remRes.ok) setReminders(await remRes.json());
      if (memRes.ok) setMemories(await memRes.json());
    } catch (err) {
      console.warn('Backend sync notice:', err.message);
    }
  };

  // Setup WebSocket connection to backend for live telemetry
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
            role: 'caregiver',
            client: 'CaregiverDashboard'
          }));
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'VR_TELEMETRY_UPDATE') {
              setLiveSessionData({
                activeMemoryId: msg.activeMemoryId,
                activeMemoryTitle: msg.activeMemoryTitle,
                imageUrl: msg.imageUrl,
                userStatus: msg.userStatus,
                responseEvaluation: msg.responseEvaluation,
                responseTimeSeconds: msg.responseTimeSeconds,
                hintsDelivered: msg.hintsDelivered,
                attempts: msg.attempts,
                sessionProgress: msg.sessionProgress,
                timestamp: msg.timestamp
              });
            } else if (msg.type === 'VR_SESSION_START') {
              const firstMem = msg.memories?.[0];
              setLiveSessionData({
                activeMemoryId: firstMem?._id || firstMem?.id,
                activeMemoryTitle: firstMem?.title || 'Personal Memory',
                imageUrl: firstMem?.imageUrl,
                userStatus: 'User viewing memory in VR...',
                hintsDelivered: 0,
                attempts: 1,
                sessionProgress: `1 / ${msg.memories?.length || 1}`,
                timestamp: Date.now()
              });
            } else if (msg.type === 'SESSION_COMPLETED') {
              console.log('⚡ [WS Sync] Session completed received:', msg.session);
              if (msg.session) {
                setSessions((prev) => [msg.session, ...prev.filter((s) => s._id !== msg.session._id)]);
              }
              fetchAll();
              setTimeout(fetchAll, 800);
              setTimeout(fetchAll, 2500);
            } else if (msg.type === 'VR_SESSION_COMPLETE') {
              setLiveSessionData((prev) => prev ? {
                ...prev,
                userStatus: 'Completed',
                responseEvaluation: 'Success'
              } : null);
              fetchAll();
            } else if (['MEMORY_ADDED', 'MEMORY_UPDATED', 'MEMORY_DELETED', 'MEMORIES_BATCH_UPDATED'].includes(msg.type)) {
              fetchAll();
            }
          } catch (e) {
            console.warn('WS parse notice:', e);
          }
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        reconnectTimeout = setTimeout(connectWebSocket, 4000);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, [apiUrl]);

  // Real-Time Socket.IO Synchronization (Zero Page Refresh)
  useEffect(() => {
    const socket = getSocket();

    // Instant Game Completion Sync
    const handleGameCompleted = (data) => {
      console.log('⚡ [Socket.IO Sync] Game completed received:', data);
      if (data?.session) {
        setSessions(prev => [data.session, ...prev.filter(s => s._id !== data.session._id)]);
      }
      // Fetch immediately + retry after 800ms to guarantee DB write has committed
      fetchAll();
      setTimeout(fetchAll, 800);
      setTimeout(fetchAll, 2500);
    };

    // Instant VR Session Complete Sync
    const handleVRCompleted = (data) => {
      console.log('⚡ [Socket.IO Sync] VR completed received:', data);
      fetchAll();
      setTimeout(fetchAll, 800);
    };

    // Instant Memory Selection Toggle Sync
    const handleMemorySelectionChanged = (updatedMemory) => {
      console.log('⚡ [Socket.IO Sync] Memory selection changed:', updatedMemory);
      setMemories(prev => prev.map(m => (m._id === updatedMemory._id || m.id === updatedMemory._id) ? { ...m, ...updatedMemory } : m));
    };

    // Instant Memory Creation
    const handleMemoryCreated = (newMemory) => {
      console.log('⚡ [Socket.IO Sync] New memory created:', newMemory);
      setMemories(prev => [newMemory, ...prev.filter(m => m._id !== newMemory._id)]);
    };

    // Instant Memory Deleted
    const handleMemoryDeleted = ({ memoryId }) => {
      setMemories(prev => prev.filter(m => m._id !== memoryId && m.id !== memoryId));
    };

    socket.on('caregiver:game-completed', handleGameCompleted);
    socket.on('caregiver:session-completed', handleGameCompleted);
    socket.on('caregiver:assessment-completed', handleGameCompleted);
    socket.on('caregiver:vr-completed', handleVRCompleted);
    socket.on('memory:selection-changed', handleMemorySelectionChanged);
    socket.on('memory:created', handleMemoryCreated);
    socket.on('memory:deleted', handleMemoryDeleted);
    socket.on('memories:batch-updated', (all) => setMemories(all));

    return () => {
      socket.off('caregiver:game-completed', handleGameCompleted);
      socket.off('caregiver:session-completed', handleGameCompleted);
      socket.off('caregiver:assessment-completed', handleGameCompleted);
      socket.off('caregiver:vr-completed', handleVRCompleted);
      socket.off('memory:selection-changed', handleMemorySelectionChanged);
      socket.off('memory:created', handleMemoryCreated);
      socket.off('memory:deleted', handleMemoryDeleted);
    };
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 2000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  // Caregiver triggers live VR session start
  const handleStartVRSession = () => {
    const selected = memories.filter((m) => m.isSelectedForSession);
    if (selected.length === 0) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'VR_SESSION_START',
        role: 'caregiver',
        data: {
          memories: selected,
          sessionId: `session_${Date.now()}`
        }
      }));
    }

    const firstMem = selected[0];
    setLiveSessionData({
      activeMemoryId: firstMem._id,
      activeMemoryTitle: firstMem.title,
      imageUrl: firstMem.imageUrl,
      userStatus: 'Connecting elder into calm VR environment...',
      hintsDelivered: 0,
      attempts: 1,
      sessionProgress: `1 / ${selected.length}`
    });

    setActiveTab('memory_album');
  };

  // Remote skip memory
  const handleSkipMemory = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'VR_CONTROL_EVENT',
        role: 'caregiver',
        data: { action: 'SKIP' }
      }));
    }
  };

  // Remote Pause VR Override: Sends immediate termination signal to force-exit VR to home screen
  const handleTogglePause = () => {
    setIsPaused(true);

    // 1. Send immediate termination via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'VR_CONTROL_EVENT',
        role: 'caregiver',
        data: { action: 'FORCE_EXIT', reason: 'Caregiver paused and exited VR' }
      }));
    }

    // 2. Send immediate termination via Socket.IO
    try {
      const socket = getSocket();
      socket.emit('caregiver:control', {
        action: 'FORCE_EXIT_VR',
        target: 'vr_memory',
        timestamp: Date.now()
      });
    } catch (e) {
      console.warn('Socket emit error:', e);
    }

    // 3. Update local session monitor state
    setLiveSessionData((prev) => prev ? {
      ...prev,
      userStatus: 'VR Force-Exited by Caregiver',
      responseEvaluation: 'Terminated Remotely'
    } : null);

    fetchAll();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas-bg)', color: 'var(--text-main)', paddingBottom: '3rem' }}>
      <Header
        profile={profile}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenMobileConnect={() => setIsMobileModalOpen(true)}
        onRefresh={fetchAll}
      />

      <main style={{ maxWidth: '1350px', margin: '0 auto', padding: '1.75rem 1.5rem' }}>
        {/* Real-Time Live Session Monitor attached via Socket.IO */}
        <LiveSessionMonitor onSessionCompleted={fetchAll} />

        {activeTab === 'dashboard' && (
          <ExecutiveDashboard
            metrics={metrics}
            profile={profile}
            sessions={sessions}
            onOpenAssessmentConfig={() => setActiveTab('assessment')}
          />
        )}

        {activeTab === 'assessment' && (
          <AssessmentManager
            apiUrl={apiUrl}
            onRefreshAll={fetchAll}
          />
        )}

        {activeTab === 'memory_album' && (
          <MemoryAlbum
            memories={memories}
            onRefresh={fetchAll}
            apiUrl={apiUrl}
            onStartVRSession={handleStartVRSession}
            liveSessionData={liveSessionData}
            onSkipMemory={handleSkipMemory}
            onTogglePause={handleTogglePause}
            isPaused={isPaused}
          />
        )}

        {activeTab === 'family' && (
          <FamilyManager
            familyMembers={familyMembers}
            onRefresh={fetchAll}
            apiUrl={apiUrl}
          />
        )}

        {activeTab === 'routines' && (
          <RoutineBuilder
            routines={routines}
            onRefresh={fetchAll}
            apiUrl={apiUrl}
          />
        )}

        {activeTab === 'reminders' && (
          <ReminderManager
            reminders={reminders}
            onRefresh={fetchAll}
            apiUrl={apiUrl}
          />
        )}

        {activeTab === 'ai_lab' && (
          <AICulturePlayground
            apiUrl={apiUrl}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileSettings
            profile={profile}
            onRefresh={fetchAll}
            apiUrl={apiUrl}
          />
        )}
      </main>

      <MobileConnectModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        apiUrl={apiUrl}
      />
    </div>
  );
}
