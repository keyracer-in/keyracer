const mongoose = require('mongoose');

const hackathonSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  organizerCode: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  rules: {
    type: String,
    default: ''
  },
  allowedTechStack: [{
    type: String
  }],
  autoStart: {
    type: Boolean,
    default: false
  },
  antiCheating: {
    screenshotCheck: {
      type: Boolean,
      default: false
    },
    webcamPermission: {
      type: Boolean,
      default: false
    },
    tabSwitchMonitoring: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed'],
    default: 'upcoming'
  },
  participants: [{
    id: String,
    name: String,
    email: String,
    joinedAt: Date,
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    submissions: [{
      problemId: String,
      code: String,
      language: String,
      submittedAt: Date,
      status: String,
      evaluated: {
        type: Boolean,
        default: false
      },
      evaluation: {
        score: Number,
        status: String,
        feedback: String,
        evaluatedAt: Date,
        evaluatedBy: String
      }
    }],
    lastActivity: Date
  }],
  problems: [{
    id: String,
    title: String,
    description: String,
    constraints: String,
    inputFormat: String,
    outputFormat: String,
    timeLimit: Number,
    memoryLimit: Number,
    sampleInput: String,
    sampleOutput: String,
    difficulty: String,
    category: String,
    testCases: [{
      input: String,
      expectedOutput: String,
      isHidden: Boolean
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
hackathonSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Hackathon = mongoose.model('Hackathon', hackathonSchema);

module.exports = Hackathon;
