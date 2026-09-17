const express = require('express');
const router = express.Router();
const GameSession = require('../models/GameSession');

// Helper to strictly sanitize language to dignity-first feedback
function sanitizeDignityLanguage(text) {
  if (!text) return 'Consistent Participation';
  const lower = text.toLowerCase();
  // Filter out any clinical / diagnostic / negative buzzwords
  const banned = ['dementia', 'mci', 'mild cognitive', 'impairment', 'score', 'failed', 'deteriorat', 'stage'];
  for (const b of banned) {
    if (lower.includes(b)) {
      return 'Needs a Gentler Pace';
    }
  }
  return text;
}

// GET all sessions
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const sessions = await GameSession.find().sort({ createdAt: -1 }).limit(limit);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new session
router.post('/', async (req, res) => {
  try {
    const sessionData = {
      activityType: req.body.activityType || 'cultural_reminiscence',
      activityTitle: req.body.activityTitle || 'Engagement Session',
      durationSeconds: parseInt(req.body.durationSeconds, 10) || 180,
      gameLevel: Math.max(1, Math.min(4, parseInt(req.body.gameLevel, 10) || 1)),
      attempts: parseInt(req.body.attempts, 10) || 1,
      hintsUsed: parseInt(req.body.hintsUsed, 10) || 0,
      needsReinforcement: Boolean(req.body.needsReinforcement),
      contentRegion: req.body.contentRegion || 'NER',
      supportiveFeedback: sanitizeDignityLanguage(req.body.supportiveFeedback),
      favoriteTopicRevisited: req.body.favoriteTopicRevisited || 'Family Memories & Heritage',
      itemsEngaged: parseInt(req.body.itemsEngaged, 10) || 1,
      paceObservation: req.body.paceObservation || 'Comfortable & Unhurried'
    };

    const session = new GameSession(sessionData);
    await session.save();

    const { broadcast } = require('../websocket');
    if (typeof broadcast === 'function') {
      broadcast({
        type: 'SESSION_COMPLETED',
        session
      });
    }

    // Real-time broadcast to Caregiver Dashboard (Zero Page Reload)
    const io = req.app.get('io');
    if (io) {
      io.to('room:caregiver').emit('caregiver:session-completed', { session });
      io.emit('caregiver:game-completed', { session });
      io.emit('caregiver:session-completed', { session });
    }

    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
