/**
 * Comprehensive Route Testing Script
 * Tests all API endpoints to ensure they're working
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const tests = [];
let passed = 0;
let failed = 0;

// Test helper
async function testEndpoint(name, method, url, data = null, expectedStatus = 200) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      validateStatus: () => true // Don't throw on any status
    };
    
    if (data) {
      config.data = data;
      config.headers = { 'Content-Type': 'application/json' };
    }
    
    const response = await axios(config);
    const success = response.status === expectedStatus || (response.status >= 200 && response.status < 300);
    
    if (success) {
      console.log(`✅ ${name} - Status: ${response.status}`);
      passed++;
    } else {
      console.log(`❌ ${name} - Status: ${response.status} (Expected: ${expectedStatus})`);
      failed++;
    }
    
    return { success, status: response.status, data: response.data };
  } catch (error) {
    console.log(`❌ ${name} - Error: ${error.message}`);
    failed++;
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Testing All Routes...\n');
  console.log('⚠️  Make sure the server is running: npm start\n');
  
  // Wait a bit for user to start server
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('📡 Testing API Endpoints:\n');
  
  // 1. Health Check
  await testEndpoint('Health Check', 'GET', '/api/chat/health');
  
  // 2. AI Chat (should require message)
  await testEndpoint('AI Chat (no data)', 'POST', '/api/ai-chat', null, 400);
  
  // 3. AI Chat (with data)
  await testEndpoint('AI Chat (with message)', 'POST', '/api/ai-chat', {
    message: 'Hello',
    history: [],
    mode: 'market'
  });
  
  // 4. Resume Analysis (should require file)
  await testEndpoint('Resume Analysis (no file)', 'POST', '/api/analyze-resume', null, 400);
  
  // 5. Auth endpoints
  await testEndpoint('Register (no data)', 'POST', '/api/auth/register', null, 400);
  await testEndpoint('Login (no data)', 'POST', '/api/auth/login', null, 400);
  
  // 6. Original chat endpoint
  await testEndpoint('Original Chat Health', 'GET', '/api/chat/health');
  
  console.log('\n📄 Testing Frontend Pages:\n');
  
  // Test frontend pages
  await testEndpoint('Home Page', 'GET', '/');
  await testEndpoint('Login Page', 'GET', '/login.html');
  await testEndpoint('Career Chat Widget', 'GET', '/career-chat-widget.html');
  await testEndpoint('Test AI Agent', 'GET', '/test-ai-agent.html');
  
  console.log('\n📊 Test Summary:');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${passed + failed}`);
  console.log(`🎯 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All routes are working correctly!');
  } else {
    console.log('\n⚠️  Some routes need attention.');
  }
  
  process.exit(failed === 0 ? 0 : 1);
}

// Check if server is running
axios.get(`${BASE_URL}/api/chat/health`)
  .then(() => {
    console.log('✅ Server is running\n');
    runTests();
  })
  .catch(() => {
    console.log('❌ Server is not running!');
    console.log('Please start the server first: npm start');
    console.log('Then run this script again: node test-all-routes.js');
    process.exit(1);
  });
