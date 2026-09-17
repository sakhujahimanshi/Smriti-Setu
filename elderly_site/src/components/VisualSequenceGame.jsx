import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Eye, Sparkles, RotateCcw, ArrowRight, Clock, TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';
import { emitTelemetry } from '../socket';

// ─── Adaptive thresholds ────────────────────────────────────────────────────
const PROMOTE_AFTER = 3; // consecutive correct to level up
const DEMOTE_AFTER  = 3; // consecutive wrong to level down
const TOTAL_ROUNDS  = 5;

// ─── Level configuration ─────────────────────────────────────────────────────
const LEVEL_CFG = {
  1: { seqLen: 2, showMs: 3500, label: 'Level 1 — Gentle (2 items)' },
  2: { seqLen: 3, showMs: 4000, label: 'Level 2 — Easy (3 items)' },
  3: { seqLen: 4, showMs: 4500, label: 'Level 3 — Moderate (4 items)' }
};

const ITEMS = [
  { id: 'tea',      emoji: '🍵', label: 'Tea' },
  { id: 'flower',   emoji: '🌸', label: 'Flower' },
  { id: 'sun',      emoji: '☀️', label: 'Sun' },
  { id: 'bird',     emoji: '🐦', label: 'Bird' },
  { id: 'fish',     emoji: '🐟', label: 'Fish' },
  { id: 'leaf',     emoji: '🍃', label: 'Leaf' },
  { id: 'mountain', emoji: '⛰️', label: 'Mountain' },
  { id: 'river',    emoji: '🌊', label: 'River' },
  { id: 'moon',     emoji: '🌙', label: 'Moon' },
  { id: 'star',     emoji: '⭐', label: 'Star' },
  { id: 'fruit',    emoji: '🍎', label: 'Fruit' },
  { id: 'lamp',     emoji: '🪔', label: 'Lamp' },
  { id: 'drum',     emoji: '🥁', label: 'Drum' },
  { id: 'umbrella', emoji: '☂️', label: 'Umbrella' }
];

function seqKey(seq) { return seq.map(i => i.id).join(','); }

function pickRandom(arr, n) {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

function buildOptions(correct) {
  const usedIds = new Set(correct.map(i => i.id));
  const unused  = ITEMS.filter(i => !usedIds.has(i.id));

  // Distractor 1: same items, different order (ensure truly different)
  let dist1; let tries = 0;
  do { dist1 = [...correct].sort(() => Math.random() - 0.5); tries++; }
  while (seqKey(dist1) === seqKey(correct) && tries < 30);

  // Distractor 2: one item replaced with an unused item
  const dist2 = [...correct];
  if (unused.length > 0) {
    const swapIdx = Math.floor(Math.random() * dist2.length);
    dist2[swapIdx] = unused[Math.floor(Math.random() * unused.length)];
  }

  // Distractor 3: entirely different items
  const pool = unused.length >= correct.length ? unused : ITEMS;
  const dist3 = pickRandom(pool, correct.length);

  const allOpts = [correct, dist1, dist2, dist3].sort(() => Math.random() - 0.5);
  const correctIdx = allOpts.findIndex(o => seqKey(o) === seqKey(correct));
  return { options: allOpts, correctIndex: correctIdx };
}

// ─── Sequence display strip ──────────────────────────────────────────────────
function SeqStrip({ seq, hidden, hintCount }) {
  return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',flexWrap:'wrap' }}>
      {seq.map((item, idx) => {
        // Hint reveals first N items progressively
        const isRevealed = hidden && idx < hintCount;
        return (
          <React.Fragment key={idx}>
            <div style={{
              width:'86px', height:'86px', borderRadius:'20px', flexShrink:0,
              background: hidden && !isRevealed
                ? 'linear-gradient(135deg,#1E3A5F,#2D5F8F)'
                : 'linear-gradient(135deg,#FEF9C3,#FEF3C7)',
              border: hidden && !isRevealed ? '2px solid rgba(255,255,255,0.12)' : '2.5px solid #FCD34D',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'4px',
              boxShadow: hidden && !isRevealed
                ? '0 4px 16px rgba(30,58,95,0.35)'
                : '0 4px 16px rgba(245,158,11,0.2)',
              transition:'all 0.4s ease',
              position:'relative'
            }}>
              {hidden && !isRevealed ? (
                <span style={{fontSize:'28px',opacity:0.5}}>❓</span>
              ) : (
                <>
                  <span style={{fontSize:'34px',lineHeight:1}}>{item.emoji}</span>
                  <span style={{fontSize:'11px',fontWeight:'700',color:'#92400E'}}>{item.label}</span>
                </>
              )}
              {isRevealed && (
                <div style={{
                  position:'absolute',top:'-8px',right:'-8px',
                  background:'#7C3AED',borderRadius:'50%',
                  width:'20px',height:'20px',
                  display:'flex',alignItems:'center',justifyContent:'center'
                }}>
                  <span style={{fontSize:'11px',color:'#FFF',fontWeight:'900'}}>💡</span>
                </div>
              )}
            </div>
            {idx < seq.length - 1 && (
              <ArrowRight size={20} color={hidden && !isRevealed ? '#475569' : '#D97706'} style={{flexShrink:0}}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Option button ────────────────────────────────────────────────────────────
function OptionBtn({ seq, onClick, state }) {
  const bgs    = { '':'#FFFFFF', correct:'#D1FAE5', wrong:'#FEE2E2' };
  const borders= { '':'#E2E8F0', correct:'#10B981', wrong:'#EF4444' };
  return (
    <button onClick={onClick} disabled={state!==''}
      style={{
        background:bgs[state]||'#FFFFFF', border:`2.5px solid ${borders[state]||'#E2E8F0'}`,
        borderRadius:'18px', padding:'12px 16px',
        display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
        cursor:state?'default':'pointer', transition:'all 0.2s ease', width:'100%',
        boxShadow: state==='correct'?'0 4px 16px rgba(16,185,129,0.25)'
                 : state==='wrong'  ?'0 4px 16px rgba(239,68,68,0.2)'
                 : '0 2px 8px rgba(15,23,42,0.05)',
        flexWrap:'wrap'
      }}
    >
      {seq.map((item,idx)=>(
        <React.Fragment key={idx}>
          <div style={{
            display:'flex',flexDirection:'column',alignItems:'center',
            background:state==='correct'?'#A7F3D0':state==='wrong'?'#FECACA':'#F8FAFC',
            borderRadius:'12px',padding:'8px 12px',minWidth:'54px'
          }}>
            <span style={{fontSize:'26px',lineHeight:1}}>{item.emoji}</span>
            <span style={{fontSize:'11px',fontWeight:'700',color:'var(--text-muted)',marginTop:'2px'}}>{item.label}</span>
          </div>
          {idx<seq.length-1 && <ArrowRight size={16} color="#94A3B8" style={{flexShrink:0}}/>}
        </React.Fragment>
      ))}
      {state==='correct' && <span style={{fontSize:'22px',marginLeft:'auto'}}>✅</span>}
      {state==='wrong'   && <span style={{fontSize:'22px',marginLeft:'auto'}}>❌</span>}
    </button>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function VisualSequenceGame({ onSessionComplete, apiUrl }) {
  // ── Adaptive state ─────────────────────────────────────────────────────────
  const [currentLevel, setCurrentLevel] = useState(1);
  const [consecCorrect, setConsecCorrect] = useState(0);
  const [consecFail,    setConsecFail]    = useState(0);

  // ── Session tracking ───────────────────────────────────────────────────────
  const [roundIndex,      setRoundIndex]      = useState(0);
  const [taskBreakdown,   setTaskBreakdown]   = useState([]);
  const [levelTrajectory, setLevelTrajectory] = useState([1]);

  // ── Round state ────────────────────────────────────────────────────────────
  const [phase,         setPhase]         = useState('memorise');
  // 'memorise' | 'recall' | 'round_feedback' | 'round_result' | 'finished'
  const [sequence,      setSequence]      = useState([]);
  const [options,       setOptions]       = useState([]);
  const [correctIndex,  setCorrectIndex]  = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [countdownMs,   setCountdownMs]   = useState(3500);
  const [roundAttempts, setRoundAttempts] = useState(0); // wrong guesses this round
  const [hintCount,     setHintCount]     = useState(0); // items revealed via hint
  const [roundResult,   setRoundResult]   = useState(null);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const levelRef        = useRef(1);
  const consecCorrRef   = useRef(0);
  const consecFailRef   = useRef(0);
  const roundBreakRef   = useRef([]);
  const levelTrajRef    = useRef([1]);
  const roundIdxRef     = useRef(0);
  const roundAttemptsRef= useRef(0);
  const hintCountRef    = useRef(0);
  const recallStartRef  = useRef(Date.now());
  const sessionStartRef = useRef(Date.now());
  const timerRef        = useRef(null);

  // Sync refs ← state
  useEffect(()=>{ levelRef.current = currentLevel; },[currentLevel]);
  useEffect(()=>{ consecCorrRef.current = consecCorrect; },[consecCorrect]);
  useEffect(()=>{ consecFailRef.current = consecFail; },[consecFail]);
  useEffect(()=>{ roundBreakRef.current = taskBreakdown; },[taskBreakdown]);
  useEffect(()=>{ levelTrajRef.current = levelTrajectory; },[levelTrajectory]);
  useEffect(()=>{ roundIdxRef.current = roundIndex; },[roundIndex]);
  useEffect(()=>{ roundAttemptsRef.current = roundAttempts; },[roundAttempts]);
  useEffect(()=>{ hintCountRef.current = hintCount; },[hintCount]);

  // ── Setup a round ─────────────────────────────────────────────────────────
  const setupRound = useCallback((level) => {
    const cfg = LEVEL_CFG[level] || LEVEL_CFG[1];
    const seq = pickRandom(ITEMS, cfg.seqLen);
    const { options: opts, correctIndex: ci } = buildOptions(seq);
    setSequence(seq);
    setOptions(opts);
    setCorrectIndex(ci);
    setSelectedIndex(null);
    setCountdownMs(cfg.showMs);
    setRoundAttempts(0); roundAttemptsRef.current = 0;
    setHintCount(0);     hintCountRef.current = 0;
    setPhase('memorise');
  }, []);

  useEffect(() => { setupRound(1); }, [setupRound]);

  // ── Memorise countdown ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'memorise') return;
    const cfg = LEVEL_CFG[levelRef.current] || LEVEL_CFG[1];
    const showMs = cfg.showMs;
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const rem = showMs - (Date.now() - start);
      if (rem <= 0) {
        clearInterval(timerRef.current);
        setCountdownMs(0);
        setPhase('recall');
        recallStartRef.current = Date.now();
      } else {
        setCountdownMs(rem);
      }
    }, 80);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // ── Process a round result ─────────────────────────────────────────────────
  const processRoundResult = useCallback((isCorrect, attemptsUsed, hintsUsed) => {
    const respSec  = parseFloat(((Date.now() - recallStartRef.current) / 1000).toFixed(1));
    const accuracy = isCorrect ? (attemptsUsed === 1 ? 100 : attemptsUsed === 2 ? 60 : 30) : 0;
    const level    = levelRef.current;

    const taskEntry = {
      taskIndex:           roundIdxRef.current + 1,
      difficultyAtTask:    level,
      accuracy,
      responseTimeSeconds: respSec,
      mistakes:            attemptsUsed - (isCorrect ? 1 : 0),
      hintsUsed
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
    setCurrentLevel(newLevel);
    levelRef.current = newLevel;

    emitTelemetry({
      activityTitle: `Visual Sequence — Round ${roundIdxRef.current + 1}`,
      activityType: 'visual_sequence',
      status: isCorrect ? 'Correct' : 'Incorrect',
      attempts: attemptsUsed, isCorrect
    });

    const nextRound = roundIdxRef.current + 1;
    if (nextRound >= TOTAL_ROUNDS) {
      finishGame(newBreakdown, newTraj, newLevel);
    } else {
      const msg = levelChanged === 'up'
        ? `🎉 Excellent memory! Moving to a longer sequence!`
        : levelChanged === 'down'
          ? `💙 Taking it a bit easier — you are doing wonderfully.`
          : isCorrect
            ? `✅ Correct! Well done.`
            : `🔁 Good try! Let us practise with another sequence.`;
      setRoundResult({ isCorrect, levelChanged, newLevel, msg });
      setPhase('round_result');
      roundIdxRef.current = nextRound;
      setRoundIndex(nextRound);
    }
  }, []); // stable — uses only refs

  // ── Answer selection ───────────────────────────────────────────────────────
  const handleSelect = useCallback((idx) => {
    if (phase !== 'recall') return;
    const isCorrect = idx === correctIndex;
    const attempts  = roundAttemptsRef.current + 1;
    const hints     = hintCountRef.current;
    setSelectedIndex(idx);
    setPhase('round_feedback');

    if (isCorrect) {
      setTimeout(() => processRoundResult(true, attempts, hints), 1400);
    } else {
      setRoundAttempts(attempts);
      roundAttemptsRef.current = attempts;

      // After 3 wrong → auto-advance as failure
      if (attempts >= 3) {
        setTimeout(() => processRoundResult(false, attempts, hints), 1600);
      } else {
        // Give a subtle hint and allow retry
        setTimeout(() => {
          setSelectedIndex(null);
          // Reveal one more item in the hint
          const newHint = Math.min(hintCountRef.current + 1, sequence.length - 1);
          setHintCount(newHint);
          hintCountRef.current = newHint;
          setPhase('recall');
        }, 1500);
      }
    }
  }, [phase, correctIndex, sequence.length, processRoundResult]);

  // ── Finish game ────────────────────────────────────────────────────────────
  const finishGame = async (finalBreakdown, finalTraj, finalLevel) => {
    setPhase('finished');
    const totalSec        = parseFloat(((Date.now() - sessionStartRef.current) / 1000).toFixed(1));
    const totalMistakes   = finalBreakdown.reduce((a,t)=>a+t.mistakes,0);
    const totalHints      = finalBreakdown.reduce((a,t)=>a+t.hintsUsed,0);
    const avgAccuracy     = Math.round(finalBreakdown.reduce((a,t)=>a+t.accuracy,0)/finalBreakdown.length);
    const avgResponseTime = parseFloat((finalBreakdown.reduce((a,t)=>a+t.responseTimeSeconds,0)/finalBreakdown.length).toFixed(1));
    const score           = avgAccuracy;

    const payload = {
      activityName:        'Visual Sequence Recall',
      activityCategory:    'Visual Sequence',
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityName: 'Visual Sequence Recall', activityCategory: 'Visual Sequence',
          score, accuracy: avgAccuracy,
          responseTimeMs: Math.round(totalSec * 1000),
          attempts: TOTAL_ROUNDS, hintsUsed: totalHints, mistakes: totalMistakes
        })
      });
    } catch(err){ console.warn('[VisualSequence] submit notice:', err.message); }

    emitTelemetry({ activityTitle:'Visual Sequence Recall', activityType:'visual_sequence',
      status:'Session Complete', attempts:TOTAL_ROUNDS, isCorrect:true, score, accuracy:avgAccuracy });
    if(onSessionComplete) onSessionComplete(payload);
  };

  const handleRestart = () => {
    clearInterval(timerRef.current);
    setCurrentLevel(1);    levelRef.current = 1;
    setConsecCorrect(0);   consecCorrRef.current = 0;
    setConsecFail(0);      consecFailRef.current = 0;
    setRoundIndex(0);      roundIdxRef.current = 0;
    setTaskBreakdown([]);  roundBreakRef.current = [];
    setLevelTrajectory([1]); levelTrajRef.current = [1];
    setRoundResult(null);
    sessionStartRef.current = Date.now();
    setupRound(1);
  };

  const cfg = LEVEL_CFG[currentLevel] || LEVEL_CFG[1];
  const countdownSec = (countdownMs/1000).toFixed(1);

  // ── Finished screen ────────────────────────────────────────────────────────
  if (phase === 'finished') {
    const correctCount = taskBreakdown.filter(t=>t.accuracy>0).length;
    const avgAcc = Math.round(taskBreakdown.reduce((a,t)=>a+t.accuracy,0)/taskBreakdown.length);
    const avgSec = (taskBreakdown.reduce((a,t)=>a+t.responseTimeSeconds,0)/taskBreakdown.length).toFixed(1);
    return (
      <div className="focus-card" style={{ maxWidth:'720px', textAlign:'center' }}>
        <div style={{ width:'88px',height:'88px',borderRadius:'50%',
          background:'linear-gradient(135deg,#7C3AED,#6D28D9)',
          display:'flex',alignItems:'center',justifyContent:'center',
          margin:'0 auto 1.5rem', boxShadow:'0 8px 24px rgba(124,58,237,0.35)' }}>
          <Sparkles size={44} color="#FFFFFF"/>
        </div>
        <h2 style={{fontSize:'34px',color:'#4C1D95',marginBottom:'8px'}}>Sequence Complete! 🧠</h2>
        <p style={{fontSize:'20px',color:'var(--text-muted)',marginBottom:'2.5rem'}}>
          {avgAcc>=80 ? 'Superb pattern memory today!' : 'A wonderful exercise — keep practising!'}
        </p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'14px',marginBottom:'2.5rem'}}>
          {[
            {label:'Correct',       value:`${correctCount}/${TOTAL_ROUNDS}`, color:'#059669',bg:'#F0FDF4',border:'#A7F3D0'},
            {label:'Avg Accuracy',  value:`${avgAcc}%`,                      color:'#7C3AED',bg:'#F5F3FF',border:'#DDD6FE'},
            {label:'Avg Response',  value:`${avgSec}s`,                      color:'#0284C7',bg:'#F0F9FF',border:'#BAE6FD'},
          ].map(s=>(
            <div key={s.label} style={{background:s.bg,border:`2px solid ${s.border}`,borderRadius:'18px',padding:'1.25rem'}}>
              <div style={{fontSize:'32px',fontWeight:'900',color:s.color}}>{s.value}</div>
              <div style={{fontSize:'15px',color:'var(--text-muted)',fontWeight:'600',marginTop:'4px'}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{marginBottom:'1.5rem'}}>
          <p style={{fontSize:'17px',color:'var(--text-muted)',fontWeight:'600',marginBottom:'10px'}}>Round Performance:</p>
          <div style={{display:'flex',gap:'8px',justifyContent:'center',flexWrap:'wrap'}}>
            {taskBreakdown.map((t,i)=>(
              <div key={i} style={{
                background:t.accuracy===100?'#D1FAE5':t.accuracy>0?'#FEF3C7':'#FEE2E2',
                border:`2px solid ${t.accuracy===100?'#10B981':t.accuracy>0?'#F59E0B':'#EF4444'}`,
                borderRadius:'12px',padding:'8px 14px',fontSize:'15px',fontWeight:'700',
                color:t.accuracy===100?'#065F46':t.accuracy>0?'#92400E':'#991B1B'
              }}>
                R{t.taskIndex}: {t.accuracy}%
              </div>
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
      <div className="focus-card" style={{ maxWidth:'600px', textAlign:'center' }}>
        <div style={{ width:'72px',height:'72px',borderRadius:'50%',
          background: isCorrect?'linear-gradient(135deg,#10B981,#059669)':'linear-gradient(135deg,#7C3AED,#6D28D9)',
          display:'flex',alignItems:'center',justifyContent:'center',
          margin:'0 auto 1.25rem', boxShadow:`0 6px 20px rgba(${isCorrect?'16,185,129':'124,58,237'},0.3)` }}>
          {isCorrect ? <Sparkles size={36} color="#FFF"/> : <RotateCcw size={36} color="#FFF"/>}
        </div>
        <h3 style={{fontSize:'28px',color:isCorrect?'#065F46':'#4C1D95',marginBottom:'8px'}}>
          {isCorrect ? 'Remembered!' : 'Good Try!'}
        </h3>
        <p style={{fontSize:'19px',color:'var(--text-muted)',marginBottom:'1.5rem'}}>{msg}</p>
        {levelChanged && (
          <div style={{
            background:levelChanged==='up'?'#F5F3FF':'#FFFBEB',
            border:`2px solid ${levelChanged==='up'?'#DDD6FE':'#FDE68A'}`,
            borderRadius:'14px',padding:'10px 18px',marginBottom:'1.5rem',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',
            fontSize:'18px',fontWeight:'700',color:levelChanged==='up'?'#4C1D95':'#92400E'
          }}>
            {levelChanged==='up' ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
            {levelChanged==='up'
              ? `Moving to ${LEVEL_CFG[newLevel]?.label}`
              : `Easing to ${LEVEL_CFG[newLevel]?.label}`}
          </div>
        )}
        <div style={{fontSize:'16px',color:'var(--text-muted)',marginBottom:'1.75rem'}}>
          Round {roundIndex} of {TOTAL_ROUNDS} complete
        </div>
        <button className="btn-large btn-sage" onClick={() => setupRound(currentLevel)}>
          <span>Next Round (পৰৱৰ্তী)</span><Eye size={22}/>
        </button>
      </div>
    );
  }

  // ── Playing screen ─────────────────────────────────────────────────────────
  return (
    <div className="focus-card" style={{ maxWidth:'840px' }}>
      {/* Header */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',
        marginBottom:'1.5rem',borderBottom:'2px solid var(--border-subtle)',
        paddingBottom:'1rem',flexWrap:'wrap',gap:'12px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:'14px' }}>
          <Eye size={34} color="#7C3AED"/>
          <div>
            <h2 style={{fontSize:'28px',margin:0}}>ক্ৰম স্মৃতি — Visual Sequence Recall</h2>
            <p style={{fontSize:'15px',color:'var(--text-muted)',margin:'2px 0 0'}}>
              Round {roundIndex + 1} of {TOTAL_ROUNDS} · {cfg.label}
            </p>
          </div>
        </div>
        <div style={{display:'flex',gap:'10px',flexWrap:'wrap',alignItems:'center'}}>
          {phase === 'memorise' && (
            <span style={{background:'#F5F3FF',color:'#7C3AED',fontSize:'15px',fontWeight:'700',
              padding:'6px 14px',borderRadius:'20px',border:'1px solid #DDD6FE',
              display:'flex',alignItems:'center',gap:'6px'}}>
              <Clock size={15}/>{countdownSec}s
            </span>
          )}
          {(phase === 'recall' || phase === 'round_feedback') && roundAttempts > 0 && (
            <span style={{background:'#FEF2F2',color:'#DC2626',fontSize:'15px',fontWeight:'700',
              padding:'6px 14px',borderRadius:'20px',border:'1px solid #FECACA'}}>
              {roundAttempts}/3 attempts
            </span>
          )}
          <span style={{background:'#F0FDF4',color:'#059669',fontSize:'15px',fontWeight:'700',
            padding:'6px 14px',borderRadius:'20px',border:'1px solid #A7F3D0'}}>
            ✓ {taskBreakdown.filter(t=>t.accuracy>0).length}/{TOTAL_ROUNDS}
          </span>
        </div>
      </div>

      {/* Session + adaptive progress */}
      <div style={{display:'flex',gap:'12px',marginBottom:'1.25rem',flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:'160px'}}>
          <span style={{fontSize:'13px',fontWeight:'700',color:'var(--text-muted)'}}>Session Progress</span>
          <div style={{background:'#E2E8F0',borderRadius:'999px',height:'7px',marginTop:'4px',overflow:'hidden'}}>
            <div style={{height:'100%',borderRadius:'999px',
              background:'linear-gradient(90deg,#7C3AED,#6D28D9)',
              width:`${(roundIndex/TOTAL_ROUNDS)*100}%`,transition:'width 0.4s ease'}}/>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
          {Array.from({length:PROMOTE_AFTER}).map((_,i)=>(
            <div key={i} style={{width:'24px',height:'7px',borderRadius:'4px',
              background:i<consecCorrect?'#7C3AED':'#E2E8F0',transition:'background 0.3s'}}/>
          ))}
          <span style={{fontSize:'12px',fontWeight:'600',color:'var(--text-muted)'}}>
            {consecCorrect}/{PROMOTE_AFTER} to advance
          </span>
        </div>
      </div>

      {/* MEMORISE phase */}
      {phase === 'memorise' && (
        <div>
          <div style={{ background:'linear-gradient(135deg,#F5F3FF,#EDE9FE)',
            border:'2px solid #DDD6FE',borderRadius:'18px',
            padding:'1rem 1.5rem',marginBottom:'1.75rem',textAlign:'center' }}>
            <p style={{fontSize:'20px',fontWeight:'700',color:'#4C1D95',margin:0}}>
              👁️ Memorise this sequence — it hides in {countdownSec}s!
            </p>
          </div>
          {/* Countdown ring */}
          <div style={{display:'flex',justifyContent:'center',marginBottom:'1.5rem'}}>
            <div style={{
              width:'70px',height:'70px',borderRadius:'50%',
              background:`conic-gradient(#7C3AED ${(countdownMs/cfg.showMs)*360}deg, #E2E8F0 0deg)`,
              display:'flex',alignItems:'center',justifyContent:'center',
              boxShadow:'0 4px 12px rgba(124,58,237,0.25)',
              transition:'background 0.1s linear'
            }}>
              <div style={{ width:'54px',height:'54px',borderRadius:'50%',background:'#FFFFFF',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:'21px',fontWeight:'900',color:'#4C1D95' }}>
                {Math.ceil(countdownMs/1000)}
              </div>
            </div>
          </div>
          <SeqStrip seq={sequence} hidden={false} hintCount={0}/>
        </div>
      )}

      {/* RECALL / FEEDBACK phase */}
      {(phase === 'recall' || phase === 'round_feedback') && (
        <div>
          <div style={{ background:'linear-gradient(135deg,#FFFBEB,#FEF3C7)',
            border:'2px solid #FDE68A',borderRadius:'18px',
            padding:'1rem 1.5rem',marginBottom:'1.25rem',textAlign:'center' }}>
            <p style={{fontSize:'19px',fontWeight:'700',color:'#78350F',margin:'0 0 14px'}}>
              🧠 Which was the correct sequence?
            </p>
            <SeqStrip seq={sequence} hidden={true} hintCount={hintCount}/>
          </div>

          {/* Hint notice when active */}
          {hintCount > 0 && (
            <div style={{ background:'#EFF6FF',border:'2px solid #BFDBFE',borderRadius:'14px',
              padding:'10px 16px',marginBottom:'1rem',
              display:'flex',alignItems:'center',gap:'10px',
              fontSize:'17px',color:'#1E40AF',fontWeight:'600' }}>
              <HelpCircle size={18}/>
              The first {hintCount} item{hintCount>1?'s are':' is'} revealed above as a gentle hint.
            </div>
          )}

          {/* Attempt indicator */}
          {roundAttempts > 0 && (
            <div style={{ background:'#FEF2F2',border:'2px solid #FECACA',borderRadius:'14px',
              padding:'8px 16px',marginBottom:'1rem',
              fontSize:'16px',color:'#991B1B',fontWeight:'600',textAlign:'center' }}>
              Attempt {roundAttempts} of 3 — you can still get it!
            </div>
          )}

          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            {options.map((opt,idx)=>{
              let state = '';
              if (phase==='round_feedback') {
                if (idx===correctIndex) state='correct';
                else if (idx===selectedIndex) state='wrong';
              }
              return (
                <OptionBtn key={idx} seq={opt}
                  onClick={()=>handleSelect(idx)} state={state}/>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
