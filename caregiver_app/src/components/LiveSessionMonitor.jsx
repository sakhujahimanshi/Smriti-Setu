import React, { useState, useEffect } from 'react';
import { Radio, Eye, Clock, HelpCircle, MessageSquare, CheckCircle, RefreshCw, AlertCircle, Sparkles, Volume2 } from 'lucide-react';
import { getSocket } from '../socket';

export default function LiveSessionMonitor({ onSessionCompleted }) {
  const [sessionState, setSessionState] = useState({
    isActive: false,
    activityTitle: '',
    activityType: '',
    status: 'Idle — Awaiting Elder Activity',
    attempts: 0,
    hintsDelivered: 0,
    responseTimeSec: 0,
    userVoiceTranscript: '',
    isCorrect: null,
    lastUpdate: null
  });

  const [connected, setConnected] = useState(false);
  const [elapsedTimer, setElapsedTimer] = useState(0);

  useEffect(() => {
    const socket = getSocket();
    setConnected(socket.connected);

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // 1. Listen for activity start
    const handleActivityStart = (data) => {
      console.log('⚡ [Live Monitor] Activity Started:', data);
      setSessionState(prev => ({
        ...prev,
        isActive: true,
        activityTitle: data?.activityName || data?.title || 'Cognitive Engagement',
        activityType: data?.activityType || 'game',
        status: 'Elderly participant entered activity',
        attempts: 1,
        hintsDelivered: 0,
        responseTimeSec: 0,
        userVoiceTranscript: '',
        isCorrect: null,
        lastUpdate: Date.now()
      }));
      setElapsedTimer(0);
    };

    // 2. Listen for high-frequency live telemetry
    const handleTelemetry = (data) => {
      setSessionState(prev => ({
        ...prev,
        isActive: true,
        activityTitle: data?.memoryTitle || data?.activityTitle || prev.activityTitle || 'Active Engagement',
        status: data?.status || data?.userStatus || 'User responding...',
        attempts: data?.attempts ?? prev.attempts,
        hintsDelivered: data?.hintsDelivered ?? prev.hintsDelivered,
        responseTimeSec: data?.responseTimeSec || data?.responseTimeSeconds || prev.responseTimeSec,
        userVoiceTranscript: data?.userVoiceTranscript || prev.userVoiceTranscript,
        isCorrect: data?.isCorrect ?? prev.isCorrect,
        lastUpdate: Date.now()
      }));
    };

    // 3. Listen for session completion
    const handleSessionComplete = (data) => {
      console.log('⚡ [Live Monitor] Session Completed:', data);
      setSessionState(prev => ({
        ...prev,
        isActive: false,
        status: 'Completed — Saved to MongoDB',
        lastUpdate: Date.now()
      }));
      // Delay callback to let the game's POST /api/sessions write commit to DB first
      if (onSessionCompleted) {
        setTimeout(() => onSessionCompleted(data), 1000);
        setTimeout(() => onSessionCompleted(data), 2500);
      }
    };

    socket.on('caregiver:activity-started', handleActivityStart);
    socket.on('elderly:activity-started', handleActivityStart);
    socket.on('caregiver:live-telemetry', handleTelemetry);
    socket.on('caregiver:live-telemetry-broadcast', handleTelemetry);
    socket.on('caregiver:session-completed', handleSessionComplete);
    socket.on('caregiver:session-completed-broadcast', handleSessionComplete);
    socket.on('caregiver:game-completed', handleSessionComplete);
    socket.on('caregiver:vr-completed', handleSessionComplete);

    return () => {
      socket.off('caregiver:activity-started', handleActivityStart);
      socket.off('elderly:activity-started', handleActivityStart);
      socket.off('caregiver:live-telemetry', handleTelemetry);
      socket.off('caregiver:live-telemetry-broadcast', handleTelemetry);
      socket.off('caregiver:session-completed', handleSessionComplete);
      socket.off('caregiver:session-completed-broadcast', handleSessionComplete);
      socket.off('caregiver:game-completed', handleSessionComplete);
      socket.off('caregiver:vr-completed', handleSessionComplete);
    };
  }, [onSessionCompleted]);

  // Live timer tick when active
  useEffect(() => {
    let interval = null;
    if (sessionState.isActive) {
      interval = setInterval(() => {
        setElapsedTimer(prev => Number((prev + 0.5).toFixed(1)));
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionState.isActive]);

  const sendRemoteControl = (action) => {
    const socket = getSocket();
    socket.emit('caregiver:control', { action, timestamp: Date.now() });
  };

  return (
    <div style={{
      background: sessionState.isActive 
        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(30, 41, 59, 0.95) 100%)' 
        : '#1e293b',
      border: sessionState.isActive ? '2px solid #10b981' : '1px solid #334155',
      borderRadius: '16px',
      padding: '1.4rem 1.6rem',
      marginBottom: '2rem',
      boxShadow: sessionState.isActive ? '0 8px 30px rgba(16, 185, 129, 0.18)' : '0 4px 20px rgba(0,0,0,0.2)',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', borderBottom: '1px solid #334155', paddingBottom: '0.9rem', marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: sessionState.isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.1)',
            color: sessionState.isActive ? '#34d399' : '#94a3b8',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 700
          }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: sessionState.isActive ? '#10b981' : '#64748b',
              boxShadow: sessionState.isActive ? '0 0 12px #10b981' : 'none',
              animation: sessionState.isActive ? 'pulse 1.5s infinite' : 'none'
            }} />
            {sessionState.isActive ? 'LIVE SESSION IN PROGRESS' : 'LIVE TELEMETRY MONITOR (IDLE)'}
          </div>

          <span style={{ fontSize: '0.8rem', color: connected ? '#38bdf8' : '#f87171' }}>
            {connected ? '● Socket.IO Connected' : '○ Reconnecting Socket...'}
          </span>
        </div>

        {sessionState.isActive && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => sendRemoteControl('gentle_chime')}
              style={{
                background: '#334155',
                color: '#f8fafc',
                border: '1px solid #475569',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <Sparkles size={14} color="#38bdf8" /> Send Calming Chime
            </button>
            <button
              onClick={() => sendRemoteControl('skip')}
              style={{
                background: '#475569',
                color: '#fff',
                border: 'none',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Next Activity ⏭
            </button>
          </div>
        )}
      </div>

      {sessionState.isActive ? (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.2rem' }}>
            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Focus</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>
                {sessionState.activityTitle || 'Personal Memory Exploration'}
              </div>
            </div>

            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Participant State</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#38bdf8', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Eye size={16} /> {sessionState.status}
              </div>
            </div>

            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Response Timer</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fbbf24', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} /> {elapsedTimer}s
              </div>
            </div>

            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assistance & Attempts</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#cbd5e1', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <HelpCircle size={16} color="#fbbf24" /> {sessionState.hintsDelivered} Hints Delivered · {sessionState.attempts} Attempts
              </div>
            </div>
          </div>

          {sessionState.userVoiceTranscript && (
            <div style={{
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              padding: '0.9rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem'
            }}>
              <Volume2 size={20} color="#38bdf8" />
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Real-Time Spoken Response:</span>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
                  "{sessionState.userVoiceTranscript}"
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#cbd5e1' }}>
              Awaiting elderly engagement on the VR Experience / Cognitive Support Site
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
              When the elder clicks any activity, opens a memory, or speaks, live telemetry will stream here automatically.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #334155', fontSize: '0.8rem', color: '#94a3b8' }}>
            <Radio size={14} color="#38bdf8" /> Real-time stream listening on Port 5050
          </div>
        </div>
      )}
    </div>
  );
}
