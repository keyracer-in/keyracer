const mongoose = require('mongoose');

const AptitudeStatsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  totalPoints: { type: Number, default: 0 },
  questionsCompleted: { type: Number, default: 0 },
  completedQuestions: [{ type: String }], // Store question IDs (ObjectId or string)
  totalAttempts: { type: Number, default: 0 },
  averageCompletionTime: { type: Number, default: 0 },
  lastActivityDate: { type: Date },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 }
});

// Dummy level calculation (customize as needed)
AptitudeStatsSchema.methods.calculateLevel = function () {
  return Math.floor(this.totalPoints / 100) + 1;
};

// Dummy streak update (customize as needed)
AptitudeStatsSchema.methods.updateStreak = function () {
  // Example: increment streak if last activity was within 24h
  if (this.lastActivityDate && (Date.now() - this.lastActivityDate.getTime()) < 24 * 60 * 60 * 1000) {
    this.streak += 1;
  } else {
    this.streak = 1;
  }
};

module.exports = mongoose.model('AptitudeStats', AptitudeStatsSchema);
