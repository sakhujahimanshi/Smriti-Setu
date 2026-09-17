import React, { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle2, AlertCircle, HelpCircle, FastForward, Pause, Play, Sparkles, User, Eye } from 'lucide-react';

export default function LiveSessionPanel({
  liveSessionData,
  onSkipMemory,
  onTogglePause,
  isPaused
}) {
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Incremental response timer while active
  useEffect(() => {
    if (!liveSessionData || liveSessionData.userStatus === 'Completed' || isPaused) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => +(prev + 0.1).toFixed(1));
    }, 100);

    return () => clearInterval(interval);
  }, [liveSessionData, isPaused]);

  // Reset timer on active memory change
  useEffect(() => {
    setTimerSeconds(0);
  }, [liveSessionData?.activeMemoryId]);

  if (!liveSessionData) {
    return (
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px dashed #475569',
        borderRadius: '20px',
        padding: '2rem',
        textAlign: 'center',
        color: '#94A3B8'
      }}>
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'rgba(51, 65, 85, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          color: '#64748B'
        }}>
          <Activity size={28} />
        </div>
        <h4 style={{ fontSize: '18px', color: '#F1F5F9', marginBottom: '6px' }}>
          No Active VR Session Running
        </h4>
        <p style={{ fontSize: '14px', maxWidth: '420px', margin: '0 auto', lineHeight: '1.5' }}>
          Select memories in the album below and click <strong>“Start Live VR Session”</strong>. Real-time telemetry and voice evaluation will stream here automatically.
        </p>
      </div>
    );
  }

  const {
    activeMemoryTitle = 'Personal Memory',
    imageUrl,
    userStatus = 'Viewing Memory...',
    responseEvaluation,
    hintsDelivered = 0,
    attempts = 1,
    sessionProgress = '1 / 1'
  } = liveSessionData;

  const isCompleted = userStatus === 'Completed';

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
      border: '2px solid #38BDF8',
      borderRadius: '24px',
      padding: '1.5rem 1.75rem',
      boxShadow: '0 15px 35px -5px rgba(14, 165, 233, 0.25)',
      marginBottom: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Status Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
        paddingBottom: '1rem',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid #38BDF8'
          }}>
            <Activity size={20} color="#38BDF8" />
            <span style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 8px #10B981'
            }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '18px', color: '#F8FAFC', margin: 0, fontWeight: '700' }}>
                Live VR Session Telemetry Stream
              </h3>
              <span style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#6EE7B7',
                fontSize: '12px',
                fontWeight: '700',
                padding: '2px 10px',
                borderRadius: '12px',
                border: '1px solid rgba(16, 185, 129, 0.4)'
              }}>
                ● Synchronized Live
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
              Real-time cognitive engagement and voice monitoring for Bhaben Baruah
            </p>
          </div>
        </div>

        {/* Session Progress Pill */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid #334155',
          borderRadius: '14px',
          padding: '6px 16px',
          fontSize: '14px',
          fontWeight: '700',
          color: '#38BDF8',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>Progress:</span>
          <strong style={{ color: '#FFFFFF', fontSize: '16px' }}>{sessionProgress} Memories</strong>
        </div>
      </div>

      {/* Main Telemetry Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr auto',
        gap: '1.5rem',
        alignItems: 'center'
      }}>
        {/* Memory Thumbnail */}
        <div style={{
          width: '120px',
          height: '90px',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '2px solid rgba(56, 189, 248, 0.4)',
          background: '#0F172A',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)'
        }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={activeMemoryTitle}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
              <Eye size={28} />
            </div>
          )}
        </div>

        {/* Memory State & Live Metrics */}
        <div>
          <h4 style={{ fontSize: '20px', color: '#FFFFFF', margin: '0 0 6px 0', fontWeight: '700' }}>
            {activeMemoryTitle}
          </h4>

          {/* User Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <span style={{
              background: isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.15)',
              color: isCompleted ? '#6EE7B7' : '#38BDF8',
              border: isCompleted ? '1px solid #10B981' : '1px solid #0284C7',
              borderRadius: '12px',
              padding: '4px 12px',
              fontSize: '13px',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {isCompleted ? <CheckCircle2 size={15} /> : <Activity size={15} />}
              Status: {userStatus}
            </span>

            {/* Response Evaluation Pill */}
            {responseEvaluation && (
              <span style={{
                background: responseEvaluation === 'Success' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.2)',
                color: responseEvaluation === 'Success' ? '#34D399' : '#FCD34D',
                border: responseEvaluation === 'Success' ? '1px solid #059669' : '1px solid #D97706',
                borderRadius: '12px',
                padding: '4px 12px',
                fontSize: '13px',
                fontWeight: '700'
              }}>
                Evaluation: {responseEvaluation === 'Success' ? '✓ Recall Successful' : 'Gentle Assistance Provided'}
              </span>
            )}
          </div>

          {/* Metric Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '13px', color: '#CBD5E1', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} color="#38BDF8" />
              <span>Response Time: <strong style={{ color: '#FFFFFF', fontSize: '15px' }}>{timerSeconds}s</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={15} color="#FBBF24" />
              <span>Hints Delivered: <strong style={{ color: '#FFFFFF', fontSize: '15px' }}>{hintsDelivered} / 2</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} color="#A78BFA" />
              <span>Attempts: <strong style={{ color: '#FFFFFF', fontSize: '15px' }}>{attempts}</strong></span>
            </div>
          </div>
        </div>

        {/* Remote Caregiver Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '160px' }}>
          <button
            type="button"
            onClick={onSkipMemory}
            disabled={isCompleted}
            style={{
              background: 'rgba(51, 65, 85, 0.8)',
              color: '#FFFFFF',
              border: '1px solid #475569',
              borderRadius: '12px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: isCompleted ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <FastForward size={15} />
            <span>Next Memory</span>
          </button>

          <button
            type="button"
            onClick={onTogglePause}
            style={{
              background: isPaused ? '#065F46' : 'rgba(30, 41, 59, 0.8)',
              color: isPaused ? '#A7F3D0' : '#CBD5E1',
              border: '1px solid #475569',
              borderRadius: '12px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {isPaused ? <Play size={15} /> : <Pause size={15} />}
            <span>{isPaused ? 'Resume Session' : 'Pause VR'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
