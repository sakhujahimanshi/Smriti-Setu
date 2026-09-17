import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, RotateCcw, Edit2, ListOrdered, Sparkles } from 'lucide-react';

export default function RoutineBuilder({ routines, onRefresh, apiUrl }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00 AM');
  const [period, setPeriod] = useState('Morning');
  const [culturalNote, setCulturalNote] = useState('');
  const [steps, setSteps] = useState([
    { stepNumber: 1, title: 'Drink warm water', description: 'Half glass of warm water with lemon', completed: false, audioPrompt: 'Take a gentle sip of warm water.' },
    { stepNumber: 2, title: 'Morning fresh air on veranda', description: 'Walk 10 peaceful steps by the railing', completed: false, audioPrompt: 'Enjoy the fresh morning breeze.' }
  ]);

  const handleAddStep = () => {
    setSteps([
      ...steps,
      {
        stepNumber: steps.length + 1,
        title: '',
        description: '',
        completed: false,
        audioPrompt: ''
      }
    ]);
  };

  const handleStepChange = (index, field, value) => {
    const updated = [...steps];
    updated[index][field] = value;
    setSteps(updated);
  };

  const handleRemoveStep = (index) => {
    const updated = steps.filter((_, i) => i !== index).map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setSteps(updated);
  };

  const handleSaveRoutine = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/routines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          time,
          period,
          culturalNote,
          steps
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setTitle('');
        setCulturalNote('');
        onRefresh();
      }
    } catch (err) {
      alert('Error creating routine: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetRoutine = async (id) => {
    try {
      const res = await fetch(`${apiUrl}/api/routines/${id}/reset`, { method: 'POST' });
      if (res.ok) onRefresh();
    } catch (err) {
      alert('Error resetting routine: ' + err.message);
    }
  };

  const handleDeleteRoutine = async (id) => {
    if (!confirm('Are you sure you want to delete this routine?')) return;
    try {
      const res = await fetch(`${apiUrl}/api/routines/${id}`, { method: 'DELETE' });
      if (res.ok) onRefresh();
    } catch (err) {
      alert('Error deleting: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '20px', color: '#FFFFFF' }}>Routine Sequence Builder</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Design multi-step daily activities with visual checkoffs and gentle audio prompts for the elderly site.
          </p>
        </div>

        <button className="btn-indigo" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>Create New Routine</span>
        </button>
      </div>

      {/* Routine Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {routines.map((r) => {
          const completedCount = r.steps.filter(s => s.completed).length;
          const totalCount = r.steps.length;
          const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <div key={r._id} className="exec-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '18px', color: '#FFFFFF' }}>{r.title}</h3>
                    <span className="badge-pill badge-indigo">⏰ {r.time}</span>
                    <span className="badge-pill badge-cyan">{r.period}</span>
                  </div>
                  {r.culturalNote && (
                    <p style={{ fontSize: '13px', color: '#38BDF8', marginTop: '4px' }}>
                      🌿 {r.culturalNote}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => handleResetRoutine(r._id)}
                    title="Reset steps for a fresh day"
                  >
                    <RotateCcw size={14} />
                    <span>Reset Day Progress</span>
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => handleDeleteRoutine(r._id)}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>Step Progress: {completedCount} of {totalCount} completed</span>
                  <span>{pct}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: '#10B981', transition: 'width 0.3s' }} />
                </div>
              </div>

              {/* Step Sequences */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {r.steps.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: step.completed ? 'rgba(16, 185, 129, 0.1)' : '#152238',
                      border: `1px solid ${step.completed ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)'}`,
                      borderRadius: '10px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: step.completed ? '#10B981' : '#334155',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {step.stepNumber}
                      </span>
                      <div>
                        <strong style={{ fontSize: '14px', color: '#F8FAFC' }}>{step.title}</strong>
                        {step.description && (
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                            — {step.description}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className={`badge-pill ${step.completed ? 'badge-emerald' : 'badge-amber'}`}>
                      {step.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Routine Modal */}
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
            maxWidth: '620px',
            padding: '1.75rem',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '18px', marginBottom: '1.25rem', color: '#FFFFFF' }}>
              Create New Routine Sequence
            </h3>

            <form onSubmit={handleSaveRoutine} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Routine Title:
                </label>
                <input
                  type="text"
                  className="input-dark"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Afternoon Garden Walk (বাৰান্দাৰ খোজ)"
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
                    placeholder="e.g., 04:30 PM"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Period:
                  </label>
                  <select
                    className="input-dark"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Cultural Note:
                </label>
                <input
                  type="text"
                  className="input-dark"
                  value={culturalNote}
                  onChange={(e) => setCulturalNote(e.target.value)}
                  placeholder="e.g. Traditional ginger tea in brass cup"
                />
              </div>

              {/* Step Sequence Builder */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Step Sequences:
                  </label>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="btn-indigo"
                    style={{ padding: '4px 10px', fontSize: '12px' }}
                  >
                    <Plus size={14} /> Add Step
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {steps.map((step, idx) => (
                    <div key={idx} style={{ background: '#0F172A', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#818CF8' }}>
                          Step {idx + 1}
                        </span>
                        {steps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStep(idx)}
                            style={{ background: 'none', border: 'none', color: '#FB7185', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        className="input-dark"
                        placeholder="Step instruction (e.g. Put on comfortable slippers)"
                        value={step.title}
                        onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                        style={{ marginBottom: '6px' }}
                        required
                      />
                      <input
                        type="text"
                        className="input-dark"
                        placeholder="Audio guide text for TTS speaker"
                        value={step.audioPrompt}
                        onChange={(e) => handleStepChange(idx, 'audioPrompt', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
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
                  {loading ? 'Creating...' : 'Save Routine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
