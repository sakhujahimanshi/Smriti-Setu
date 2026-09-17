const express = require('express');
const router = express.Router();
const os = require('os');
const seedData = require('../seed');
const ElderlyProfile = require('../models/ElderlyProfile');
const FamilyMember = require('../models/FamilyMember');
const Routine = require('../models/Routine');
const Reminder = require('../models/Reminder');
const GameSession = require('../models/GameSession');

// Helper to get local network IP
function getLocalNetworkIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      // IPv4 and non-internal
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

// GET system network info
router.get('/network', (req, res) => {
  const lanIp = getLocalNetworkIp();
  res.json({
    lanIp,
    caregiverAppUrl: `http://${lanIp}:3000`,
    elderlySiteUrl: `http://${lanIp}:3001`,
    backendApiUrl: `http://${lanIp}:5000`,
    localhostUrls: {
      caregiver: 'http://localhost:3000',
      elderly: 'http://localhost:3001',
      backend: 'http://localhost:5000',
      aiProxy: 'http://localhost:8000'
    }
  });
});

// POST reset and reseed demo data (fail-safe for demo)
router.post('/reset-demo', async (req, res) => {
  try {
    await Promise.all([
      ElderlyProfile.deleteMany({}),
      FamilyMember.deleteMany({}),
      Routine.deleteMany({}),
      Reminder.deleteMany({}),
      GameSession.deleteMany({})
    ]);

    await seedData();
    res.json({ success: true, message: 'Smriti Setu demo data reseeded successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
