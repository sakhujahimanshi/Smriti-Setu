const express = require('express');
const router = express.Router();
const ElderlyProfile = require('../models/ElderlyProfile');
const GameSession = require('../models/GameSession');
const VRSessionLog = require('../models/VRSessionLog');
const Memory = require('../models/Memory');

// GET /api/caregiver/progress — Aggregated longitudinal progress for Caregiver Dashboard
router.get('/progress', async (req, res) => {
  try {
    let profile = await ElderlyProfile.findOne();
    if (!profile) {
      profile = await ElderlyProfile.create({
        name: 'Biren Borah',
        age: 76,
        region: 'Jorhat, Assam',
        preferredLanguage: 'Assamese / English',
        currentLevel: { photoRecall: 1, nameRecall: 1, routineSequencing: 1 }
      });
    }

    const sessions = await GameSession.find({
      $or: [
        { elderlyId: profile._id },
        { elderlyId: null }
      ]
    }).sort({ createdAt: -1 }).limit(50);

    const vrLogs = await VRSessionLog.find().sort({ createdAt: -1 }).limit(20);
    const memories = await Memory.find().sort({ updatedAt: -1 });

    const totalSessions = sessions.length;
    const avgAccuracy = totalSessions > 0
      ? Math.round(sessions.reduce((acc, s) => acc + (s.accuracy || 100), 0) / totalSessions)
      : 85;

    let supportiveStatus = 'Consistent Engagement';
    if (avgAccuracy >= 80) {
      supportiveStatus = 'High Familiarity & Calm Recall';
    } else if (avgAccuracy < 60) {
      supportiveStatus = 'Pacing Recommended (Gentler Routine)';
    }

    res.json({
      profile,
      sessions,
      vrLogs,
      memories,
      metrics: {
        totalSessions,
        avgAccuracy,
        supportiveStatus,
        levels: profile.currentLevel || { photoRecall: 1, nameRecall: 1, routineSequencing: 1 }
      }
    });
  } catch (err) {
    console.error('[Caregiver Progress Error]', err);
    res.status(500).json({ error: 'Failed to fetch caregiver progress' });
  }
});

module.exports = router;
