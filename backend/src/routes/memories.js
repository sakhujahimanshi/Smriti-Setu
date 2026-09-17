const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory');
const ElderlyProfile = require('../models/ElderlyProfile');
const { broadcast } = require('../websocket');
const { emitToCaregiver, emitToElderly, emitToAll } = require('../socket');

// GET /api/memories/selected-session — Return only memories marked for the VR session
router.get('/selected-session', async (req, res) => {
  try {
    const memories = await Memory.find({
      $or: [
        { isSelectedForSession: true },
        { selectedForSession: true }
      ]
    }).sort({ updatedAt: -1 });

    res.json(memories);
  } catch (err) {
    console.error('[Selected Memories Error]', err);
    res.status(500).json({ error: 'Failed to fetch selected memories' });
  }
});

// GET /api/memories — List all memories with optional category filter
router.get('/', async (req, res) => {
  try {
    const { category, selectedOnly } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (selectedOnly === 'true') {
      query.$or = [
        { isSelectedForSession: true },
        { selectedForSession: true }
      ];
    }

    const memories = await Memory.find(query).sort({ updatedAt: -1 });
    res.json(memories);
  } catch (err) {
    console.error('[Get Memories Error]', err);
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// GET /api/memories/:id/preview — Spatial preview data for 4-second VR simulation
router.get('/:id/preview', async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    res.json({
      memoryId: memory._id,
      title: memory.title,
      photoUrl: memory.photoUrl || memory.imageUrl,
      category: memory.category,
      location: memory.location,
      questionPrompt: memory.questionPrompt || memory.vrPromptQuestion || 'Who is standing beside you in this photo?',
      hints: memory.hints || {
        tier1: 'This is someone very dear to your family.',
        tier2: 'Take a close look at their warm smile.'
      },
      spatialConfig: {
        roomTone: 'warm_sunrise',
        particleDensity: 120,
        frameElevationY: 1.6,
        ambientLighting: '#fffaed'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch preview data' });
  }
});

// GET /api/memories/:id — Get a single memory
router.get('/:id', async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }
    res.json(memory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch memory' });
  }
});

// POST /api/memories — Create a new personalized memory
router.post('/', async (req, res) => {
  try {
    const {
      title,
      imageUrl,
      photoUrl,
      videoUrl,
      audioUrl,
      category,
      people,
      associatedPeople,
      relationship,
      location,
      details,
      description,
      datePeriod,
      regionalContext,
      state,
      questionPrompt,
      vrPromptQuestion,
      expectedAnswers,
      hints
    } = req.body;

    const resolvedPhoto = photoUrl || imageUrl;
    if (!title || !resolvedPhoto) {
      return res.status(400).json({ error: 'Title and photoUrl / imageUrl are required' });
    }

    const profile = await ElderlyProfile.findOne();

    const newMemory = new Memory({
      elderlyId: profile ? profile._id : null,
      title,
      imageUrl: resolvedPhoto,
      photoUrl: resolvedPhoto,
      videoUrl: videoUrl || '',
      audioUrl: audioUrl || '',
      category: category || 'Family',
      people: Array.isArray(people) ? people : (people ? [people] : []),
      associatedPeople: Array.isArray(associatedPeople) ? associatedPeople : [],
      relationship: relationship || 'Family Member',
      location: location || '',
      details: details || description || '',
      description: description || details || '',
      datePeriod: datePeriod || '',
      regionalContext: regionalContext || 'NER',
      state: state || 'Assam',
      contextualCues: [details || description || title],
      questionPrompt: questionPrompt || vrPromptQuestion || 'Who is standing beside you in this photo?',
      vrPromptQuestion: vrPromptQuestion || questionPrompt || 'Who is standing beside you in this photo?',
      expectedAnswers: Array.isArray(expectedAnswers) ? expectedAnswers : (expectedAnswers ? [expectedAnswers] : []),
      hints: {
        tier1: hints?.tier1 || 'This is someone very dear to your family.',
        tier2: hints?.tier2 || 'Take a close look at their warm smile.'
      },
      status: 'Ready',
      isSelectedForSession: false,
      selectedForSession: false
    });

    const saved = await newMemory.save();

    // Broadcast memory update to all clients via WebSockets and Socket.IO
    broadcast({
      type: 'MEMORY_ADDED',
      memory: saved
    });
    emitToCaregiver('memory:created', saved);
    emitToAll('memory:created', saved);

    res.status(201).json(saved);
  } catch (err) {
    console.error('[Create Memory Error]', err);
    res.status(500).json({ error: err.message || 'Failed to create memory' });
  }
});

// PUT /api/memories/:id — Update existing memory
router.put('/:id', async (req, res) => {
  try {
    const updated = await Memory.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    broadcast({
      type: 'MEMORY_UPDATED',
      memory: updated
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update memory' });
  }
});

// DELETE /api/memories/:id — Delete memory
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Memory.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    broadcast({
      type: 'MEMORY_DELETED',
      memoryId: req.params.id
    });
    emitToAll('memory:deleted', { memoryId: req.params.id });

    res.json({ message: 'Memory deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

// PATCH /api/memories/:id/toggle-select — Toggle session playlist selection
router.patch('/:id/toggle-select', async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    const nextState = !(memory.isSelectedForSession || memory.selectedForSession);
    memory.isSelectedForSession = nextState;
    memory.selectedForSession = nextState;
    memory.status = nextState ? 'Selected' : 'Ready';
    await memory.save();

    broadcast({
      type: 'MEMORY_SELECTION_CHANGED',
      memoryId: memory._id,
      isSelectedForSession: memory.isSelectedForSession,
      selectedForSession: memory.selectedForSession,
      status: memory.status
    });

    // Real-Time Socket.IO emission to both caregiver and elderly
    emitToCaregiver('memory:selection-changed', memory);
    emitToElderly('memory:selection-changed', memory);
    emitToAll('memory:selection-changed', memory);

    res.json(memory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle selection' });
  }
});

// POST /api/memories/select-batch — Batch update selection
router.post('/select-batch', async (req, res) => {
  try {
    const { memoryIds, selectAll } = req.body;

    if (selectAll !== undefined) {
      await Memory.updateMany({}, {
        $set: {
          isSelectedForSession: !!selectAll,
          selectedForSession: !!selectAll,
          status: selectAll ? 'Selected' : 'Ready'
        }
      });
    } else if (Array.isArray(memoryIds)) {
      await Memory.updateMany({ _id: { $in: memoryIds } }, {
        $set: { isSelectedForSession: true, selectedForSession: true, status: 'Selected' }
      });
      await Memory.updateMany({ _id: { $nin: memoryIds } }, {
        $set: { isSelectedForSession: false, selectedForSession: false, status: 'Ready' }
      });
    }

    const all = await Memory.find().sort({ updatedAt: -1 });

    broadcast({
      type: 'MEMORIES_BATCH_UPDATED',
      memories: all
    });
    emitToAll('memories:batch-updated', all);

    res.json(all);
  } catch (err) {
    res.status(500).json({ error: 'Failed to batch update memories' });
  }
});

// POST /api/memories/:id/record-session — Log VR session telemetry and update insights
router.post('/:id/record-session', async (req, res) => {
  try {
    const { recallStatus, attempts, hintsDelivered, responseTimeSeconds, observationalNotes } = req.body;

    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    const sessionRecord = {
      playedAt: new Date(),
      recallStatus: recallStatus || 'Successful',
      attempts: attempts || 1,
      hintsDelivered: hintsDelivered || 0,
      responseTimeSeconds: responseTimeSeconds || 5.0,
      observationalNotes: observationalNotes || 'Comfortable engagement observed.'
    };

    memory.status = 'Played';
    memory.lastSessionInsights = {
      lastPlayedAt: sessionRecord.playedAt,
      recallStatus: sessionRecord.recallStatus,
      attempts: sessionRecord.attempts,
      hintsDelivered: sessionRecord.hintsDelivered,
      responseTimeSeconds: sessionRecord.responseTimeSeconds,
      observationalNotes: sessionRecord.observationalNotes
    };

    memory.lastSessionMetrics = {
      recallOutcome: sessionRecord.recallStatus,
      attempts: sessionRecord.attempts,
      hintUsed: sessionRecord.hintsDelivered > 0,
      responseTimeSec: sessionRecord.responseTimeSeconds,
      lastPlayedAt: sessionRecord.playedAt
    };

    memory.sessionHistory.push(sessionRecord);
    await memory.save();

    broadcast({
      type: 'MEMORY_SESSION_RECORDED',
      memoryId: memory._id,
      insights: memory.lastSessionInsights
    });

    emitToCaregiver('memory:session-recorded', {
      memoryId: memory._id,
      insights: memory.lastSessionInsights,
      lastSessionMetrics: memory.lastSessionMetrics,
      memory
    });
    emitToAll('memory:session-recorded', {
      memoryId: memory._id,
      insights: memory.lastSessionInsights,
      lastSessionMetrics: memory.lastSessionMetrics,
      memory
    });

    res.json(memory);
  } catch (err) {
    console.error('[Record Session Error]', err);
    res.status(500).json({ error: 'Failed to record session insights' });
  }
});

module.exports = router;
