import React, { useState } from 'react';
import { X, RefreshCw, UserPlus, Database, ShieldCheck, CheckCircle } from 'lucide-react';

export default function DemoSetupModal({ isOpen, onClose, onDataUpdated, apiUrl }) {
  const [activeTab, setActiveTab] = useState('reseed');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form states for adding new family member directly to MongoDB
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Granddaughter');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80');
  const [memoryHook, setMemoryHook] = useState('Loves making sweet Til Pitha with you during Magh Bihu!');

  if (!isOpen) return null;

  const handleReseed = async () => {
    setLoading(true);
    setSuccessMsg('');
    try {
      const res = await fetch(`${apiUrl}/api/system/reset-demo`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Successfully restored all authentic North-East cultural seed data!');
        if (onDataUpdated) onDataUpdated();
      }
    } catch (err) {
      alert('Failed to reset demo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFamilyMember = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setSuccessMsg('');
    try {
      const res = await fetch(`${apiUrl}/api/family`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          relation,
          photoUrl,
          memoryHook,
          recallChoices: [
            `${name} (${relation})`,
            'Deepak (Son)',
            'Family Friend'
          ]
        })
      });
      if (res.ok) {
        setSuccessMsg(`Added "${name}" to MongoDB successfully!`);
        setName('');
        if (onDataUpdated) onDataUpdated();
      }
    } catch (err) {
      alert('Error adding family member: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1.5rem'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '680px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '3px solid var(--border-subtle)'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.5rem 2rem',
          background: '#0F172A',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Database size={24} color="#F59E0B" />
            <h3 style={{ fontSize: '22px', color: '#FFFFFF' }}>
              Live Demo & Caregiver Fallback Setup
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
          >
            <X size={26} />
          </button>
        </div>

        {/* Safety & Demo Assurance Notice */}
        <div style={{
          background: '#F8FAFC',
          padding: '1rem 2rem',
          borderBottom: '1px solid #E2E8F0',
          fontSize: '15px',
          color: '#475569',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <ShieldCheck size={20} color="#059669" />
          <span>
            <strong>Fail-safe fallback:</strong> Input family data directly into the shared MongoDB if Wi-Fi prevents mobile phone access.
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid #E2E8F0' }}>
          <button
            onClick={() => setActiveTab('reseed')}
            style={{
              flex: 1,
              padding: '14px',
              background: activeTab === 'reseed' ? '#FFFBEB' : '#FFFFFF',
              border: 'none',
              borderBottom: activeTab === 'reseed' ? '3px solid var(--accent-amber)' : 'none',
              fontSize: '17px',
              fontWeight: '700',
              color: activeTab === 'reseed' ? 'var(--accent-amber-hover)' : '#64748B',
              cursor: 'pointer'
            }}
          >
            🔄 Reseed Cultural Data
          </button>
          <button
            onClick={() => setActiveTab('add_member')}
            style={{
              flex: 1,
              padding: '14px',
              background: activeTab === 'add_member' ? '#FFFBEB' : '#FFFFFF',
              border: 'none',
              borderBottom: activeTab === 'add_member' ? '3px solid var(--accent-amber)' : 'none',
              fontSize: '17px',
              fontWeight: '700',
              color: activeTab === 'add_member' ? 'var(--accent-amber-hover)' : '#64748B',
              cursor: 'pointer'
            }}
          >
            ➕ Quick Add Family Member
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '2rem' }}>
          {successMsg && (
            <div style={{
              background: '#DCFCE7',
              border: '2px solid #86EFAC',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#166534',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <CheckCircle size={20} />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'reseed' ? (
            <div>
              <p style={{ fontSize: '18px', color: '#334155', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Restore all default North Eastern cultural topics (Rongali Bihu, Assam tea gardens, Kaziranga, Majuli Satras) and family members (Maina, Rohan, Deepak, Dr. Ananya).
              </p>
              <button
                type="button"
                className="btn-large btn-amber"
                onClick={handleReseed}
                disabled={loading}
                style={{ width: '100%', minHeight: '64px', fontSize: '20px' }}
              >
                <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
                <span>{loading ? 'Reseeding MongoDB...' : 'Reset & Reseed All Cultural Data'}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleAddFamilyMember} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
                  Name:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Pari (Granddaughter)"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '18px',
                    borderRadius: '12px',
                    border: '2px solid #CBD5E1',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
                    Relation:
                  </label>
                  <select
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '18px',
                      borderRadius: '12px',
                      border: '2px solid #CBD5E1',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="Granddaughter">Granddaughter (Naati-Suwali)</option>
                    <option value="Grandson">Grandson (Naati-Lora)</option>
                    <option value="Daughter">Daughter (Suwali)</option>
                    <option value="Son">Son (Lora)</option>
                    <option value="Wife">Wife (Srimati)</option>
                    <option value="Brother">Brother (Kokaai)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
                    Photo URL:
                  </label>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '18px',
                      borderRadius: '12px',
                      border: '2px solid #CBD5E1',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
                  Memory Story / Clue:
                </label>
                <textarea
                  value={memoryHook}
                  onChange={(e) => setMemoryHook(e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '18px',
                    borderRadius: '12px',
                    border: '2px solid #CBD5E1',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn-large btn-sage"
                disabled={loading}
                style={{ minHeight: '64px', fontSize: '20px', marginTop: '8px' }}
              >
                <UserPlus size={24} />
                <span>{loading ? 'Saving...' : 'Add Directly to Shared MongoDB'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
