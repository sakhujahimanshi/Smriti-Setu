import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ListOrdered, Sparkles, RotateCcw, ArrowRight, HelpCircle, CheckCircle2, GripVertical, TrendingUp, TrendingDown } from 'lucide-react';
import { emitTelemetry } from '../socket';

// ─── Adaptive thresholds ─────────────────────────────────────────────────────
const PROMOTE_AFTER = 3; // consecutive correct arrangements to level up
const DEMOTE_AFTER  = 3; // consecutive wrong arrangements to level down
const TOTAL_ROUNDS  = 5;

// ─── Level configuration ─────────────────────────────────────────────────────
// maxSteps: how many steps from the routine are used at this level
const LEVEL_CFG = {
  1: { maxSteps: 3, label: 'Level 1 — Gentle (2–3 tiles)' },
  2: { maxSteps: 4, label: 'Level 2 — Easy (4 tiles)' },
  3: { maxSteps: 6, label: 'Level 3 — Moderate (5–6 tiles)' }
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function normaliseRoutine(r) {
  const raw = Array.isArray(r.steps) ? r.steps : [];
  const steps = raw.map((s, i) => (typeof s === 'string' ? s : (s.title || s.name || `Step ${i+1}`)));
  return { _id: r._id, name: r.routineName || r.title || r.name || 'Daily Routine',
    time: r.approximateTime || r.time || '', steps };
}

// ─── Sequencing board ─────────────────────────────────────────────────────────
function Board({ scrambled, placed, onPickTile, onDropSlot, activeIdx, stepCount }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
      {/* Slots */}
      <div>
        <p style={{ fontSize:'17px',color:'var(--text-muted)',fontWeight:'700',marginBottom:'10px',letterSpacing:'0.04em' }}>
          📋 Place steps in the correct order:
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {Array.from({length:stepCount}).map((_,slotIdx) => {
            const filled = placed[slotIdx];
            return (
              <div key={slotIdx} onClick={() => {
                if (filled !== undefined) onPickTile({fromSlot: slotIdx});
                else if (activeIdx !== null) onDropSlot(slotIdx);
              }} style={{
                display:'flex', alignItems:'center', gap:'14px',
                background: filled !== undefined
                  ? 'linear-gradient(135deg,#F0FDF4,#DCFCE7)'
                  : activeIdx !== null ? 'linear-gradient(135deg,#FFFBEB,#FEF3C7)' : '#F8FAFC',
                border: filled !== undefined ? '2.5px solid #10B981'
                  : activeIdx !== null ? '2.5px dashed #F59E0B' : '2.5px dashed #CBD5E1',
                borderRadius:'16px', padding:'0.9rem 1.25rem', minHeight:'68px',
                cursor:(filled!==undefined||activeIdx!==null)?'pointer':'default',
                transition:'all 0.18s ease',
                boxShadow:filled!==undefined?'0 4px 12px rgba(16,185,129,0.12)':'0 2px 6px rgba(15,23,42,0.04)'
              }}>
                <div style={{ flexShrink:0,width:'40px',height:'40px',borderRadius:'50%',
                  background:filled!==undefined?'#10B981':'#E2E8F0',
                  color:filled!==undefined?'#FFF':'#94A3B8',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:'20px',fontWeight:'900' }}>{slotIdx+1}</div>
                {filled !== undefined
                  ? <span style={{fontSize:'20px',fontWeight:'700',color:'#065F46',flex:1}}>{filled}</span>
                  : <span style={{fontSize:'17px',color:'#94A3B8',flex:1,fontStyle:'italic'}}>
                      {activeIdx!==null?'Tap here to place →':'Empty — select a step below'}
                    </span>}
                {filled !== undefined && <CheckCircle2 size={24} color="#10B981" style={{flexShrink:0}}/>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrambled tiles */}
      <div>
        <p style={{ fontSize:'17px',color:'var(--text-muted)',fontWeight:'700',marginBottom:'10px',letterSpacing:'0.04em' }}>
          🔀 Available steps:
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:'9px' }}>
          {scrambled.map((step, tIdx) => {
            if (step === null) return null;
            const isActive = activeIdx === tIdx;
            return (
              <div key={tIdx} onClick={() => onPickTile({fromTile: tIdx})} style={{
                display:'flex', alignItems:'center', gap:'12px',
                background:isActive?'linear-gradient(135deg,#FEF3C7,#FDE68A)':'linear-gradient(135deg,#FFF,#F8FAFC)',
                border:isActive?'2.5px solid #F59E0B':'2.5px solid #E2E8F0',
                borderRadius:'14px', padding:'0.8rem 1.2rem',
                cursor:'pointer', transition:'all 0.15s ease',
                boxShadow:isActive?'0 6px 18px rgba(245,158,11,0.25)':'0 2px 6px rgba(15,23,42,0.04)',
                transform:isActive?'scale(1.02)':'none'
              }}>
                <GripVertical size={20} color={isActive?'#D97706':'#94A3B8'} style={{flexShrink:0}}/>
                <span style={{fontSize:'19px',fontWeight:'700',
                  color:isActive?'#92400E':'var(--text-main)',flex:1}}>{step}</span>
                {isActive && <span style={{fontSize:'13px',fontWeight:'700',color:'#D97706',
                  background:'#FEF9C3',padding:'3px 10px',borderRadius:'20px'}}>Selected</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DailyRoutineModule({ routines = [], onRefreshRoutines, onSessionComplete, apiUrl }) {
  // ── Adaptive state ─────────────────────────────────────────────────────────
  const [currentLevel, setCurrentLevel] = useState(1);
  const [consecCorrect, setConsecCorrect] = useState(0);
  const [consecFail,    setConsecFail]    = useState(0);

  // ── Session tracking ───────────────────────────────────────────────────────
  const [roundIndex,      setRoundIndex]      = useState(0);
  const [taskBreakdown,   setTaskBreakdown]   = useState([]);
  const [levelTrajectory, setLevelTrajectory] = useState([1]);

  // ── Normalised routines ────────────────────────────────────────────────────
  const [normRoutines,     setNormRoutines]     = useState([]);
  const [selectedRoutine,  setSelectedRoutine]  = useState(0);

  // ── Phase state ────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('select'); // 'select'|'playing'|'round_result'|'finished'
  const [scrambledTiles,  setScrambledTiles]  = useState([]);
  const [placedSteps,     setPlacedSteps]     = useState([]);
  const [activeTileIdx,   setActiveTileIdx]   = useState(null);
  const [roundAttempts,   setRoundAttempts]   = useState(0); // wrong checks this round
  const [hintsThisRound,  setHintsThisRound]  = useState(0);
  const [hintText,        setHintText]        = useState('');
  const [feedbackMsg,     setFeedbackMsg]     = useState('');
  const [feedbackType,    setFeedbackType]    = useState('');
  const [roundResult,     setRoundResult]     = useState(null);
  const [isSubmitting,    setIsSubmitting]    = useState(false);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const levelRef         = useRef(1);
  const consecCorrRef    = useRef(0);
  const consecFailRef    = useRef(0);
  const roundBreakRef    = useRef([]);
  const levelTrajRef     = useRef([1]);
  const roundIdxRef      = useRef(0);
  const roundAttRef      = useRef(0);
  const hintsRef         = useRef(0);
  const taskStartRef     = useRef(Date.now());
  const sessionStartRef  = useRef(Date.now());

  // Sync refs ← state
  useEffect(()=>{ levelRef.current = currentLevel; },[currentLevel]);
  useEffect(()=>{ consecCorrRef.current = consecCorrect; },[consecCorrect]);
  useEffect(()=>{ consecFailRef.current = consecFail; },[consecFail]);
  useEffect(()=>{ roundBreakRef.current = taskBreakdown; },[taskBreakdown]);
  useEffect(()=>{ levelTrajRef.current = levelTrajectory; },[levelTrajectory]);
  useEffect(()=>{ roundIdxRef.current = roundIndex; },[roundIndex]);
  useEffect(()=>{ roundAttRef.current = roundAttempts; },[roundAttempts]);
  useEffect(()=>{ hintsRef.current = hintsThisRound; },[hintsThisRound]);

  useEffect(() => {
    setNormRoutines(routines.map(normaliseRoutine));
  }, [routines]);

  const currentRoutine = normRoutines[selectedRoutine] || null;

  // ── Setup round ───────────────────────────────────────────────────────────
  const setupRound = useCallback((routine, level) => {
    const cfg = LEVEL_CFG[level] || LEVEL_CFG[1];
    const stepCount = Math.min(cfg.maxSteps, routine.steps.length);
    const stepsToUse = routine.steps.slice(0, stepCount);
    setScrambledTiles(shuffle(stepsToUse));
    setPlacedSteps(Array(stepCount).fill(undefined));
    setActiveTileIdx(null);
    setHintText('');
    setFeedbackMsg('');
    setFeedbackType('');
    setRoundAttempts(0); roundAttRef.current = 0;
    setHintsThisRound(0); hintsRef.current = 0;
    taskStartRef.current = Date.now();
  }, []);

  // ── Start game ────────────────────────────────────────────────────────────
  const handleStartGame = () => {
    if (!currentRoutine || currentRoutine.steps.length < 2) return;
    setCurrentLevel(1); levelRef.current = 1;
    setConsecCorrect(0); consecCorrRef.current = 0;
    setConsecFail(0);    consecFailRef.current = 0;
    setRoundIndex(0);    roundIdxRef.current = 0;
    setTaskBreakdown([]); roundBreakRef.current = [];
    setLevelTrajectory([1]); levelTrajRef.current = [1];
    sessionStartRef.current = Date.now();
    setupRound(currentRoutine, 1);
    setPhase('playing');
  };

  // ── Tile interactions ─────────────────────────────────────────────────────
  const handlePickTile = useCallback(({fromTile, fromSlot}) => {
    if (fromTile !== undefined) {
      // Toggle select from scrambled pool
      setActiveTileIdx(prev => prev === fromTile ? null : fromTile);
    } else if (fromSlot !== undefined) {
      // Un-place from slot → put back into scrambled
      const stepText = placedSteps[fromSlot];
      if (stepText === undefined) return;
      const newScrambled = [...scrambledTiles];
      const freeIdx = newScrambled.findIndex(t => t === null);
      if (freeIdx >= 0) newScrambled[freeIdx] = stepText;
      else newScrambled.push(stepText);
      const newPlaced = [...placedSteps];
      newPlaced[fromSlot] = undefined;
      setScrambledTiles(newScrambled);
      setPlacedSteps(newPlaced);
      setActiveTileIdx(null);
      setFeedbackMsg('');
    }
  }, [placedSteps, scrambledTiles]);

  const handleDropSlot = useCallback((slotIdx) => {
    if (activeTileIdx === null || scrambledTiles[activeTileIdx] === null) return;
    const stepText   = scrambledTiles[activeTileIdx];
    const newScram   = [...scrambledTiles];
    const newPlaced  = [...placedSteps];

    // If slot occupied, push existing item back
    if (newPlaced[slotIdx] !== undefined) {
      const existing = newPlaced[slotIdx];
      const freeIdx  = newScram.findIndex(t => t === null);
      if (freeIdx >= 0) newScram[freeIdx] = existing;
      else newScram.push(existing);
    }

    newScram[activeTileIdx] = null;
    newPlaced[slotIdx]      = stepText;
    setScrambledTiles(newScram);
    setPlacedSteps(newPlaced);
    setActiveTileIdx(null);
    setFeedbackMsg('');
  }, [activeTileIdx, scrambledTiles, placedSteps]);

  const allSlotsFilled = placedSteps.length > 0 && placedSteps.every(s => s !== undefined);

  // ── Check arrangement ─────────────────────────────────────────────────────
  const handleCheck = useCallback(() => {
    if (!currentRoutine || !allSlotsFilled) return;
    const cfg       = LEVEL_CFG[levelRef.current] || LEVEL_CFG[1];
    const stepCount = Math.min(cfg.maxSteps, currentRoutine.steps.length);
    const correct   = currentRoutine.steps.slice(0, stepCount);
    let correctCount = 0;
    placedSteps.forEach((p, i) => { if (p === correct[i]) correctCount++; });
    const isFullyCorrect = correctCount === stepCount;
    const accuracy       = Math.round((correctCount / stepCount) * 100);
    const respSec        = parseFloat(((Date.now() - taskStartRef.current) / 1000).toFixed(1));

    if (!isFullyCorrect) {
      const newAtt = roundAttRef.current + 1;
      setRoundAttempts(newAtt); roundAttRef.current = newAtt;
      setFeedbackMsg(accuracy >= 50
        ? `${correctCount} of ${stepCount} steps are correct — adjust the rest!`
        : `Let us rearrange — you had ${correctCount} right.`);
      setFeedbackType('error');
      emitTelemetry({ activityTitle:`Daily Routine Sequencing — Round ${roundIdxRef.current+1}`,
        activityType:'routine_sequencing', status:`Incorrect: ${accuracy}%`,
        attempts: newAtt, isCorrect:false });

      // Auto-hint after 2 wrong attempts
      if (newAtt >= 2) {
        const firstWrong = placedSteps.findIndex((p, i) => p !== correct[i]);
        if (firstWrong >= 0) {
          setHintText(`Hint: Step ${firstWrong + 1} should be "${correct[firstWrong]}"`);
          const newHints = hintsRef.current + 1;
          setHintsThisRound(newHints); hintsRef.current = newHints;
        }
      }

      // After 3 wrong attempts → force finish task as failed
      if (newAtt >= 3) {
        setTimeout(() => processTaskResult(false, newAtt, hintsRef.current, accuracy, respSec), 900);
      }
      return;
    }

    // Fully correct!
    setFeedbackMsg('Perfect sequence! 🎉');
    setFeedbackType('success');
    emitTelemetry({ activityTitle:`Daily Routine Sequencing — Round ${roundIdxRef.current+1}`,
      activityType:'routine_sequencing', status:'Correct: 100%',
      attempts: roundAttRef.current+1, isCorrect:true });
    setTimeout(() => processTaskResult(true, roundAttRef.current+1, hintsRef.current, 100, respSec), 1200);
  }, [currentRoutine, allSlotsFilled, placedSteps]);

  // ── Process task result ───────────────────────────────────────────────────
  const processTaskResult = useCallback((isCorrect, attemptsUsed, hints, accuracy, respSec) => {
    const level = levelRef.current;
    const taskEntry = {
      taskIndex:           roundIdxRef.current + 1,
      difficultyAtTask:    level,
      accuracy:            isCorrect ? (attemptsUsed === 1 ? 100 : attemptsUsed === 2 ? 60 : 30) : 0,
      responseTimeSeconds: respSec,
      mistakes:            attemptsUsed - (isCorrect ? 1 : 0),
      hintsUsed:           hints
    };

    const newBreakdown = [...roundBreakRef.current, taskEntry];
    roundBreakRef.current = newBreakdown;
    setTaskBreakdown(newBreakdown);

    // Adaptive logic
    const prevCC = consecCorrRef.current;
    const prevCF = consecFailRef.current;
    let newCC    = isCorrect ? prevCC + 1 : 0;
    let newCF    = isCorrect ? 0 : prevCF + 1;
    let newLevel = level;
    let levelChanged = null;

    if (newCC >= PROMOTE_AFTER && level < 3) {
      newLevel = level + 1; newCC = 0; levelChanged = 'up';
    } else if (newCF >= DEMOTE_AFTER && level > 1) {
      newLevel = level - 1; newCF = 0; levelChanged = 'down';
    }

    const newTraj = [...levelTrajRef.current, newLevel];
    levelTrajRef.current = newTraj;
    consecCorrRef.current = newCC; setConsecCorrect(newCC);
    consecFailRef.current = newCF; setConsecFail(newCF);
    setLevelTrajectory(newTraj);
    setCurrentLevel(newLevel); levelRef.current = newLevel;

    const nextRound = roundIdxRef.current + 1;
    if (nextRound >= TOTAL_ROUNDS) {
      finishGame(newBreakdown, newTraj, newLevel);
    } else {
      const msg = levelChanged === 'up'
        ? '🎉 Excellent! Moving to a slightly longer sequence!'
        : levelChanged === 'down'
          ? '💙 Easing to a shorter sequence — you are doing wonderfully.'
          : isCorrect ? '✅ Correct! On to the next round.' : '🔁 Good effort! Next routine.';
      setRoundResult({ isCorrect, levelChanged, newLevel, msg });
      setPhase('round_result');
      roundIdxRef.current = nextRound;
      setRoundIndex(nextRound);
    }
  }, []);

  // ── Hint button ────────────────────────────────────────────────────────────
  const handleHint = () => {
    if (!currentRoutine) return;
    const cfg       = LEVEL_CFG[currentLevel] || LEVEL_CFG[1];
    const stepCount = Math.min(cfg.maxSteps, currentRoutine.steps.length);
    const correct   = currentRoutine.steps.slice(0, stepCount);
    let hintMsg = '';
    for (let i = 0; i < placedSteps.length; i++) {
      if (placedSteps[i] !== correct[i]) {
        hintMsg = `Hint: Step ${i + 1} should be "${correct[i]}"`;
        break;
      }
    }
    if (!hintMsg) hintMsg = 'All placed steps look correct — fill remaining slots.';
    setHintText(hintMsg);
    const newH = hintsRef.current + 1;
    setHintsThisRound(newH); hintsRef.current = newH;
  };

  // ── Finish session ─────────────────────────────────────────────────────────
  const finishGame = async (finalBreakdown, finalTraj, finalLevel) => {
    setIsSubmitting(true);
    setPhase('finished');
    const totalSec        = parseFloat(((Date.now() - sessionStartRef.current) / 1000).toFixed(1));
    const totalMistakes   = finalBreakdown.reduce((a,t)=>a+t.mistakes,0);
    const totalHints      = finalBreakdown.reduce((a,t)=>a+t.hintsUsed,0);
    const avgAccuracy     = Math.round(finalBreakdown.reduce((a,t)=>a+t.accuracy,0)/finalBreakdown.length);
    const avgResponseTime = parseFloat((finalBreakdown.reduce((a,t)=>a+t.responseTimeSeconds,0)/finalBreakdown.length).toFixed(1));
    const score           = clamp(Math.round(avgAccuracy - totalMistakes * 4), 0, 100);

    const payload = {
      activityName:        'Daily Routine Sequencing',
      activityCategory:    'Routine Sequencing',
      startLevel:          finalTraj[0],
      endLevel:            finalLevel,
      levelTrajectory:     finalTraj,
      taskBreakdown:       finalBreakdown,
      score,
      accuracy:            avgAccuracy,
      responseTimeSeconds: avgResponseTime,
      mistakes:            totalMistakes,
      hintsUsed:           totalHints
    };

    try {
      await fetch(`${apiUrl}/api/games/submit-session`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          activityName:'Daily Routine Sequencing', activityCategory:'Routine Sequencing',
          score, accuracy:avgAccuracy,
          responseTimeMs: Math.round(totalSec*1000),
          attempts: TOTAL_ROUNDS, hintsUsed:totalHints, mistakes:totalMistakes
        })
      });
    } catch(err){ console.warn('[DailyRoutine] submit notice:', err.message); }

    emitTelemetry({ activityTitle:'Daily Routine Sequencing', activityType:'routine_sequencing',
      status:'Session Complete', attempts:TOTAL_ROUNDS, isCorrect:true, score, accuracy:avgAccuracy });
    setIsSubmitting(false);
    if (onSessionComplete) onSessionComplete(payload);
  };

  const handleRestart = () => {
    setPhase('select');
    setRoundIndex(0); roundIdxRef.current = 0;
    setTaskBreakdown([]); roundBreakRef.current = [];
    setLevelTrajectory([1]); levelTrajRef.current = [1];
    setCurrentLevel(1); levelRef.current = 1;
    setConsecCorrect(0); setConsecFail(0);
    setRoundResult(null);
    setFeedbackMsg(''); setHintText('');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  // Empty state
  if (!normRoutines || normRoutines.length === 0) {
    return (
      <div className="focus-card" style={{textAlign:'center',padding:'4rem 2rem'}}>
        <div style={{width:'80px',height:'80px',borderRadius:'50%',
          background:'linear-gradient(135deg,#D1FAE5,#A7F3D0)',
          display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.5rem'}}>
          <ListOrdered size={40} color="#10B981"/>
        </div>
        <h2 style={{fontSize:'30px',marginBottom:'1rem'}}>No routines available yet</h2>
        <p style={{fontSize:'20px',color:'var(--text-muted)',maxWidth:'480px',margin:'0 auto'}}>
          Please ask your caregiver to add a daily routine from the Caregiver Setup panel.
        </p>
      </div>
    );
  }

  // ── Finished ──────────────────────────────────────────────────────────────
  if (phase === 'finished') {
    const totalMistakes = taskBreakdown.reduce((a,t)=>a+t.mistakes,0);
    const totalHints    = taskBreakdown.reduce((a,t)=>a+t.hintsUsed,0);
    const avgAcc = Math.round(taskBreakdown.reduce((a,t)=>a+t.accuracy,0)/taskBreakdown.length);
    const score  = clamp(Math.round(avgAcc - totalMistakes * 4), 0, 100);
    return (
      <div className="focus-card" style={{maxWidth:'720px',textAlign:'center'}}>
        <div style={{width:'88px',height:'88px',borderRadius:'50%',
          background:'linear-gradient(135deg,#10B981,#059669)',
          display:'flex',alignItems:'center',justifyContent:'center',
          margin:'0 auto 1.5rem',boxShadow:'0 8px 24px rgba(16,185,129,0.3)'}}>
          <Sparkles size={44} color="#FFFFFF"/>
        </div>
        <h2 style={{fontSize:'34px',color:'#065F46',marginBottom:'8px'}}>
          Routine Mastered! ৰুটিন সম্পূৰ্ণ! 🎉
        </h2>
        <p style={{fontSize:'20px',color:'#047857',marginBottom:'2.5rem'}}>
          You sequenced {TOTAL_ROUNDS} routines with care and focus.
        </p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'14px',marginBottom:'2rem'}}>
          {[
            {label:'Score',          value:score,           color:'#059669',bg:'#F0FDF4',border:'#A7F3D0'},
            {label:'Avg Accuracy',   value:`${avgAcc}%`,    color:'#0284C7',bg:'#F0F9FF',border:'#BAE6FD'},
            {label:'Total Mistakes', value:totalMistakes,   color:'#D97706',bg:'#FFFBEB',border:'#FDE68A'},
            {label:'Hints Used',     value:totalHints,      color:'#7C3AED',bg:'#F5F3FF',border:'#DDD6FE'},
          ].map(s=>(
            <div key={s.label} style={{background:s.bg,border:`2px solid ${s.border}`,borderRadius:'18px',padding:'1.25rem'}}>
              <div style={{fontSize:'34px',fontWeight:'900',color:s.color}}>{s.value}</div>
              <div style={{fontSize:'15px',color:'var(--text-muted)',fontWeight:'600',marginTop:'4px'}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{marginBottom:'1.5rem'}}>
          <p style={{fontSize:'16px',color:'var(--text-muted)',fontWeight:'600',marginBottom:'10px'}}>Round Performance:</p>
          <div style={{display:'flex',gap:'8px',justifyContent:'center',flexWrap:'wrap'}}>
            {taskBreakdown.map((t,i)=>(
              <div key={i} style={{
                background:t.accuracy>=80?'#D1FAE5':t.accuracy>=50?'#FEF3C7':'#FEE2E2',
                border:`2px solid ${t.accuracy>=80?'#10B981':t.accuracy>=50?'#F59E0B':'#EF4444'}`,
                borderRadius:'12px',padding:'7px 12px',fontSize:'14px',fontWeight:'700',
                color:t.accuracy>=80?'#065F46':t.accuracy>=50?'#92400E':'#991B1B'
              }}>R{t.taskIndex}: {t.accuracy}%</div>
            ))}
          </div>
        </div>
        <button className="btn-large btn-outline" onClick={handleRestart} style={{margin:'0 auto'}}>
          <RotateCcw size={22}/><span>Play Again (পুনৰ খেলক)</span>
        </button>
      </div>
    );
  }

  // ── Round result interstitial ──────────────────────────────────────────────
  if (phase === 'round_result' && roundResult) {
    const { isCorrect, levelChanged, newLevel, msg } = roundResult;
    return (
      <div className="focus-card" style={{maxWidth:'580px',textAlign:'center'}}>
        <div style={{width:'70px',height:'70px',borderRadius:'50%',
          background:isCorrect?'linear-gradient(135deg,#10B981,#059669)':'linear-gradient(135deg,#F59E0B,#D97706)',
          display:'flex',alignItems:'center',justifyContent:'center',
          margin:'0 auto 1.25rem'}}>
          {isCorrect?<Sparkles size={34} color="#FFF"/>:<RotateCcw size={34} color="#FFF"/>}
        </div>
        <h3 style={{fontSize:'26px',color:isCorrect?'#065F46':'#92400E',marginBottom:'8px'}}>
          {isCorrect?'Correct Sequence!':'Round Complete!'}
        </h3>
        <p style={{fontSize:'18px',color:'var(--text-muted)',marginBottom:'1.25rem'}}>{msg}</p>
        {levelChanged && (
          <div style={{background:levelChanged==='up'?'#F0FDF4':'#FFFBEB',
            border:`2px solid ${levelChanged==='up'?'#A7F3D0':'#FDE68A'}`,
            borderRadius:'14px',padding:'10px 16px',marginBottom:'1.25rem',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',
            fontSize:'17px',fontWeight:'700',
            color:levelChanged==='up'?'#065F46':'#92400E'}}>
            {levelChanged==='up'?<TrendingUp size={19}/>:<TrendingDown size={19}/>}
            {levelChanged==='up'
              ? `Moving to ${LEVEL_CFG[newLevel]?.label}`
              : `Easing to ${LEVEL_CFG[newLevel]?.label}`}
          </div>
        )}
        <div style={{fontSize:'15px',color:'var(--text-muted)',marginBottom:'1.5rem'}}>
          Round {roundIndex} of {TOTAL_ROUNDS} complete
        </div>
        <button className="btn-large btn-sage"
          onClick={() => { setupRound(currentRoutine, currentLevel); setPhase('playing'); }}>
          <span>Next Round (পৰৱৰ্তী)</span><ArrowRight size={22}/>
        </button>
      </div>
    );
  }

  // ── Select routine ─────────────────────────────────────────────────────────
  if (phase === 'select') {
    return (
      <div className="focus-card" style={{maxWidth:'820px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'16px',
          marginBottom:'2rem',borderBottom:'2px solid var(--border-subtle)',paddingBottom:'1.25rem'}}>
          <div style={{width:'60px',height:'60px',borderRadius:'16px',
            background:'linear-gradient(135deg,#F0FDF4,#D1FAE5)',
            display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <ListOrdered size={34} color="#10B981"/>
          </div>
          <div>
            <h2 style={{fontSize:'28px',margin:0}}>নিয়মীয়া ক্ৰম — Daily Routine Sequencing</h2>
            <p style={{fontSize:'17px',color:'var(--text-muted)',margin:'4px 0 0'}}>
              Arrange the daily steps in the correct order. Starts with 3 steps.
            </p>
          </div>
        </div>

        <div style={{marginBottom:'1.75rem'}}>
          <p style={{fontSize:'19px',fontWeight:'700',marginBottom:'12px'}}>Choose a routine:</p>
          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            {normRoutines.map((r,idx)=>(
              <button key={r._id||idx} onClick={()=>setSelectedRoutine(idx)} style={{
                background:selectedRoutine===idx?'linear-gradient(135deg,#F0FDF4,#DCFCE7)':'#FFFFFF',
                border:`2.5px solid ${selectedRoutine===idx?'#10B981':'#E2E8F0'}`,
                borderRadius:'16px',padding:'1rem 1.25rem',textAlign:'left',
                cursor:'pointer',display:'flex',alignItems:'center',gap:'12px',
                transition:'all 0.15s ease',
                boxShadow:selectedRoutine===idx?'0 4px 14px rgba(16,185,129,0.15)':'0 2px 6px rgba(15,23,42,0.04)'
              }}>
                <div style={{width:'44px',height:'44px',borderRadius:'50%',flexShrink:0,
                  background:selectedRoutine===idx?'#10B981':'#E2E8F0',
                  color:selectedRoutine===idx?'#FFF':'#64748B',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:'20px',fontWeight:'900'}}>{idx+1}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'20px',fontWeight:'800',
                    color:selectedRoutine===idx?'#065F46':'var(--text-main)'}}>{r.name}</div>
                  {r.time&&<div style={{fontSize:'15px',color:'var(--text-muted)',marginTop:'2px'}}>
                    ⏰ {r.time} · {r.steps.length} steps
                  </div>}
                </div>
                {selectedRoutine===idx&&<CheckCircle2 size={26} color="#10B981"/>}
              </button>
            ))}
          </div>
        </div>

        {currentRoutine && (
          <div style={{background:'linear-gradient(135deg,#F8FAFC,#F1F5F9)',
            border:'2px solid #E2E8F0',borderRadius:'16px',padding:'1.1rem 1.4rem',marginBottom:'1.75rem'}}>
            <p style={{fontSize:'16px',fontWeight:'700',color:'var(--text-muted)',marginBottom:'10px'}}>
              📋 Steps you will sequence (shown in correct order — memorise!):
            </p>
            <div style={{display:'flex',flexDirection:'column',gap:'7px'}}>
              {currentRoutine.steps.map((step,idx)=>(
                <div key={idx} style={{display:'flex',alignItems:'center',gap:'10px'}}>
                  <span style={{width:'26px',height:'26px',borderRadius:'50%',
                    background:'#E2E8F0',color:'#64748B',
                    display:'inline-flex',alignItems:'center',justifyContent:'center',
                    fontSize:'13px',fontWeight:'800',flexShrink:0}}>{idx+1}</span>
                  <span style={{fontSize:'17px',color:'var(--text-main)'}}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{textAlign:'center'}}>
          <button className="btn-large btn-sage" onClick={handleStartGame}
            disabled={!currentRoutine||currentRoutine.steps.length<2}>
            <span>Start Game (খেল আৰম্ভ কৰক)</span><ArrowRight size={24}/>
          </button>
        </div>
      </div>
    );
  }

  // ── Playing phase ─────────────────────────────────────────────────────────
  const cfg = LEVEL_CFG[currentLevel] || LEVEL_CFG[1];
  const stepCount = currentRoutine ? Math.min(cfg.maxSteps, currentRoutine.steps.length) : 0;

  return (
    <div className="focus-card" style={{maxWidth:'820px'}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
        marginBottom:'1.5rem',borderBottom:'2px solid var(--border-subtle)',
        paddingBottom:'1rem',flexWrap:'wrap',gap:'12px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
          <ListOrdered size={32} color="#10B981"/>
          <div>
            <h2 style={{fontSize:'24px',margin:0}}>নিয়মীয়া ক্ৰম — {currentRoutine?.name}</h2>
            <p style={{fontSize:'15px',color:'var(--text-muted)',margin:'2px 0 0'}}>
              Round {roundIndex + 1} of {TOTAL_ROUNDS} · {cfg.label}
            </p>
          </div>
        </div>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
          <span style={{background:'#FEF3C7',color:'#92400E',fontSize:'14px',fontWeight:'700',
            padding:'5px 12px',borderRadius:'20px',border:'1px solid #FDE68A'}}>⭐ {cfg.label}</span>
          <span style={{background:'#F0F9FF',color:'#0284C7',fontSize:'14px',fontWeight:'700',
            padding:'5px 12px',borderRadius:'20px',border:'1px solid #BAE6FD'}}>
            Round {roundIndex+1}/{TOTAL_ROUNDS}
          </span>
        </div>
      </div>

      {/* Progress + streak indicators */}
      <div style={{display:'flex',gap:'12px',marginBottom:'1.25rem',flexWrap:'wrap',alignItems:'center'}}>
        <div style={{flex:1,minWidth:'160px'}}>
          <div style={{background:'#E2E8F0',borderRadius:'999px',height:'7px',overflow:'hidden'}}>
            <div style={{height:'100%',borderRadius:'999px',
              background:'linear-gradient(90deg,#10B981,#059669)',
              width:`${(roundIndex/TOTAL_ROUNDS)*100}%`,transition:'width 0.4s ease'}}/>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'5px'}}>
          {Array.from({length:PROMOTE_AFTER}).map((_,i)=>(
            <div key={i} style={{width:'22px',height:'7px',borderRadius:'4px',
              background:i<consecCorrect?'#10B981':'#E2E8F0',transition:'background 0.3s'}}/>
          ))}
          <span style={{fontSize:'12px',fontWeight:'600',color:'var(--text-muted)'}}>
            {consecCorrect}/{PROMOTE_AFTER}
          </span>
        </div>
      </div>

      {/* Instruction */}
      <div style={{background:'linear-gradient(135deg,#FFFBEB,#FEF9C3)',
        border:'2px solid #FDE68A',borderRadius:'14px',padding:'0.9rem 1.25rem',
        marginBottom:'1.5rem',fontSize:'17px',color:'#78350F',fontWeight:'600'}}>
        📌 Tap a step below, then tap the numbered slot where it belongs. Arrange all {stepCount} steps.
      </div>

      {/* Board */}
      <Board
        scrambled={scrambledTiles}
        placed={placedSteps}
        onPickTile={handlePickTile}
        onDropSlot={handleDropSlot}
        activeIdx={activeTileIdx}
        stepCount={stepCount}
      />

      {/* Hint */}
      {hintText && (
        <div style={{background:'#EFF6FF',border:'2px solid #BFDBFE',borderRadius:'13px',
          padding:'10px 16px',fontSize:'17px',color:'#1E40AF',fontWeight:'600',marginTop:'1.25rem',
          display:'flex',alignItems:'center',gap:'8px'}}>
          <HelpCircle size={17}/>
          {hintText}
        </div>
      )}

      {/* Feedback */}
      {feedbackMsg && (
        <div style={{
          background:feedbackType==='success'?'#F0FDF4':'#FEF2F2',
          border:`2px solid ${feedbackType==='success'?'#A7F3D0':'#FECACA'}`,
          borderRadius:'13px',padding:'10px 16px',fontSize:'17px',
          color:feedbackType==='success'?'#065F46':'#991B1B',
          fontWeight:'700',marginTop:'1.25rem'}}>
          {feedbackType==='success'?'✅':'🔁'} {feedbackMsg}
          {roundAttempts >= 2 && feedbackType !== 'success' && (
            <span style={{display:'block',fontSize:'14px',fontWeight:'600',marginTop:'4px',color:'#92400E'}}>
              Attempt {roundAttempts} of 3 — a hint has been revealed above.
            </span>
          )}
        </div>
      )}

      {/* Action bar */}
      <div style={{display:'flex',gap:'10px',marginTop:'1.75rem',flexWrap:'wrap',
        justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
          <button onClick={handleHint} disabled={isSubmitting} style={{
            background:'#F0F9FF',border:'2px solid #BAE6FD',borderRadius:'13px',
            padding:'9px 16px',fontSize:'15px',fontWeight:'700',color:'#0284C7',
            cursor:'pointer',display:'flex',alignItems:'center',gap:'7px'}}>
            <HelpCircle size={16}/>Hint (সহায়)
          </button>
          <button onClick={()=>setupRound(currentRoutine,currentLevel)} disabled={isSubmitting} style={{
            background:'#F8FAFC',border:'2px solid #E2E8F0',borderRadius:'13px',
            padding:'9px 16px',fontSize:'15px',fontWeight:'700',color:'#475569',
            cursor:'pointer',display:'flex',alignItems:'center',gap:'7px'}}>
            <RotateCcw size={16}/>Shuffle
          </button>
        </div>
        <button className="btn-large btn-sage" onClick={handleCheck}
          disabled={!allSlotsFilled||isSubmitting}
          style={{opacity:allSlotsFilled?1:0.5}}>
          <span>{allSlotsFilled?'Check My Order (পৰীক্ষা কৰক)':`Fill all ${stepCount} slots first`}</span>
          <ArrowRight size={22}/>
        </button>
      </div>
    </div>
  );
}
