import React, { useState, useEffect } from 'react';
import { User, MapPin, Phone, ShieldCheck, Save, Heart, Sparkles } from 'lucide-react';

export default function ProfileSettings({ profile, onRefresh, apiUrl }) {
  const [form, setForm] = useState({
    name: 'Bhaben Baruah',
    honorific: 'Koka',
    greetingTitle: 'Suprabhat',
    hometown: 'Sivasagar & Jorhat, Assam',
    currentResidence: 'Beltola, Guwahati',
    primaryLanguage: 'Assamese',
    secondaryLanguage: 'English',
    comfortNotes: 'Responds warmly to memories of the Sivasagar historic tank, Rongali Bihu dhol beats, and childhood tea gardens.',
    emergencyName: 'Deepak Baruah (Son)',
    emergencyPhone: '+91 98640 12345'
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || 'Bhaben Baruah',
        honorific: profile.honorific || 'Koka',
        greetingTitle: profile.greetingTitle || 'Suprabhat',
        hometown: profile.hometown || 'Sivasagar & Jorhat, Assam',
        currentResidence: profile.currentResidence || 'Beltola, Guwahati',
        primaryLanguage: profile.primaryLanguage || 'Assamese',
        secondaryLanguage: profile.secondaryLanguage || 'English',
        comfortNotes: profile.comfortNotes || '',
        emergencyName: profile.emergencyContact?.name || 'Deepak Baruah (Son)',
        emergencyPhone: profile.emergencyContact?.phone || '+91 98640 12345'
      });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch(`${apiUrl}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          honorific: form.honorific,
          greetingTitle: form.greetingTitle,
          hometown: form.hometown,
          currentResidence: form.currentResidence,
          primaryLanguage: form.primaryLanguage,
          secondaryLanguage: form.secondaryLanguage,
          comfortNotes: form.comfortNotes,
          emergencyContact: {
            name: form.emergencyName,
            relation: 'Primary Caregiver',
            phone: form.emergencyPhone
          }
        })
      });

      if (res.ok) {
        setSuccess(true);
        onRefresh();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="exec-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '20px', color: '#FFFFFF' }}>Elderly Profile & Regional Sensitivity</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Personalize greetings, honorifics, and cultural touchpoints for the Elderly Support Site.
            </p>
          </div>
          <div className="badge-pill badge-emerald">
            NER Sensitivity Configured
          </div>
        </div>

        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '10px',
            padding: '12px 16px',
            color: '#34D399',
            fontSize: '14px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={16} />
            <span>Profile successfully updated! Changes are reflected immediately on the Elderly Site.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Elder's Full Name:
              </label>
              <input
                type="text"
                className="input-dark"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Cultural Honorific:
              </label>
              <select
                className="input-dark"
                value={form.honorific}
                onChange={(e) => setForm({ ...form, honorific: e.target.value })}
              >
                <option value="Koka">Koka (Grandfather - Assamese)</option>
                <option value="Aita">Aita (Grandmother - Assamese)</option>
                <option value="Deuta">Deuta (Father - Assamese)</option>
                <option value="Maa">Maa (Mother)</option>
                <option value="Dadu">Dadu (Grandfather - Bengali)</option>
                <option value="Thakuma">Thakuma (Grandmother - Bengali)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Birthplace / Ancestral Hometown:
              </label>
              <input
                type="text"
                className="input-dark"
                value={form.hometown}
                onChange={(e) => setForm({ ...form, hometown: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Current Residence:
              </label>
              <input
                type="text"
                className="input-dark"
                value={form.currentResidence}
                onChange={(e) => setForm({ ...form, currentResidence: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Primary Language / Dialect:
              </label>
              <select
                className="input-dark"
                value={form.primaryLanguage}
                onChange={(e) => setForm({ ...form, primaryLanguage: e.target.value })}
              >
                <option value="Assamese">অসমীয়া (Assamese)</option>
                <option value="English">English</option>
                <option value="Nepali">नेपाली (Nepali)</option>
                <option value="Bengali">বাংলা (Bengali)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Greeting Title:
              </label>
              <input
                type="text"
                className="input-dark"
                value={form.greetingTitle}
                onChange={(e) => setForm({ ...form, greetingTitle: e.target.value })}
                placeholder="e.g. Suprabhat, Namaskar"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Comfort & Nostalgia Notes:
            </label>
            <textarea
              className="input-dark"
              rows={3}
              value={form.comfortNotes}
              onChange={(e) => setForm({ ...form, comfortNotes: e.target.value })}
            />
          </div>

          <div style={{ borderTop: '1px solid #28374D', paddingTop: '14px' }}>
            <h4 style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '10px' }}>Emergency Contact:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Contact Name & Relation:
                </label>
                <input
                  type="text"
                  className="input-dark"
                  value={form.emergencyName}
                  onChange={(e) => setForm({ ...form, emergencyName: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Phone Number:
                </label>
                <input
                  type="tel"
                  className="input-dark"
                  value={form.emergencyPhone}
                  onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="submit" className="btn-indigo" disabled={loading}>
              <Save size={16} />
              <span>{loading ? 'Saving...' : 'Update Profile in MongoDB'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
