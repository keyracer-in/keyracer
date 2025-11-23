const express = require('express');
const router = express.Router();
const AptitudeQuestion = require('../models/AptitudeQuestion');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

// Submit aptitude test
router.post('/submit', requireAuth, async (req, res) => {
    try {
        const { testType, questions, timeTaken } = req.body;
        const userId = req.user._id;

        // Calculate results
        let correctAnswers = 0;
        let totalScore = 0;
        const newlySolvedQuestions = [];

        for (const submission of questions) {
            const question = await AptitudeQuestion.findById(submission.questionId);
            if (question && submission.userAnswer === question.correctAnswer) {
                correctAnswers++;
                totalScore += question.points || 2;
                newlySolvedQuestions.push(submission.questionId);
            }
        }

        const accuracy = (correctAnswers / questions.length) * 100;
        
        // Determine badges
        const badges = [];
        if (accuracy >= 90) badges.push('excellent');
        if (accuracy >= 80) badges.push('good');
        if (timeTaken < 60) badges.push('fast-thinker');
        if (correctAnswers === questions.length) badges.push('perfect-score');

        // Save result to user
        const user = await User.findById(userId);
        if (!user.aptitudeStats) {
            user.aptitudeStats = {
                testsCompleted: 0,
                totalScore: 0,
                bestAccuracy: 0,
                badges: [],
                solvedQuestions: []
            };
        }

        user.aptitudeStats.testsCompleted += 1;
        user.aptitudeStats.totalScore += totalScore;
        user.aptitudeStats.bestAccuracy = Math.max(user.aptitudeStats.bestAccuracy, accuracy);
        
        // Add newly solved questions
        newlySolvedQuestions.forEach(questionId => {
            if (!user.aptitudeStats.solvedQuestions.includes(questionId)) {
                user.aptitudeStats.solvedQuestions.push(questionId);
            }
        });
        
        // Add new badges
        badges.forEach(badge => {
            if (!user.aptitudeStats.badges.includes(badge)) {
                user.aptitudeStats.badges.push(badge);
            }
        });

        await user.save();

        const result = {
            score: totalScore,
            accuracy,
            correctAnswers,
            totalQuestions: questions.length,
            timeTaken,
            badges
        };

        res.json({ success: true, result });
    } catch (error) {
        console.error('Error submitting aptitude test:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const { period = 'all-time' } = req.query;
        
        // Get users with aptitude stats
        const users = await User.find({ 
            'aptitudeStats.testsCompleted': { $gt: 0 } 
        })
        .select('username email aptitudeStats')
        .sort({ 'aptitudeStats.totalScore': -1 })
        .limit(50);

        const leaderboard = users.map(user => ({
            name: user.username || user.email?.split('@')[0] || 'Anonymous',
            score: user.aptitudeStats.totalScore,
            accuracy: user.aptitudeStats.bestAccuracy,
            timeTaken: 180, // Mock average time
            badges: user.aptitudeStats.badges || []
        }));

        res.json({ success: true, leaderboard });
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get questions by topic and difficulty
router.get('/questions/:topic/:difficulty', requireAuth, async (req, res) => {
    try {
        const { topic, difficulty } = req.params;
        const userId = req.user._id;
        
        // Get user's solved questions
        const user = await User.findById(userId);
        const solvedQuestions = user.aptitudeStats?.solvedQuestions || [];
        
        const questions = await AptitudeQuestion.find({
            topic,
            difficulty,
            isActive: true,
            _id: { $nin: solvedQuestions } // Exclude already solved questions
        }).select('-correctAnswer'); // Don't send correct answers to client

        res.json({ success: true, questions });
    } catch (error) {
        console.error('Error loading questions:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;