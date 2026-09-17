import React from 'react';
import { QrCode, RefreshCw, Sparkles, Shield } from 'lucide-react';

export default function Header({ profile, onOpenMobileConnect, onRefresh, activeTab, onTabChange }) {
  const tabs = [
    { id: 'dashboard', label: 'Executive Dashboard' },
    { id: 'assessment', label: '🛡️ Daily Assessment & AI Trends' },
    { id: 'memory_album', label: 'Memory Album & VR Studio' },
    { id: 'family', label: 'Family & Memory Clues' },
    { id: 'routines', label: 'Routine Builder' },
    { id: 'reminders', label: 'Reminders' },
    { id: 'ai_lab', label: 'AI Cultural Lab' },
    { id: 'profile', label: 'Elder Profile' }
  ];

  return (
    <header style={{
      background: '#FFFFFF',
      borderBottom: '2px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 2px 12px rgba(15, 23, 42, 0.06)'
    }}>
      {/* Top Bar */}
      <div style={{
        maxWidth: '1350px',
        margin: '0 auto',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand & Elder Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #D97706, #B45309)',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
          }}>
            <span style={{ fontSize: '22px' }}>🌿</span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '20px', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                Smriti Setu <span style={{ color: 'var(--accent-amber)', fontSize: '15px', fontWeight: '500' }}>স্মৃতি সেতু</span>
              </h1>
              <span className="badge-pill badge-indigo">Caregiver Executive Suite</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Monitoring: <strong style={{ color: 'var(--text-main)' }}>{profile?.name || 'Bhaben Baruah'}</strong> ({profile?.honorific || 'Koka'}) • {profile?.hometown || 'Sivasagar, Assam'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="badge-pill badge-emerald">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--affirm-green)', display: 'inline-block' }}></span>
            Active & Consistent Pace
          </div>

          {/* Mobile LAN QR Access button */}
          <button
            className="btn-indigo"
            onClick={onOpenMobileConnect}
            title="Scan QR Code to open on Mobile Wi-Fi"
          >
            <QrCode size={16} />
            <span>Mobile QR Access</span>
          </button>

          <button
            className="btn-secondary"
            onClick={onRefresh}
            title="Refresh records"
          >
            <RefreshCw size={15} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        maxWidth: '1350px',
        margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex',
        gap: '4px',
        overflowX: 'auto'
      }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: isActive ? `3px solid var(--accent-amber)` : '3px solid transparent',
                padding: '12px 16px',
                color: isActive ? 'var(--accent-amber-hover)' : 'var(--text-muted)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
