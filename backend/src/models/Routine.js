const mongoose = require('mongoose');

const RoutineSchema = new mongoose.Schema({
  elderlyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ElderlyProfile',
    required: false
  },
  name: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    trim: true
  },
  time: {
    type: String,
    default: '08:00 AM'
  },
  approxTime: {
    type: String,
    default: '08:00 AM'
  },
  period: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening', 'Night'],
    default: 'Morning'
  },
  culturalNote: {
    type: String,
    default: ''
  },
  // Flexible steps: can store strings or step objects
  steps: [{
    type: mongoose.Schema.Types.Mixed
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  orderIndex: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save synchronization hook
RoutineSchema.pre('save', function(next) {
  if (this.name && !this.title) {
    this.title = this.name;
  } else if (this.title && !this.name) {
    this.name = this.title;
  }
  if (this.approxTime && !this.time) {
    this.time = this.approxTime;
  } else if (this.time && !this.approxTime) {
    this.approxTime = this.time;
  }
  next();
});

module.exports = mongoose.model('Routine', RoutineSchema);
