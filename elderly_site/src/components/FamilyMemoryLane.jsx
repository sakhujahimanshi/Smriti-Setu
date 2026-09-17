import React, { useEffect, useState, useMemo } from 'react';
import { GAME_UI } from '../i18n/gameUI';
import { RELATION_LABELS } from '../i18n/relationships';
import { speechService } from '../services/speechService';
import { DEFAULT_MEMORY_ITEMS, normalizeFamilyMemberToMemoryItem } from '../data/memoryItems';
import { adaptiveDifficultyManager } from '../services/adaptiveDifficulty';
import { emitTelemetry } from '../socket';
import { Sparkles, CheckCircle, ArrowRight, Heart, HelpCircle, RotateCcw } from 'lucide-react';

const GAME_ID = 'family_recall';

export const FamilyMemoryLane = ({
  items: propItems,
  familyMembers,
  selectedLanguage = 'as',
  onLanguageChange,
  onSessionComplete,
  apiUrl
}) => {
  // Determine authoritative memory items
  const baseItems = useMemo(() => {
    if (propItems && propItems.length > 0) return propItems;
    if (familyMembers && familyMembers.length > 0) {
      return familyMembers.map((m, idx) => normalizeFamilyMemberToMemoryItem(m, idx));
    }
    return DEFAULT_MEMORY_ITEMS;
  }, [propItems, familyMembers]);

  // Current level from AdaptiveDifficultyManager (Levels 1 to 4)
  const [currentLevel, setCurrentLevel] = useState(() => adaptiveDifficultyManager.getLevel(GAME_ID));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);
  const [activeHintTier, setActiveHintTier] = useState(0); // 0: none, 1: gentle, 2: context, 3: direct
  const [adaptiveSimplifyNotice, setAdaptiveSimplifyNotice] = useState(false);
  const [isReinforcementItem, setIsReinforcementItem] = useState(false);
  const [reinforceSuccessNotice, setReinforceSuccessNotice] = useState(false);
  const [startTime] = useState(Date.now());

  // Check if we have a delayed-recall reinforcement item queued
  const items = useMemo(() => {
    const queued = adaptiveDifficultyManager.getNextReinforcementItem(GAME_ID);
    if (queued && queued.itemPayload && currentIndex > 0) {
      // Inject reinforcement item into active sequence
      const list = [...baseItems];
      const matchIdx = list.findIndex(i => i.id === queued.itemId || i.targetId === queued.itemId);
      if (matchIdx >= 0) {
        list.splice(currentIndex, 0, list[matchIdx]);
      }
      return list;
    }
    return baseItems;
  }, [baseItems, currentIndex]);

  const currentItem = items[currentIndex] || items[0];
  const ui = useMemo(() => GAME_UI[selectedLanguage] || GAME_UI.en, [selectedLanguage]);
  const localizedContent = useMemo(() => {
    if (!currentItem || !currentItem.content) return {};
    return currentItem.content[selectedLanguage] || currentItem.content.en || {};
  }, [currentItem, selectedLanguage]);

  // Stop active speech whenever language changes
  useEffect(() => {
    speechService.stop();
  }, [selectedLanguage]);

  const handleSpeak = (text) => {
    if (!text) return;
    speechService.speak(text, selectedLanguage);
  };

  // Determine visible options based on current cognitive Level (1 to 4) and adaptive simplification
  const visibleOptions = useMemo(() => {
    if (!currentItem?.options) return [];
    const allOpts = currentItem.options;
    const correctOpt = allOpts.find(o => o.id === currentItem.targetId) || allOpts[0];
    const distractors = allOpts.filter(o => o.id !== currentItem.targetId);

    if (adaptiveSimplifyNotice || currentLevel === 1) {
      // Level 1: 2 choices (correct + 1 distractor)
      return [correctOpt, distractors[0]].filter(Boolean);
    }
    if (currentLevel === 2) {
      // Level 2: 3 choices
      return [correctOpt, ...distractors.slice(0, 2)].filter(Boolean);
    }
    // Level 3 & 4: 4 choices
    return allOpts.slice(0, 4);
  }, [currentItem, currentLevel, adaptiveSimplifyNotice]);

  const handleOptionSelect = (optionId) => {
    if (isAnswered) return;
    setSelectedOptionId(optionId);

    const isCorrect = optionId === currentItem.targetId;

    emitTelemetry({
      activityTitle: 'Smriti Ghor (Family Memory Lane)',
      activityType: 'family_recall',
      status: isCorrect ? `Identified: ${localizedContent.name}` : `Attempt ${attemptCount} for ${localizedContent.name}`,
      attempts: attemptCount,
      hintsDelivered: activeHintTier,
      isCorrect,
      gameLevel: currentLevel
    });

    if (isCorrect) {
      setIsAnswered(true);
      // Record clean success in adaptive difficulty manager
      const evaluation = adaptiveDifficultyManager.recordResult({
        gameId: GAME_ID,
        itemId: currentItem.targetId,
        isCorrect: true,
        attempts: attemptCount,
        hintsUsed: activeHintTier,
        itemDifficulty: currentLevel
      });

      if (isReinforcementItem) {
        setReinforceSuccessNotice(true);
      }

      if (evaluation.leveledUp) {
        setCurrentLevel(evaluation.nextLevel);
      }

      handleSpeak(localizedContent.correctFeedback);
    } else {
      // 3-Attempt Adaptive Rule Handling
      if (attemptCount < 3) {
        const nextAttempt = attemptCount + 1;
        setAttemptCount(nextAttempt);
        setActiveHintTier(nextAttempt);

        // Speak gentle encouragement
        handleSpeak(localizedContent.incorrectFeedback);
      } else {
        // Attempt 3 failed -> queue for reinforcement and intentionally simplify
        setIsAnswered(true);
        const result = adaptiveDifficultyManager.handleAttemptFailure({
          gameId: GAME_ID,
          item: currentItem,
          attemptNumber: attemptCount,
          hintsUsed: activeHintTier
        });

        setAdaptiveSimplifyNotice(true);
        setCurrentLevel(result.reducedLevel);
        handleSpeak(ui.adaptiveSimplify || "That's okay. Let's try something a little easier.");
      }
    }
  };

  const handleNext = async () => {
    speechService.stop();
    setIsAnswered(false);
    setSelectedOptionId(null);
    setAttemptCount(1);
    setActiveHintTier(0);
    setAdaptiveSimplifyNotice(false);
    setReinforceSuccessNotice(false);

    if (currentIndex < items.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);

      // Check if next item is a delayed recall reinforcement item
      const nextItem = items[nextIdx];
      const queued = adaptiveDifficultyManager.getNextReinforcementItem(GAME_ID);
      if (queued && (queued.itemId === nextItem?.id || queued.itemId === nextItem?.targetId)) {
        setIsReinforcementItem(true);
      } else {
        setIsReinforcementItem(false);
      }
    } else {
      // Completed session
      const duration = Math.round((Date.now() - startTime) / 1000);
      let savedSession = null;
      try {
        const res = await fetch(`${apiUrl}/api/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activityType: 'family_recall',
            activityTitle: `Smriti Ghor — Family Memory Lane (${ui.levels[currentLevel] || 'Level ' + currentLevel})`,
            durationSeconds: duration || 140,
            supportiveFeedback: adaptiveSimplifyNotice ? 'Needs a Gentler Pace' : 'High Recall Day',
            favoriteTopicRevisited: currentItem.options[0]?.personName?.en || 'Family Memories',
            itemsEngaged: items.length,
            paceObservation: 'Comfortable & Dignified',
            gameLevel: currentLevel
          })
        });
        if (res.ok) {
          savedSession = await res.json();
        }
      } catch (err) {
        console.warn('Session logging notice:', err.message);
      }
      if (onSessionComplete) onSessionComplete(savedSession);
    }
  };

  // Get active hint text based on current hint tier
  const activeHintText = useMemo(() => {
    if (!currentItem?.hints) return localizedContent.clue || '';
    const langHints = currentItem.hints[selectedLanguage] || currentItem.hints.en || [];
    const tierIdx = Math.max(0, Math.min(activeHintTier - 1, langHints.length - 1));
    return langHints[tierIdx] || localizedContent.clue || '';
  }, [currentItem, selectedLanguage, activeHintTier, localizedContent]);

  if (!currentItem) return null;

  const isLast = currentIndex === items.length - 1;

  return (
    <div className="memory-lane-container">
      {/* Microcopy Header with Level Badge and Progress */}
      <div className="header-meta">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Heart size={30} color="#DC2626" fill="#FEE2E2" />
          <span>{ui.gameTitle}</span>
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
          <span style={{ fontWeight: '700' }}>
            {ui.photoProgress
              .replace('{current}', String(currentIndex + 1))
              .replace('{total}', String(items.length))}
          </span>
        </div>
      </div>

      {/* Delayed Recall / Reinforcement Banner if active */}
      {isReinforcementItem && !isAnswered && (
        <div style={{
          background: '#EFF6FF',
          border: '2px solid #93C5FD',
          borderRadius: '16px',
          padding: '12px 18px',
          fontSize: '20px',
          color: '#1E40AF',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Sparkles size={24} color="#2563EB" />
          <span>{ui.reinforcementNotice || "Let's revisit this memory from earlier together."}</span>
        </div>
      )}

      {/* Main Photograph */}
      <div className="memory-photo-wrapper">
        <img
          src={currentItem.imageSrc}
          alt="Family memory"
          className="memory-photo"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80';
          }}
        />
      </div>

      {/* Localized Question & Read Aloud */}
      <div className="question-box">
        <h2>{localizedContent.question}</h2>
        <button
          type="button"
          className="audio-btn"
          onClick={() => handleSpeak(localizedContent.question)}
          aria-label={ui.readQuestionAloud || "Read question aloud"}
          title={ui.readQuestionAloud || "Read question aloud"}
        >
          🔊
        </button>
      </div>

      {/* 3-Attempt Adaptive Notice on exhaustion */}
      {adaptiveSimplifyNotice && !isAnswered && (
        <div style={{
          background: '#FEF3C7',
          border: '2px solid #FCD34D',
          borderRadius: '16px',
          padding: '14px 20px',
          fontSize: '22px',
          color: '#92400E',
          fontWeight: '700'
        }}>
          💡 {ui.adaptiveSimplify || "That's okay. Let's try something a little easier."}
        </div>
      )}

      {/* Options: Language-neutral ID validation, fully localized presentation */}
      <div className="options-grid">
        {visibleOptions.map(opt => {
          const name = opt.personName[selectedLanguage] || opt.personName.en;
          const relationLookup = RELATION_LABELS[opt.relationKey];
          const relation = relationLookup ? (relationLookup[selectedLanguage] || relationLookup.en) : opt.relationKey;
          const isSelected = selectedOptionId === opt.id;
          const isCorrect = opt.id === currentItem.targetId;

          let btnClass = "option-btn";
          if (isAnswered) {
            if (isCorrect) btnClass += " correct";
            else if (isSelected) btnClass += " incorrect";
          }

          return (
            <button
              key={opt.id}
              className={btnClass}
              onClick={() => handleOptionSelect(opt.id)}
            >
              <span>{name} ({relation})</span>
              {isAnswered && isCorrect && <CheckCircle size={32} color="#059669" />}
            </button>
          );
        })}
      </div>

      {/* 3-Tier Gentle Clue Section */}
      <div className="clue-section">
        {activeHintTier === 0 ? (
          <button
            type="button"
            className="clue-toggle-btn"
            onClick={() => {
              setActiveHintTier(1);
              handleSpeak(activeHintText);
            }}
          >
            💡 {ui.hintTier1 || ui.clueLabel}
          </button>
        ) : (
          <div className="clue-card">
            <div>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#B45309', display: 'block', marginBottom: '4px' }}>
                {activeHintTier === 1 ? ui.hintTier1 : activeHintTier === 2 ? ui.hintTier2 : ui.hintTier3}
              </span>
              <p style={{ margin: 0 }}>{activeHintText}</p>
            </div>
            <button
              type="button"
              className="audio-btn"
              onClick={() => handleSpeak(activeHintText)}
              aria-label={ui.readClueAloud || "Read clue aloud"}
              title={ui.readClueAloud || "Read clue aloud"}
            >
              🔊
            </button>
          </div>
        )}
      </div>

      {/* Localized Affirmation Banner after selection */}
      {isAnswered && (
        <div style={{
          background: selectedOptionId === currentItem.targetId ? 'var(--affirm-green-light)' : '#FEF3C7',
          border: `3px solid ${selectedOptionId === currentItem.targetId ? 'var(--affirm-green)' : '#F59E0B'}`,
          borderRadius: '20px',
          padding: '1.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <Sparkles size={32} color={selectedOptionId === currentItem.targetId ? '#059669' : '#D97706'} />
          <div style={{ fontSize: '24px', fontWeight: '700', color: selectedOptionId === currentItem.targetId ? '#065F46' : '#92400E' }}>
            {reinforceSuccessNotice
              ? (ui.reinforcementSuccess || "Wonderful! You remembered this previously challenging memory.")
              : (selectedOptionId === currentItem.targetId ? localizedContent.correctFeedback : ui.adaptiveSimplify)}
          </div>
        </div>
      )}

      {/* Story & Navigation */}
      <div className="footer-actions">
        <button
          type="button"
          className="btn-story"
          onClick={() => handleSpeak(localizedContent.story)}
        >
          📖 {ui.listenStory}
        </button>
        {isAnswered && (
          <button
            type="button"
            className="btn-primary"
            onClick={handleNext}
          >
            <span>{isLast ? (ui.completedTitle ? ui.next : 'Complete') : `${ui.next} →`}</span>
            <ArrowRight size={28} />
          </button>
        )}
      </div>
    </div>
  );
};

export default FamilyMemoryLane;
