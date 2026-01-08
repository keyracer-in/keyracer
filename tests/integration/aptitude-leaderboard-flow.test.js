/**
 * Integration test for aptitude leaderboard complete flow
 * Tests: Submit aptitude quiz -> Verify score appears on leaderboard
 */

const axios = require('axios');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

// Test data
const testUser = {
  email: `test-${Date.now()}@keyracer.test`,
  displayName: 'Test User',
  answers: ['A', 'B', 'C', 'A', 'B'],
  timeTaken: 120,
  questionIds: ['test-q1', 'test-q2', 'test-q3', 'test-q4', 'test-q5']
};

async function testCompleteFlow() {
  console.log('🧪 Starting Aptitude Leaderboard Integration Test\n');
  
  try {
    // Step 1: Submit a test aptitude quiz
    console.log('📝 Step 1: Submitting test aptitude quiz...');
    const submitResponse = await axios.post(`${API_URL}/aptitude/submit-secure`, {
      email: testUser.email,
      displayName: testUser.displayName,
      answers: testUser.answers,
      timeTaken: testUser.timeTaken,
      questionIds: testUser.questionIds
    });
    
    if (!submitResponse.data.success) {
      throw new Error('Submission failed: ' + submitResponse.data.message);
    }
    
    console.log('✅ Submission successful');
    console.log('   Score:', submitResponse.data.result.score);
    console.log('   Accuracy:', submitResponse.data.result.accuracy.toFixed(2) + '%');
    console.log('   Correct Answers:', submitResponse.data.result.correctAnswers);
    console.log('   Total Questions:', submitResponse.data.result.totalQuestions);
    
    // Step 2: Wait a moment for database to update
    console.log('\n⏳ Waiting for database to update...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 3: Fetch leaderboard
    console.log('📊 Step 2: Fetching leaderboard...');
    const leaderboardResponse = await axios.get(`${API_URL}/aptitude/leaderboard`);
    
    if (!leaderboardResponse.data.success) {
      throw new Error('Leaderboard fetch failed: ' + leaderboardResponse.data.message);
    }
    
    console.log('✅ Leaderboard fetched successfully');
    console.log('   Total entries:', leaderboardResponse.data.data.leaderboard.length);
    
    // Step 4: Verify our test user appears on the leaderboard
    console.log('\n🔍 Step 3: Verifying test user appears on leaderboard...');
    const leaderboard = leaderboardResponse.data.data.leaderboard;
    const testUserEntry = leaderboard.find(entry => 
      entry.user.name === testUser.displayName
    );
    
    if (!testUserEntry) {
      throw new Error('Test user not found on leaderboard!');
    }
    
    console.log('✅ Test user found on leaderboard');
    console.log('   Rank:', testUserEntry.rank);
    console.log('   Name:', testUserEntry.user.name);
    console.log('   Total Points:', testUserEntry.stats.totalPoints);
    console.log('   Questions Completed:', testUserEntry.stats.questionsCompleted);
    
    // Step 5: Verify data structure
    console.log('\n🔍 Step 4: Verifying response structure...');
    
    // Check leaderboard response structure
    if (!leaderboardResponse.data.success) {
      throw new Error('Response missing success field');
    }
    if (!leaderboardResponse.data.data) {
      throw new Error('Response missing data field');
    }
    if (!leaderboardResponse.data.data.leaderboard) {
      throw new Error('Response missing leaderboard array');
    }
    
    // Check leaderboard entry structure
    if (!testUserEntry.rank) {
      throw new Error('Leaderboard entry missing rank');
    }
    if (!testUserEntry.user || !testUserEntry.user.name) {
      throw new Error('Leaderboard entry missing user.name');
    }
    if (!testUserEntry.stats) {
      throw new Error('Leaderboard entry missing stats');
    }
    if (testUserEntry.stats.totalPoints === undefined) {
      throw new Error('Leaderboard entry missing stats.totalPoints');
    }
    if (testUserEntry.stats.questionsCompleted === undefined) {
      throw new Error('Leaderboard entry missing stats.questionsCompleted');
    }
    
    console.log('✅ Response structure is correct');
    
    // Step 6: Verify sort order
    console.log('\n🔍 Step 5: Verifying leaderboard sort order...');
    for (let i = 0; i < leaderboard.length - 1; i++) {
      if (leaderboard[i].stats.totalPoints < leaderboard[i + 1].stats.totalPoints) {
        throw new Error(`Leaderboard not sorted correctly at position ${i}`);
      }
    }
    console.log('✅ Leaderboard is sorted by totalPoints (descending)');
    
    // All tests passed
    console.log('\n✅ ✅ ✅ ALL TESTS PASSED ✅ ✅ ✅\n');
    console.log('Summary:');
    console.log('  ✓ Aptitude quiz submission works');
    console.log('  ✓ Score is saved to User.aptitudeStats');
    console.log('  ✓ Leaderboard API returns correct format');
    console.log('  ✓ Test user appears on leaderboard');
    console.log('  ✓ Response structure is correct');
    console.log('  ✓ Leaderboard is sorted correctly');
    
    return true;
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Run the test
if (require.main === module) {
  testCompleteFlow()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { testCompleteFlow };
