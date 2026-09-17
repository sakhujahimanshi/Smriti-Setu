import React, { useState } from 'react';
import { UserPlus, Sparkles, Trash2, Edit3, Image, Heart, CheckCircle } from 'lucide-react';

const PRESET_PHOTOS = [
  { label: 'Young Woman (Granddaughter)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80' },
  { label: 'Young Man (Grandson)', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80' },
  { label: 'Mature Man (Son)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80' },
  { label: 'Mature Woman (Daughter)', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80' },
  { label: 'Elderly Matriarch (Wife / Sister)', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80' }
];

export default function FamilyManager({ familyMembers, onRefresh, apiUrl }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    relation: 'Granddaughter',
    culturalRelation: 'Naati-Suwali',
    photoUrl: PRESET_PHOTOS[0].url,
    memoryHook: '',
    voicePrompt: '',
    residence: 'Guwahati, Assam',
    recallChoices: []
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      name: '',
      relation: 'Granddaughter',
      culturalRelation: 'Naati-Suwali',
      photoUrl: PRESET_PHOTOS[0].url,
      memoryHook: '',
      voicePrompt: '',
      residence: 'Guwahati, Assam',
      recallChoices: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member) => {
    setEditingId(member._id);
    setForm({
      name: member.name,
      relation: member.relation,
      culturalRelation: member.culturalRelation || '',
      photoUrl: member.photoUrl,
      memoryHook: member.memoryHook,
      voicePrompt: member.voicePrompt || '',
      residence: member.residence || 'Guwahati, Assam',
      recallChoices: member.recallChoices || []
    });
    setIsModalOpen(true);
  };

  const handleGenerateAiClue = async () => {
    if (!form.name.trim()) {
      alert('Please enter a name first so AI can tailor the memory clue.');
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/ai/cultural-clue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elderName: 'Bhaben Koka',
          relationship: form.relation,
          topic: form.name
        })
      });
      const data = await res.json();
      if (data.clue) {
        setForm(prev => ({
          ...prev,
          memoryHook: data.clue,
          voicePrompt: `Look Koka, this is ${prev.name}, your ${prev.relation}. ${data.clue}`
        }));
      }
    } catch (err) {
      console.error('AI clue error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      recallChoices: [
        `${form.name} (${form.relation})`,
        'Deepak (Son)',
        'Ananya (Daughter)'
      ]
    };

    try {
      const url = editingId
        ? `${apiUrl}/api/family/${editingId}`
        : `${apiUrl}/api/family`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        onRefresh();
      }
    } catch (err) {
      alert('Error saving family member: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this family member?')) return;
    try {
      const res = await fetch(`${apiUrl}/api/family/${id}`, { method: 'DELETE' });
      if (res.ok) onRefresh();
    } catch (err) {
      alert('Error deleting: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header with Add Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '20px', color: '#FFFFFF' }}>Family Member Directory & Memory Clues</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            These profiles feed directly into the Elderly Site's "Smriti Ghor" face recognition cards.
          </p>
        </div>

        <button className="btn-indigo" onClick={handleOpenAdd}>
          <UserPlus size={16} />
          <span>Add Family Member</span>
        </button>
      </div>

      {/* Grid of Family Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {familyMembers.map((m) => (
          <div key={m._id} className="exec-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', gap: '14px', marginBottom: '14px' }}>
                <img
                  src={m.photoUrl}
                  alt={m.name}
                  style={{ width: '74px', height: '74px', borderRadius: '14px', objectFit: 'cover', border: '2px solid var(--border-color)' }}
                  onError={(e) => { e.target.src = PRESET_PHOTOS[0].url; }}
                />
                <div>
                  <h3 style={{ fontSize: '17px', color: '#FFFFFF' }}>{m.name}</h3>
                  <span className="badge-pill badge-indigo" style={{ marginTop: '4px' }}>
                    {m.relation} {m.culturalRelation ? `(${m.culturalRelation})` : ''}
                  </span>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    📍 {m.residence || 'Guwahati, Assam'}
                  </p>
                </div>
              </div>

              <div style={{
                background: '#152238',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '13px',
                color: '#CBD5E1',
                lineHeight: '1.5',
                marginBottom: '14px'
              }}>
                <strong style={{ color: '#FBBF24', display: 'block', marginBottom: '2px' }}>
                  💭 Memory Hook:
                </strong>
                {m.memoryHook}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #28374D', paddingTop: '10px' }}>
              <button
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => handleOpenEdit(m)}
              >
                <Edit3 size={14} />
                <span>Edit</span>
              </button>
              <button
                className="btn-danger"
                onClick={() => handleDelete(m._id)}
              >
                <Trash2 size={14} />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#1E293B',
            border: '1px solid var(--border-color)',
            borderRadius: '18px',
            width: '100%',
            maxWidth: '560px',
            padding: '1.75rem',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '18px', marginBottom: '1.25rem', color: '#FFFFFF' }}>
              {editingId ? 'Edit Family Member' : 'Register New Family Member'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Full Name:
                </label>
                <input
                  type="text"
                  className="input-dark"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Maina (Rhea)"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Relation:
                  </label>
                  <select
                    className="input-dark"
                    value={form.relation}
                    onChange={(e) => setForm({ ...form, relation: e.target.value })}
                  >
                    <option value="Granddaughter">Granddaughter</option>
                    <option value="Grandson">Grandson</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Son">Son</option>
                    <option value="Wife">Wife</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Cultural Relation:
                  </label>
                  <input
                    type="text"
                    className="input-dark"
                    value={form.culturalRelation}
                    onChange={(e) => setForm({ ...form, culturalRelation: e.target.value })}
                    placeholder="e.g. Naati-Suwali, Dangor Lora"
                  />
                </div>
              </div>

              {/* Photo Preset Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Photo Preset:
                </label>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
                  {PRESET_PHOTOS.map((p, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setForm({ ...form, photoUrl: p.url })}
                      style={{
                        background: form.photoUrl === p.url ? '#4F46E5' : '#0F172A',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Or Custom Photo URL:
                </label>
                <input
                  type="url"
                  className="input-dark"
                  value={form.photoUrl}
                  onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                  required
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Heartfelt Memory Story Hook:
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateAiClue}
                    disabled={aiLoading}
                    style={{
                      background: 'rgba(79, 70, 229, 0.2)',
                      border: '1px solid rgba(79, 70, 229, 0.4)',
                      color: '#818CF8',
                      fontSize: '11px',
                      fontWeight: '600',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Sparkles size={12} />
                    <span>{aiLoading ? 'Generating...' : 'AI Memory Assistant'}</span>
                  </button>
                </div>
                <textarea
                  className="input-dark"
                  rows={3}
                  value={form.memoryHook}
                  onChange={(e) => setForm({ ...form, memoryHook: e.target.value })}
                  placeholder="e.g. Loves making warm Til Pitha with you during Magh Bihu..."
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-indigo"
                  disabled={loading}
                >
                  {loading ? 'Saving to DB...' : 'Save to MongoDB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
