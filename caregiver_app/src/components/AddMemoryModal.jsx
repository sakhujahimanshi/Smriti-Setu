import React, { useState } from 'react';
import { X, Sparkles, Image, User, MapPin, Tag, HelpCircle, Save, Plus } from 'lucide-react';

const NER_STATES = [
  'Assam',
  'Meghalaya',
  'Nagaland',
  'Manipur',
  'Mizoram',
  'Arunachal Pradesh',
  'Sikkim',
  'Tripura'
];

const PRESET_PHOTOS = [
  { label: 'Family Gathering', url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Graduation / Milestone', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Courtyard & Veranda', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Traditional Festival', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Hillside & Lake View', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Cultural Attire & Craft', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1000&auto=format&fit=crop&q=80' }
];

export default function AddMemoryModal({ isOpen, onClose, onMemoryAdded, apiUrl }) {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [category, setCategory] = useState('Family');
  const [people, setPeople] = useState('');
  const [relationship, setRelationship] = useState('Granddaughter');
  const [location, setLocation] = useState('Majuli, Assam');
  const [details, setDetails] = useState('');
  const [datePeriod, setDatePeriod] = useState('Winter 2019');
  const [state, setState] = useState('Assam');
  const [questionPrompt, setQuestionPrompt] = useState('Who is standing beside you in this photo?');
  const [expectedAnswers, setExpectedAnswers] = useState('');
  const [hintTier1, setHintTier1] = useState('She is your granddaughter who loves visiting you during winter holidays.');
  const [hintTier2, setHintTier2] = useState('Her name starts with A — Ananya.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      setError('Please provide a memory title and photograph.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        title: title.trim(),
        imageUrl: imageUrl.trim(),
        videoUrl: videoUrl.trim(),
        audioUrl: audioUrl.trim(),
        category,
        people: people.split(',').map(p => p.trim()).filter(Boolean),
        relationship: relationship.trim(),
        location: location.trim(),
        details: details.trim(),
        datePeriod: datePeriod.trim(),
        regionalContext: 'NER',
        state,
        questionPrompt: questionPrompt.trim(),
        expectedAnswers: expectedAnswers.split(',').map(a => a.trim().toLowerCase()).filter(Boolean),
        hints: {
          tier1: hintTier1.trim(),
          tier2: hintTier2.trim()
        }
      };

      const res = await fetch(`${apiUrl}/api/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save memory');
      }

      const saved = await res.json();
      if (onMemoryAdded) onMemoryAdded(saved);
      onClose();
    } catch (err) {
      console.error('Error adding memory:', err);
      setError(err.message || 'Error saving memory to database');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem'
    }}>
      <div style={{
        background: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        color: '#F8FAFC'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          background: '#1E293B',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #10B981, #059669)',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={20} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', margin: 0, fontWeight: '700' }}>Add Personal Memory to Album</h3>
              <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
                Curate a meaningful memory for personalized VR and cognitive engagement
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #EF4444',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '14px',
              color: '#FCA5A5'
            }}>
              {error}
            </div>
          )}

          {/* Title & Category Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#E2E8F0' }}>
                Memory Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Granddaughter Ananya's Visit, Old Sivasagar Veranda"
                required
                style={{
                  width: '100%',
                  background: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: '#FFFFFF',
                  fontSize: '15px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#E2E8F0' }}>
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: '#FFFFFF',
                  fontSize: '15px'
                }}
              >
                <option value="Family">Family</option>
                <option value="People">People</option>
                <option value="Places">Places</option>
                <option value="Events">Events</option>
                <option value="Childhood">Childhood</option>
                <option value="Culture">Culture</option>
              </select>
            </div>
          </div>

          {/* Photograph URL & Presets */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#E2E8F0' }}>
              Photograph Media URL *
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... or choose from quick curated presets below"
                required
                style={{
                  flex: 1,
                  background: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: '#FFFFFF',
                  fontSize: '15px'
                }}
              />
            </div>

            {/* Quick Presets */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {PRESET_PHOTOS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImageUrl(p.url)}
                  style={{
                    background: imageUrl === p.url ? '#065F46' : 'rgba(15, 23, 42, 0.6)',
                    color: imageUrl === p.url ? '#6EE7B7' : '#94A3B8',
                    border: imageUrl === p.url ? '1px solid #10B981' : '1px solid #334155',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  📷 {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* People & Relationship */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#E2E8F0' }}>
                People Associated (Comma-separated)
              </label>
              <input
                type="text"
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                placeholder="e.g., Ananya (Granddaughter), Minoti"
                style={{
                  width: '100%',
                  background: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: '#FFFFFF',
                  fontSize: '15px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#E2E8F0' }}>
                Primary Relationship
              </label>
              <input
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="e.g., Granddaughter, Daughter, Childhood Friend"
                style={{
                  width: '100%',
                  background: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: '#FFFFFF',
                  fontSize: '15px'
                }}
              />
            </div>
          </div>

          {/* Location & NER State */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#E2E8F0' }}>
                Location / Setting & Date Period
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Majuli, Sivasagar, Shillong"
                  style={{
                    background: '#0F172A',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    color: '#FFFFFF',
                    fontSize: '15px'
                  }}
                />
                <input
                  type="text"
                  value={datePeriod}
                  onChange={(e) => setDatePeriod(e.target.value)}
                  placeholder="e.g., Winter 2018, 1974"
                  style={{
                    background: '#0F172A',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    color: '#FFFFFF',
                    fontSize: '15px'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#E2E8F0' }}>
                NER Sister State
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: '#FFFFFF',
                  fontSize: '15px'
                }}
              >
                {NER_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Details / Memory Context */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#E2E8F0' }}>
              Important Details & Contextual Story
            </label>
            <textarea
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g., Winter boat picnic across the Brahmaputra with hot cardamom tea and Til Pitha..."
              style={{
                width: '100%',
                background: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '10px 14px',
                color: '#FFFFFF',
                fontSize: '14px',
                lineHeight: '1.5'
              }}
            />
          </div>

          {/* VR Prompt & Expected Voice Keywords */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38BDF8', fontWeight: '700', fontSize: '15px' }}>
              <HelpCircle size={18} />
              <span>VR Spatial Question & Scaffolded Hints</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: '#CBD5E1' }}>
                Spatial Question Prompt (Spoken & shown in VR)
              </label>
              <input
                type="text"
                value={questionPrompt}
                onChange={(e) => setQuestionPrompt(e.target.value)}
                placeholder="e.g., Who is standing beside you in this photo?"
                style={{
                  width: '100%',
                  background: '#1E293B',
                  border: '1px solid #475569',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  color: '#FFFFFF',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: '#CBD5E1' }}>
                Expected Voice Keywords (Comma-separated for voice matcher)
              </label>
              <input
                type="text"
                value={expectedAnswers}
                onChange={(e) => setExpectedAnswers(e.target.value)}
                placeholder="e.g., ananya, granddaughter, nati, daughter"
                style={{
                  width: '100%',
                  background: '#1E293B',
                  border: '1px solid #475569',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  color: '#FFFFFF',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#FBBF24' }}>
                  Tier 1 Hint (Gentle Relational Cue)
                </label>
                <input
                  type="text"
                  value={hintTier1}
                  onChange={(e) => setHintTier1(e.target.value)}
                  placeholder="e.g., She is your granddaughter."
                  style={{
                    width: '100%',
                    background: '#1E293B',
                    border: '1px solid #475569',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#F87171' }}>
                  Tier 2 Hint (Phonetic / Direct Clue)
                </label>
                <input
                  type="text"
                  value={hintTier2}
                  onChange={(e) => setHintTier2(e.target.value)}
                  placeholder="e.g., Her name starts with A — Ananya."
                  style={{
                    width: '100%',
                    background: '#1E293B',
                    border: '1px solid #475569',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#334155',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
              }}
            >
              <Save size={16} />
              <span>{isSubmitting ? 'Saving...' : 'Save to Memory Album'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
