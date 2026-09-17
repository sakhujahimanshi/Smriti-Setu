const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');

// GET all reminders
router.get('/', async (req, res) => {
  try {
    const reminders = await Reminder.find().sort({ time: 1 });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new reminder
router.post('/', async (req, res) => {
  try {
    const reminder = new Reminder(req.body);
    await reminder.save();
    res.status(201).json(reminder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update reminder
router.put('/:id', async (req, res) => {
  try {
    const updated = await Reminder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Reminder not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH toggle completion
router.patch('/:id/toggle', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });

    if (req.body.isCompletedToday !== undefined) {
      reminder.isCompletedToday = req.body.isCompletedToday;
    } else if (req.body.isActive !== undefined) {
      reminder.isActive = req.body.isActive;
    } else {
      reminder.isCompletedToday = !reminder.isCompletedToday;
    }

    await reminder.save();
    res.json(reminder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE reminder
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Reminder.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Reminder not found' });
    res.json({ message: 'Reminder removed successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
