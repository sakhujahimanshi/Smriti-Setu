const express = require('express');
const router = express.Router();
const Routine = require('../models/Routine');

// GET all routines
router.get('/', async (req, res) => {
  try {
    const routines = await Routine.find().sort({ orderIndex: 1, createdAt: 1 });
    res.json(routines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new routine
router.post('/', async (req, res) => {
  try {
    const count = await Routine.countDocuments();
    const newRoutine = new Routine({
      ...req.body,
      orderIndex: req.body.orderIndex || count + 1
    });
    await newRoutine.save();
    res.status(201).json(newRoutine);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update routine
router.put('/:id', async (req, res) => {
  try {
    const updated = await Routine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Routine not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH toggle step completion
router.patch('/:id/step/:stepIndex', async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);
    if (!routine) return res.status(404).json({ error: 'Routine not found' });

    const stepIndex = parseInt(req.params.stepIndex, 10);
    if (stepIndex < 0 || stepIndex >= routine.steps.length) {
      return res.status(400).json({ error: 'Invalid step index' });
    }

    // Toggle or set completion
    if (typeof req.body.completed === 'boolean') {
      routine.steps[stepIndex].completed = req.body.completed;
    } else {
      routine.steps[stepIndex].completed = !routine.steps[stepIndex].completed;
    }

    await routine.save();
    res.json(routine);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST reset steps for day
router.post('/:id/reset', async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);
    if (!routine) return res.status(404).json({ error: 'Routine not found' });

    routine.steps.forEach(s => { s.completed = false; });
    await routine.save();
    res.json(routine);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE routine
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Routine.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Routine not found' });
    res.json({ message: 'Routine removed successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
