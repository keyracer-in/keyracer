/**
 * Route Verification Script
 * Checks all routes are properly connected
 */

const express = require('express');
require('dotenv').config();

console.log('🔍 Verifying All Routes...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('✅ PORT:', process.env.PORT || 3000);
console.log('✅ MONGODB_URI:', process.env.MONGODB_URI ? 'Configured' : '❌ Missing');
console.log('✅ JWT_SECRET:', process.env.JWT_SECRET ? 'Configured' : '❌ Missing');
console.log('✅ GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Configured' : '❌ Missing');
console.log('✅ BREVO_API_KEY:', process.env.BREVO_API_KEY ? 'Configured' : '❌ Missing');
console.log('');

// Check required modules
console.log('📦 Checking Dependencies:');
const requiredModules = [
  'express',
  'mongoose',
  'bcryptjs',
  'jsonwebtoken',
  'cors',
  'multer',
  'pdf-parse',
  '@google/generative-ai'
];

let allModulesPresent = true;
requiredModules.forEach(module => {
  try {
    require.resolve(module);
    console.log(`✅ ${module}`);
  } catch (e) {
    console.log(`❌ ${module} - NOT INSTALLED`);
    allModulesPresent = false;
  }
});
console.log('');

// Check route files
console.log('📁 Checking Route Files:');
const routeFiles = [
  './server/routes/chatRoutes.js',
  './server/routes/hackathonRoutes.js',
  './server/routes/aptitude.js'
];

let allRoutesPresent = true;
routeFiles.forEach(file => {
  try {
    require.resolve(file);
    console.log(`✅ ${file}`);
  } catch (e) {
    console.log(`❌ ${file} - NOT FOUND`);
    allRoutesPresent = false;
  }
});
console.log('');

// Check model files
console.log('📊 Checking Model Files:');
const modelFiles = [
  './server/models/User.js',
  './server/models/ChatSession.js'
];

modelFiles.forEach(file => {
  try {
    require.resolve(file);
    console.log(`✅ ${file}`);
  } catch (e) {
    console.log(`⚠️  ${file} - NOT FOUND (may be optional)`);
  }
});
console.log('');

// Check service files
console.log('🔧 Checking Service Files:');
const serviceFiles = [
  './server/services/conversationService.js',
  './server/services/geminiService.js'
];

serviceFiles.forEach(file => {
  try {
    require.resolve(file);
    console.log(`✅ ${file}`);
  } catch (e) {
    console.log(`⚠️  ${file} - NOT FOUND`);
  }
});
console.log('');

// Verify server.js structure
console.log('🔍 Analyzing server.js:');
const fs = require('fs');
const serverContent = fs.readFileSync('./server.js', 'utf8');

const checks = [
  { name: 'Multer import', pattern: /require\(['"]multer['"]\)/ },
  { name: 'PDF Parse import', pattern: /require\(['"]pdf-parse['"]\)/ },
  { name: 'Gemini AI import', pattern: /require\(['"]@google\/generative-ai['"]\)/ },
  { name: 'Chat routes loaded', pattern: /chatRoutes.*require/ },
  { name: 'Resume analysis endpoint', pattern: /\/api\/analyze-resume/ },
  { name: 'AI chat endpoint', pattern: /\/api\/ai-chat/ },
  { name: 'Auth endpoints', pattern: /\/api\/auth/ },
  { name: 'Hackathon routes', pattern: /hackathonRoutes/ }
];

checks.forEach(check => {
  if (check.pattern.test(serverContent)) {
    console.log(`✅ ${check.name}`);
  } else {
    console.log(`❌ ${check.name} - NOT FOUND`);
  }
});
console.log('');

// Summary
console.log('📊 Summary:');
console.log('='.repeat(50));

if (allModulesPresent && allRoutesPresent) {
  console.log('✅ All critical dependencies and routes are present');
  console.log('✅ Server should start successfully');
  console.log('');
  console.log('🚀 Available Endpoints:');
  console.log('   POST /api/auth/register');
  console.log('   POST /api/auth/login');
  console.log('   POST /api/auth/forgot-password');
  console.log('   POST /api/auth/reset-password');
  console.log('   GET  /api/chat/health');
  console.log('   POST /api/chat');
  console.log('   POST /api/ai-chat');
  console.log('   POST /api/analyze-resume');
  console.log('   GET  /api/hackathons/*');
  console.log('   GET  /api/aptitude/*');
  console.log('');
  console.log('🌐 Frontend Pages:');
  console.log('   http://localhost:3000/');
  console.log('   http://localhost:3000/login.html');
  console.log('   http://localhost:3000/career-chat-widget.html');
  console.log('   http://localhost:3000/test-ai-agent.html');
  console.log('');
  process.exit(0);
} else {
  console.log('❌ Some dependencies or routes are missing');
  console.log('⚠️  Run: npm install');
  console.log('');
  process.exit(1);
}
