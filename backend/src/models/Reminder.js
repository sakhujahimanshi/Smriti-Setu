const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
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
  time: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  isCompletedToday: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    default: 'Medication'
  },
  voiceText: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  recurrence: {
    type: String,
    default: 'Daily'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

ReminderSchema.pre('save', function(next) {
  if (this.completed !== undefined && this.isCompletedToday !== this.completed) {
    this.isCompletedToday = this.completed;
  } else if (this.isCompletedToday !== undefined) {
    this.completed = this.isCompletedToday;
  }
  next();
});

module.exports = mongoose.model('Reminder', ReminderSchema);
