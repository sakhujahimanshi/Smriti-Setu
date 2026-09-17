import React, { useState, useEffect, useMemo } from 'react';
import { Compass, Sparkles, Heart, ArrowRight, Lightbulb, CheckCircle2, RotateCcw } from 'lucide-react';
import SpeechSpeaker from './SpeechSpeaker';
import { speechService } from '../services/speechService';
import { adaptiveDifficultyManager } from '../services/adaptiveDifficulty';
import { NER_CULTURAL_STORIES } from '../data/nerCulturalData';
import { GAME_UI } from '../i18n/gameUI';

const GAME_ID = 'cultural_reminiscence';

export default function CulturalReminiscenceModule({
  onSessionComplete,
  apiUrl,
  lang = 'en',
  selectedLanguage,
  selectedContentRegion = 'NER',
  t
}) {
  const activeLang = selectedLanguage || lang;
  const ui = useMemo(() => GAME_UI[activeLang] || GAME_UI.en, [activeLang]);

  // Current cognitive level from AdaptiveDifficultyManager (1 to 4)
  const [currentLevel, setCurrentLevel] = useState(() => adaptiveDifficultyManager.getLevel(GAME_ID));
  const [topicIndex, setTopicIndex] = useState(0);
  const [phase, setPhase] = useState('story'); // 'story', 'recall', 'success'
  const [selectedChoiceId, setSelectedChoiceId] = useState(null);
  const [attemptCount, setAttemptCount] = useState(1);
  const [activeHintTier, setActiveHintTier] = useState(0);
  const [adaptiveSimplifyNotice, setAdaptiveSimplifyNotice] = useState(false);
  const [isReinforcementItem, setIsReinforcementItem] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [startTime] = useState(Date.now());

  // Filter NER stories matching selectedContentRegion ('NER')
  const baseStories = useMemo(() => {
    return NER_CULTURAL_STORIES.filter(s => s.region === 'NER');
  }, []);

  // Check if reinforcement queue has a story waiting for delayed recall
  const activeStory = useMemo(() => {
    const queued = adaptiveDifficultyManager.getNextReinforcementItem(GAME_ID);
    if (queued) {
      const match = baseStories.find(s => s.id === queued.itemId || s.level === queued.difficulty);
      if (match) {
        setIsReinforcementItem(true);
        return match;
      }
    }
    setIsReinforcementItem(false);

    // Full journey across all 8 sister states of the North Eastern Region
    return baseStories[topicIndex % baseStories.length];
  }, [baseStories, topicIndex]);

  const storyTitle = activeStory.title[activeLang] || activeStory.title.en;
  const storySubtitle = activeStory.subtitle[activeLang] || activeStory.subtitle.en;
  const storyText = activeStory.story[activeLang] || activeStory.story.en;
  const reflectionPrompt = activeStory.reflectionPrompt[activeLang] || activeStory.reflectionPrompt.en;
  const recallQuestion = activeStory.recallQuestion.question[activeLang] || activeStory.recallQuestion.question.en;

  // Active choices adjusted for level and simplification
  const displayChoices = useMemo(() => {
    const choices = activeStory.recallQuestion.choices;
    const correctChoice = choices.find(c => c.id === activeStory.recallQuestion.targetId) || choices[0];
    const distractors = choices.filter(c => c.id !== activeStory.recallQuestion.targetId);

    let list;
    if (adaptiveSimplifyNotice || currentLevel === 1) {
      // 2 choices
      list = [correctChoice, distractors[0]].filter(Boolean);
    } else if (currentLevel === 2) {
      // 3 choices
      list = [correctChoice, ...distractors.slice(0, 2)].filter(Boolean);
    } else {
      list = choices;
    }

    // Stable alternating position based on topicIndex so the correct answer is not always the first card
    if (topicIndex % 2 === 1 && list.length >= 2) {
      return [list[1], list[0], ...list.slice(2)];
    }
    return list;
  }, [activeStory, currentLevel, adaptiveSimplifyNotice, topicIndex]);

  // Active hint text based on current hint tier
  const activeHintText = useMemo(() => {
    if (!activeStory?.hints) return '';
    const langHints = activeStory.hints[activeLang] || activeStory.hints.en || [];
    const tierIdx = Math.max(0, Math.min(activeHintTier - 1, langHints.length - 1));
    return langHints[tierIdx] || '';
  }, [activeStory, activeLang, activeHintTier]);

  // Stop active voice on language change
  useEffect(() => {
    speechService.stop();
  }, [activeLang]);

  const handleStartRecall = () => {
    speechService.stop();
    setPhase('recall');
    speechService.speak(recallQuestion, activeLang);
  };

  const handleChoiceClick = (choice) => {
    if (phase !== 'recall') return;
    setSelectedChoiceId(choice.id);

    const isCorrect = choice.id === activeStory.recallQuestion.targetId;

    if (isCorrect) {
      setPhase('success');
      const successMsg = isReinforcementItem
        ? (ui.reinforcementSuccess || "Wonderful! You remembered this previously challenging memory.")
        : (ui.wellDone || "Wonderful! You remembered correctly.");

      setFeedback(successMsg);
      speechService.speak(successMsg, activeLang);

      const evaluation = adaptiveDifficultyManager.recordResult({
        gameId: GAME_ID,
        itemId: activeStory.id,
        isCorrect: true,
        attempts: attemptCount,
        hintsUsed: activeHintTier,
        itemDifficulty: currentLevel
      });

      if (evaluation.leveledUp) {
        setCurrentLevel(evaluation.nextLevel);
      }
    } else {
      // 3-Attempt Adaptive Rule Handling
      if (attemptCount < 3) {
        const nextAttempt = attemptCount + 1;
        setAttemptCount(nextAttempt);
        setActiveHintTier(nextAttempt);

        const encouragement = ui.gentleEncouragement || "That is close, take a slow look again.";
        setFeedback(encouragement);
        speechService.speak(activeHintText || encouragement, activeLang);
      } else {
        // Attempt 3 failed -> queue for reinforcement and intentionally simplify to Level 1
        const result = adaptiveDifficultyManager.handleAttemptFailure({
          gameId: GAME_ID,
          item: activeStory,
          attemptNumber: attemptCount,
          hintsUsed: 3
        });

        setAdaptiveSimplifyNotice(true);
        setCurrentLevel(result.reducedLevel);
        const simplifyMsg = ui.adaptiveSimplify || "That's okay. Let's try something a little easier.";
        setFeedback(simplifyMsg);
        speechService.speak(simplifyMsg, activeLang);
      }
    }
  };

  const handleNextStory = async () => {
    speechService.stop();
    setPhase('story');
    setSelectedChoiceId(null);
    setAttemptCount(1);
    setActiveHintTier(0);
    setAdaptiveSimplifyNotice(false);
    setFeedback('');

    const isLast = topicIndex === baseStories.length - 1;
    const duration = Math.round((Date.now() - startTime) / 1000);

    let savedSession = null;
    try {
      const res = await fetch(`${apiUrl}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityType: 'cultural_reminiscence',
          activityTitle: `Heritage Journey (${activeStory.state} — ${ui.levels[currentLevel] || 'Level ' + currentLevel})`,
          durationSeconds: duration || 180,
          supportiveFeedback: adaptiveSimplifyNotice ? 'Needs a Gentler Pace' : 'High Recall Day',
          favoriteTopicRevisited: activeStory.favoriteTag,
          itemsEngaged: topicIndex + 1,
          paceObservation: 'Comfortable & Dignified',
          gameLevel: currentLevel
        })
      });
      if (res.ok) {
        savedSession = await res.json();
      }
    } catch (err) {
      console.warn('Failed to log session:', err);
    }

    if (!isLast) {
      setTopicIndex(prev => prev + 1);
    } else {
      if (onSessionComplete) onSessionComplete(savedSession);
    }
  };

  const isLast = topicIndex === baseStories.length - 1;

  return (
    <div className="focus-card" style={{ maxWidth: '980px' }}>
      {/* Header Meta: Regional Scope & Originating State Badge */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <Compass size={36} color="var(--accent-amber)" />
          <h2 style={{ fontSize: '32px' }}>{ui.regionBadge || 'North Eastern Region (NER)'}</h2>

          {/* Originating State Badge (Internal state metadata) */}
          <span style={{
            background: '#F0F9FF',
            color: '#0369A1',
            fontSize: '16px',
            fontWeight: '800',
            padding: '4px 14px',
            borderRadius: '16px',
            border: '2px solid #BAE6FD'
          }}>
            📍 {ui.states[activeStory.state] || activeStory.state}
          </span>

          {/* Level Badge */}
          <span style={{
            background: 'var(--accent-amber-light)',
            color: 'var(--accent-amber-hover)',
            fontSize: '15px',
            fontWeight: '800',
            padding: '4px 12px',
            borderRadius: '16px',
            border: '2px solid #FCD34D'
          }}>
            {ui.levels[currentLevel] || `Level ${currentLevel}`}
          </span>
        </div>

        <span style={{ fontSize: '18px', color: 'var(--text-muted)', fontWeight: '600' }}>
          {ui.storyProgress
            ? ui.storyProgress.replace('{current}', String((topicIndex % baseStories.length) + 1)).replace('{total}', String(baseStories.length))
            : `Story ${(topicIndex % baseStories.length) + 1} of ${baseStories.length}`}
        </span>
      </div>

      {/* 8 Sister States Journey Navigator */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {baseStories.map((s, idx) => {
          const stateName = ui.states[s.state] || s.state;
          const isActive = (topicIndex % baseStories.length) === idx;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                speechService.stop();
                setTopicIndex(idx);
                setPhase('story');
                setSelectedChoiceId(null);
                setAttemptCount(1);
                setActiveHintTier(0);
                setAdaptiveSimplifyNotice(false);
                setFeedback('');
              }}
              style={{
                background: isActive ? '#0369A1' : '#F0F9FF',
                color: isActive ? '#FFFFFF' : '#0369A1',
                border: isActive ? '2px solid #0284C7' : '2px solid #BAE6FD',
                borderRadius: '14px',
                padding: '6px 14px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              📍 {stateName}
            </button>
          );
        })}
      </div>

      {/* Delayed Recall / Reinforcement Banner */}
      {isReinforcementItem && (
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

      {/* PHASE 1: STORY NARRATION & REFLECTION */}
      {phase === 'story' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 380px) 1fr', gap: '2.5rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              borderRadius: '24px',
              overflow: 'hidden',
              border: '4px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-soft)',
              height: '340px'
            }}>
              <img
                src={activeStory.imageUrl}
                alt={storyTitle}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <SpeechSpeaker
                text={`${storyTitle}. ${storyText}. ${reflectionPrompt}`}
                label={ui.readStoryAloud || "Listen to Heritage Story Aloud"}
                lang={activeLang}
              />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '30px', color: 'var(--text-main)', marginBottom: '8px' }}>
              {storyTitle}
            </h3>
            <p style={{ fontSize: '20px', color: 'var(--accent-amber)', fontWeight: '700', marginBottom: '1.25rem' }}>
              {storySubtitle}
            </p>

            <p style={{ fontSize: '22px', lineHeight: '1.6', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
              {storyText}
            </p>

            <div style={{
              background: '#FFFBEB',
              border: '2px solid #FDE68A',
              borderRadius: '18px',
              padding: '1.25rem',
              fontSize: '22px',
              color: '#92400E',
              marginBottom: '1.5rem'
            }}>
              💭 <em>"{reflectionPrompt}"</em>
            </div>

            <button
              type="button"
              className="btn-large btn-amber"
              onClick={handleStartRecall}
              style={{ width: '100%' }}
            >
              <Heart size={28} />
              <span>
                {activeLang === 'as' ? 'ঐতিহ্যৰ স্মৃতি পৰীক্ষা কৰক' :
                 activeLang === 'bn' ? 'ঐতিহ্যের স্মৃতিচারণ করুন' :
                 activeLang === 'ne' ? 'सम्पदा सम्झना अभ्यास गर्नुहोस्' :
                 'Reflect on Heritage Memory'}
              </span>
              <ArrowRight size={24} />
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: INTERACTIVE STORY RECALL QUESTION */}
      {phase === 'recall' && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '18px', color: '#64748B', fontWeight: '600' }}>
              {(ui.attemptText || 'Attempt {current} of 3').replace('{current}', String(attemptCount))}
            </span>
          </div>

          <div style={{
            background: '#FAF7F2',
            border: '2px solid var(--border-subtle)',
            borderRadius: '20px',
            padding: '1.5rem 2rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '26px', color: 'var(--text-main)', margin: 0 }}>
              {recallQuestion}
            </h3>
            <button
              type="button"
              className="audio-btn"
              onClick={() => speechService.speak(recallQuestion, activeLang)}
              aria-label={ui.readQuestionAloud || "Read question aloud"}
            >
              🔊
            </button>
          </div>

          {/* Adaptive Notice / Clue Display */}
          {feedback && (
            <div style={{
              background: '#FEF3C7',
              border: '2px solid #FCD34D',
              borderRadius: '16px',
              padding: '12px 20px',
              fontSize: '20px',
              color: '#92400E',
              marginBottom: '1.5rem',
              fontWeight: '700'
            }}>
              💡 {feedback}
            </div>
          )}

          {/* Choice Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '2rem' }}>
            {displayChoices.map((choice) => {
              const choiceLabel = choice.label[activeLang] || choice.label.en;
              const isSelected = selectedChoiceId === choice.id;
              const isTarget = choice.id === activeStory.recallQuestion.targetId;

              let btnClass = "option-btn";
              if (selectedChoiceId) {
                if (isTarget) btnClass += " correct";
                else if (isSelected) btnClass += " incorrect";
              }

              return (
                <button
                  key={choice.id}
                  type="button"
                  className={btnClass}
                  onClick={() => handleChoiceClick(choice)}
                >
                  <span>{choiceLabel}</span>
                  {selectedChoiceId && isTarget && <CheckCircle2 size={32} color="#059669" />}
                </button>
              );
            })}
          </div>

          {/* Hint Button */}
          {activeHintTier === 0 ? (
            <button
              type="button"
              className="clue-toggle-btn"
              onClick={() => {
                setActiveHintTier(1);
                speechService.speak(activeHintText, activeLang);
              }}
            >
              💡 {ui.hintTier1 || ui.clueLabel}
            </button>
          ) : (
            <div className="clue-card" style={{ marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#B45309', display: 'block', marginBottom: '4px' }}>
                  {activeHintTier === 1 ? ui.hintTier1 : activeHintTier === 2 ? ui.hintTier2 : ui.hintTier3}
                </span>
                <p style={{ margin: 0 }}>{activeHintText}</p>
              </div>
              <button
                type="button"
                className="audio-btn"
                onClick={() => speechService.speak(activeHintText, activeLang)}
              >
                🔊
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
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--affirm-green)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <Sparkles size={36} />
          </div>

          <h3 style={{ fontSize: '32px', color: '#065F46', marginBottom: '8px' }}>
            {ui.wellDone || 'Wonderful! You remembered correctly.'}
          </h3>
          <p style={{ fontSize: '22px', color: '#047857', marginBottom: '1.75rem' }}>
            {feedback || storySubtitle}
          </p>

          <button
            type="button"
            className="btn-large btn-sage"
            onClick={handleNextStory}
          >
            <span>{isLast ? (t?.complete || ui.completedTitle || 'Finish Heritage Journey') : `${ui.next || 'Next'} →`}</span>
            <ArrowRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
}
