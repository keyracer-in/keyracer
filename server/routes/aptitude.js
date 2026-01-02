const express = require('express');
const router = express.Router();
const AptitudeQuestion = require('../models/AptitudeQuestion');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

// Test endpoint to check database connection
router.get('/test-db', async (req, res) => {
    try {
        const User = require('../models/User');
        const count = await User.countDocuments();
        res.json({ success: true, message: 'Database connected', userCount: count });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database error: ' + error.message });
    }
});

// Secure aptitude submission (no auth required but server validates)
router.post('/submit-secure', async (req, res) => {
    try {
        console.log('Submit request received:', req.body);
        const { email, displayName, answers, timeTaken, questionIds } = req.body;
        
        if (!email || !displayName || !answers || !questionIds) {
            console.log('Missing fields:', { email: !!email, displayName: !!displayName, answers: !!answers, questionIds: !!questionIds });
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Find or create user
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ 
                email, 
                username: displayName,
                displayName,
                isVerified: true 
            });
            await user.save();
        }

        // Server-side score calculation
        let correctAnswers = 0;
        let totalScore = 0;
        
        for (let i = 0; i < questionIds.length; i++) {
            const question = await AptitudeQuestion.findById(questionIds[i]);
            if (question && answers[i] === question.correctAnswer) {
                correctAnswers++;
                totalScore += question.points || 2;
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
            if (answers[i]) {
                const question = await AptitudeQuestion.findById(questionIds[i]);
                if (question && answers[i] === question.correctAnswer) {
                    if (!user.aptitudeStats.solvedQuestions.includes(questionIds[i])) {
                        user.aptitudeStats.solvedQuestions.push(questionIds[i]);
                    }
                }
            }
        }
        
        badges.forEach(badge => {
            if (!user.aptitudeStats.badges.includes(badge)) {
                user.aptitudeStats.badges.push(badge);
            }
        });
        
        await user.save();

        res.json({ 
            success: true, 
            result: { score: totalScore, accuracy, correctAnswers, totalQuestions: questionIds.length, timeTaken, badges }
        });
    } catch (error) {
        console.error('Submit error:', error.message);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// Original submit (keep for JWT users)
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

// Get questions by topic and difficulty (no auth required)
router.get('/questions/:topic/:difficulty', async (req, res) => {
    try {
        const { topic, difficulty } = req.params;
        const { email, showAll } = req.query;
        
        let solvedQuestions = [];
        // Only filter out solved questions if showAll is not true
        if (email && showAll !== 'true') {
            const user = await User.findOne({ email });
            solvedQuestions = user?.aptitudeStats?.solvedQuestions || [];
        }
        
        const questions = await AptitudeQuestion.find({
            topic,
            difficulty,
            isActive: true,
            _id: { $nin: solvedQuestions }
        }).select('-correctAnswer');

        res.json({ success: true, questions, total: questions.length, filtered: solvedQuestions.length });
    } catch (error) {
        console.error('Error loading questions:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;