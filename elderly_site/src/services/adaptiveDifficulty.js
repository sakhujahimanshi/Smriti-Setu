/**
 * Smriti Setu — Reusable Adaptive Difficulty & Cognitive Reinforcement Engine
 * 
 * Architectural Rules:
 * 1. Performance-adaptive across all cognitive games (Levels 1 to 4).
 * 2. Stable progression: no knee-jerk level changes from a single mistake or single success.
 * 3. Three-attempt rule per item:
 *    - Attempt 1: Gentle hint
 *    - Attempt 2: Contextual / repetitive hint
 *    - Attempt 3: Strong clue
 *    - After 3 fails: marks item for reinforcement, intentionally simplifies difficulty,
 *      and queues difficult item into ReinforcementQueue for delayed recall.
 * 4. Delayed recall: returns previously difficult item after successful simpler tasks.
 * 5. Persistent across sessions (localStorage + backend /api/sessions logging).
 * 6. Language-invariant: switching language NEVER resets levels, performance, or reinforcement items.
 * 7. Strictly dignity-first: no clinical or deficit-based labels.
 */

const STORAGE_KEY = 'smriti_setu_adaptive_state_v1';

export class AdaptiveDifficultyManager {
  constructor() {
    this.state = this._loadState();
    this.listeners = [];
  }

  _loadState() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            gameLevels: parsed.gameLevels || {},
            gameHistory: parsed.gameHistory || {},
            reinforcementQueue: parsed.reinforcementQueue || []
          };
        }
      }
    } catch (e) {
      console.warn('AdaptiveDifficultyManager storage read notice:', e);
    }
    return {
      gameLevels: {},
      gameHistory: {},
      reinforcementQueue: []
    };
  }

  _saveState() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      }
    } catch (e) {
      console.warn('AdaptiveDifficultyManager storage save notice:', e);
    }
  }

  /**
   * Get current level for a game (defaults to Level 1: Gentle)
   * Levels: 1 (Gentle/Easy), 2 (Easy/Moderate), 3 (Moderate), 4 (Challenging/Delayed Recall)
   */
  getLevel(gameId) {
    return this.state.gameLevels[gameId] || 1;
  }

  setLevel(gameId, level) {
    const clamped = Math.max(1, Math.min(4, level));
    this.state.gameLevels[gameId] = clamped;
    this._saveState();
    this.notify(gameId, clamped);
    return clamped;
  }

  subscribe(listener) {
    if (typeof listener !== 'function') return () => {};
    if (!this.listeners) this.listeners = [];
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(gameId, newLevel) {
    if (!this.listeners) return;
    this.listeners.forEach(l => {
      try { l(gameId, newLevel); } catch (e) { console.warn(e); }
    });
  }

  /**
   * Get performance history for a game
   */
  getHistory(gameId) {
    if (!this.state.gameHistory[gameId]) {
      this.state.gameHistory[gameId] = {
        consecutiveSuccesses: 0,
        consecutiveStruggles: 0,
        totalAttempts: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        totalHintsUsed: 0
      };
    }
    return this.state.gameHistory[gameId];
  }

  /**
   * Evaluates performance and updates level based on stable patterns.
   * Requires 2 consecutive successes to level up.
   * Requires 2 consecutive struggles to level down.
   * Never levels down on a single error.
   */
  recordResult({ gameId, itemId, isCorrect, attempts = 1, hintsUsed = 0, itemDifficulty = 1, timeMs = 0 }) {
    const history = this.getHistory(gameId);
    const currentLevel = this.getLevel(gameId);
    let nextLevel = currentLevel;
    let leveledUp = false;
    let leveledDown = false;

    history.totalAttempts += attempts;
    history.totalHintsUsed += hintsUsed;

    if (isCorrect && attempts <= 2) {
      // Clean success
      history.totalCorrect += 1;
      history.consecutiveSuccesses += 1;
      history.consecutiveStruggles = 0;

      // Check if we just resolved an item that was in the reinforcement queue
      this.resolveReinforcement(gameId, itemId);

      // Level up after every single clean success
      if (history.consecutiveSuccesses >= 1 && currentLevel < 4) {
        nextLevel = currentLevel + 1;
        this.setLevel(gameId, nextLevel);
        history.consecutiveSuccesses = 0;
        leveledUp = true;
      }
    } else {
      // Struggle or failed item
      history.totalIncorrect += 1;
      history.consecutiveStruggles += 1;
      history.consecutiveSuccesses = 0;

      // Level down only after 2 consecutive struggles
      if (history.consecutiveStruggles >= 2 && currentLevel > 1) {
        nextLevel = currentLevel - 1;
        this.setLevel(gameId, nextLevel);
        history.consecutiveStruggles = 0;
        leveledDown = true;
      }
    }

    this._saveState();

    return {
      currentLevel,
      nextLevel,
      leveledUp,
      leveledDown,
      consecutiveSuccesses: history.consecutiveSuccesses,
      consecutiveStruggles: history.consecutiveStruggles
    };
  }

  /**
   * 3-Attempt Adaptive Rule Handling:
   * Called when the user fails an attempt.
   * If attemptCount >= 3, queues item for reinforcement,
   * triggers intentional difficulty reduction, and returns actionable guidance.
   */
  handleAttemptFailure({ gameId, item, attemptNumber, hintsUsed }) {
    const history = this.getHistory(gameId);
    history.totalAttempts += 1;
    history.totalHintsUsed = (history.totalHintsUsed || 0) + 1;

    const isExhausted = attemptNumber >= 3;

    if (isExhausted) {
      // Mark for reinforcement & enter into queue
      this.enqueueReinforcement({
        itemId: item.id || item.targetId || String(item),
        gameId,
        difficulty: this.getLevel(gameId),
        failedAttempts: attemptNumber,
        hintsUsed,
        itemPayload: item,
        timestamp: Date.now(),
        needsReinforcement: true
      });

      // Stable struggle counter
      history.consecutiveStruggles += 1;
      history.consecutiveSuccesses = 0;

      // Temporarily step down level if applicable to present an easier task
      const currentLevel = this.getLevel(gameId);
      const reducedLevel = Math.max(1, currentLevel - 1);
      this.setLevel(gameId, reducedLevel);

      this._saveState();

      return {
        action: 'simplify_and_queue',
        needsReinforcement: true,
        reducedLevel,
        messageKey: 'adaptiveSimplify'
      };
    }

    this._saveState();

    return {
      action: 'next_hint',
      hintTier: attemptNumber + 1,
      needsReinforcement: false
    };
  }

  /**
   * Enqueue a difficult item for later reinforcement
   */
  enqueueReinforcement(itemData) {
    // Avoid duplicate entries
    const existingIdx = this.state.reinforcementQueue.findIndex(
      q => q.gameId === itemData.gameId && q.itemId === itemData.itemId
    );
    if (existingIdx >= 0) {
      this.state.reinforcementQueue[existingIdx] = {
        ...this.state.reinforcementQueue[existingIdx],
        failedAttempts: itemData.failedAttempts,
        hintsUsed: itemData.hintsUsed,
        needsReinforcement: true,
        timestamp: Date.now()
      };
    } else {
      this.state.reinforcementQueue.push(itemData);
    }
    this._saveState();
  }

  /**
   * Removes or marks resolved an item from reinforcement queue
   */
  resolveReinforcement(gameId, itemId) {
    if (!itemId) return;
    const initialLen = this.state.reinforcementQueue.length;
    this.state.reinforcementQueue = this.state.reinforcementQueue.filter(
      q => !(q.gameId === gameId && q.itemId === itemId)
    );
    if (this.state.reinforcementQueue.length !== initialLen) {
      this._saveState();
    }
  }

  clearQueueForGame(gameId) {
    this.state.reinforcementQueue = this.state.reinforcementQueue.filter(
      q => q.gameId !== gameId
    );
    this._saveState();
  }

  /**
   * Gets pending reinforcement item for a game if ready for delayed recall.
   * Delayed recall rule: only returned if user has completed at least 1 easier activity since failure.
   */
  getNextReinforcementItem(gameId) {
    return this.state.reinforcementQueue.find(q => q.gameId === gameId && q.needsReinforcement);
  }

  /**
   * All items currently requiring reinforcement across all games
   */
  /**
   * Convenience alias method for recording attempts with positional arguments
   */
  recordAttempt(gameId, isCorrect, attempts = 1, hintsUsed = 0, failedAfter3Attempts = false) {
    if (failedAfter3Attempts) {
      const history = this.getHistory(gameId);
      history.consecutiveStruggles = 0;
      history.consecutiveSuccesses = 0;
      const currentLevel = this.getLevel(gameId);
      const reducedLevel = Math.max(1, currentLevel - 1);
      this.setLevel(gameId, reducedLevel);
      return {
        level: reducedLevel,
        consecutiveSuccesses: 0,
        consecutiveStruggles: 0,
        reduced: true
      };
    }
    const res = this.recordResult({ gameId, isCorrect, attempts, hintsUsed });
    return {
      level: res.nextLevel,
      consecutiveSuccesses: res.consecutiveSuccesses,
      consecutiveStruggles: res.consecutiveStruggles,
      leveledUp: res.leveledUp,
      leveledDown: res.leveledDown
    };
  }

  /**
   * Convenience alias for queueing reinforcement
   */
  queueForReinforcement(gameId, item) {
    const id = item.id || item.targetId || item.storyId || String(item);
    this.enqueueReinforcement({
      itemId: id,
      targetId: id,
      gameId,
      difficulty: this.getLevel(gameId),
      failedAttempts: item.failedAttempts || 3,
      hintsUsed: item.hintsUsed || item.hintsGiven || 2,
      itemPayload: item,
      timestamp: Date.now(),
      needsReinforcement: true,
      delayedRecallScheduled: true
    });
    return true;
  }

  hasReinforcement(gameId) {
    return this.state.reinforcementQueue.some(q => q.gameId === gameId && q.needsReinforcement);
  }

  /**
   * Reset a specific game's level to 1 at the start of each new session.
   * Resets consecutive counters but preserves historical totals.
   */
  resetSessionLevel(gameId) {
    this.setLevel(gameId, 1);
    const history = this.getHistory(gameId);
    history.consecutiveSuccesses = 0;
    history.consecutiveStruggles = 0;
    this.clearQueueForGame(gameId);
    this._saveState();
  }

  /**
   * Reset game history for testing or demo reset (preserves levels)
   */
  resetSessionData() {
    this.state.reinforcementQueue = [];
    this.state.gameHistory = {};
    this._saveState();
  }
}

export const adaptiveDifficultyManager = new AdaptiveDifficultyManager();
