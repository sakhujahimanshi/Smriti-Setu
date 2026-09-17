import React, { useState, useEffect } from 'react';
import { X, Smartphone, Copy, Check, ExternalLink, Wifi, ShieldAlert } from 'lucide-react';

export default function MobileConnectModal({ isOpen, onClose, apiUrl }) {
  const [networkInfo, setNetworkInfo] = useState(null);
  const [copiedApp, setCopiedApp] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState('caregiver'); // 'caregiver' or 'elderly'

  useEffect(() => {
    if (isOpen) {
      fetch(`${apiUrl}/api/system/network`)
        .then(res => res.json())
        .then(data => setNetworkInfo(data))
        .catch(err => console.error('Failed to fetch network info:', err));
    }
  }, [isOpen, apiUrl]);

  if (!isOpen) return null;

  const lanIp = networkInfo?.lanIp || window.location.hostname || '127.0.0.1';
  const targetUrl = selectedTarget === 'caregiver'
    ? `http://${lanIp}:3000`
    : `http://${lanIp}:3001`;

  // Standard high-reliability QR code image via quick svg/image encoder
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(targetUrl)}`;

  const handleCopy = (url, type) => {
    navigator.clipboard.writeText(url);
    setCopiedApp(type);
    setTimeout(() => setCopiedApp(null), 2500);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1.5rem'
    }}>
      <div style={{
        background: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '560px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: '#0F172A',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Smartphone size={22} color="#818CF8" />
            <h3 style={{ fontSize: '18px', color: '#FFFFFF' }}>
              Local Wi-Fi Mobile PWA Connection
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.75rem' }}>
          <div style={{
            background: 'rgba(79, 70, 229, 0.1)',
            border: '1px solid rgba(79, 70, 229, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13px',
            color: '#CBD5E1'
          }}>
            <Wifi size={24} color="#818CF8" style={{ flexShrink: 0 }} />
            <span>
              Connected to local network. Judges can scan this QR code using an iPhone / Android camera on the same Wi-Fi to test the mobile PWA directly.
            </span>
          </div>

          {/* App Switcher Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            background: '#0F172A',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '1.5rem'
          }}>
            <button
              onClick={() => setSelectedTarget('caregiver')}
              style={{
                background: selectedTarget === 'caregiver' ? '#4F46E5' : 'none',
                color: selectedTarget === 'caregiver' ? '#FFFFFF' : '#94A3B8',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Caregiver App (Port 3000)
            </button>
            <button
              onClick={() => setSelectedTarget('elderly')}
              style={{
                background: selectedTarget === 'elderly' ? '#D97706' : 'none',
                color: selectedTarget === 'elderly' ? '#FFFFFF' : '#94A3B8',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Elderly Site (Port 3001)
            </button>
          </div>

          {/* QR Code Container */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'center',
            width: '240px',
            margin: '0 auto 1.5rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
          }}>
            <img
              src={qrCodeUrl}
              alt="Scan QR Code"
              style={{ width: '100%', height: 'auto', display: 'block' }}
              onError={(e) => {
                // Fallback display if offline
                e.target.style.display = 'none';
              }}
            />
            <p style={{ color: '#0F172A', fontSize: '12px', fontWeight: '700', marginTop: '10px' }}>
              SCAN WITH PHONE CAMERA
            </p>
          </div>

          {/* Direct URL copy bar */}
          <div style={{
            background: '#0F172A',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block' }}>Direct Wi-Fi URL:</span>
              <strong style={{ fontSize: '14px', color: '#38BDF8', fontFamily: 'monospace' }}>{targetUrl}</strong>
            </div>

            <button
              className="btn-indigo"
              onClick={() => handleCopy(targetUrl, selectedTarget)}
              style={{ padding: '8px 14px', fontSize: '12px' }}
            >
              {copiedApp === selectedTarget ? (
                <>
                  <Check size={14} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
