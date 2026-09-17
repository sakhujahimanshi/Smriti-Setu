const mongoose = require('mongoose');

const VRSessionLogSchema = new mongoose.Schema({
  elderlyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ElderlyProfile',
    required: false
  },
  memoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Memory',
    required: false
  },
  memoryTitle: {
    type: String,
    required: true,
    trim: true
  },
  attempts: {
    type: Number,
    default: 1
  },
  hintsDelivered: {
    type: Number,
    default: 0
  },
  userVoiceTranscript: {
    type: String,
    default: ''
  },
  isCorrect: {
    type: Boolean,
    default: true
  },
  responseTimeSec: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Viewing', 'Responding', 'Assistance needed', 'Completed'],
    default: 'Completed'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('VRSessionLog', VRSessionLogSchema);
