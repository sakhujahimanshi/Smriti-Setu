import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Brain, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Mic, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Edit3, 
  Sparkles 
} from 'lucide-react';
import { getSocket } from '../socket';

export default function AssessmentManager({ apiUrl = '', onRefreshAll }) {
  const [status, setStatus] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null);

  // New question form state
  const [newQuestionTextEn, setNewQuestionTextEn] = useState('');
  const [newQuestionTextAs, setNewQuestionTextAs] = useState('');
  const [newExpectedAnswers, setNewExpectedAnswers] = useState('');
  const [newCategory, setNewCategory] = useState('family');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Fetch all assessment data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statusRes, questionsRes, logsRes] = await Promise.all([
        fetch(`${apiUrl}/api/assessment/status`),
        fetch(`${apiUrl}/api/assessment/questions`),
        fetch(`${apiUrl}/api/assessment/logs?limit=20`)
      ]);

      if (statusRes.ok) setStatus(await statusRes.json());
      if (questionsRes.ok) setQuestions(await questionsRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
    } catch (err) {
      console.warn('Failed to fetch assessment data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen to real-time socket events for live sync
    const socket = getSocket();

    const handleAssessmentCompleted = (data) => {
      console.log('⚡ [Caregiver Assessment] Completed event received:', data);
      fetchData();
      if (data?.forgetfulnessTrend === 'increasing' || data?.frequency !== 'once_daily') {
        setActiveAlert({
          title: 'AI Detected Forgetfulness Trend',
          message: `Accuracy was ${data?.log?.accuracy}%. Assessment frequency automatically escalated to ${data?.frequency?.replace('_', ' ')}.`,
          time: new Date().toLocaleTimeString()
        });
      }
    };

    const handleAssessmentAlert = (alertData) => {
      console.log('🚨 [Caregiver Alert] Escalation alert:', alertData);
      setActiveAlert({
        title: alertData.title,
        message: alertData.message,
        time: new Date(alertData.timestamp).toLocaleTimeString()
      });
      fetchData();
    };

    socket.on('caregiver:assessment-completed', handleAssessmentCompleted);
    socket.on('caregiver:assessment-alert', handleAssessmentAlert);

    return () => {
      socket.off('caregiver:assessment-completed', handleAssessmentCompleted);
      socket.off('caregiver:assessment-alert', handleAssessmentAlert);
    };
  }, [apiUrl]);

  const handleResetGate = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/assessment/reset`, { method: 'POST' });
      if (res.ok) {
        alert('Pre-UI Assessment Gate has been triggered! The elderly site is now locked with mandatory check-in questions.');
        fetchData();
      }
    } catch (e) {
      console.warn('Reset gate error:', e);
    }
  };

  // Handle question edit change
  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    if (field === 'en' || field === 'as' || field === 'bn' || field === 'ne') {
      if (typeof updated[index].questionText !== 'object') {
        updated[index].questionText = { en: String(updated[index].questionText || '') };
      }
      updated[index].questionText[field] = value;
    } else if (field === 'expectedAnswers') {
      updated[index].expectedAnswers = value;
    } else {
      updated[index][field] = value;
    }
    setQuestions(updated);
  };

  // Save questions back to backend
  const handleSaveQuestions = async () => {
    try {
      setIsSaving(true);
      const res = await fetch(`${apiUrl}/api/assessment/questions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions })
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchData();
      }
    } catch (err) {
      console.warn('Failed to save questions:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Add new question
  const handleAddQuestion = () => {
    if (!newQuestionTextEn.trim() || !newExpectedAnswers.trim()) return;

    const newQ = {
      questionId: `q_custom_${Date.now()}`,
      category: newCategory,
      questionText: {
        en: newQuestionTextEn.trim(),
        as: newQuestionTextAs.trim() || newQuestionTextEn.trim(),
        bn: newQuestionTextEn.trim(),
        ne: newQuestionTextEn.trim()
      },
      expectedAnswers: newExpectedAnswers.split(',').map(s => s.trim()).filter(Boolean),
      importance: 'standard',
      orderIndex: questions.length + 1,
      active: true
    };

    setQuestions([...questions, newQ]);
    setNewQuestionTextEn('');
    setNewQuestionTextAs('');
    setNewExpectedAnswers('');
    setIsAddingNew(false);
  };

  // Delete question
  const handleDeleteQuestion = (index) => {
    if (!window.confirm('Are you sure you want to remove this memory assessment question?')) return;
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const getFrequencyBadge = (freq) => {
    switch (freq) {
      case 'thrice_daily':
        return <span className="badge-pill" style={{ background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FCA5A5' }}>🚨 Thrice Daily (High Alert)</span>;
      case 'twice_daily':
        return <span className="badge-pill" style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #FCD34D' }}>⚠️ Twice Daily (Escalated by AI)</span>;
      default:
        return <span className="badge-pill" style={{ background: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC' }}>✓ Once Daily (Standard)</span>;
    }
  };

  const getTrendBadge = (trend) => {
    switch (trend) {
      case 'increasing':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#DC2626', fontWeight: '700' }}>
            <TrendingDown size={16} /> Increasing Forgetfulness Detected
          </span>
        );
      case 'mild_decline':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#D97706', fontWeight: '700' }}>
            <TrendingDown size={16} /> Mild Fluctuations
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16A34A', fontWeight: '700' }}>
            <TrendingUp size={16} /> Stable Baseline
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* AI Notification Alert Banner */}
      {activeAlert && (
        <div style={{
          background: '#FEF2F2',
          border: '2px solid #EF4444',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: '0 4px 14px rgba(239, 68, 68, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '17px', color: '#991B1B' }}>
                {activeAlert.title} <span style={{ fontSize: '13px', fontWeight: 'normal', color: '#B91C1C' }}>({activeAlert.time})</span>
              </h4>
              <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#B91C1C' }}>
                {activeAlert.message}
              </p>
            </div>
          </div>
          <button 
            className="btn-secondary" 
            style={{ fontSize: '13px', padding: '6px 12px' }}
            onClick={() => setActiveAlert(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Section: AI Status & Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Status Card */}
        <div className="card-glass" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={24} style={{ color: '#4F46E5' }} />
              <h3 style={{ margin: 0, fontSize: '18px', color: '#FFFFFF' }}>Pre-UI Assessment Gate</h3>
            </div>
            {status && getFrequencyBadge(status.frequency)}
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5', margin: '0 0 1rem' }}>
            Blocks elderly dashboard until 5–10 core identity, family, and safety questions are answered via voice or text with dignified correction.
          </p>
          <div style={{ background: '#0F172A', padding: '12px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', color: '#94A3B8' }}>Current Gate Requirement:</span>
            <span style={{ 
              fontWeight: '700', 
              color: status?.isRequired ? '#F59E0B' : '#10B981',
              fontSize: '14px' 
            }}>
              {status?.isRequired ? '🔒 Active (Must complete)' : '✓ Unlocked for today'}
            </span>
          </div>
          <button
            className="btn-secondary"
            onClick={handleResetGate}
            style={{ width: '100%', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#FCA5A5' }}
            title="Lock elderly device to force mandatory pre-UI assessment check-in"
          >
            <ShieldCheck size={16} />
            <span>🔒 Force Lock Elderly Site (Trigger Gate Now)</span>
          </button>
        </div>

        {/* AI Forgetfulness Tracking Card */}
        <div className="card-glass" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <Brain size={24} style={{ color: '#8B5CF6' }} />
            <h3 style={{ margin: 0, fontSize: '18px', color: '#FFFFFF' }}>AI Forgetfulness Trend</h3>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
              Cognitive Trajectory:
            </span>
            <div style={{ fontSize: '16px' }}>
              {status ? getTrendBadge(status.trend) : 'Analyzing...'}
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94A3B8', marginBottom: '6px' }}>
              <span>Latest Assessment Accuracy</span>
              <span style={{ color: '#FFFFFF', fontWeight: '700' }}>{status?.lastAccuracy ?? '--'}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${status?.lastAccuracy || 0}%`, 
                height: '100%', 
                background: (status?.lastAccuracy || 0) >= 70 ? '#10B981' : (status?.lastAccuracy || 0) >= 50 ? '#F59E0B' : '#EF4444',
                borderRadius: '4px',
                transition: 'width 0.5s ease'
              }}></div>
            </div>
          </div>
        </div>

        {/* Escalation Policy Card */}
        <div className="card-glass" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <Activity size={24} style={{ color: '#06B6D4' }} />
            <h3 style={{ margin: 0, fontSize: '18px', color: '#FFFFFF' }}>Automated AI Escalation</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: '1.5', margin: '0 0 12px' }}>
            If accuracy drops below 60% or repeated errors are logged, the platform automatically escalates check-ins to twice or thrice daily and notifies caregivers.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge-pill" style={{ fontSize: '12px', background: '#1E293B', color: '#CBD5E1' }}>≥70%: 1x Daily</span>
            <span className="badge-pill" style={{ fontSize: '12px', background: '#1E293B', color: '#FCD34D' }}>50-69%: 2x Daily</span>
            <span className="badge-pill" style={{ fontSize: '12px', background: '#1E293B', color: '#FCA5A5' }}>&lt;50%: 3x Daily</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Caregiver Question Customizer */}
      <div className="card-glass" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '22px', color: '#FFFFFF', margin: '0 0 6px' }}>
              Curated Assessment Questions & Expected Answer Keys
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
              Customize questions and provide allowed answer variants (in Assamese, English, or Romanized). The AI uses fuzzy phonetic matching.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn-secondary"
              onClick={() => setIsAddingNew(!isAddingNew)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} />
              <span>{isAddingNew ? 'Cancel' : 'Add Question'}</span>
            </button>
            <button
              className="btn-indigo"
              onClick={handleSaveQuestions}
              disabled={isSaving}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={16} />
              <span>{isSaving ? 'Saving...' : 'Save & Broadcast'}</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div style={{
            background: '#ECFDF5',
            border: '1px solid #10B981',
            borderRadius: '10px',
            padding: '10px 16px',
            color: '#065F46',
            fontSize: '14px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={18} />
            <span>Questions and validation keys saved successfully and broadcasted to elderly tablet!</span>
          </div>
        )}

        {/* Form to add a new question */}
        {isAddingNew && (
          <div style={{
            background: '#1E293B',
            border: '2px dashed #4F46E5',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h4 style={{ margin: '0 0 1rem', color: '#FFFFFF', fontSize: '16px' }}>Add New Memory Assessment Question</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '4px' }}>Question (English)</label>
                <input
                  type="text"
                  placeholder="e.g. What is your daughter's name?"
                  value={newQuestionTextEn}
                  onChange={(e) => setNewQuestionTextEn(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #475569', background: '#0F172A', color: '#FFFFFF' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '4px' }}>Question (Assamese / Regional)</label>
                <input
                  type="text"
                  placeholder="e.g. আপোনাৰ জীয়াৰীৰ নাম কি?"
                  value={newQuestionTextAs}
                  onChange={(e) => setNewQuestionTextAs(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #475569', background: '#0F172A', color: '#FFFFFF' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '4px' }}>Expected Answers (comma-separated variants)</label>
                <input
                  type="text"
                  placeholder="e.g. Ananya, Dr. Ananya, অনন্যা"
                  value={newExpectedAnswers}
                  onChange={(e) => setNewExpectedAnswers(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #475569', background: '#0F172A', color: '#FFFFFF' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '4px' }}>Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #475569', background: '#0F172A', color: '#FFFFFF' }}
                >
                  <option value="identity">Identity / Self</option>
                  <option value="family">Family / Relatives</option>
                  <option value="location">Location / Residence</option>
                  <option value="emergency">Emergency / Phone</option>
                  <option value="culture">Culture / Childhood</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn-secondary" onClick={() => setIsAddingNew(false)}>Cancel</button>
              <button className="btn-indigo" onClick={handleAddQuestion}>Add to List</button>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {questions.map((q, idx) => {
            const textEn = typeof q.questionText === 'object' ? (q.questionText.en || '') : String(q.questionText || '');
            const textAs = typeof q.questionText === 'object' ? (q.questionText.as || '') : '';
            const expectedStr = Array.isArray(q.expectedAnswers) ? q.expectedAnswers.join(', ') : String(q.expectedAnswers || '');

            return (
              <div 
                key={q.questionId || idx}
                style={{
                  background: '#1E293B',
                  border: '1px solid #334155',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ 
                      background: '#334155', 
                      color: '#F8FAFC', 
                      fontWeight: '700', 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '13px'
                    }}>
                      {idx + 1}
                    </span>
                    <span className="badge-pill" style={{ background: '#0F172A', color: '#94A3B8', textTransform: 'capitalize' }}>
                      {q.category || 'General'}
                    </span>
                    <span className="badge-pill" style={{ background: q.importance === 'high' ? '#372020' : '#1A293B', color: q.importance === 'high' ? '#F87171' : '#60A5FA' }}>
                      {q.importance === 'high' ? 'Critical Baseline' : 'Standard'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteQuestion(idx)}
                    style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '6px' }}
                    title="Delete question"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                      Question (English)
                    </label>
                    <input
                      type="text"
                      value={textEn}
                      onChange={(e) => handleQuestionChange(idx, 'en', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155', background: '#0F172A', color: '#FFFFFF', fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                      Question (Assamese)
                    </label>
                    <input
                      type="text"
                      value={textAs}
                      onChange={(e) => handleQuestionChange(idx, 'as', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155', background: '#0F172A', color: '#FFFFFF', fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                      Acceptable Answer Variants (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={expectedStr}
                      onChange={(e) => handleQuestionChange(idx, 'expectedAnswers', e.target.value.split(',').map(s => s.trim()))}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155', background: '#0F172A', color: '#38BDF8', fontSize: '14px' }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Recent Assessment History Logs */}
      <div className="card-glass" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={22} style={{ color: '#10B981' }} />
            <h2 style={{ fontSize: '20px', color: '#FFFFFF', margin: 0 }}>
              Recent Assessment Logs & AI Decisions
            </h2>
          </div>
          <button className="btn-secondary" onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} />
            <span>Refresh Logs</span>
          </button>
        </div>

        {logs.length === 0 ? (
          <p style={{ color: '#94A3B8', textAlign: 'center', padding: '2rem 0' }}>
            No assessment sessions recorded yet. Launch the elderly site to record the first daily check-in.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                  <th style={{ padding: '12px 14px' }}>Date & Time</th>
                  <th style={{ padding: '12px 14px' }}>Score</th>
                  <th style={{ padding: '12px 14px' }}>Accuracy</th>
                  <th style={{ padding: '12px 14px' }}>AI Trend Evaluation</th>
                  <th style={{ padding: '12px 14px' }}>Assigned Frequency</th>
                  <th style={{ padding: '12px 14px' }}>Missed / Corrected Items</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const dateStr = new Date(log.timestamp || log.createdAt).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  const missedAnswers = Array.isArray(log.answers) 
                    ? log.answers.filter(a => !a.isCorrect) 
                    : [];

                  return (
                    <tr key={log._id} style={{ borderBottom: '1px solid #1E293B' }}>
                      <td style={{ padding: '14px', color: '#FFFFFF', fontWeight: '500' }}>
                        {dateStr}
                      </td>
                      <td style={{ padding: '14px', color: '#CBD5E1' }}>
                        {log.score} / {log.totalQuestions}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span style={{
                          color: log.accuracy >= 70 ? '#10B981' : log.accuracy >= 50 ? '#F59E0B' : '#EF4444',
                          fontWeight: '700'
                        }}>
                          {log.accuracy}%
                        </span>
                      </td>
                      <td style={{ padding: '14px' }}>
                        {getTrendBadge(log.forgetfulnessTrend)}
                      </td>
                      <td style={{ padding: '14px' }}>
                        {getFrequencyBadge(log.frequency)}
                      </td>
                      <td style={{ padding: '14px', color: '#94A3B8' }}>
                        {missedAnswers.length === 0 ? (
                          <span style={{ color: '#10B981' }}>None (Perfect)</span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {missedAnswers.map((m, mi) => (
                              <span key={mi} style={{ fontSize: '12px', color: '#FCA5A5' }}>
                                • "{m.questionText?.slice(0, 30)}..." → Elder said: <em>"{m.userAnswer || 'No answer'}"</em>
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
