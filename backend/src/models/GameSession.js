const mongoose = require('mongoose');

const GameSessionSchema = new mongoose.Schema({
  elderlyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ElderlyProfile',
    required: false
  },
  activityName: {
    type: String,
    trim: true
  },
  activityTitle: {
    type: String,
    trim: true
  },
  activityCategory: {
    type: String,
    trim: true
  },
  activityType: {
    type: String,
    trim: true
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 4
  },
  gameLevel: {
    type: Number,
    default: 1,
    min: 1,
    max: 4
  },
  score: {
    type: Number,
    default: 100
  },
  accuracy: {
    type: Number,
    default: 100
  },
  responseTimeMs: {
    type: Number,
    default: 0
  },
  durationSeconds: {
    type: Number,
    default: 0
  },
  attempts: {
    type: Number,
    default: 1
  },
  hintsUsed: {
    type: Number,
    default: 0
  },
  mistakes: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: true
  },
  needsReinforcement: {
    type: Boolean,
    default: false
  },
  contentRegion: {
    type: String,
    default: 'NER'
  },
  supportiveFeedback: {
    type: String,
    default: 'Consistent Participation' // Strictly non-diagnostic
  },
  favoriteTopicRevisited: {
    type: String,
    default: 'Family & Heritage'
  },
  itemsEngaged: {
    type: Number,
    default: 1
  },
  paceObservation: {
    type: String,
    default: 'Comfortable & Unhurried'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save synchronization hook
GameSessionSchema.pre('save', function(next) {
  if (this.activityName && !this.activityTitle) {
    this.activityTitle = this.activityName;
  } else if (this.activityTitle && !this.activityName) {
    this.activityName = this.activityTitle;
  }

  if (this.activityCategory && !this.activityType) {
    this.activityType = this.activityCategory;
  } else if (this.activityType && !this.activityCategory) {
    this.activityCategory = this.activityType;
  }

  if (this.level !== undefined && this.gameLevel !== this.level) {
    this.gameLevel = this.level;
  } else if (this.gameLevel !== undefined) {
    this.level = this.gameLevel;
  }

  if (this.responseTimeMs && !this.durationSeconds) {
    this.durationSeconds = Math.round(this.responseTimeMs / 1000);
  } else if (this.durationSeconds && !this.responseTimeMs) {
    this.responseTimeMs = this.durationSeconds * 1000;
  }

  next();
});

module.exports = mongoose.model('GameSession', GameSessionSchema);
