const express = require('express');
const router = express.Router();
const FamilyMember = require('../models/FamilyMember');

// GET all family members
router.get('/', async (req, res) => {
  try {
    const members = await FamilyMember.find().sort({ orderIndex: 1, createdAt: 1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single family member
router.get('/:id', async (req, res) => {
  try {
    const member = await FamilyMember.findById(req.params.id);
    if (!member) return res.status(404).json({ error: 'Family member not found' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new family member
router.post('/', async (req, res) => {
  try {
    const count = await FamilyMember.countDocuments();
    const newMember = new FamilyMember({
      ...req.body,
      orderIndex: req.body.orderIndex || count + 1
    });
    // Ensure recallChoices includes correct name/relation if empty
    if (!newMember.recallChoices || newMember.recallChoices.length === 0) {
      newMember.recallChoices = [
        `${newMember.name} (${newMember.relation})`,
        'Family Friend',
        'Cousin'
      ];
    }
    await newMember.save();
    res.status(201).json(newMember);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update family member
router.put('/:id', async (req, res) => {
  try {
    const updated = await FamilyMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Family member not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE family member
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await FamilyMember.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Family member not found' });
    res.json({ message: 'Family member removed successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
