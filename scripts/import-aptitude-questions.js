// Script to import aptitude questions from JSON to MongoDB
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const AptitudeQuestion = require('../server/models/AptitudeQuestion');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/keyracer';
const questionsPath = path.join(__dirname, '../data/aptitude-questions.json');

async function importQuestions() {
  await mongoose.connect(MONGO_URI);
  const data = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
  let count = 0;
  for (const topic of Object.keys(data)) {
    for (const difficulty of Object.keys(data[topic])) {
      for (const q of data[topic][difficulty]) {
        // Check if already exists by question text
        const exists = await AptitudeQuestion.findOne({ question: q.question });
        if (!exists) {
          const doc = new AptitudeQuestion({
            topic,
            question: q.question,
            type: q.type,
            options: q.options,
            correctAnswer: q.correct,
            explanation: q.explanation || '',
            difficulty: q.difficulty,
            points: q.points || undefined,
            isActive: true
          });
          await doc.save();
          count++;
        }
      }
    }
  }
  console.log(`Imported ${count} new questions.`);
  mongoose.disconnect();
}

importQuestions().catch(e => { console.error(e); process.exit(1); });
