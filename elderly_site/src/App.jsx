import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import NavigationCards from './components/NavigationCards';
import MemoryLaneModule from './components/MemoryLaneModule';
import NumberSequenceGame from './components/NumberSequenceGame';
import WordPuzzleGame from './components/WordPuzzleGame';
import PictureMatchGame from './components/PictureMatchGame';
import CulturalReminiscenceModule from './components/CulturalReminiscenceModule';
import DailyRoutineModule from './components/DailyRoutineModule';
import StorytellingModule from './components/StorytellingModule';
import VRMemoryExperience from './components/VRMemoryExperience';
import DemoSetupModal from './components/DemoSetupModal';
import DailyAssessmentGate from './components/DailyAssessmentGate';
import MemoryMatchGame from './components/MemoryMatchGame';
import VisualSequenceGame from './components/VisualSequenceGame';
import { TRANSLATIONS } from './i18n/translations';
import { DEFAULT_MEMORY_ITEMS } from './data/memoryItems';
import { speechService } from './services/speechService';
import { Sparkles } from 'lucide-react';
import { getSocket, emitActivityStart, emitSessionComplete } from './socket';

export default function App() {
  const [profile, setProfile] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [isDemoSetupOpen, setIsDemoSetupOpen] = useState(false);
  const [sessionCompletedNotice, setSessionCompletedNotice] = useState(false);

  // Pre-UI Daily Memory Assessment Gate state (MANDATORY on load)
  const [showAssessmentGate, setShowAssessmentGate] = useState(true);

  // Authoritative language state ('as', 'bn', 'ne', 'en')
  const [selectedLanguage, setSelectedLanguage] = useState('as');
  // Authoritative cultural region strictly bounded to the 8 sister states of the North Eastern Region of India
  const [selectedContentRegion] = useState('NER');
  const [vrPresetMemories, setVrPresetMemories] = useState(null);

  // Use Vite proxy for seamless routing on both localhost and mobile LAN IP
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const handleLanguageChange = (newLang) => {
    speechService.stop();
    setSelectedLanguage(newLang);
  };

  const checkAssessmentGate = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/assessment/status`);
      if (res.ok) {
        const data = await res.json();
        const dismissed = sessionStorage.getItem('smriti_gate_completed_session');
        if (data.isRequired && !dismissed) {
          setShowAssessmentGate(true);
        }
      }
    } catch (err) {
      console.warn('Assessment status check notice:', err);
    }
  };

  const handleAssessmentComplete = () => {
    sessionStorage.setItem('smriti_gate_completed_session', 'true');
    setShowAssessmentGate(false);
    fetchData();
  };

  const fetchData = async () => {
    try {
      const [pRes, fRes, rRes] = await Promise.all([
        fetch(`${apiUrl}/api/profile`),
        fetch(`${apiUrl}/api/family`),
        fetch(`${apiUrl}/api/routines`)
      ]);
      if (pRes.ok) {
        const p = await pRes.json();
        setProfile(p);
        if (p.primaryLanguage) {
          const l = p.primaryLanguage.toLowerCase();
          if (l.includes('nepali')) setSelectedLanguage('ne');
          else if (l.includes('bengali') || l.includes('bangla')) setSelectedLanguage('bn');
          else if (l.includes('english')) setSelectedLanguage('en');
          else if (l.includes('assamese') || l.includes('as')) setSelectedLanguage('as');
        }
      }
      if (fRes.ok) setFamilyMembers(await fRes.json());
      if (rRes.ok) setRoutines(await rRes.json());
    } catch (err) {
      console.warn('Backend fetch notice:', err.message);
    }
  };

  useEffect(() => {
    fetchData();
    checkAssessmentGate();

    // WebSocket listener for remote Caregiver session trigger
    let reconnectTimeout = null;
    const connectWebSocket = () => {
      try {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = apiUrl
          ? apiUrl.replace(/^http(s?):\/\//, '')
          : (window.location.hostname ? `${window.location.hostname}:5050` : 'localhost:5050');
        const wsUrl = `${wsProtocol}//${wsHost}/ws`;

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          ws.send(JSON.stringify({
            type: 'IDENTIFY',
            role: 'headset',
            client: 'ElderlySiteMain'
          }));
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'VR_SESSION_START') {
              if (msg.memories && msg.memories.length > 0) {
                setVrPresetMemories(msg.memories);
              }
              speechService.stop();
              setActiveModule('vr_memory');
            } else if (msg.type === 'VR_CONTROL_EVENT') {
              if (msg.action === 'FORCE_EXIT' || msg.action === 'PAUSE' || msg.action === 'TERMINATE') {
                console.log('🛑 [Elderly Site WS] Caregiver forced exit from VR to Home screen!');
                speechService.stop();
                setActiveModule(null);
              }
            } else if (msg.type === 'ASSESSMENT_FORCE_GATE') {
              console.log('🔒 [Elderly Site WS] Remote assessment gate trigger received!');
              speechService.stop();
              setActiveModule(null);
              setShowAssessmentGate(true);
            }
          } catch (e) {}
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connectWebSocket, 4000);
        };
      } catch (e) {
        reconnectTimeout = setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [apiUrl]);

  // Real-Time Socket.IO Synchronization (Zero Page Refresh)
  useEffect(() => {
    const socket = getSocket();

    socket.on('memory:selection-changed', (updatedMemory) => {
      console.log('⚡ [Elderly Socket.IO] Memory selection changed by caregiver:', updatedMemory);
      // Auto-refresh data from MongoDB if memories were changed
      fetchData();
    });

    // Caregiver VR Pause Override / Force Exit listener
    socket.on('elderly:control', (data) => {
      console.log('⚡ [Elderly Socket.IO] Control received from caregiver:', data);
      if (data?.action === 'FORCE_EXIT_VR' || data?.action === 'PAUSE' || data?.action === 'FORCE_EXIT') {
        console.log('🛑 [Elderly Site Socket] Caregiver forced exit from VR to Home screen!');
        speechService.stop();
        setActiveModule(null);
      }
    });

    // Remote Assessment Gate trigger from Caregiver
    socket.on('assessment:force-gate', () => {
      console.log('🔒 [Elderly Site Socket] Remote assessment gate trigger received!');
      speechService.stop();
      setActiveModule(null);
      setShowAssessmentGate(true);
    });

    return () => {
      socket.off('memory:selection-changed');
      socket.off('elderly:control');
      socket.off('assessment:force-gate');
    };
  }, []);

  const currentLang = selectedLanguage;
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;

  const handleSessionComplete = (savedSession) => {
    emitSessionComplete({
      activityName: activeModule || 'Cognitive Module',
      session: savedSession || null
    });
    setSessionCompletedNotice(true);
    setTimeout(() => {
      setSessionCompletedNotice(false);
      setActiveModule(null);
      fetchData();
    }, 3500);
  };

  // MANDATORY PRE-UI GATE: Completely blocks all access to main tabs/UI until completed
  if (showAssessmentGate) {
    return (
      <DailyAssessmentGate
        onComplete={handleAssessmentComplete}
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        apiUrl={apiUrl}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>

      <Header
        profile={profile}
        activeModule={activeModule}
        onBackHome={() => setActiveModule(null)}
        onOpenDemoSetup={() => setIsDemoSetupOpen(true)}
        onOpenAssessment={() => setShowAssessmentGate(true)}
        currentLang={selectedLanguage}
        selectedLanguage={selectedLanguage}
        onLangChange={handleLanguageChange}
        t={t}
      />

      {/* Celebratory Non-Infantile Affirmation Banner */}
      {sessionCompletedNotice && (
        <div style={{
          maxWidth: '900px',
          margin: '0 auto 2.5rem',
          background: 'var(--affirm-green-light)',
          border: '3px solid var(--affirm-green)',
          borderRadius: '24px',
          padding: '2.5rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--affirm-green)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <Sparkles size={48} />
          </div>
          <h2 style={{ fontSize: '36px', color: '#065F46', marginBottom: '10px' }}>
            {t.completedBanner || 'A Beautiful Memory Session Completed!'}
          </h2>
          <p style={{ fontSize: '24px', color: '#047857' }}>
            {t.completedBannerSub || 'Thank you for sharing your precious time and memories with us today.'}
          </p>
        </div>
      )}

      {/* Module Rendering */}
      {!activeModule && (
        <NavigationCards
          onSelectModule={(modId) => {
            emitActivityStart(modId);
            setActiveModule(modId);
          }}
          t={t}
        />
      )}

      {activeModule === 'family_recall' && (
        <MemoryLaneModule
          items={DEFAULT_MEMORY_ITEMS}
          familyMembers={familyMembers}
          selectedLanguage={selectedLanguage}
          selectedContentRegion={selectedContentRegion}
          onLanguageChange={handleLanguageChange}
          onSessionComplete={handleSessionComplete}
          apiUrl={apiUrl}
          lang={selectedLanguage}
          t={t}
        />
      )}

      {activeModule === 'number_sequence' && (
        <NumberSequenceGame
          onSessionComplete={handleSessionComplete}
          apiUrl={apiUrl}
          selectedLanguage={selectedLanguage}
          selectedContentRegion={selectedContentRegion}
          lang={selectedLanguage}
          t={t}
        />
      )}

      {activeModule === 'word_puzzle' && (
        <WordPuzzleGame
          onSessionComplete={handleSessionComplete}
          apiUrl={apiUrl}
          selectedLanguage={selectedLanguage}
          selectedContentRegion={selectedContentRegion}
          lang={selectedLanguage}
          t={t}
        />
      )}

      {activeModule === 'picture_match' && (
        <PictureMatchGame
          onSessionComplete={handleSessionComplete}
          apiUrl={apiUrl}
          selectedLanguage={selectedLanguage}
          selectedContentRegion={selectedContentRegion}
          lang={selectedLanguage}
          t={t}
        />
      )}

      {activeModule === 'cultural_reminiscence' && (
        <CulturalReminiscenceModule
          onSessionComplete={handleSessionComplete}
          apiUrl={apiUrl}
          selectedLanguage={selectedLanguage}
          selectedContentRegion={selectedContentRegion}
          lang={selectedLanguage}
          t={t}
        />
      )}

      {activeModule === 'daily_routine' && (
        <DailyRoutineModule
          routines={routines}
          onRefreshRoutines={fetchData}
          onSessionComplete={handleSessionComplete}
          apiUrl={apiUrl}
        />
      )}

      {activeModule === 'storytelling' && (
        <StorytellingModule
          onSessionComplete={handleSessionComplete}
          apiUrl={apiUrl}
          selectedLanguage={selectedLanguage}
          selectedContentRegion={selectedContentRegion}
          lang={selectedLanguage}
          t={t}
        />
      )}

      {activeModule === 'vr_memory' && (
        <VRMemoryExperience
          onSessionComplete={handleSessionComplete}
          apiUrl={apiUrl}
          selectedLanguage={selectedLanguage}
          lang={selectedLanguage}
          t={t}
          presetMemories={vrPresetMemories}
        />
      )}

      {activeModule === 'memory_match' && (
        <MemoryMatchGame
          onSessionComplete={handleSessionComplete}
          apiUrl={apiUrl}
        />
      )}

      {activeModule === 'visual_sequence' && (
        <VisualSequenceGame
          onSessionComplete={handleSessionComplete}
          apiUrl={apiUrl}
        />
      )}

      {/* Discrete Fallback Setup Modal */}
      <DemoSetupModal
        isOpen={isDemoSetupOpen}
        onClose={() => setIsDemoSetupOpen(false)}
        onDataUpdated={fetchData}
        apiUrl={apiUrl}
      />
    </div>
  );
}
