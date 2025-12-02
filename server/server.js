const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "Set" : "Not Set");
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "Set (hidden)" : "Not Set");
console.log("EMAIL_FROM:", process.env.EMAIL_FROM);
console.log("EMAIL_FROM_NAME:", process.env.EMAIL_FROM_NAME);
console.log("BREVO_SMTP_HOST:", process.env.BREVO_SMTP_HOST ? "Set" : "Not Set");
console.log("BREVO_SMTP_USER:", process.env.BREVO_SMTP_USER ? "Set" : "Not Set");
console.log("BREVO_SMTP_PASSWORD:", process.env.BREVO_SMTP_PASSWORD ? "Set (not displayed)" : "Not Set");
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "Set (not displayed)" : "Not Set");

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const { URLSearchParams } = require('url');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Import database connection
const connectDB = require('./utils/dbConnect');

// Import models
const User = require('./models/User');
const Session = require('./models/Session');

// Import routes
const authRoutes = require('./routes/authRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const coderacerLeaderboardRoutes = require('./routes/coderacerLeaderboardRoutes');
const aptitudeRoutes = require('./routes/aptitudeRoutes');
const chatRoutes = require('./routes/chatRoutes');
const hackathonRoutes = require('./routes/hackathonRoutes');

// Import middleware
const { authenticate } = require('./middleware/authMiddleware');
const monitoringService = require('./utils/monitoring');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

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

// Connect to MongoDB
connectDB().then(connected => {
  if (!connected) {
    console.error('Failed to connect to MongoDB. Please check your connection string.');
    // Continue running the server even if DB connection fails
  }
});

// Request logging and monitoring
app.use((req, res, next) => {
  monitoringService.incrementRequests();
  
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_REQUEST_LOGGING === 'true') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${req.ip}`);
  }
  
  // Track errors
  const originalSend = res.send;
  res.send = function(data) {
    if (res.statusCode >= 400) {
      monitoringService.incrementErrors();
    }
    originalSend.call(this, data);
  };
  
  next();
});

// Security middleware for production
if (process.env.NODE_ENV === 'production') {
  // Trust proxy for accurate IP addresses
  app.set('trust proxy', 1);
  
  // Additional security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.CORS_ORIGIN : true,
  credentials: true
}));
// Production security configuration
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
        scriptSrcAttr: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://emkc.org", "https://cdnjs.cloudflare.com", "https://www.google-analytics.com", "https://analytics.google.com"]
      }
    },
    crossOriginEmbedderPolicy: false
  }));
} else {
  app.use(helmet({
    contentSecurityPolicy: false
  }));
}
app.use(morgan('dev')); // Logging
// Register CodeRacer leaderboard API routes under /api
app.use('/api', coderacerLeaderboardRoutes);
console.log('[SERVER] CodeRacer leaderboard routes registered');
app.use(cookieParser()); // Parse cookies for auth

// Diagnostic route to list all registered endpoints
app.get('/diagnostic/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) { // routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        methods: middleware.route.methods
      });
    } else if (middleware.name === 'router') { // router middleware 
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: handler.route.methods
          });
        }
      });
    }
  });
  res.json({ routes });
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days for longer persistence
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Check if email configuration is valid
if (!process.env.EMAIL_FROM || !process.env.EMAIL_FROM_NAME) {
  console.error('WARNING: Email configuration is not properly set in environment variables');
  console.error('Email functionality may not work properly');
} else {
  console.log('Email configuration found using Brevo SMTP');
}

// Check if Google OAuth credentials are configured
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('WARNING: Google OAuth credentials are not properly set in environment variables');
  console.error('Google sign-in functionality will not work properly');
} else {
  console.log('Google OAuth credentials found. Configuring Passport...');
  
  // Configure Google Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production' 
      ? 'https://keyracer.in/auth/google/callback'
      : 'http://localhost:3000/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Get email from profile
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
      
      if (!email) {
        return done(new Error('No email found in Google profile'), null);
      }
      
      // Check if user exists in database
      let user = await User.findOne({ email });
      
      if (!user) {
        // First time user - create a new user record
        user = new User({
          email,
          googleId: profile.id,
          displayName: profile.displayName,
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          picture: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
          authMethod: 'google',
          isVerified: true, // Google accounts are pre-verified
          hasSetUsername: false
        });
        
        await user.save();
        console.log(`New user ${email} created via Google OAuth`);
      } else {
        // Returning user - update profile information
        user.displayName = profile.displayName;
        user.picture = profile.photos && profile.photos[0] ? profile.photos[0].value : '';
        user.lastLogin = new Date();
        user.googleId = profile.id;
        user.authMethod = 'google';
        user.isVerified = true;
        
        await user.save();
      }
      
      console.log(`User ${email} authenticated via Google`);
      return done(null, user);
    } catch (error) {
      console.error('Error during Google authentication:', error);
      return done(error, null);
    }
  }));
  
  // Serialize user - store only the user ID in the session
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  
  // Deserialize user - retrieve user from database
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      if (!user) {
        return done(new Error('User not found'), null);
      }
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

// Static files - Serve the client app
app.use(express.static(path.join(__dirname, '../')));

// AI Career Agent - Resume Analysis Endpoint
app.post('/api/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-001' });
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
      model: 'gemini-1.5-flash-001',
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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', challengeRoutes);
app.use('/api', leaderboardRoutes);
app.use('/api', aptitudeRoutes);
app.use('/api', chatRoutes);
app.use('/api/hackathons', hackathonRoutes);
console.log('[SERVER] All API routes registered including AI Career Agent routes');

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.GLOBAL_RATE_LIMIT_WINDOW) || 900000, // 15 minutes
  max: parseInt(process.env.GLOBAL_RATE_LIMIT_MAX) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' && req.ip === '127.0.0.1'
});

// Auth rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 10,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply global rate limiting
app.use(globalLimiter);

// Apply rate limiting to auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);
app.use('/api/auth/send-verification', authLimiter);

// User info endpoint
app.get('/api/user', authenticate, (req, res) => {
  res.json({
    authenticated: true,
    user: {
      id: req.user._id,
      email: req.user.email,
      displayName: req.user.displayName,
      username: req.user.username,
      picture: req.user.picture,
      hasSetUsername: req.user.hasSetUsername,
      isVerified: req.user.isVerified
    }
  });
});

// Update username endpoint
app.post('/api/user/username', authenticate, async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters' });
    }
    
    // Check if username is already taken by another user
    const existingUser = await User.findOne({ 
      username, 
      _id: { $ne: req.user._id } 
    });
    
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }
    
    // Update user's username
    req.user.username = username;
    req.user.hasSetUsername = true;
    await req.user.save();
    
    res.json({ 
      success: true, 
      message: 'Username updated successfully',
      user: {
        username,
        hasSetUsername: true
      }
    });
  } catch (error) {
    console.error('Error updating username:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Direct Passport routes
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => {
    // Check if user has set a username
    if (req.user && req.user.hasSetUsername) {
      // Returning user with username - redirect to dashboard
      res.redirect('/dashboard');
    } else {
      // New user or user without username - redirect to success page to set username
      const userParams = new URLSearchParams({
        provider: 'google',
        name: req.user.displayName || '',
        email: req.user.email || '',
        picture: req.user.picture || '',
        newUser: req.user.hasSetUsername ? 'false' : 'true'
      });
      
      res.redirect(`/login-success.html?${userParams.toString()}`);
    }
  }
);

// Health check routes
app.get('/api/health', async (req, res) => {
  try {
    const health = monitoringService.isHealthy();
    const chatMetrics = await monitoringService.getChatMetrics();
    
    res.status(health.healthy ? 200 : 503).json({
      status: health.healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      system: health.metrics,
      chat: chatMetrics,
      issues: health.issues
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Detailed monitoring endpoint (production only)
app.get('/api/monitoring', (req, res) => {
  if (process.env.NODE_ENV !== 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
  
  const health = monitoringService.getSystemHealth();
  res.json({
    ...health,
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
    platform: process.platform
  });
});

// Authentication check middleware for protected routes
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login.html');
}

// Protected route example
app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../preference.html'));
});

// Catch-all route to handle client-side routing
app.get('*', (req, res) => {
  // Exclude API routes
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '../preference.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Cleanup job for old sessions (run every hour in production)
if (process.env.NODE_ENV === 'production') {
  setInterval(async () => {
    await monitoringService.cleanupOldSessions();
  }, 60 * 60 * 1000); // 1 hour
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Visit http://localhost:${PORT} in your browser`);
  console.log(`🤖 AI Career Chat: http://localhost:${PORT}/career-guidance-demo.html`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log('🔒 Running in production mode');
  }
}); 