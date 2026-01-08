const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const AptitudeQuestion = require('../src/models/AptitudeQuestion');

async function check() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  await mongoose.connect(uri);
  const count = await AptitudeQuestion.countDocuments();
  console.log('Total questions:', count);
  
  const byTopic = await AptitudeQuestion.aggregate([
    { $group: { _id: '$topic', count: { $sum: 1 } } }
  ]);
  console.log('By topic:', byTopic);
  
  const byDifficulty = await AptitudeQuestion.aggregate([
    { $group: { _id: '$difficulty', count: { $sum: 1 } } }
  ]);
  console.log('By difficulty:', byDifficulty);
  
  mongoose.disconnect();
}

check();
