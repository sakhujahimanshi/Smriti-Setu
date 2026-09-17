import React from 'react';
import {
  Activity,
  CheckCircle,
  Clock,
  Heart,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Calendar
} from 'lucide-react';

export default function ExecutiveDashboard({ metrics, profile, sessions, onOpenAssessmentConfig }) {
  const summary = metrics?.summary || {
    weeklySessionsCount: 7,
    participationStatus: 'Consistent Participation',
    comfortLevel: 'Comfortable & Unhurried',
    routineCompletionRate: 85,
    totalRoutines: 3,
    completedSteps: 6,
    totalSteps: 8,
    activeReminders: 4,
    registeredFamilyMembers: 4
  };

  const topTopics = metrics?.topTopics || [
    { topic: 'Rongali Bihu Celebrations & Dhol', count: 3 },
    { topic: 'Granddaughter Maina (Til Pitha)', count: 3 },
    { topic: 'Assam Orthodox Golden Tips Tea', count: 2 },
    { topic: 'Brahmaputra Sunset Cruises', count: 1 }
  ];

  const recentSessions = sessions && sessions.length > 0
    ? sessions
    : (metrics?.recentSessions || []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Pre-UI Daily Memory Assessment Configuration Card (Executive Spotlight) */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(254, 243, 199, 0.9) 100%)',
        border: '2px solid rgba(217, 119, 6, 0.3)',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 4px 16px rgba(217, 119, 6, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(217, 119, 6, 0.15)',
            color: 'var(--accent-amber)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)' }}>
                Pre-UI Daily Memory Assessment Gate Configuration
              </h3>
              <span className="badge-pill" style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #FCD34D' }}>
                🔒 Mandatory Pre-UI Gate Active
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
              Configure the 5–10 daily memory questions and corresponding correct answer keys. Controls the pre-UI gate that blocks the elderly site on launch.
            </p>
          </div>
        </div>
        <button
          className="btn-indigo"
          onClick={onOpenAssessmentConfig}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '14px', fontWeight: '700' }}
        >
          <span>Configure 5–10 Questions & Keys →</span>
        </button>
      </div>

      {/* Critical Medical & Product Safety Compliance Banner */}
      <div style={{
        background: 'rgba(5, 150, 105, 0.06)',
        border: '1px solid rgba(5, 150, 105, 0.2)',
        borderRadius: '14px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={22} color="var(--affirm-green)" />
          <div>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--affirm-green)' }}>
              Safety & Dignity-First Compliance Guaranteed
            </span>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              This platform does NOT produce clinical diagnostic labels, dementia severity ratings, or numerical test scores. Observations are dignity-first.
            </p>
          </div>
        </div>

        <div className="badge-pill badge-emerald">
          Zero Diagnostic Scoring
        </div>
      </div>

      {/* Top 4 Executive Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Metric 1: Participation */}
        <div className="exec-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
              Weekly Engagement
            </span>
            <div style={{ background: 'rgba(217, 119, 6, 0.12)', padding: '8px', borderRadius: '10px' }}>
            <Calendar size={18} color="var(--accent-amber)" />
          </div>
        </div>
        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
          {summary.weeklySessionsCount} Sessions
        </div>
          <div className="badge-pill badge-indigo">
            {summary.participationStatus}
          </div>
        </div>

        {/* Metric 2: Comfort Pace */}
        <div className="exec-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
              Comfort & Pace
            </span>
            <div style={{ background: 'rgba(5, 150, 105, 0.12)', padding: '8px', borderRadius: '10px' }}>
            <Heart size={18} color="var(--affirm-green)" />
          </div>
        </div>
        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--affirm-green)', marginBottom: '6px' }}>
            {summary.comfortLevel}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Gentle, unhurried participation
          </p>
        </div>

        {/* Metric 3: Routine Completion */}
        <div className="exec-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
              Routine Completion
            </span>
            <div style={{ background: 'rgba(217, 119, 6, 0.12)', padding: '8px', borderRadius: '10px' }}>
            <CheckCircle size={18} color="var(--accent-amber)" />
          </div>
        </div>
        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--accent-amber-hover)', marginBottom: '6px' }}>
          {summary.routineCompletionRate}%
        </div>
        <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${summary.routineCompletionRate}%`, height: '100%', background: 'var(--accent-amber)' }} />
        </div>
        </div>

        {/* Metric 4: Registered Family Members */}
        <div className="exec-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
              Family Memory Links
            </span>
            <div style={{ background: 'rgba(8, 145, 178, 0.12)', padding: '8px', borderRadius: '10px' }}>
              <UserCheck size={18} color="var(--accent-cyan)" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
            {summary.registeredFamilyMembers} Members
          </div>
          <div className="badge-pill badge-cyan">
            Active Reminiscence Hooks
          </div>
        </div>
      </div>

      {/* Middle Grid: Weekly Activity Chart + Top Reminiscence Topics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Weekly Participation Trend */}
        <div className="exec-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '16px' }}>Weekly Engagement Rhythm</h3>
            <span className="badge-pill badge-emerald">Consistent Rhythm</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '150px', padding: '10px 0' }}>
            {[
              { day: 'Mon', mins: 15, active: true },
              { day: 'Tue', mins: 20, active: true },
              { day: 'Wed', mins: 12, active: true },
              { day: 'Thu', mins: 18, active: true },
              { day: 'Fri', mins: 22, active: true },
              { day: 'Sat', mins: 25, active: true },
              { day: 'Sun', mins: 16, active: true }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: `${item.mins * 4.5}px`,
                  background: 'linear-gradient(180deg, var(--accent-amber-light), var(--accent-amber))',
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(217, 119, 6, 0.2)'
                }} />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.day}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
            Average: ~18 mins/day of calm reminiscence & routine guidance.
          </p>
        </div>

        {/* Favorite Heritage Topics */}
        <div className="exec-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '16px' }}>Top Reminiscence Topics</h3>
            <span className="badge-pill badge-amber">Deep Nostalgia</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topTopics.map((t, idx) => (
              <div key={idx} style={{
                background: '#FAF8F5',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={16} color="var(--accent-amber)" />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{t.topic}</span>
                </div>
                <span className="badge-pill badge-indigo">{t.count} Sessions</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Audit Table */}
      <div className="exec-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '16px' }}>Activity Session History (Dignity-First Logs)</h3>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Showing recent interactions</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="exec-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Activity Module</th>
                <th>Duration</th>
                <th>Focus Topic</th>
                <th>Supportive Observation</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map((s, idx) => {
                const date = new Date(s.createdAt || Date.now());
                return (
                  <tr key={s._id || idx}>
                    <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {date.toLocaleDateString()} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      {s.activityTitle}
                    </td>
                    <td>
                      {Math.round((s.durationSeconds || 180) / 60)} mins
                    </td>
                    <td style={{ color: 'var(--accent-amber)' }}>
                      {s.favoriteTopicRevisited || 'Heritage Story'}
                    </td>
                    <td>
                      <span className="badge-pill badge-emerald">
                        {s.supportiveFeedback || 'Consistent Participation'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
