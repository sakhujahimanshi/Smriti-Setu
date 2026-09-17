const express = require('express');
const router = express.Router();
const { AssessmentQuestion, AssessmentLog } = require('../models/Assessment');
const ElderlyProfile = require('../models/ElderlyProfile');

// Default culturally authentic 6 curated daily memory assessment questions
const DEFAULT_QUESTIONS = [
  {
    questionId: 'q_user_name',
    category: 'identity',
    questionText: {
      en: 'What is your full name?',
      as: 'আপোনাৰ সম্পূৰ্ণ নাম কি?',
      bn: 'আপনার পুরো নাম কি?',
      ne: 'तपाईंको पूरा नाम के हो?'
    },
    expectedAnswers: ['Bhaben Baruah', 'Bhaben', 'Koka', 'Bhaben Barua', 'ভবেন বৰুৱা', 'ভবেন'],
    importance: 'high',
    orderIndex: 1,
    active: true
  },
  {
    questionId: 'q_spouse_name',
    category: 'family',
    questionText: {
      en: "What is your spouse's (wife's) name?",
      as: 'আপোনাৰ সহধৰ্মিণীৰ (পত্নীৰ) নাম কি?',
      bn: 'আপনার সহধর্মিণীর (স্ত্রীর) নাম কি?',
      ne: 'तपाईंको श्रीमतीको नाम के हो?'
    },
    expectedAnswers: ['Pratima', 'Pratima Baruah', 'Aita Pratima', 'প্ৰতিমা', 'প্ৰতিমা বৰুৱা', 'प्रतिमा'],
    importance: 'high',
    orderIndex: 2,
    active: true
  },
  {
    questionId: 'q_child_name',
    category: 'family',
    questionText: {
      en: "What is your granddaughter's or daughter's name?",
      as: 'আপোনাৰ নাতিনী বা জীয়াৰীৰ নাম কি?',
      bn: 'আপনার নাতনি বা মেয়ের নাম কি?',
      ne: 'तपाईंकी नातिनी वा छोरीको नाम के हो?'
    },
    expectedAnswers: ['Ananya', 'Dr. Ananya Sarma', 'Ananya Sarma', 'অনন্যা', 'অনন্যা শৰ্মা', 'अनन्या'],
    importance: 'high',
    orderIndex: 3,
    active: true
  },
  {
    questionId: 'q_location',
    category: 'location',
    questionText: {
      en: 'Where do you currently live?',
      as: 'আপুনি বৰ্তমান ক’ত থাকে?',
      bn: 'আপনি বর্তমানে কোথায় থাকেন?',
      ne: 'तपाईं हाल कहाँ बस्नुहुन्छ?'
    },
    expectedAnswers: ['Beltola', 'Guwahati', 'Beltola Guwahati', 'বেলেতলা', 'গুৱাহাটী', 'বেলতলা', 'गुवाहाटी'],
    importance: 'high',
    orderIndex: 4,
    active: true
  },
  {
    questionId: 'q_guardian_phone',
    category: 'emergency',
    questionText: {
      en: "What is your family caregiver or guardian's phone number?",
      as: 'আপোনাৰ তত্ত্বাৱধায়ক বা পৰিয়ালৰ ফোন নম্বৰ কি?',
      bn: 'আপনার অভিভাবক বা পরিবারের ফোন নম্বর কি?',
      ne: 'तपाईंको हेरचाहकर्ता वा अभिभावकको फोन नम्बर के हो?'
    },
    expectedAnswers: ['9876543210', '98765 43210', '+91 98765 43210', '+919876543210', '98765-43210'],
    importance: 'high',
    orderIndex: 5,
    active: true
  },
  {
    questionId: 'q_hometown',
    category: 'culture',
    questionText: {
      en: 'In which town or district of Assam did you grow up?',
      as: 'আপুনি অসমৰ কোনখন চহৰ বা জিলাত ডাঙৰ-দীঘল হৈছিল?',
      bn: 'আপনি আসামের কোন শহরে বা জেলায় বড় হয়েছেন?',
      ne: 'तपाईं असमको कुन सहर वा जिल्लामा हुर्कनुभएको हो?'
    },
    expectedAnswers: ['Jorhat', 'Sivasagar', 'যোৰহাট', 'শিৱসাগৰ', 'জোড়হাট', 'जोरहाट'],
    importance: 'standard',
    orderIndex: 6,
    active: true
  }
];

// Helper: Seed default questions if collection is empty
async function ensureDefaultQuestions() {
  try {
    const count = await AssessmentQuestion.countDocuments();
    if (count === 0) {
      await AssessmentQuestion.insertMany(DEFAULT_QUESTIONS);
      console.log('✅ [Assessment] Seeded default curated assessment questions.');
    }
  } catch (err) {
    console.warn('Assessment seeding notice:', err.message);
  }
}

// 1. GET active questions
router.get('/questions', async (req, res) => {
  try {
    await ensureDefaultQuestions();
    const questions = await AssessmentQuestion.find({ active: true }).sort({ orderIndex: 1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. PUT update / customize questions (Caregiver Control)
router.put('/questions', async (req, res) => {
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions)) {
      return res.status(400).json({ error: 'Questions must be an array' });
    }

    // Upsert or replace
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const questionId = q.questionId || `custom_q_${Date.now()}_${i}`;
      
      let expected = q.expectedAnswers;
      if (typeof expected === 'string') {
        expected = expected.split(',').map(s => s.trim()).filter(Boolean);
      }

      await AssessmentQuestion.findOneAndUpdate(
        { questionId },
        {
          questionId,
          category: q.category || 'custom',
          questionText: typeof q.questionText === 'object' ? q.questionText : { en: String(q.questionText || '') },
          expectedAnswers: Array.isArray(expected) ? expected : [String(expected)],
          importance: q.importance || 'standard',
          orderIndex: q.orderIndex || i + 1,
          active: q.active !== false
        },
        { upsert: true, new: true }
      );
    }

    const updatedList = await AssessmentQuestion.find().sort({ orderIndex: 1 });

    const io = req.app.get('io');
    if (io) {
      io.emit('assessment:questions-updated', { questions: updatedList });
    }

    res.json({ message: 'Questions updated successfully', questions: updatedList });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: Normalize answer for comparison
function normalizeAnswer(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/[+.,!?'"()\-–—_]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

// 3. POST validate single answer
router.post('/validate', async (req, res) => {
  try {
    const { questionId, userAnswer, lang = 'en' } = req.body;
    if (!questionId) {
      return res.status(400).json({ error: 'questionId is required' });
    }

    const question = await AssessmentQuestion.findOne({ questionId });
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const normalizedUser = normalizeAnswer(userAnswer);
    const expectedList = question.expectedAnswers || [];

    // Check if user answer matches any expected answer
    let isCorrect = false;
    for (const exp of expectedList) {
      const normExp = normalizeAnswer(exp);
      if (normalizedUser === normExp || normalizedUser.includes(normExp) || normExp.includes(normalizedUser)) {
        isCorrect = true;
        break;
      }
    }

    const primaryExpected = expectedList[0] || '';

    // Dignified polite response messages
    const affirmations = {
      en: "Wonderful! That's completely correct.",
      as: "বৰ ধুনীয়া! একেবাৰে সঠিক উত্তৰ।",
      bn: "দারুণ! একদম সঠিক উত্তর।",
      ne: "धेरै राम्रो! ठिक उत्तर।"
    };

    const politeCorrections = {
      en: `That's completely fine! The correct answer is: ${primaryExpected}. Let's continue together.`,
      as: `একো কথা নাই, ইয়াৰ সঠিক উত্তৰটো হ'ল: ${primaryExpected}। আহক আমি শান্তভাৱে আগবাঢ়োঁ।`,
      bn: `কোনো অসুবিধা নেই, সঠিক উত্তরটি হলো: ${primaryExpected}। আসুন আমরা একসাথে এগিয়ে যাই।`,
      ne: `केही छैन, यसको सही उत्तर हो: ${primaryExpected}। आउनुहोस्, हामी अगाडि बढौँ।`
    };

    const message = isCorrect
      ? (affirmations[lang] || affirmations.en)
      : (politeCorrections[lang] || politeCorrections.en);

    res.json({
      isCorrect,
      expectedAnswer: primaryExpected,
      politeMessage: message,
      questionId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. POST submit complete assessment session & run AI Trend Tracking
router.post('/submit', async (req, res) => {
  try {
    const { answers = [], totalQuestions = 5, score = 0 } = req.body;
    const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const todayStr = new Date().toISOString().split('T')[0];

    // Fetch past 5 assessment logs to evaluate trend
    const recentLogs = await AssessmentLog.find().sort({ createdAt: -1 }).limit(5);

    // AI Trend Tracking Logic:
    // If recent scores show a declining trend or current accuracy < 70%, escalate frequency
    let forgetfulnessTrend = 'stable';
    let newFrequency = 'once_daily';

    const recentAccuracies = recentLogs.map(l => l.accuracy);
    recentAccuracies.unshift(accuracy);

    const avgAccuracy = recentAccuracies.reduce((a, b) => a + b, 0) / recentAccuracies.length;

    if (accuracy < 60 || (recentAccuracies.length >= 2 && recentAccuracies[0] < recentAccuracies[1] && accuracy < 75)) {
      forgetfulnessTrend = 'increasing';
      newFrequency = 'twice_daily';
      if (accuracy < 40) {
        newFrequency = 'thrice_daily';
      }
    } else if (avgAccuracy < 70) {
      forgetfulnessTrend = 'mild_decline';
      newFrequency = 'twice_daily';
    } else {
      forgetfulnessTrend = 'stable';
      newFrequency = 'once_daily';
    }

    const log = new AssessmentLog({
      date: todayStr,
      timestamp: Date.now(),
      totalQuestions: totalQuestions || answers.length,
      score,
      accuracy,
      answers,
      forgetfulnessTrend,
      frequency: newFrequency
    });
    await log.save();

    // Update ElderlyProfile with assessment status
    await ElderlyProfile.findOneAndUpdate(
      {},
      {
        $set: {
          'assessmentConfig.lastCompletedAt': new Date(),
          'assessmentConfig.frequency': newFrequency,
          'assessmentConfig.latestTrend': forgetfulnessTrend,
          'assessmentConfig.latestAccuracy': accuracy
        }
      }
    );

    // Real-time broadcast to Caregiver Dashboard via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to('room:caregiver').emit('caregiver:assessment-completed', {
        log,
        forgetfulnessTrend,
        frequency: newFrequency
      });
      io.emit('caregiver:assessment-completed', {
        log,
        forgetfulnessTrend,
        frequency: newFrequency
      });

      if (forgetfulnessTrend === 'increasing' || newFrequency !== 'once_daily') {
        const alertPayload = {
          type: 'ASSESSMENT_ESCALATION',
          title: 'Assessment Frequency Increased by AI',
          message: `Accuracy dropped to ${accuracy}%. AI detected increasing forgetfulness trend and escalated assessment to ${newFrequency.replace('_', ' ')}.`,
          accuracy,
          frequency: newFrequency,
          timestamp: Date.now()
        };
        io.to('room:caregiver').emit('caregiver:assessment-alert', alertPayload);
        io.emit('caregiver:assessment-alert', alertPayload);
      }
    }

    res.status(201).json({
      success: true,
      log,
      forgetfulnessTrend,
      frequency: newFrequency
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. GET assessment history logs
router.get('/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 15;
    const logs = await AssessmentLog.find().sort({ createdAt: -1 }).limit(limit);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. GET assessment status (checks if gate is active)
router.get('/status', async (req, res) => {
  try {
    const latestLog = await AssessmentLog.findOne().sort({ createdAt: -1 });
    const currentHour = new Date().getHours();

    let isRequired = true;
    let frequency = 'once_daily';
    let trend = 'stable';

    if (latestLog) {
      frequency = latestLog.frequency || 'once_daily';
      trend = latestLog.forgetfulnessTrend || 'stable';

      const timeSinceLastMs = Date.now() - latestLog.timestamp;
      const hoursSinceLast = timeSinceLastMs / (1000 * 60 * 60);

      if (frequency === 'once_daily') {
        // Once per day: required if > 14 hours since last or calendar date changed
        const todayStr = new Date().toISOString().split('T')[0];
        isRequired = latestLog.date !== todayStr;
      } else if (frequency === 'twice_daily') {
        // Twice daily: required if > 5 hours since last
        isRequired = hoursSinceLast >= 5;
      } else if (frequency === 'thrice_daily') {
        // Thrice daily: required if > 3 hours since last
        isRequired = hoursSinceLast >= 3;
      }
    }

    res.json({
      isRequired,
      frequency,
      trend,
      lastCompletedAt: latestLog ? latestLog.createdAt : null,
      lastAccuracy: latestLog ? latestLog.accuracy : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. POST reset assessment gate (Force trigger gate on elderly tablet)
router.post('/reset', async (req, res) => {
  try {
    // Delete the logs so isRequired immediately becomes true
    await AssessmentLog.deleteMany({});
    
    // Broadcast to elderly site to immediately trigger gate
    const io = req.app.get('io');
    if (io) {
      io.emit('assessment:force-gate', { required: true });
    }

    const { broadcast } = require('../websocket');
    if (typeof broadcast === 'function') {
      broadcast({ type: 'ASSESSMENT_FORCE_GATE', required: true });
    }

    res.json({ success: true, message: 'Assessment gate reset. Elderly tablet is now locked with mandatory check-in.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
