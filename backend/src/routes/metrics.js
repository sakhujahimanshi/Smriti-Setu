const express = require('express');
const router = express.Router();
const GameSession = require('../models/GameSession');
const Routine = require('../models/Routine');
const Reminder = require('../models/Reminder');
const FamilyMember = require('../models/FamilyMember');

// GET aggregated caregiver metrics
router.get('/', async (req, res) => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 86400000);

    const [recentSessions, routines, reminders, familyCount] = await Promise.all([
      GameSession.find({ createdAt: { $gte: oneWeekAgo } }).sort({ createdAt: -1 }),
      Routine.find(),
      Reminder.find(),
      FamilyMember.countDocuments()
    ]);

    // Calculate routine completion percentage
    let totalSteps = 0;
    let completedSteps = 0;
    routines.forEach(r => {
      if (r.steps && r.steps.length > 0) {
        totalSteps += r.steps.length;
        completedSteps += r.steps.filter(s => s.completed).length;
      }
    });
    const routineCompletionRate = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 100;

    // Reminders status
    const activeReminders = reminders.filter(r => r.isActive).length;
    const completedReminders = reminders.filter(r => r.isActive && r.isCompletedToday).length;

    // Engagement pace evaluation
    const sessionCount = recentSessions.length;
    let paceLabel = 'Consistent Participation';
    let comfortStatus = 'Comfortable & Unhurried';

    if (sessionCount >= 5) {
      paceLabel = 'Consistent Participation (Active)';
      comfortStatus = 'Relaxed & Joyful';
    } else if (sessionCount === 0) {
      paceLabel = 'Gentle Rest Period';
      comfortStatus = 'Needs a Gentler Pace';
    }

    // Favorite topics list
    const topicsMap = {};
    recentSessions.forEach(s => {
      const topic = s.favoriteTopicRevisited || 'Family Memories';
      topicsMap[topic] = (topicsMap[topic] || 0) + 1;
    });

    const topTopics = Object.entries(topicsMap)
      .sort((a, b) => b[1] - a[1])
      .map(([topic, count]) => ({ topic, count }));

    // Return strictly dignity-first caregiver metrics
    res.json({
      summary: {
        weeklySessionsCount: sessionCount,
        participationStatus: paceLabel,
        comfortLevel: comfortStatus,
        routineCompletionRate,
        totalRoutines: routines.length,
        completedSteps,
        totalSteps,
        activeReminders,
        completedReminders,
        registeredFamilyMembers: familyCount
      },
      topTopics,
      recentSessions: recentSessions.slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
