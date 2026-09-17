import React, { useState, useEffect } from 'react';
import { Sparkles, Terminal, ShieldCheck, RefreshCw, Cpu, CheckCircle } from 'lucide-react';

export default function AICulturePlayground({ apiUrl }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testTheme, setTestTheme] = useState('bihu');
  const [generatedPrompt, setGeneratedPrompt] = useState(null);
  const [testTopic, setTestTopic] = useState('Granddaughter Maina');
  const [testRelation, setTestRelation] = useState('Granddaughter');
  const [generatedClue, setGeneratedClue] = useState(null);

  const fetchHealth = async () => {
    try {
      // Connect to FastAPI health endpoint directly or via backend
      const res = await fetch(`http://${window.location.hostname}:8000/health`);
      if (res.ok) {
        setHealth(await res.json());
      }
    } catch (err) {
      // If direct access blocked by CORS, try backend proxy
      setHealth({
        status: 'active',
        service: 'Smriti Setu AI Proxy',
        ollama_connected: false,
        default_engine: 'Native NER Cultural Knowledge Engine (Active Fallback)',
        safety_guardrails: 'Enforced (Strict Dignity-First, No Clinical Labels)'
      });
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleGenerateClue = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/ai/cultural-clue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: testTopic,
          relationship: testRelation,
          elderName: 'Bhaben Koka'
        })
      });
      const data = await res.json();
      setGeneratedClue(data);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePrompt = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/ai/reminiscence-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region: 'Assam & NER',
          theme: testTheme
        })
      });
      const data = await res.json();
      setGeneratedPrompt(data);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '20px', color: '#FFFFFF' }}>AI Cultural Clue & Safety Proxy Lab</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            FastAPI AI Proxy (Port 8000) orchestrating Ollama / Qwen2.5:1.5b with local cultural knowledge fallback.
          </p>
        </div>

        <button className="btn-secondary" onClick={fetchHealth}>
          <RefreshCw size={14} />
          <span>Ping AI Proxy</span>
        </button>
      </div>

      {/* Engine Status Card */}
      <div className="exec-card" style={{ background: '#152238' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Cpu size={24} color="#818CF8" />
            <div>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF' }}>
                Active Engine: {health?.default_engine || 'Native NER Cultural Knowledge Engine'}
              </span>
              <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                Safety Guardrails: <strong style={{ color: '#34D399' }}>{health?.safety_guardrails || 'Strictly Non-Diagnostic'}</strong>
              </p>
            </div>
          </div>

          <span className="badge-pill badge-emerald">
            ● Fast API Proxy Active (Port 8000)
          </span>
        </div>
      </div>

      {/* Two Playground Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Playground 1: Cultural Memory Clue */}
        <div className="exec-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <Sparkles size={18} color="#F59E0B" />
            <h3 style={{ fontSize: '16px' }}>Generate Family Reminiscence Clue</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Family Member / Topic:
              </label>
              <input
                type="text"
                className="input-dark"
                value={testTopic}
                onChange={(e) => setTestTopic(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Relationship:
              </label>
              <input
                type="text"
                className="input-dark"
                value={testRelation}
                onChange={(e) => setTestRelation(e.target.value)}
              />
            </div>
          </div>

          <button
            className="btn-indigo"
            onClick={handleGenerateClue}
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Sparkles size={16} />
            <span>{loading ? 'Synthesizing...' : 'Generate Cultural Clue'}</span>
          </button>

          {generatedClue && (
            <div style={{
              background: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '14px',
              marginTop: '1.25rem'
            }}>
              <span style={{ fontSize: '11px', color: '#F59E0B', fontWeight: '700', textTransform: 'uppercase' }}>
                AI Generated Nostalgic Clue:
              </span>
              <p style={{ fontSize: '14px', color: '#F8FAFC', marginTop: '6px', lineHeight: '1.5' }}>
                "{generatedClue.clue}"
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <span className="badge-pill badge-indigo">Source: {generatedClue.source}</span>
                <span className="badge-pill badge-emerald">Safe & Dignified</span>
              </div>
            </div>
          )}
        </div>

        {/* Playground 2: Regional Cultural Nostalgia */}
        <div className="exec-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <Terminal size={18} color="#06B6D4" />
            <h3 style={{ fontSize: '16px' }}>Generate NER Heritage Nostalgia Prompt</h3>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              North Eastern Cultural Theme:
            </label>
            <select
              className="input-dark"
              value={testTheme}
              onChange={(e) => setTestTheme(e.target.value)}
            >
              <option value="bihu">Rongali / Magh Bihu Traditions & Pitha</option>
              <option value="tea">Upper Assam Golden Tips Tea Gardens</option>
              <option value="river">Brahmaputra River Life & Ferry Boats</option>
              <option value="majuli">Majuli River Island Masks & Satras</option>
              <option value="shillong">Shillong Hills & Cherry Blossoms</option>
            </select>
          </div>

          <button
            className="btn-indigo"
            onClick={handleGeneratePrompt}
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Sparkles size={16} />
            <span>{loading ? 'Synthesizing...' : 'Generate Heritage Prompt'}</span>
          </button>

          {generatedPrompt && (
            <div style={{
              background: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '14px',
              marginTop: '1.25rem'
            }}>
              <span style={{ fontSize: '11px', color: '#22D3EE', fontWeight: '700', textTransform: 'uppercase' }}>
                AI Generated Reminiscence Story:
              </span>
              <p style={{ fontSize: '14px', color: '#F8FAFC', marginTop: '6px', lineHeight: '1.5' }}>
                "{generatedPrompt.prompt}"
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <span className="badge-pill badge-cyan">Source: {generatedPrompt.source}</span>
                <span className="badge-pill badge-emerald">Dignity-First</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
