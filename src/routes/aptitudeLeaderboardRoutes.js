const express = require('express');
const router = express.Router();
const AptitudeStats = require('../models/AptitudeStats');
const User = require('../models/User');

// Clear all Aptitude leaderboard data
router.post('/aptitude-leaderboard/clear-demo-data', async (req, res) => {
  try {
    const result = await AptitudeStats.deleteMany({});
    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} Aptitude entries. Leaderboard is now clean.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Submit aptitude challenge result
router.post('/aptitude-leaderboard/submit', async (req, res) => {
  let responseSent = false;
  try {
    let { userId, pointsEarned, attempts, completionTime, email, googleId, createGuestUser, displayName, questionId } = req.body;
    if ((!userId && !email && !googleId) || pointsEarned === undefined || !attempts || !completionTime) {
      responseSent = true;
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    if (pointsEarned <= 0) {
      responseSent = true;
      return res.json({ success: true, message: 'No points awarded for incomplete question.' });
    }
    if (userId && typeof userId === 'string' && userId.startsWith('google_')) {
      googleId = userId;
    }
    let userObjectId = userId;
    if (!userObjectId || !userObjectId.match(/^[0-9a-fA-F]{24}$/)) {
      let user = null;
      if (googleId) {
        user = await User.findOne({ googleId });
      } else if (email) {
        user = await User.findOne({ email });
      }
      if (!user) {
        if (googleId) {
          const newUserData = {
            googleId: googleId,
            email: email || `user_${Date.now()}@keyracer.in`,
            displayName: `User${Math.floor(Math.random() * 100000)}`,
            authMethod: 'google',
            isVerified: true
          };
          const newUser = new User(newUserData);
          await newUser.save();
          user = newUser;
        } else if (createGuestUser && email) {
          const userName = displayName || email.split('@')[0];
          const uniqueUsername = `${userName.toLowerCase().replace(/\s+/g, '')}_${Date.now()}`;
          const newUserData = {
            email: email,
            displayName: userName,
            username: uniqueUsername,
            password: 'guest_user',
            authMethod: 'local',
            isVerified: true
          };
          const newUser = new User(newUserData);
          await newUser.save();
          user = newUser;
        } else {
          responseSent = true;
          return res.status(404).json({ success: false, message: 'User not found.' });
        }
      }
      userObjectId = user._id;
    }
    let stats = await AptitudeStats.findOne({ userId: userObjectId });
    if (!stats) {
      stats = new AptitudeStats({ userId: userObjectId });
    }
    if (questionId && stats.completedQuestions && stats.completedQuestions.includes(questionId)) {
      responseSent = true;
      return res.json({ success: true, message: 'Question already completed. No additional points awarded.', pointsAwarded: 0 });
    }
    if (pointsEarned > 0) {
      stats.questionsCompleted += 1;
      stats.totalPoints += pointsEarned;
      if (!stats.completedQuestions) stats.completedQuestions = [];
      if (questionId && !stats.completedQuestions.includes(questionId)) {
        stats.completedQuestions.push(questionId);
      }
    }
    stats.totalAttempts += attempts;
    stats.averageCompletionTime =
      ((stats.averageCompletionTime * Math.max(1, stats.questionsCompleted - 1)) + completionTime) / Math.max(1, stats.questionsCompleted);
    stats.lastActivityDate = new Date();
    stats.level = stats.calculateLevel();
    stats.updateStreak();
    await stats.save();
    responseSent = true;
    res.json({ success: true, message: 'Aptitude result saved.', pointsAwarded: pointsEarned });
  } catch (error) {
    if (!responseSent) {
      res.status(500).json({ success: false, message: 'Server error.' });
    }
  }
});

// Get aptitude leaderboard
router.get('/aptitude-leaderboard', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const leaderboardPipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $match: { questionsCompleted: { $gt: 0 }, totalPoints: { $gt: 0 } } },
      { $sort: { totalPoints: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) },
      {
        $project: {
          totalPoints: 1,
          questionsCompleted: 1,
          'user.displayName': 1,
          'user.username': 1
        }
      }
    ];
    const stats = await AptitudeStats.aggregate(leaderboardPipeline);
    const leaderboard = stats.map((entry, idx) => ({
      rank: (page - 1) * limit + idx + 1,
      user: {
        name: entry.user.displayName || entry.user.username || 'Player'
      },
      stats: {
        totalPoints: entry.totalPoints || 0,
        questionsCompleted: entry.questionsCompleted || 0
      }
    }));
    res.json({ success: true, data: { leaderboard } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
