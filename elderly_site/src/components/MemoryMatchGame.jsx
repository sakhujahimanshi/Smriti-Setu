import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Grid2X2, Sparkles, RotateCcw, Clock, XCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { emitTelemetry } from '../socket';

// ─── Adaptive thresholds ────────────────────────────────────────────────────
const PROMOTE_AFTER = 3; // consecutive successful rounds before level up
const DEMOTE_AFTER  = 3; // consecutive struggling rounds before level down
const TOTAL_ROUNDS  = 5;

// ─── Level configuration ────────────────────────────────────────────────────
// successThreshold = max mistakes allowed to count the round as "successful"
const LEVEL_CFG = {
  1: { pairs: 2, cols: 2, cardPx: '130px', label: 'Level 1 — Gentle (4 cards)',     successThreshold: 2 },
  2: { pairs: 3, cols: 3, cardPx: '110px', label: 'Level 2 — Easy (6 cards)',        successThreshold: 4 },
  3: { pairs: 4, cols: 4, cardPx:  '90px', label: 'Level 3 — Moderate (8 cards)',    successThreshold: 6 },
  4: { pairs: 6, cols: 4, cardPx:  '90px', label: 'Level 4 — Challenging (12 cards)',successThreshold: 9 }
};

const SYMBOLS = [
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
  { id: 'lamp',     emoji: '🪔', label: 'Lamp' }
];

function buildDeck(pairCount) {
  const chosen = [...SYMBOLS].sort(() => Math.random() - 0.5).slice(0, pairCount);
  const doubled = [...chosen, ...chosen];
  for (let i = doubled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
  }
  return doubled.map((s, idx) => ({ uid: idx, id: s.id, emoji: s.emoji, label: s.label, isFlipped: false, isMatched: false }));
}

// ─── Card component ──────────────────────────────────────────────────────────
function Card({ card, onClick, disabled, sizePx }) {
  const { isFlipped, isMatched, emoji, label } = card;
  const revealed = isFlipped || isMatched;
  const px = parseInt(sizePx);
  return (
    <div
      onClick={() => !disabled && !isMatched && !isFlipped && onClick(card.uid)}
      style={{ width: sizePx, height: sizePx, perspective: '600px',
        cursor: (disabled || isMatched || isFlipped) ? 'default' : 'pointer', userSelect: 'none' }}
    >
      <div style={{
        position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d',
        transform: revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
        transition: 'transform 0.38s cubic-bezier(0.4,0,0.2,1)', borderRadius: '16px'
      }}>
        {/* Back face */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          background: 'linear-gradient(135deg,#1E3A5F,#2D5F8F)', borderRadius: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(30,58,95,0.35)', border: '2px solid rgba(255,255,255,0.12)'
        }}>
          <span style={{ fontSize: Math.round(px * 0.28) + 'px', opacity: 0.65 }}>🍀</span>
        </div>
        {/* Front face */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
          background: isMatched ? 'linear-gradient(135deg,#D1FAE5,#A7F3D0)' : 'linear-gradient(135deg,#FEF9C3,#FEF3C7)',
          borderRadius: '16px', border: isMatched ? '2.5px solid #10B981' : '2.5px solid #FCD34D',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
          boxShadow: isMatched ? '0 4px 14px rgba(16,185,129,0.3)' : '0 4px 14px rgba(245,158,11,0.2)'
        }}>
          <span style={{ fontSize: Math.round(px * 0.34) + 'px', lineHeight: 1 }}>{emoji}</span>
          <span style={{ fontSize: Math.max(10, Math.round(px * 0.12)) + 'px', fontWeight: '700',
            color: isMatched ? '#065F46' : '#92400E', letterSpacing: '0.03em' }}>
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function MemoryMatchGame({ onSessionComplete, apiUrl }) {
  // ── Adaptive state ─────────────────────────────────────────────────────────
  const [currentLevel, setCurrentLevel] = useState(1);
  const [consecCorrect, setConsecCorrect] = useState(0);
  const [consecFail,    setConsecFail]    = useState(0);

  // ── Session tracking ───────────────────────────────────────────────────────
  const [roundIndex,      setRoundIndex]      = useState(0); // 0-based
  const [taskBreakdown,   setTaskBreakdown]   = useState([]);
  const [levelTrajectory, setLevelTrajectory] = useState([1]); // starts at L1

  // ── Round state ────────────────────────────────────────────────────────────
  const [phase,        setPhase]        = useState('playing'); // 'playing'|'round_result'|'finished'
  const [deck,         setDeck]         = useState(() => buildDeck(LEVEL_CFG[1].pairs));
  const [flippedUids,  setFlippedUids]  = useState([]);
  const [roundMistakes,setRoundMistakes]= useState(0);
  const [isLocked,     setIsLocked]     = useState(false);
  const [roundResult,  setRoundResult]  = useState(null); // { isSuccess, levelChanged, newLevel, msg }

  // ── Refs (avoid stale closures in setTimeout callbacks) ────────────────────
  const levelRef        = useRef(1);
  const roundMistRef    = useRef(0);
  const consecCorrRef   = useRef(0);
  const consecFailRef   = useRef(0);
  const roundBreakRef   = useRef([]); // mirrors taskBreakdown
  const levelTrajRef    = useRef([1]);
  const roundIdxRef     = useRef(0);
  const roundStartRef   = useRef(Date.now());
  const sessionStartRef = useRef(Date.now());

  // Sync refs ← state
  useEffect(() => { levelRef.current = currentLevel; }, [currentLevel]);
  useEffect(() => { roundMistRef.current = roundMistakes; }, [roundMistakes]);
  useEffect(() => { consecCorrRef.current = consecCorrect; }, [consecCorrect]);
  useEffect(() => { consecFailRef.current = consecFail; }, [consecFail]);
  useEffect(() => { roundBreakRef.current = taskBreakdown; }, [taskBreakdown]);
  useEffect(() => { levelTrajRef.current = levelTrajectory; }, [levelTrajectory]);
  useEffect(() => { roundIdxRef.current = roundIndex; }, [roundIndex]);

  // ── Start a new round ─────────────────────────────────────────────────────
  const startRound = useCallback((level) => {
    const cfg = LEVEL_CFG[level] || LEVEL_CFG[1];
    setDeck(buildDeck(cfg.pairs));
    setFlippedUids([]);
    setRoundMistakes(0);
    roundMistRef.current = 0;
    setIsLocked(false);
    setPhase('playing');
    roundStartRef.current = Date.now();
  }, []);

  // ── Called when all pairs found ────────────────────────────────────────────
  const onRoundComplete = useCallback((finalMistakes, level) => {
    const cfg       = LEVEL_CFG[level] || LEVEL_CFG[1];
    const respSec   = parseFloat(((Date.now() - roundStartRef.current) / 1000).toFixed(1));
    const isSuccess = finalMistakes <= cfg.successThreshold;
    const accuracy  = Math.max(0, Math.round(100 - (finalMistakes / cfg.pairs) * 50));

    const taskEntry = {
      taskIndex:          roundIdxRef.current + 1,
      difficultyAtTask:   level,
      accuracy,
      responseTimeSeconds: respSec,
      mistakes:            finalMistakes,
      hintsUsed:           0
    };

    const newBreakdown = [...roundBreakRef.current, taskEntry];
    roundBreakRef.current = newBreakdown;
    setTaskBreakdown(newBreakdown);

    // Adaptive logic (3-4 consecutive threshold)
    const prevCC = consecCorrRef.current;
    const prevCF = consecFailRef.current;
    let newCC    = isSuccess ? prevCC + 1 : 0;
    let newCF    = isSuccess ? 0 : prevCF + 1;
    let newLevel = level;
    let levelChanged = null;

    if (newCC >= PROMOTE_AFTER && level < 4) {
      newLevel = level + 1; newCC = 0; levelChanged = 'up';
    } else if (newCF >= DEMOTE_AFTER && level > 1) {
      newLevel = level - 1; newCF = 0; levelChanged = 'down';
    }

    const newTraj = [...levelTrajRef.current, newLevel];
    levelTrajRef.current = newTraj;

    consecCorrRef.current = newCC;
    consecFailRef.current = newCF;
    setConsecCorrect(newCC);
    setConsecFail(newCF);
    setLevelTrajectory(newTraj);
    setCurrentLevel(newLevel);
    levelRef.current = newLevel;

    emitTelemetry({
      activityTitle: `Memory Match — Round ${roundIdxRef.current + 1}`,
      activityType: 'memory_match',
      status: isSuccess ? 'Round Success' : 'Round Struggled',
      attempts: 1, isCorrect: isSuccess
    });

    const nextRound = roundIdxRef.current + 1;
    if (nextRound >= TOTAL_ROUNDS) {
      finishGame(newBreakdown, newTraj, newLevel);
    } else {
      const msg = levelChanged === 'up'
        ? '🎉 Wonderful! Moving to a slightly bigger board!'
        : levelChanged === 'down'
          ? '💙 Taking it a bit easier — you are doing beautifully.'
          : isSuccess
            ? '✅ Well done! On to the next round.'
            : '🔁 Good effort! Let us try again.';
      setRoundResult({ isSuccess, levelChanged, newLevel, msg });
      setPhase('round_result');
      roundIdxRef.current = nextRound;
      setRoundIndex(nextRound);
    }
  }, []); // stable — uses only refs

  // ── Card tap handler ───────────────────────────────────────────────────────
  const handleCardClick = useCallback((uid) => {
    if (isLocked) return;
    setFlippedUids(prev => {
      if (prev.includes(uid)) return prev;
      const next = [...prev, uid];

      if (next.length === 2) {
        setIsLocked(true);
        const [aId, bId] = next;

        setDeck(prevDeck => {
          const cardA = prevDeck.find(c => c.uid === aId);
          const cardB = prevDeck.find(c => c.uid === bId);

          if (cardA.id === cardB.id) {
            // Match!
            const newDeck = prevDeck.map(c =>
              c.uid === aId || c.uid === bId ? { ...c, isFlipped: true, isMatched: true } : c
            );
            const allDone = newDeck.every(c => c.isMatched);
            setTimeout(() => {
              setFlippedUids([]);
              setIsLocked(false);
              if (allDone) onRoundComplete(roundMistRef.current, levelRef.current);
            }, 400);
            return newDeck;
          } else {
            // No match
            const m = roundMistRef.current + 1;
            setRoundMistakes(m);
            roundMistRef.current = m;
            const flipped = prevDeck.map(c =>
              c.uid === aId || c.uid === bId ? { ...c, isFlipped: true } : c
            );
            setTimeout(() => {
              setDeck(d => d.map(c =>
                c.uid === aId || c.uid === bId ? { ...c, isFlipped: false } : c
              ));
              setFlippedUids([]);
              setIsLocked(false);
            }, 1050);
            return flipped;
          }
        });
        return next;
      }

      // First card flipped
      setDeck(d => d.map(c => c.uid === uid ? { ...c, isFlipped: true } : c));
      return next;
    });
  }, [isLocked, onRoundComplete]);

  // ── Finish session ─────────────────────────────────────────────────────────
  const finishGame = async (finalBreakdown, finalTraj, finalLevel) => {
    setPhase('finished');
    const totalSec        = parseFloat(((Date.now() - sessionStartRef.current) / 1000).toFixed(1));
    const totalMistakes   = finalBreakdown.reduce((a, t) => a + t.mistakes, 0);
    const avgAccuracy     = Math.round(finalBreakdown.reduce((a, t) => a + t.accuracy, 0) / finalBreakdown.length);
    const avgResponseTime = parseFloat((finalBreakdown.reduce((a, t) => a + t.responseTimeSeconds, 0) / finalBreakdown.length).toFixed(1));
    const score           = Math.max(0, Math.round(avgAccuracy - totalMistakes * 2));

    const sessionPayload = {
      activityName:        'Memory Match',
      activityCategory:    'Memory Match',
      startLevel:          finalTraj[0],
      endLevel:            finalLevel,
      levelTrajectory:     finalTraj,
      taskBreakdown:       finalBreakdown,
      score,
      accuracy:            avgAccuracy,
      responseTimeSeconds: avgResponseTime,
      mistakes:            totalMistakes,
      hintsUsed:           0
    };

    try {
      await fetch(`${apiUrl}/api/games/submit-session`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityName: 'Memory Match', activityCategory: 'Memory Match',
          score, accuracy: avgAccuracy,
          responseTimeMs: Math.round(totalSec * 1000),
          attempts: TOTAL_ROUNDS, hintsUsed: 0, mistakes: totalMistakes
        })
      });
    } catch (err) { console.warn('[MemoryMatch] submit notice:', err.message); }

    emitTelemetry({ activityTitle: 'Memory Match', activityType: 'memory_match',
      status: 'Session Complete', attempts: TOTAL_ROUNDS, isCorrect: true, score, accuracy: avgAccuracy });

    if (onSessionComplete) onSessionComplete(sessionPayload);
  };

  // ── Restart ────────────────────────────────────────────────────────────────
  const handleRestart = () => {
    setCurrentLevel(1); levelRef.current = 1;
    setConsecCorrect(0); consecCorrRef.current = 0;
    setConsecFail(0);    consecFailRef.current = 0;
    setRoundIndex(0);    roundIdxRef.current = 0;
    setTaskBreakdown([]); roundBreakRef.current = [];
    setLevelTrajectory([1]); levelTrajRef.current = [1];
    setRoundResult(null);
    sessionStartRef.current = Date.now();
    startRound(1);
  };

  // ── Timer display ──────────────────────────────────────────────────────────
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - roundStartRef.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [phase]);
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  const cfg = LEVEL_CFG[currentLevel] || LEVEL_CFG[1];

  // ── Finished screen ────────────────────────────────────────────────────────
  if (phase === 'finished') {
    const totalMistakes = taskBreakdown.reduce((a,t)=>a+t.mistakes,0);
    const avgAcc = Math.round(taskBreakdown.reduce((a,t)=>a+t.accuracy,0)/taskBreakdown.length);
    const score  = Math.max(0, Math.round(avgAcc - totalMistakes * 2));
    return (
      <div className="focus-card" style={{ maxWidth:'720px', textAlign:'center' }}>
        <div style={{ width:'88px',height:'88px',borderRadius:'50%',
          background:'linear-gradient(135deg,#F59E0B,#D97706)',
          display:'flex',alignItems:'center',justifyContent:'center',
          margin:'0 auto 1.5rem', boxShadow:'0 8px 24px rgba(245,158,11,0.35)' }}>
          <Sparkles size={44} color="#FFFFFF"/>
        </div>
        <h2 style={{fontSize:'34px',color:'#92400E',marginBottom:'8px'}}>All Pairs Found! স্মৃতি উজ্জ্বল! 🎉</h2>
        <p style={{fontSize:'20px',color:'var(--text-muted)',marginBottom:'2.5rem'}}>
          You completed {TOTAL_ROUNDS} rounds with great memory and patience.
        </p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'14px',marginBottom:'2.5rem'}}>
          {[
            {label:'Score',         value:score,          color:'#059669',bg:'#F0FDF4',border:'#A7F3D0'},
            {label:'Total Mistakes',value:totalMistakes,  color:'#D97706',bg:'#FFFBEB',border:'#FDE68A'},
            {label:'Avg Accuracy',  value:`${avgAcc}%`,   color:'#0284C7',bg:'#F0F9FF',border:'#BAE6FD'},
          ].map(s=>(
            <div key={s.label} style={{background:s.bg,border:`2px solid ${s.border}`,borderRadius:'18px',padding:'1.25rem'}}>
              <div style={{fontSize:'34px',fontWeight:'900',color:s.color}}>{s.value}</div>
              <div style={{fontSize:'15px',color:'var(--text-muted)',fontWeight:'600',marginTop:'4px'}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{marginBottom:'1.5rem'}}>
          <p style={{fontSize:'17px',color:'var(--text-muted)',fontWeight:'600',marginBottom:'10px'}}>Round-by-Round Performance:</p>
          <div style={{display:'flex',gap:'8px',justifyContent:'center',flexWrap:'wrap'}}>
            {taskBreakdown.map((t,i)=>(
              <div key={i} style={{
                background: t.accuracy>=80?'#D1FAE5':t.accuracy>=50?'#FEF3C7':'#FEE2E2',
                border:`2px solid ${t.accuracy>=80?'#10B981':t.accuracy>=50?'#F59E0B':'#EF4444'}`,
                borderRadius:'12px', padding:'8px 14px', fontSize:'15px', fontWeight:'700',
                color: t.accuracy>=80?'#065F46':t.accuracy>=50?'#92400E':'#991B1B'
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
    const { isSuccess, levelChanged, newLevel, msg } = roundResult;
    return (
      <div className="focus-card" style={{ maxWidth:'600px', textAlign:'center' }}>
        <div style={{ width:'72px',height:'72px',borderRadius:'50%',
          background: isSuccess ? 'linear-gradient(135deg,#10B981,#059669)' : 'linear-gradient(135deg,#F59E0B,#D97706)',
          display:'flex',alignItems:'center',justifyContent:'center',
          margin:'0 auto 1.25rem', boxShadow:`0 6px 20px rgba(${isSuccess?'16,185,129':'245,158,11'},0.3)` }}>
          {isSuccess ? <Sparkles size={36} color="#FFF"/> : <RotateCcw size={36} color="#FFF"/>}
        </div>
        <h3 style={{fontSize:'28px',color: isSuccess?'#065F46':'#92400E',marginBottom:'8px'}}>
          {isSuccess ? 'Round Complete!' : 'Round Done!'}
        </h3>
        <p style={{fontSize:'19px',color:'var(--text-muted)',marginBottom:'1.5rem'}}>{msg}</p>

        {levelChanged && (
          <div style={{
            background: levelChanged==='up'?'#F0FDF4':'#FFFBEB',
            border:`2px solid ${levelChanged==='up'?'#A7F3D0':'#FDE68A'}`,
            borderRadius:'14px', padding:'10px 18px', marginBottom:'1.5rem',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',
            fontSize:'18px',fontWeight:'700',
            color: levelChanged==='up'?'#065F46':'#92400E'
          }}>
            {levelChanged==='up' ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
            {levelChanged==='up' ? `Moving to ${LEVEL_CFG[newLevel]?.label || 'next level'}` : `Easing to ${LEVEL_CFG[newLevel]?.label || 'previous level'}`}
          </div>
        )}

        <div style={{fontSize:'16px',color:'var(--text-muted)',marginBottom:'1.75rem'}}>
          Round {roundIndex} of {TOTAL_ROUNDS} complete
        </div>

        <button className="btn-large btn-sage" onClick={() => startRound(currentLevel)}>
          <span>Next Round (পৰৱৰ্তী ৰাউণ্ড)</span>
          <Grid2X2 size={22}/>
        </button>
      </div>
    );
  }

  // ── Playing screen ─────────────────────────────────────────────────────────
  const matchedPairs = deck.filter(c => c.isMatched).length / 2;
  return (
    <div className="focus-card" style={{ maxWidth:'900px' }}>
      {/* Header */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',
        marginBottom:'1.5rem',borderBottom:'2px solid var(--border-subtle)',
        paddingBottom:'1rem',flexWrap:'wrap',gap:'12px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:'14px' }}>
          <Grid2X2 size={34} color="#F59E0B"/>
          <div>
            <h2 style={{fontSize:'28px',margin:0}}>স্মৃতি মিলান — Memory Match</h2>
            <p style={{fontSize:'15px',color:'var(--text-muted)',margin:'2px 0 0'}}>
              Round {roundIndex + 1} of {TOTAL_ROUNDS} · {cfg.label}
            </p>
          </div>
        </div>
        <div style={{display:'flex',gap:'10px',flexWrap:'wrap',alignItems:'center'}}>
          <span style={{background:'#F0F9FF',color:'#0284C7',fontSize:'15px',fontWeight:'700',
            padding:'6px 14px',borderRadius:'20px',border:'1px solid #BAE6FD',
            display:'flex',alignItems:'center',gap:'6px'}}>
            <Clock size={15}/>{fmt(elapsed)}
          </span>
          <span style={{background:'#FEF2F2',color:'#DC2626',fontSize:'15px',fontWeight:'700',
            padding:'6px 14px',borderRadius:'20px',border:'1px solid #FECACA',
            display:'flex',alignItems:'center',gap:'6px'}}>
            <XCircle size={15}/>{roundMistakes} mistakes
          </span>
          <span style={{background:'#F0FDF4',color:'#059669',fontSize:'15px',fontWeight:'700',
            padding:'6px 14px',borderRadius:'20px',border:'1px solid #A7F3D0'}}>
            ✓ {matchedPairs}/{cfg.pairs}
          </span>
        </div>
      </div>

      {/* Session progress */}
      <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'1.25rem'}}>
        <span style={{fontSize:'14px',fontWeight:'700',color:'var(--text-muted)',whiteSpace:'nowrap'}}>Session:</span>
        <div style={{flex:1,background:'#E2E8F0',borderRadius:'999px',height:'7px',overflow:'hidden'}}>
          <div style={{height:'100%',borderRadius:'999px',
            background:'linear-gradient(90deg,#F59E0B,#D97706)',
            width:`${(roundIndex/TOTAL_ROUNDS)*100}%`, transition:'width 0.4s ease'}}/>
        </div>
        <span style={{fontSize:'14px',fontWeight:'700',color:'var(--text-muted)',whiteSpace:'nowrap'}}>{roundIndex}/{TOTAL_ROUNDS}</span>
      </div>

      {/* Adaptive streak indicators */}
      <div style={{display:'flex',gap:'8px',marginBottom:'1.5rem',flexWrap:'wrap'}}>
        {Array.from({length:PROMOTE_AFTER}).map((_,i)=>(
          <div key={i} style={{
            width:'28px',height:'8px',borderRadius:'4px',
            background: i < consecCorrect ? '#10B981' : '#E2E8F0',
            transition:'background 0.3s'
          }}/>
        ))}
        <span style={{fontSize:'13px',fontWeight:'600',color:'var(--text-muted)',marginLeft:'4px'}}>
          {consecCorrect}/{PROMOTE_AFTER} to advance
        </span>
      </div>

      {/* Card grid */}
      <div style={{
        display:'grid',
        gridTemplateColumns:`repeat(${cfg.cols},1fr)`,
        gap:'12px',
        justifyItems:'center'
      }}>
        {deck.map(card => (
          <Card key={card.uid} card={card} onClick={handleCardClick}
            disabled={isLocked} sizePx={cfg.cardPx}/>
        ))}
      </div>

      {/* Instructions */}
      <div style={{textAlign:'center',marginTop:'1.5rem'}}>
        <p style={{fontSize:'17px',color:'var(--text-muted)'}}>
          Tap two cards to find matching pairs. Take your time — there is no rush.
        </p>
      </div>
    </div>
  );
}
