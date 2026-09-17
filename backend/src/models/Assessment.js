const mongoose = require('mongoose');

const AssessmentQuestionSchema = new mongoose.Schema({
  questionId: { type: String, required: true, unique: true },
  category: { 
    type: String, 
    enum: ['identity', 'family', 'location', 'emergency', 'culture', 'custom'],
    default: 'identity'
  },
  questionText: {
    en: { type: String, required: true },
    as: { type: String, default: '' },
    bn: { type: String, default: '' },
    ne: { type: String, default: '' }
  },
  expectedAnswers: [{ type: String, required: true }],
  importance: { type: String, enum: ['high', 'standard'], default: 'standard' },
  orderIndex: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const AssessmentLogSchema = new mongoose.Schema({
  elderlyId: { type: String, default: 'elderly_bhaben_01' },
  date: { type: String, required: true },
  timestamp: { type: Number, default: () => Date.now() },
  totalQuestions: { type: Number, required: true },
  score: { type: Number, required: true },
  accuracy: { type: Number, required: true }, // 0 to 100
  answers: [{
    questionId: String,
    questionText: String,
    userAnswer: String,
    isCorrect: Boolean,
    correctProvided: String,
    method: { type: String, enum: ['voice', 'text'], default: 'text' }
  }],
  forgetfulnessTrend: {
    type: String,
    enum: ['stable', 'increasing', 'mild_decline'],
    default: 'stable'
  },
  frequency: {
    type: String,
    enum: ['once_daily', 'twice_daily', 'thrice_daily'],
    default: 'once_daily'
  }
}, { timestamps: true });

const AssessmentQuestion = mongoose.model('AssessmentQuestion', AssessmentQuestionSchema);
const AssessmentLog = mongoose.model('AssessmentLog', AssessmentLogSchema);

module.exports = {
  AssessmentQuestion,
  AssessmentLog
};
