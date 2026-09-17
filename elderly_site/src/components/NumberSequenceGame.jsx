import React, { useState, useEffect, useMemo } from 'react';
import { Hash, Sparkles, RotateCcw, ArrowRight, HelpCircle } from 'lucide-react';
import { speechService } from '../services/speechService';
import { adaptiveDifficultyManager } from '../services/adaptiveDifficulty';
import { GAME_UI } from '../i18n/gameUI';
import { emitTelemetry, emitSessionComplete } from '../socket';

const GAME_ID = 'number_sequence';

const GAME_LEVELS = [
  { level: 1, digits: [4, 7], paceMs: 2400, label: 'Level 1 (2 Digits)' },
  { level: 2, digits: [3, 8, 5], paceMs: 1800, label: 'Level 2 (3 Digits)' },
  { level: 3, digits: [6, 2, 9, 4], paceMs: 1400, label: 'Level 3 (4 Digits)' },
  { level: 4, digits: [5, 1, 8, 3, 7], paceMs: 1100, label: 'Level 4 (5 Digits)' }
];

export default function NumberSequenceGame({ onSessionComplete, apiUrl, lang = 'en', selectedLanguage, t }) {
  const activeLang = selectedLanguage || lang;
  const nStrings = t?.numberGame || {};
  const nWords = t?.numberWords || {};
  const ui = useMemo(() => GAME_UI[activeLang] || GAME_UI.en, [activeLang]);

  // Current level from AdaptiveDifficultyManager (1 to 4)
  const [currentLevel, setCurrentLevel] = useState(1);
  const [phase, setPhase] = useState('showing'); // 'showing', 'input', 'success'
  const [revealedIndex, setRevealedIndex] = useState(0);
  const [userInput, setUserInput] = useState([]);
  const [attemptCount, setAttemptCount] = useState(1);
  const [adaptiveSimplifyNotice, setAdaptiveSimplifyNotice] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isReinforcementSequence, setIsReinforcementSequence] = useState(false);
  const [startTime] = useState(Date.now());

  // Check if a reinforced sequence is queued
  const targetDigits = useMemo(() => {
    const queued = adaptiveDifficultyManager.getNextReinforcementItem(GAME_ID);
    if (queued && Array.isArray(queued.itemPayload)) {
      setIsReinforcementSequence(true);
      return queued.itemPayload;
    }
    setIsReinforcementSequence(false);
    const lvlConfig = GAME_LEVELS.find(l => l.level === currentLevel) || GAME_LEVELS[0];
    return lvlConfig.digits;
  }, [currentLevel]);

  const levelConfig = useMemo(() => {
    return GAME_LEVELS.find(l => l.level === currentLevel) || GAME_LEVELS[0];
  }, [currentLevel]);

  // Reset to Level 1 on mount (fresh session start)
  useEffect(() => {
    adaptiveDifficultyManager.resetSessionLevel(GAME_ID);
    setCurrentLevel(1);
  }, []);

  // Halt speech on language change
  useEffect(() => {
    speechService.stop();
  }, [activeLang]);

  // Speak each digit in the active language calmly
  const speakDigit = (digit) => {
    const spokenWord = nWords[digit] || String(digit);
    speechService.speak(spokenWord, activeLang, 0.8);
  };

  // Step through digits one-by-one calmly
  useEffect(() => {
    if (phase === 'showing') {
      setUserInput([]);
      setFeedbackMsg('');
      setRevealedIndex(0);
      speakDigit(targetDigits[0]);

      const interval = setInterval(() => {
        setRevealedIndex((prev) => {
          if (prev + 1 < targetDigits.length) {
            speakDigit(targetDigits[prev + 1]);
            return prev + 1;
          } else {
            clearInterval(interval);
            setTimeout(() => {
              setPhase('input');
            }, 1200);
            return prev;
          }
        });
      }, levelConfig.paceMs);

      return () => clearInterval(interval);
    }
  }, [phase, currentLevel, activeLang, targetDigits]);

  const handleReplaySequence = () => {
    speechService.stop();
    setPhase('showing');
  };

  const handleKeypadPress = (num) => {
    if (phase !== 'input') return;
    if (userInput.length >= targetDigits.length) return;

    const nextInput = [...userInput, num];
    setUserInput(nextInput);

    if (nextInput.length === targetDigits.length) {
      const isCorrect = nextInput.every((val, idx) => val === targetDigits[idx]);

      // Emit live telemetry to Caregiver Dashboard
      emitTelemetry({
        activityTitle: 'Xonkhya Xuboni (Number Sequence)',
        activityType: 'number_sequence',
        status: isCorrect ? 'Sequence completed correctly' : `Attempt ${attemptCount} incorrect`,
        attempts: attemptCount,
        hintsDelivered: attemptCount - 1,
        isCorrect,
        gameLevel: currentLevel
      });

      if (isCorrect) {
        setPhase('success');
        setFeedbackMsg(nStrings.successMsg || 'Every number in perfect order.');
        speechService.speak(nStrings.successMsg || 'Every number in perfect order.', activeLang);

        const evaluation = adaptiveDifficultyManager.recordResult({
          gameId: GAME_ID,
          itemId: targetDigits.join(''),
          isCorrect: true,
          attempts: attemptCount,
          hintsUsed: attemptCount - 1,
          itemDifficulty: currentLevel
        });

        if (evaluation.leveledUp) {
          setCurrentLevel(evaluation.nextLevel);
        }
      } else {
        // 3-Attempt Dignified Adaptive Rule Handling
        if (attemptCount < 3) {
          const nextAttempt = attemptCount + 1;
          setAttemptCount(nextAttempt);

          const hintMsg = nextAttempt === 2
            ? (nStrings.gentleGuide || 'Gentle Guidance: The target numbers are highlighted in amber below!')
            : (ui.hintTier3 || 'Take your time, let us watch the sequence once more together.');

          setFeedbackMsg(hintMsg);

          // Audio stability fix: Wait for the hint to completely finish speaking before replaying sequence
          let hasTriggeredReplay = false;
          const triggerReplay = () => {
            if (hasTriggeredReplay) return;
            hasTriggeredReplay = true;
            setTimeout(() => {
              setUserInput([]);
              setPhase('showing');
            }, 600);
          };

          speechService.speak(hintMsg, activeLang, 0.85, {
            onEnd: triggerReplay,
            onError: triggerReplay
          });

          // Safety fallback timeout in case browser TTS onEnd is delayed
          setTimeout(triggerReplay, 4500);
        } else {
          // Exhausted 3 attempts -> Genuine difficulty lowering without condescending language
          // Clear any queued hard item so it cannot override the reduced level
          adaptiveDifficultyManager.clearQueueForGame(GAME_ID);

          const reducedLevel = Math.max(1, currentLevel - 1);
          adaptiveDifficultyManager.setLevel(GAME_ID, reducedLevel);
          setCurrentLevel(reducedLevel);
          setAdaptiveSimplifyNotice(true);

          // Dignified polite empathy update (never making user feel bad)
          const politeMsgByLang = {
            en: "Okay, let's try something different.",
            as: "ঠিক আছে, আহক আন কিবা এটা চেষ্টা কৰোঁ।",
            bn: "ঠিক আছে, আসুন অন্য কিছু চেষ্টা করি।",
            ne: "हुन्छ, अब अर्कै केही प्रयास गरौँ।"
          };
          const politeMsg = politeMsgByLang[activeLang] || "Okay, let's try something different.";

          setFeedbackMsg(politeMsg);

          // Audio stability fix: let the polite message finish naturally before starting easier sequence
          let hasTransitioned = false;
          const transitionToEasier = () => {
            if (hasTransitioned) return;
            hasTransitioned = true;
            setTimeout(() => {
              setUserInput([]);
              setAttemptCount(1);
              setPhase('showing');
            }, 600);
          };

          speechService.speak(politeMsg, activeLang, 0.85, {
            onEnd: transitionToEasier,
            onError: transitionToEasier
          });

          // Safety fallback timeout
          setTimeout(transitionToEasier, 4500);
        }
      }
    }
  };

  const handleUndo = () => {
    setUserInput(prev => prev.slice(0, -1));
  };

  const handleNextLevel = async () => {
    speechService.stop();
    setAdaptiveSimplifyNotice(false);
    setAttemptCount(1);
    setFeedbackMsg('');

    const isLast = currentLevel === 4;
    const duration = Math.round((Date.now() - startTime) / 1000);

    let savedSession = null;
    try {
      const res = await fetch(`${apiUrl}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityType: 'number_sequence',
          activityTitle: `Xonkhya Xuboni (${ui.levels[currentLevel] || 'Level ' + currentLevel})`,
          durationSeconds: duration || 140,
          supportiveFeedback: adaptiveSimplifyNotice ? 'Needs a Gentler Pace' : 'High Recall Day',
          favoriteTopicRevisited: `Digit Sequence (${targetDigits.length} Digits)`,
          itemsEngaged: targetDigits.length,
          paceObservation: 'Comfortable & Unhurried',
          gameLevel: currentLevel
        })
      });
      if (res.ok) {
        savedSession = await res.json();
      }
    } catch (err) {
      console.warn('Session logging notice:', err);
    }

    if (!isLast) {
      setCurrentLevel(prev => Math.min(4, prev + 1));
      setPhase('showing');
    } else {
      if (onSessionComplete) onSessionComplete(savedSession);
    }
  };

  const keypadNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  return (
    <div className="focus-card" style={{ maxWidth: '900px' }}>
      {/* Header Meta: Title, Level Badge, Attempt Count */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        borderBottom: '2px solid var(--border-subtle)',
        paddingBottom: '1rem',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Hash size={36} color="var(--accent-amber)" />
          <h2 style={{ fontSize: '32px' }}>সংখ্যা সুৱনি — Number Sequence</h2>
          <span style={{
            background: 'var(--accent-amber-light)',
            color: 'var(--accent-amber-hover)',
            fontSize: '16px',
            fontWeight: '800',
            padding: '4px 14px',
            borderRadius: '16px',
            border: '2px solid #FCD34D'
          }}>
            {ui.levels[currentLevel] || `Level ${currentLevel}`}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>
            {ui.attemptText ? ui.attemptText.replace('{current}', String(attemptCount)) : `Attempt ${attemptCount} of 3`}
          </span>
          <button
            type="button"
            className="speaker-btn"
            onClick={handleReplaySequence}
            style={{ fontSize: '18px', padding: '8px 16px' }}
          >
            <RotateCcw size={18} />
            <span>{nStrings.replay || 'Show Sequence Again'}</span>
          </button>
        </div>
      </div>

      {/* Delayed Recall / Reinforcement Banner */}
      {isReinforcementSequence && (
        <div style={{
          background: '#EFF6FF',
          border: '2px solid #93C5FD',
          borderRadius: '16px',
          padding: '12px 18px',
          fontSize: '20px',
          color: '#1E40AF',
          fontWeight: '700',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Sparkles size={24} color="#2563EB" />
          <span>{ui.reinforcementNotice || "Let's revisit this memory from earlier together."}</span>
        </div>
      )}

      {/* PHASE 1: SHOWING DIGITS */}
      {phase === 'showing' && (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
          <p style={{ fontSize: '24px', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            {nStrings.watchPrompt || 'Watch the numbers calmly:'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {targetDigits.map((digit, idx) => {
              const isRevealed = idx <= revealedIndex;
              const isCurrent = idx === revealedIndex;
              return (
                <div
                  key={idx}
                  style={{
                    width: '110px',
                    height: '130px',
                    borderRadius: '24px',
                    background: isRevealed ? '#FFFFFF' : '#F1F5F9',
                    border: isCurrent ? '4px solid var(--accent-amber)' : '3px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isCurrent ? '0 10px 25px rgba(217, 119, 6, 0.25)' : 'var(--shadow-soft)',
                    transform: isCurrent ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <span style={{
                    fontSize: '60px',
                    fontWeight: '800',
                    color: isRevealed ? 'var(--text-main)' : 'transparent',
                    fontFamily: 'var(--font-heading)'
                  }}>
                    {isRevealed ? digit : '?'}
                  </span>
                  {isRevealed && (
                    <span style={{ fontSize: '18px', color: 'var(--accent-amber)', fontWeight: '700' }}>
                      {nWords[digit] || ''}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PHASE 2: INPUT PHASE */}
      {phase === 'input' && (
        <div>
          <p style={{ fontSize: '24px', textAlign: 'center', marginBottom: '1.5rem', fontWeight: '600' }}>
            {nStrings.tapPrompt || 'Now, tap the numbers in the same order:'}
          </p>

          {/* User Input Display Boxes */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '2rem' }}>
            {targetDigits.map((_, idx) => {
              const enteredNum = userInput[idx];
              return (
                <div
                  key={idx}
                  style={{
                    width: '90px',
                    height: '100px',
                    borderRadius: '20px',
                    background: enteredNum !== undefined ? 'var(--accent-amber-light)' : '#FFFFFF',
                    border: '3px dashed var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    fontWeight: '800',
                    color: 'var(--accent-amber-hover)'
                  }}
                >
                  {enteredNum !== undefined ? enteredNum : ''}
                </div>
              );
            })}
          </div>

          {/* Adaptive Message Notice */}
          {feedbackMsg && (
            <div style={{
              background: '#FEF3C7',
              border: '2px solid #FCD34D',
              borderRadius: '16px',
              padding: '12px 20px',
              fontSize: '20px',
              color: '#92400E',
              textAlign: 'center',
              marginBottom: '1.5rem',
              fontWeight: '700'
            }}>
              💡 {feedbackMsg}
            </div>
          )}

          {/* Massive Age-Friendly Keypad */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '16px',
            maxWidth: '650px',
            margin: '0 auto 1.5rem'
          }}>
            {keypadNumbers.map((num) => {
              const isTargetDigit = targetDigits.includes(num);
              const highlight = attemptCount >= 2 && isTargetDigit;
              return (
                <button
                  key={num}
                  onClick={() => handleKeypadPress(num)}
                  style={{
                    minHeight: '80px',
                    background: highlight ? '#FEF3C7' : '#FFFFFF',
                    border: highlight ? '3px solid #D97706' : '3px solid var(--border-subtle)',
                    borderRadius: '20px',
                    fontSize: '40px',
                    fontWeight: '800',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-soft)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'var(--accent-amber)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = highlight ? '#D97706' : 'var(--border-subtle)';
                  }}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {userInput.length > 0 && (
            <div style={{ textAlign: 'center' }}>
              <button
                className="btn-large btn-outline"
                onClick={handleUndo}
                style={{ minHeight: '60px', padding: '10px 24px', fontSize: '20px' }}
              >
                {nStrings.undo || 'Undo Last Digit'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* PHASE 3: SUCCESS PHASE */}
      {phase === 'success' && (
        <div style={{
          background: 'var(--affirm-green-light)',
          border: '3px solid var(--affirm-green)',
          borderRadius: '24px',
          padding: '2.5rem',
          textAlign: 'center',
          marginTop: '1.5rem'
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'var(--affirm-green)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <Sparkles size={40} />
          </div>

          <h3 style={{ fontSize: '32px', color: '#065F46', marginBottom: '8px' }}>
            {nStrings.successTitle || 'Wonderfully Remembered!'}
          </h3>
          <p style={{ fontSize: '24px', color: '#047857', marginBottom: '2rem' }}>
            {feedbackMsg || nStrings.successMsg || 'Every number in perfect order.'}
          </p>

          <button
            className="btn-large btn-sage"
            onClick={handleNextLevel}
          >
            <span>{currentLevel === 4 ? (nStrings.complete || 'Complete Activity') : (nStrings.nextLevel || 'Proceed to Next Level')}</span>
            <ArrowRight size={28} />
          </button>
        </div>
      )}
    </div>
  );
}
