const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "Set" : "Not Set");
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "Set (hidden)" : "Not Set");
console.log("EMAIL_FROM:", process.env.EMAIL_FROM);
console.log("EMAIL_FROM_NAME:", process.env.EMAIL_FROM_NAME);
console.log("BREVO_SMTP_HOST:", process.env.BREVO_SMTP_HOST ? "Set" : "Not Set");
console.log("BREVO_SMTP_USER:", process.env.BREVO_SMTP_USER ? "Set" : "Not Set");
console.log("BREVO_SMTP_PASSWORD:", process.env.BREVO_SMTP_PASSWORD ? "Set (not displayed)" : "Not Set");
console.log("TAVILY_API_KEY:", process.env.TAVILY_API_KEY ? "Set (not displayed)" : "Not Set");
console.log("GROQ_API_KEY:", process.env.GROQ_API_KEY? "Set (not displayed)" : "Not Set");

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
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');

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
const aptitudeRoutes = require('./routes/aptitude');
const hackathonRoutes = require('./routes/hackathonRoutes');
const keyracerAgentRoutes = require('./routes/keyracerAgentRoutes');

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

// Brevo (Sendinblue) API configuration
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// Helper to send email via Brevo
async function sendBrevoEmail({ to, subject, html }) {
  return axios.post(BREVO_API_URL, {
    sender: { name: 'KeyRacer', email: 'noreply@keyracer.in' },
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
app.use(cookieParser()); // Parse cookies for auth

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

// Static files - Serve the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve content directory for markdown files
app.use('/content', express.static(path.join(__dirname, '../content')));

// Serve data directory for JSON files
app.use('/data', express.static(path.join(__dirname, '../data')));

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

// Register CodeRacer leaderboard API routes
app.use('/api', coderacerLeaderboardRoutes);
console.log('[SERVER] CodeRacer leaderboard routes registered');

// Additional auth endpoints from root server.js (using Brevo email)
// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = new User({
      username,
      email,
      password: hashedPassword,
      verificationToken
    });

    await user.save();

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
      return res.redirect('/pages/login.html?error=invalid_token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.redirect('/pages/login.html?verified=true');
  } catch (error) {
    res.redirect('/pages/login.html?error=verification_failed');
  }
});

// Login endpoint
app.post('/api/auth/login', authLimiter, async (req, res) => {
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
app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
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

    const resetUrl = `${req.protocol}://${req.get('host')}/pages/reset-password.html?token=${resetToken}`;
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
app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', challengeRoutes);
app.use('/api', leaderboardRoutes);
app.use('/api/aptitude', aptitudeRoutes);
app.use('/api/keyracer-agent', keyracerAgentRoutes);
app.use('/api/hackathons', hackathonRoutes);
console.log('[SERVER] All API routes registered including KeyRacer Agent routes');

// Apply rate limiting to auth routes
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
  passport.authenticate('google', { failureRedirect: '/pages/login.html' }),
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
      
      res.redirect(`/pages/login-success.html?${userParams.toString()}`);
    }
  }
);

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
  res.redirect('/pages/login.html');
}

// Protected route example
app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Catch-all route to handle client-side routing
app.get('*', (req, res) => {
  // Exclude API routes
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
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
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log('🔒 Running in production mode');
  }
});
