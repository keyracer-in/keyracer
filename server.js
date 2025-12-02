const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System instructions for different modes
const getSystemInstruction = (mode) => {
  const instructions = {
    interview: `You are a strict FAANG interviewer for KeyRacer Career Agent. Ask ONE hard technical question at a time. Wait for the user's answer. Grade it (Poor/Average/Good/Excellent) with specific feedback, then ask the next question. Be challenging but fair. Focus on DSA, system design, or behavioral questions.`,
    
    market: `You are a Career Strategist for KeyRacer. FIRST check if you know the user's degree and tech stack. If not, ASK them directly: "To provide accurate market insights, I need to know: 1) Your degree/field 2) Your tech stack/skills". Once known, provide high-demand tech trends, salary insights, job market analysis, and career opportunities specific to their profile. Be data-driven and practical.`,
    
    roadmap: `You are a Learning Architect for KeyRacer. Generate strict week-by-week learning schedules with specific topics, daily hours (2-4 hours/day), resources, and milestones. Include 2-3 portfolio projects with tech stack. Format: Week 1-4: Topic, Week 5-8: Topic, etc. Be structured and actionable.`
  };
  return instructions[mode] || instructions.market;
};



app.use(express.static('.'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/keyracer', {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
});

// AI Career Agent - Resume Analysis Endpoint
app.post('/api/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Analyze this resume for a fresher role. Provide a detailed analysis:

1. **Overall Score**: Rate 0-100 based on content, formatting, and relevance
2. **Strengths**: List 3-4 strong points
3. **Weaknesses**: List 3-4 areas needing improvement
4. **Specific Improvements**: Provide 5-6 actionable items with examples
5. **ATS Keywords**: List missing keywords for better ATS compatibility
6. **Project Suggestions**: Recommend 2-3 projects to add

Resume Content:
${resumeText}

Format with clear headings and bullet points. Be constructive and specific.`;

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    res.json({ 
      success: true, 
      analysis,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze resume: ' + error.message });
  }
});

// AI Career Agent - Multi-Mode Chat Endpoint
app.post('/api/ai-chat', async (req, res) => {
  try {
    const { message, history = [], mode = 'market' } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const systemInstruction = getSystemInstruction(mode);

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction
    });

    const conversationHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: conversationHistory,
      generationConfig: {
        temperature: mode === 'interview' ? 0.8 : 0.7,
        maxOutputTokens: 2048,
      }
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    res.json({ 
      success: true, 
      response,
      mode 
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ success: false, error: 'Failed to process message: ' + error.message });
  }
});

// Routes
try {
  const chatRoutes = require('./server/routes/chatRoutes');
  app.use('/api', chatRoutes);
  console.log('✅ Chat routes loaded');
} catch (error) {
  console.error('❌ Failed to load chat routes:', error.message);
}

try {
  const hackathonRoutes = require('./server/routes/hackathonRoutes');
  app.use('/api/hackathons', hackathonRoutes);
  console.log('✅ Hackathon routes loaded');
} catch (error) {
  console.error('❌ Failed to load hackathon routes:', error.message);
}

try {
  const aptitudeRoutes = require('./server/routes/aptitude');
  app.use('/api/aptitude', aptitudeRoutes);
  console.log('✅ Aptitude routes loaded');
} catch (error) {
  console.error('❌ Failed to load aptitude routes:', error.message);
  // Add fallback routes
  app.get('/api/aptitude/test', (req, res) => {
    res.json({ success: true, message: 'Aptitude API is working' });
  });
}

// Use the User model from the models directory instead
const User = require('./server/models/User');

// Brevo (Sendinblue) API key
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// Helper to send email via Brevo
async function sendBrevoEmail({ to, subject, html }) {
  return axios.post(BREVO_API_URL, {
    sender: { name: 'KeyRacer', email: 'noreply@keyracer.in' }, // updated sender
    to: [{ email: to }],
    subject,
    htmlContent: html
  }, {
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      'accept': 'application/json'
    }
  });
}

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      verificationToken
    });

    await user.save();

    // Send verification email via Brevo
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;
    await sendBrevoEmail({
      to: email,
      subject: 'Verify Your KeyRacer Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF4A4A;">Welcome to KeyRacer!</h2>
          <p>Hi ${username},</p>
          <p>Thank you for registering with KeyRacer. Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" style="background: #FF4A4A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Verify Email</a>
          <p>Or copy and paste this link: ${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>Happy typing!<br>The KeyRacer Team</p>
        </div>
      `
    });

    res.json({ message: 'Registration successful. Please check your email to verify your account.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Email verification endpoint
app.get('/api/auth/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    
    if (!user) {
      return res.redirect('/login.html?error=invalid_token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.redirect('/login.html?verified=true');
  } catch (error) {
    res.redirect('/login.html?error=verification_failed');
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ error: 'Please verify your email first' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Forgot password endpoint
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If an account exists, a reset email has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password.html?token=${resetToken}`;
    await sendBrevoEmail({
      to: email,
      subject: 'Reset Your KeyRacer Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF4A4A;">Password Reset Request</h2>
          <p>Hi ${user.username},</p>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="background: #FF4A4A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    });

    res.json({ message: 'If an account exists, a reset email has been sent.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset password endpoint
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Debug endpoint for aptitude API
app.get('/api/debug/aptitude', async (req, res) => {
  try {
    const AptitudeQuestion = require('./server/models/AptitudeQuestion');
    const questionCount = await AptitudeQuestion.countDocuments();
    const sampleQuestions = await AptitudeQuestion.find().limit(3);
    
    res.json({
      success: true,
      debug: {
        totalQuestions: questionCount,
        sampleQuestions: sampleQuestions.map(q => ({
          id: q._id,
          topic: q.topic,
          difficulty: q.difficulty,
          question: q.question.substring(0, 50) + '...'
        })),
        routes: {
          questions: '/api/aptitude/questions/:topic/:difficulty',
          submit: '/api/aptitude/submit-secure',
          leaderboard: '/api/aptitude/leaderboard'
        }
      }
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      debug: 'Database connection or model issue'
    });
  }
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Debug endpoint: http://localhost:${PORT}/api/debug/aptitude`);
  console.log(`Aptitude API endpoints:`);
  console.log(`  GET /api/aptitude/questions/:topic/:difficulty`);
  console.log(`  POST /api/aptitude/submit-secure`);
  console.log(`  GET /api/aptitude/leaderboard`);
});