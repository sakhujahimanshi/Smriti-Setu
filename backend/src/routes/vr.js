const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory');
const VRSessionLog = require('../models/VRSessionLog');
const ElderlyProfile = require('../models/ElderlyProfile');
const { broadcast } = require('../websocket');
const { emitToCaregiver, emitToAll } = require('../socket');

// POST /api/vr/telemetry — Ingest real-time telemetry from VR client & broadcast to caregiver
router.post('/telemetry', async (req, res) => {
  try {
    const {
      memoryId,
      memoryTitle,
      attempts = 1,
      hintsDelivered = 0,
      responseTimeSec = 0,
      status = 'Responding',
      isCorrect = true,
      userVoiceTranscript = ''
    } = req.body;

    const payload = {
      type: 'VR_TELEMETRY_UPDATE',
      data: {
        memoryId,
        memoryTitle: memoryTitle || 'Personal Memory',
        attempts,
        hintsDelivered,
        responseTimeSec,
        status,
        isCorrect,
        userVoiceTranscript,
        timestamp: new Date()
      }
    };

    // Broadcast to WebSocket clients and Socket.IO caregiver room
    broadcast(payload);
    emitToCaregiver('caregiver:live-telemetry', payload.data);

    res.json({
      success: true,
      message: 'Telemetry broadcasted and processed',
      telemetry: payload.data
    });
  } catch (err) {
    console.error('[VR Telemetry Error]', err);
    res.status(500).json({ error: 'Failed to process VR telemetry' });
  }
});

// POST /api/vr/session-complete — Log final VR session outcome and update memory record
router.post('/session-complete', async (req, res) => {
  try {
    const {
      memoryId,
      memoryTitle,
      attempts = 1,
      hintsDelivered = 0,
      responseTimeSec = 0,
      isCorrect = true,
      userVoiceTranscript = '',
      observationalNotes = 'Comfortable engagement observed'
    } = req.body;

    // 1. Find profile for reference
    const profile = await ElderlyProfile.findOne();

    // 2. Persist VRSessionLog document
    const sessionLog = new VRSessionLog({
      elderlyId: profile ? profile._id : null,
      memoryId: memoryId || null,
      memoryTitle: memoryTitle || 'Personal Memory',
      attempts,
      hintsDelivered,
      userVoiceTranscript,
      isCorrect,
      responseTimeSec,
      status: 'Completed',
      timestamp: new Date()
    });
    await sessionLog.save();

    // 3. Update Memory document if memoryId provided
    let updatedMemory = null;
    if (memoryId) {
      updatedMemory = await Memory.findById(memoryId);
      if (updatedMemory) {
        const recallOutcome = isCorrect && attempts <= 2 ? 'Successful' : 'Needed assistance';

        updatedMemory.status = 'Played';
        updatedMemory.lastSessionMetrics = {
          recallOutcome,
          attempts,
          hintUsed: hintsDelivered > 0,
          responseTimeSec,
          lastPlayedAt: new Date()
        };

        updatedMemory.lastSessionInsights = {
          lastPlayedAt: new Date(),
          recallStatus: recallOutcome,
          attempts,
          hintsDelivered,
          responseTimeSeconds: responseTimeSec,
          observationalNotes
        };

        updatedMemory.sessionHistory.push({
          playedAt: new Date(),
          recallStatus: recallOutcome,
          attempts,
          hintsDelivered,
          responseTimeSeconds: responseTimeSec,
          observationalNotes
        });

        await updatedMemory.save();
      }
    }

    // 4. Broadcast completion event to caregiver dashboard
    broadcast({
      type: 'VR_SESSION_COMPLETE',
      data: {
        sessionLog,
        memory: updatedMemory
      }
    });
    emitToCaregiver('caregiver:vr-completed', { sessionLog, memory: updatedMemory });
    emitToCaregiver('caregiver:session-completed', { sessionLog, memory: updatedMemory, type: 'vr' });

    res.json({
      message: 'VR Session successfully completed and persisted in MongoDB',
      sessionLog,
      memory: updatedMemory
    });
  } catch (err) {
    console.error('[VR Session Complete Error]', err);
    res.status(500).json({ error: 'Failed to complete VR session in MongoDB' });
  }
});

// GET /api/vr/sessions — Return historical VR sessions from MongoDB
router.get('/sessions', async (req, res) => {
  try {
    const logs = await VRSessionLog.find().sort({ timestamp: -1 }).limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve VR session logs' });
  }
});

module.exports = router;
