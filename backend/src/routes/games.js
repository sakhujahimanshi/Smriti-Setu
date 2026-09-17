const express = require('express');
const router = express.Router();
const GameSession = require('../models/GameSession');
const ElderlyProfile = require('../models/ElderlyProfile');
const { broadcast } = require('../websocket');
const { emitToCaregiver, emitToAll } = require('../socket');

// POST /api/games/submit-session — Strict Rule-Based Adaptive Difficulty Engine
router.post('/submit-session', async (req, res) => {
  try {
    const {
      activityCategory = 'photoRecall',
      activityName = 'Cognitive Activity',
      score = 100,
      accuracy = 100,
      responseTimeMs = 5000,
      attempts = 1,
      hintsUsed = 0,
      mistakes = 0
    } = req.body;

    let profile = await ElderlyProfile.findOne();
    if (!profile) {
      profile = await ElderlyProfile.create({
        name: 'Biren Borah',
        age: 76,
        currentLevel: { photoRecall: 1, nameRecall: 1, routineSequencing: 1 }
      });
    }

    if (!profile.currentLevel) {
      profile.currentLevel = { photoRecall: 1, nameRecall: 1, routineSequencing: 1 };
    }

    const currentLevel = profile.currentLevel[activityCategory] || 1;
    let nextLevel = currentLevel;

    // STRICT DETERMINISTIC RULE-BASED ADAPTIVE ENGINE
    if (accuracy >= 80) {
      nextLevel = Math.min(4, currentLevel + 1); // Step up gently
    } else if (accuracy < 60) {
      nextLevel = Math.max(1, currentLevel - 1); // Offer more support
    }
    // 60-79% maintains current level for stabilization

    profile.currentLevel[activityCategory] = nextLevel;
    await profile.save();

    // Map supportive dignity-first feedback
    let supportiveFeedback = 'Consistent Participation';
    if (accuracy >= 80) {
      supportiveFeedback = 'Strong Performance & High Recall';
    } else if (accuracy < 60) {
      supportiveFeedback = 'Gentle Pacing & Supported Practice';
    }

    const session = await GameSession.create({
      elderlyId: profile._id,
      activityName,
      activityTitle: activityName,
      activityCategory,
      activityType: activityCategory,
      level: currentLevel,
      gameLevel: currentLevel,
      score,
      accuracy,
      responseTimeMs,
      durationSeconds: Math.round(responseTimeMs / 1000),
      attempts,
      hintsUsed,
      mistakes,
      completed: true,
      supportiveFeedback
    });

    // Broadcast session log to caregiver dashboard in real time
    broadcast({
      type: 'GAME_SESSION_LOGGED',
      data: {
        session,
        previousLevel: currentLevel,
        recommendedNextLevel: nextLevel,
        currentLevelState: profile.currentLevel
      }
    });

    // Real-Time Socket.IO emission to Caregiver Dashboard
    emitToCaregiver('caregiver:game-completed', {
      session,
      previousLevel: currentLevel,
      recommendedNextLevel: nextLevel,
      currentLevels: profile.currentLevel,
      profile
    });

    res.json({
      message: 'Performance logged to MongoDB',
      previousLevel: currentLevel,
      recommendedNextLevel: nextLevel,
      currentLevels: profile.currentLevel,
      session
    });
  } catch (err) {
    console.error('[Game Submit Error]', err);
    res.status(500).json({ error: 'Failed to record game session' });
  }
});

module.exports = router;
