const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  elderlyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ElderlyProfile',
    required: false
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  photoUrl: {
    type: String,
    trim: true
  },
  videoUrl: {
    type: String,
    default: ''
  },
  audioUrl: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['People', 'Places', 'Events', 'Family', 'Childhood', 'Culture'],
    default: 'Family'
  },
  people: [{
    type: String,
    trim: true
  }],
  associatedPeople: [{
    name: String,
    relationship: String
  }],
  relationship: {
    type: String,
    trim: true,
    default: 'Family Member'
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  details: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  datePeriod: {
    type: String,
    trim: true,
    default: ''
  },
  regionalContext: {
    type: String,
    trim: true,
    default: 'NER'
  },
  state: {
    type: String,
    trim: true,
    default: 'Assam'
  },
  contextualCues: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['Ready', 'Selected', 'Played'],
    default: 'Ready'
  },
  isSelectedForSession: {
    type: Boolean,
    default: false
  },
  selectedForSession: {
    type: Boolean,
    default: false
  },
  questionPrompt: {
    type: String,
    default: 'Who is standing beside you in this photo?'
  },
  vrPromptQuestion: {
    type: String,
    default: 'Who is standing beside you in this photo?'
  },
  expectedAnswers: [{
    type: String,
    trim: true
  }],
  hints: {
    tier1: {
      type: String,
      default: 'This is someone very dear to your family.'
    },
    tier2: {
      type: String,
      default: 'Take a close look at their warm smile.'
    }
  },
  lastSessionInsights: {
    lastPlayedAt: {
      type: Date,
      default: null
    },
    recallStatus: {
      type: String,
      default: 'Not played yet'
    },
    attempts: {
      type: Number,
      default: 0
    },
    hintsDelivered: {
      type: Number,
      default: 0
    },
    responseTimeSeconds: {
      type: Number,
      default: 0
    },
    observationalNotes: {
      type: String,
      default: ''
    }
  },
  lastSessionMetrics: {
    recallOutcome: {
      type: String,
      enum: ['Successful', 'Needed assistance', 'Pending', 'Not played yet'],
      default: 'Pending'
    },
    attempts: {
      type: Number,
      default: 0
    },
    hintUsed: {
      type: Boolean,
      default: false
    },
    responseTimeSec: {
      type: Number,
      default: 0
    },
    lastPlayedAt: {
      type: Date,
      default: null
    }
  },
  sessionHistory: [{
    playedAt: {
      type: Date,
      default: Date.now
    },
    recallStatus: String,
    attempts: Number,
    hintsDelivered: Number,
    responseTimeSeconds: Number,
    observationalNotes: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save synchronization hook for dual-field compatibility
memorySchema.pre('save', function(next) {
  // Sync imageUrl and photoUrl
  if (this.photoUrl && !this.imageUrl) {
    this.imageUrl = this.photoUrl;
  } else if (this.imageUrl && !this.photoUrl) {
    this.photoUrl = this.imageUrl;
  }

  // Sync details and description
  if (this.description && !this.details) {
    this.details = this.description;
  } else if (this.details && !this.description) {
    this.description = this.details;
  }

  // Sync prompt questions
  if (this.vrPromptQuestion && !this.questionPrompt) {
    this.questionPrompt = this.vrPromptQuestion;
  } else if (this.questionPrompt && !this.vrPromptQuestion) {
    this.vrPromptQuestion = this.questionPrompt;
  }

  // Sync selection flags
  if (this.selectedForSession !== undefined && this.isSelectedForSession !== this.selectedForSession) {
    this.isSelectedForSession = this.selectedForSession;
  } else if (this.isSelectedForSession !== undefined) {
    this.selectedForSession = this.isSelectedForSession;
  }

  // Sync contextualCues with details if empty
  if ((!this.contextualCues || this.contextualCues.length === 0) && this.details) {
    this.contextualCues = [this.details];
  }

  // Sync status
  if (this.isSelectedForSession || this.selectedForSession) {
    if (this.status !== 'Played') {
      this.status = 'Selected';
    }
  } else if (this.status === 'Selected') {
    this.status = 'Ready';
  }

  next();
});

module.exports = mongoose.model('Memory', memorySchema);
