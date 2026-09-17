const mongoose = require('mongoose');

const FamilyMemberSchema = new mongoose.Schema({
  elderlyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ElderlyProfile',
    required: false
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  relation: {
    type: String,
    trim: true
  },
  relationship: {
    type: String,
    trim: true
  },
  culturalRelation: {
    type: String,
    default: 'Naati'
  },
  photoUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'
  },
  notes: {
    type: String,
    default: ''
  },
  memoryHook: {
    type: String,
    default: ''
  },
  voicePrompt: {
    type: String,
    default: ''
  },
  favoriteMemory: {
    type: String,
    default: ''
  },
  residence: {
    type: String,
    default: 'Guwahati, Assam'
  },
  recallChoices: [{
    type: String
  }],
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
FamilyMemberSchema.pre('save', function(next) {
  if (this.relationship && !this.relation) {
    this.relation = this.relationship;
  } else if (this.relation && !this.relationship) {
    this.relationship = this.relation;
  }
  if (!this.notes && this.memoryHook) {
    this.notes = this.memoryHook;
  } else if (!this.memoryHook && this.notes) {
    this.memoryHook = this.notes;
  }
  next();
});

module.exports = mongoose.model('FamilyMember', FamilyMemberSchema);
