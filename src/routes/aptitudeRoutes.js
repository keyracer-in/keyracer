const express = require('express');
const router = express.Router();
const AptitudeQuestion = require('../models/AptitudeQuestion');
const AptitudeAttempt = require('../models/AptitudeAttempt');
const { authenticate } = require('../middleware/authMiddleware');

// Get questions by topic and difficulty
router.get('/aptitude/questions/:topic/:difficulty', async (req, res) => {
  try {
    const { topic, difficulty } = req.params;
    const { email } = req.query;
    
    let solvedQuestions = [];
    if (email) {
      const User = require('../models/User');
      const user = await User.findOne({ email });
      solvedQuestions = user?.aptitudeStats?.solvedQuestions || [];
    }
    
    const questions = await AptitudeQuestion.find({
      topic,
      difficulty,
      isActive: true,
      _id: { $nin: solvedQuestions }
    }).select('-correctAnswer');

    res.json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Secure aptitude submission (no auth required but server validates)
router.post('/aptitude/submit-secure', async (req, res) => {
  try {
    const { email, displayName, answers, timeTaken, questionIds } = req.body;
    
    if (!email || !displayName || !answers || !questionIds) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const User = require('../models/User');
    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ 
        email, 
        username: displayName,
        displayName,
        authMethod: 'google',
        isVerified: true 
      });
      await user.save();
    }

    // Server-side score calculation - handle local JSON questions
    let correctAnswers = 0;
    let totalScore = 0;
    
    // Load local questions for validation
    const fs = require('fs');
    const path = require('path');
    let localQuestions = {};
    
    try {
      const questionsPath = path.join(__dirname, '../../data/aptitude-questions.json');
      localQuestions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    } catch (err) {
      console.log('Could not load local questions file');
    }
    
    for (let i = 0; i < questionIds.length; i++) {
      let isCorrect = false;
      
      // Try database first
      try {
        const question = await AptitudeQuestion.findById(questionIds[i]);
        if (question && answers[i] === question.correctAnswer) {
          isCorrect = true;
          totalScore += question.points || 2;
        }
      } catch (qError) {
        // Fallback to local JSON questions
        const questionId = questionIds[i];
        let foundQuestion = null;
        
        // Search through all topics and difficulties
        for (const topic in localQuestions) {
          for (const difficulty in localQuestions[topic]) {
            const questions = localQuestions[topic][difficulty];
            foundQuestion = questions.find(q => q._id === questionId);
            if (foundQuestion) break;
          }
          if (foundQuestion) break;
        }
        
        if (foundQuestion && answers[i] === foundQuestion.correct) {
          isCorrect = true;
          totalScore += 2; // Default points for local questions
        }
      }
      
      if (isCorrect) {
        correctAnswers++;
      }
    }

    const accuracy = (correctAnswers / questionIds.length) * 100;
    const badges = [];
    if (accuracy >= 90) badges.push('excellent');
    if (accuracy >= 80) badges.push('good');
    if (timeTaken < 60) badges.push('fast-thinker');
    if (correctAnswers === questionIds.length) badges.push('perfect-score');

    // Update user stats
    if (!user.aptitudeStats) {
      user.aptitudeStats = { testsCompleted: 0, totalScore: 0, bestAccuracy: 0, badges: [], solvedQuestions: [] };
    }
    
    user.aptitudeStats.testsCompleted += 1;
    user.aptitudeStats.totalScore += totalScore;
    user.aptitudeStats.bestAccuracy = Math.max(user.aptitudeStats.bestAccuracy, accuracy);
    
    // Add correctly answered questions to solved list
    for (let i = 0; i < questionIds.length; i++) {
      if (answers[i] && !user.aptitudeStats.solvedQuestions.includes(questionIds[i])) {
        user.aptitudeStats.solvedQuestions.push(questionIds[i]);
      }
    }
    
    badges.forEach(badge => {
      if (!user.aptitudeStats.badges.includes(badge)) {
        user.aptitudeStats.badges.push(badge);
      }
    });
    
    await user.save();
    
    // Log confirmation that data was saved to User.aptitudeStats only
    console.log(`[Aptitude Submission] Saved to User.aptitudeStats for user: ${email}`);
    console.log(`[Aptitude Submission] Stats: testsCompleted=${user.aptitudeStats.testsCompleted}, totalScore=${user.aptitudeStats.totalScore}, accuracy=${accuracy.toFixed(2)}%`);

    res.json({ 
      success: true, 
      result: { score: totalScore, accuracy, correctAnswers, totalQuestions: questionIds.length, timeTaken, badges }
    });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Original submit (keep for JWT users)
router.post('/aptitude/submit', authenticate, async (req, res) => {
  try {
    const { testType, duration, questions, timeTaken } = req.body;
    
    let correctAnswers = 0;
    let score = 0;
    const processedQuestions = [];
    
    for (const q of questions) {
      const question = await AptitudeQuestion.findById(q.questionId);
      const isCorrect = question.correctAnswer.toLowerCase() === q.userAnswer.toLowerCase();
      
      if (isCorrect) {
        correctAnswers++;
        score += question.points;
      } else {
        score = Math.max(0, score - 1); // Negative marking
      }
      
      processedQuestions.push({
        questionId: q.questionId,
        userAnswer: q.userAnswer,
        isCorrect,
        timeSpent: q.timeSpent || 0
      });
    }
    
    const totalQuestions = questions.length;
    const wrongAnswers = totalQuestions - correctAnswers;
    const accuracy = (correctAnswers / totalQuestions) * 100;
    
    // Calculate badges
    const badges = [];
    if (accuracy >= 90) badges.push('math-whiz');
    if (timeTaken < 300) badges.push('fast-thinker'); // Under 5 minutes
    if (correctAnswers === totalQuestions) badges.push('puzzle-master');
    
    const attempt = new AptitudeAttempt({
      userId: req.user._id,
      testType,
      duration,
      questions: processedQuestions,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      score,
      accuracy,
      timeTaken,
      badges
    });
    
    await attempt.save();
    
    res.json({ 
      success: true, 
      result: {
        score,
        accuracy,
        correctAnswers,
        wrongAnswers,
        timeTaken,
        badges
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get leaderboard
router.get('/aptitude/leaderboard', async (req, res) => {
  try {
    const { period = 'all-time' } = req.query;
    
    // Get users with aptitude stats
    const User = require('../models/User');
    const users = await User.find({ 
      'aptitudeStats.testsCompleted': { $gt: 0 } 
    })
    .select('username displayName email aptitudeStats')
    .sort({ 'aptitudeStats.totalScore': -1 })
    .limit(50);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      user: {
        name: user.displayName || user.username || user.email?.split('@')[0] || 'Anonymous'
      },
      stats: {
        totalPoints: user.aptitudeStats.totalScore || 0,
        questionsCompleted: user.aptitudeStats.solvedQuestions?.length || 0
      }
    }));

    res.json({ 
      success: true, 
      data: {
        leaderboard 
      }
    });
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user stats
router.get('/aptitude/stats', authenticate, async (req, res) => {
  try {
    const stats = await AptitudeAttempt.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          bestScore: { $max: '$score' },
          avgAccuracy: { $avg: '$accuracy' },
          totalBadges: { $addToSet: '$badges' }
        }
      }
    ]);
    
    res.json({ 
      success: true, 
      stats: stats[0] || { totalAttempts: 0, bestScore: 0, avgAccuracy: 0, totalBadges: [] }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;