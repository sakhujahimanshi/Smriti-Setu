const express = require('express');
const router = express.Router();
const ElderlyProfile = require('../models/ElderlyProfile');

// GET profile
router.get('/', async (req, res) => {
  try {
    let profile = await ElderlyProfile.findOne();
    if (!profile) {
      profile = await ElderlyProfile.create({
        name: 'Bhaben Baruah',
        honorific: 'Koka'
      });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update profile
router.put('/', async (req, res) => {
  try {
    let profile = await ElderlyProfile.findOne();
    if (!profile) {
      profile = new ElderlyProfile(req.body);
    } else {
      Object.assign(profile, req.body);
    }
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
