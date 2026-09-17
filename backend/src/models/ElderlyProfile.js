const mongoose = require('mongoose');

const ElderlyProfileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'Bhaben Baruah'
  },
  age: {
    type: Number,
    default: 76
  },
  preferredLanguage: {
    type: String,
    default: 'Assamese / English'
  },
  region: {
    type: String,
    default: 'Jorhat, Assam'
  },
  interests: [{
    type: String
  }],
  currentLevel: {
    photoRecall: {
      type: Number,
      default: 1,
      min: 1,
      max: 4
    },
    nameRecall: {
      type: Number,
      default: 1,
      min: 1,
      max: 4
    },
    routineSequencing: {
      type: Number,
      default: 1,
      min: 1,
      max: 4
    }
  },
  honorific: {
    type: String,
    default: 'Koka'
  },
  greetingTitle: {
    type: String,
    default: 'Suprabhat'
  },
  hometown: {
    type: String,
    default: 'Sivasagar, Assam'
  },
  currentResidence: {
    type: String,
    default: 'Beltola, Guwahati'
  },
  primaryLanguage: {
    type: String,
    default: 'Assamese'
  },
  secondaryLanguage: {
    type: String,
    default: 'English'
  },
  culturalInterests: [{
    type: String,
    default: ['Rongali Bihu', 'Brahmaputra Boat Cruises', 'Majuli Mask Making', 'Assam Orthodox Tea', 'Naam-Ghor Prayers']
  }],
  comfortNotes: {
    type: String,
    default: 'Loves hearing about the old tea gardens in Jorhat and listening to gentle dhol rhythms. Prefers slow, peaceful interactions.'
  },
  emergencyContact: {
    name: { type: String, default: 'Deepak Baruah (Son)' },
    relation: { type: String, default: 'Son' },
    phone: { type: String, default: '+91 98640 12345' }
  },
  avatarUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save synchronization hook
ElderlyProfileSchema.pre('save', function(next) {
  if ((!this.interests || this.interests.length === 0) && this.culturalInterests?.length > 0) {
    this.interests = this.culturalInterests;
  }
  if (!this.currentLevel) {
    this.currentLevel = { photoRecall: 1, nameRecall: 1, routineSequencing: 1 };
  }
  next();
});

module.exports = mongoose.model('ElderlyProfile', ElderlyProfileSchema);
