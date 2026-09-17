import React from 'react';
import { Settings, ArrowLeft, Globe, ShieldCheck } from 'lucide-react';

const LANGUAGES = [
  { code: 'as', label: 'অসমীয়া' },
  { code: 'en', label: 'English' },
  { code: 'ne', label: 'नेपाली' },
  { code: 'bn', label: 'বাংলা' }
];

export default function Header({
  profile,
  activeModule,
  onBackHome,
  onOpenDemoSetup,
  onOpenAssessment,
  currentLang = 'as',
  onLangChange,
  t
}) {
  const honorific = profile?.honorific || 'Koka';
  const name = profile?.name || 'Bhaben Baruah';
  const residence = profile?.currentResidence || 'Beltola, Guwahati';

  // Format today's date in a serene, readable style
  const today = new Date();
  const dateStr = today.toLocaleDateString(currentLang === 'en' ? 'en-US' : currentLang === 'bn' ? 'bn-IN' : currentLang === 'ne' ? 'ne-NP' : 'as-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header style={{
      position: 'relative',
      padding: '1.75rem 2.5rem 1.25rem',
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '2px solid var(--border-subtle)',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      gap: '1.25rem'
    }}>
      {/* Discrete Fallback Setup Button for Live Demo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button 
          className="corner-caregiver-btn"
          onClick={onOpenDemoSetup}
          title="Discrete Caregiver & Demo Seeding Setup"
        >
          <Settings size={18} />
          <span>{t.demoSetup || 'Caregiver Setup'}</span>
        </button>
        <button 
          className="corner-caregiver-btn"
          onClick={onOpenAssessment}
          style={{ background: '#FEF3C7', color: '#92400E', borderColor: '#FCD34D' }}
          title="Daily Memory Verification Check-in"
        >
          <ShieldCheck size={18} />
          <span>দৈনিক পৰীক্ষা (Memory Check)</span>
        </button>
        <a 
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            textDecoration: 'none',
            background: '#F8FAFC',
            color: '#1E293B',
            padding: '8px 14px',
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: '600',
            border: '1px solid #CBD5E1',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
          title="Open Caregiver Dashboard in a new tab"
        >
          <span>🛡️ Caregiver Dashboard ↗</span>
        </a>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {activeModule && (
          <button
            className="btn-large btn-outline"
            style={{ minHeight: '60px', padding: '10px 24px', fontSize: '20px', borderRadius: '16px' }}
            onClick={onBackHome}
            aria-label="Back to Main Menu"
          >
            <ArrowLeft size={24} />
            <span>{t.mainMenu}</span>
          </button>
        )}

        <div>
          <h1 style={{ fontSize: '36px', marginBottom: '4px' }}>
            {t.greeting}, {name.split(' ')[0]} {honorific}!
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--text-muted)' }}>
            {dateStr} • {residence}
          </p>
        </div>
      </div>

      {/* Right Controls: Accessible Language Switcher & Peace Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        {/* Language Pills Switcher */}
        <div style={{
          background: '#FFFFFF',
          border: '2px solid var(--border-subtle)',
          borderRadius: '20px',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ padding: '0 6px 0 8px', color: 'var(--text-muted)' }}>
            <Globe size={18} />
          </div>
          {LANGUAGES.map((lang) => {
            const isActive = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => onLangChange(lang.code)}
                style={{
                  background: isActive ? 'var(--accent-amber)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-main)',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '8px 16px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {lang.label}
              </button>
            );
          })}
        </div>

        <div style={{
          background: '#EFF6FF',
          color: '#1D4ED8',
          border: '1px solid #BFDBFE',
          padding: '8px 16px',
          borderRadius: '24px',
          fontSize: '17px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>🇮🇳</span>
          <span>{t.nerBadge || 'North Eastern Region (NER)'}</span>
        </div>

        <div style={{
          background: 'var(--affirm-green-light)',
          color: 'var(--affirm-green-hover)',
          padding: '8px 18px',
          borderRadius: '24px',
          fontSize: '18px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--affirm-green)', display: 'inline-block' }}></span>
          {t.peacefulDay}
        </div>
      </div>
    </header>
  );
}
