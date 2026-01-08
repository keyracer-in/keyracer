// Script to import aptitude questions from JSON to MongoDB
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const AptitudeQuestion = require('../src/models/AptitudeQuestion');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/keyracer';
const questionsPath = path.join(__dirname, '../data/aptitude-questions.json');

async function importQuestions() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
  
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
            explanation: q.explanation || `The correct answer is ${q.correct}`,
            difficulty: q.difficulty,
            points: q.points || undefined,
            isActive: true
          });
          await doc.save();
          count++;
          if (count % 10 === 0) {
            console.log(`Imported ${count} questions...`);
          }
        }
      }
    }
  }
  console.log(`✅ Successfully imported ${count} new questions.`);
  mongoose.disconnect();
}

importQuestions().catch(e => { console.error(e); process.exit(1); });
