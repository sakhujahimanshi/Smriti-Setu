import React, { useState } from 'react';
import { Bell, Plus, Trash2, Volume2, CheckCircle2, Circle, Clock } from 'lucide-react';

export default function ReminderManager({ reminders, onRefresh, apiUrl }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00 AM');
  const [category, setCategory] = useState('Medication');
  const [voiceText, setVoiceText] = useState('Koka, it is time for your morning wellness tea and tablet.');

  const handleToggle = async (reminder) => {
    try {
      await fetch(`${apiUrl}/api/reminders/${reminder._id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompletedToday: !reminder.isCompletedToday })
      });
      onRefresh();
    } catch (err) {
      alert('Error updating reminder: ' + err.message);
    }
  };

  const handleToggleActive = async (reminder) => {
    try {
      await fetch(`${apiUrl}/api/reminders/${reminder._id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !reminder.isActive })
      });
      onRefresh();
    } catch (err) {
      alert('Error updating reminder: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;
    try {
      await fetch(`${apiUrl}/api/reminders/${id}`, { method: 'DELETE' });
      onRefresh();
    } catch (err) {
      alert('Error deleting: ' + err.message);
    }
  };

  const handleTestVoice = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    } else {
      alert('Speech synthesis not available in this browser.');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          time,
          category,
          voiceText,
          isActive: true
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setTitle('');
        onRefresh();
      }
    } catch (err) {
      alert('Error creating reminder: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '20px', color: '#FFFFFF' }}>Reminder & Announcement Manager</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Schedule spoken voice reminders for medication, hydration, and gentle walks.
          </p>
        </div>

        <button className="btn-indigo" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Reminders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {reminders.map((r) => (
          <div
            key={r._id}
            className="exec-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              opacity: r.isActive ? 1 : 0.6
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => handleToggle(r)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                title={r.isCompletedToday ? "Mark Incomplete" : "Mark Completed for Today"}
              >
                {r.isCompletedToday ? (
                  <CheckCircle2 size={26} color="#10B981" />
                ) : (
                  <Circle size={26} color="#475569" />
                )}
              </button>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <strong style={{
                    fontSize: '16px',
                    color: r.isCompletedToday ? '#94A3B8' : '#FFFFFF',
                    textDecoration: r.isCompletedToday ? 'line-through' : 'none'
                  }}>
                    {r.title}
                  </strong>
                  <span className="badge-pill badge-indigo">⏰ {r.time}</span>
                  <span className="badge-pill badge-cyan">{r.category}</span>
                </div>

                {r.voiceText && (
                  <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>
                    📢 "{r.voiceText}"
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => handleTestVoice(r.voiceText || r.title)}
                title="Preview spoken announcement"
              >
                <Volume2 size={14} color="#818CF8" />
                <span>Test Audio</span>
              </button>

              <button
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => handleToggleActive(r)}
              >
                {r.isActive ? 'Disable' : 'Enable'}
              </button>

              <button
                className="btn-danger"
                onClick={() => handleDelete(r._id)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Reminder Modal */}
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
            maxWidth: '520px',
            padding: '1.75rem'
          }}>
            <h3 style={{ fontSize: '18px', marginBottom: '1.25rem', color: '#FFFFFF' }}>
              Create Scheduled Spoken Reminder
            </h3>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Reminder Title:
                </label>
                <input
                  type="text"
                  className="input-dark"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Afternoon Blood Pressure Tablet"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Scheduled Time:
                  </label>
                  <input
                    type="text"
                    className="input-dark"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g., 02:00 PM"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Category:
                  </label>
                  <select
                    className="input-dark"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Medication">Medication</option>
                    <option value="Hydration">Hydration</option>
                    <option value="Gentle Walk">Gentle Walk</option>
                    <option value="Family Call">Family Call</option>
                    <option value="Meal">Meal</option>
                    <option value="Prayer">Prayer</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Spoken Announcement Script (TTS Voice):
                </label>
                <textarea
                  className="input-dark"
                  rows={3}
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                  placeholder="e.g. Koka, it is time for your afternoon glass of warm water and tablet."
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
                  {loading ? 'Creating...' : 'Set Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
