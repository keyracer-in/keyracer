/**
 * Property-Based Test: Server Entry Point Uniqueness
 * Feature: project-restructure, Property 5: Server Entry Point Uniqueness
 * Validates: Requirements 3.2, 3.3, 3.5
 * 
 * Property: For any valid project state after restructuring, there SHALL be 
 * exactly one server entry point at src/server.js, and no server.js files 
 * SHALL exist in root, server/, or backend_new/ directories.
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const PROJECT_ROOT = path.join(__dirname, '../../');
const EXPECTED_SERVER_PATH = path.join(PROJECT_ROOT, 'src/server.js');
const FORBIDDEN_PATHS = [
  path.join(PROJECT_ROOT, 'server.js'),
  path.join(PROJECT_ROOT, 'server/server.js'),
  path.join(PROJECT_ROOT, 'backend_new/server.js')
];

/**
 * Check if a file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch (error) {
    return false;
  }
}

/**
 * Property Test: Server Entry Point Uniqueness
 * 
 * This test verifies that:
 * 1. Exactly one server entry point exists at src/server.js
 * 2. No server.js files exist in forbidden locations (root, server/, backend_new/)
 */
function testServerEntryPointUniqueness() {
  const results = {
    passed: true,
    errors: [],
    warnings: []
  };

  // Check 1: Verify src/server.js exists
  if (!fileExists(EXPECTED_SERVER_PATH)) {
    results.passed = false;
    results.errors.push(
      `FAILED: Expected server entry point not found at ${EXPECTED_SERVER_PATH}`
    );
  } else {
    results.warnings.push(
      `✓ Server entry point exists at src/server.js`
    );
  }

  // Check 2: Verify no server.js in forbidden locations
  FORBIDDEN_PATHS.forEach(forbiddenPath => {
    if (fileExists(forbiddenPath)) {
      results.passed = false;
      results.errors.push(
        `FAILED: Forbidden server.js found at ${path.relative(PROJECT_ROOT, forbiddenPath)}`
      );
    } else {
      results.warnings.push(
        `✓ No server.js at ${path.relative(PROJECT_ROOT, forbiddenPath)}`
      );
    }
  });

  // Check 3: Verify no duplicate server directories exist
  const forbiddenDirs = [
    path.join(PROJECT_ROOT, 'server'),
    path.join(PROJECT_ROOT, 'backend_new')
  ];

  forbiddenDirs.forEach(dir => {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      results.passed = false;
      results.errors.push(
        `FAILED: Redundant directory still exists: ${path.relative(PROJECT_ROOT, dir)}/`
      );
    } else {
      results.warnings.push(
        `✓ Redundant directory removed: ${path.relative(PROJECT_ROOT, dir)}/`
      );
    }
  });

  return results;
}

/**
 * Run the property test
 */
function runTest() {
  console.log('🧪 Property Test: Server Entry Point Uniqueness');
  console.log('Feature: project-restructure, Property 5');
  console.log('Validates: Requirements 3.2, 3.3, 3.5\n');
  console.log('Property: For any valid project state after restructuring,');
  console.log('there SHALL be exactly one server entry point at src/server.js,');
  console.log('and no server.js files SHALL exist in root, server/, or backend_new/\n');
  console.log('='.repeat(70));
  console.log('');

  const results = testServerEntryPointUniqueness();

  // Display results
  if (results.warnings.length > 0) {
    console.log('Checks:');
    results.warnings.forEach(warning => console.log(`  ${warning}`));
    console.log('');
  }

  if (results.errors.length > 0) {
    console.log('Failures:');
    results.errors.forEach(error => console.log(`  ❌ ${error}`));
    console.log('');
  }

  console.log('='.repeat(70));
  
  if (results.passed) {
    console.log('✅ PROPERTY TEST PASSED');
    console.log('Server entry point uniqueness property is satisfied.\n');
    process.exit(0);
  } else {
    console.log('❌ PROPERTY TEST FAILED');
    console.log('Server entry point uniqueness property is violated.\n');
    console.log('Expected state:');
    console.log('  - Single server entry point at: src/server.js');
    console.log('  - No server.js in: root, server/, backend_new/');
    console.log('  - No redundant directories: server/, backend_new/\n');
    process.exit(1);
  }
}

// Run the test if executed directly
if (require.main === module) {
  runTest();
}

module.exports = { testServerEntryPointUniqueness, fileExists };
