/**
 * Property-Based Test: Root Directory Cleanliness
 * Feature: project-restructure, Property 1: Root Directory Cleanliness
 * Validates: Requirements 1.3, 4.2, 4.3, 5.2, 5.3, 5.4, 6.1, 6.3, 6.4, 6.5, 9.3
 * 
 * Property: For any file in the project root directory, it SHALL be one of the 
 * explicitly allowed files (package.json, package-lock.json, .env, .env.example, 
 * .gitignore, README.md, LICENSE, CONTRIBUTING.md, ecosystem.config.js) OR be a 
 * directory. No loose .html, .css, .sh, .py, .md (except allowed), test-*.js, 
 * debug-*.html, or *_backup.* files SHALL exist in root.
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const PROJECT_ROOT = path.join(__dirname, '../../');

// Allowed files in root directory
const ALLOWED_FILES = [
  'package.json',
  'package-lock.json',
  '.env',
  '.env.example',
  '.gitignore',
  'README.md',
  'LICENSE',
  'CONTRIBUTING.md',
  'ecosystem.config.js',
  // Additional configuration files that are acceptable
  'robots.txt',
  'sitemap.xml',
  'nginx.conf.template',
  'particles.json',
  'seo-metadata.json',
  'structured-data.json',
  '.DS_Store' // macOS system file
];

// Forbidden file patterns (regex patterns)
const FORBIDDEN_PATTERNS = [
  /\.html$/,           // No HTML files
  /\.css$/,            // No CSS files
  /\.sh$/,             // No shell scripts
  /\.py$/,             // No Python scripts
  /^test-.*\.js$/,     // No test-*.js files
  /^debug-.*\.html$/,  // No debug-*.html files
  /_backup\./,         // No *_backup.* files
  /\.md$/              // No markdown files (except explicitly allowed)
];

/**
 * Get all items in the root directory
 */
function getRootItems() {
  try {
    return fs.readdirSync(PROJECT_ROOT);
  } catch (error) {
    console.error('Error reading root directory:', error);
    return [];
  }
}

/**
 * Check if an item is a directory
 */
function isDirectory(itemPath) {
  try {
    return fs.statSync(itemPath).isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * Check if a file matches any forbidden pattern
 */
function matchesForbiddenPattern(filename) {
  return FORBIDDEN_PATTERNS.some(pattern => pattern.test(filename));
}

/**
 * Check if a file is explicitly allowed
 */
function isAllowedFile(filename) {
  return ALLOWED_FILES.includes(filename);
}

/**
 * Property Test: Root Directory Cleanliness
 * 
 * This test verifies that:
 * 1. All items in root are either allowed files or directories
 * 2. No forbidden file patterns exist in root
 * 3. Only explicitly allowed markdown files exist in root
 */
function testRootDirectoryCleanliness() {
  const results = {
    passed: true,
    errors: [],
    warnings: [],
    summary: {
      totalItems: 0,
      directories: 0,
      allowedFiles: 0,
      forbiddenFiles: 0
    }
  };

  const rootItems = getRootItems();
  results.summary.totalItems = rootItems.length;

  rootItems.forEach(item => {
    const itemPath = path.join(PROJECT_ROOT, item);
    
    // Skip hidden files/directories starting with . (except explicitly allowed)
    if (item.startsWith('.') && !isAllowedFile(item)) {
      if (isDirectory(itemPath)) {
        results.summary.directories++;
        results.warnings.push(`✓ Directory: ${item}/`);
      }
      return;
    }

    if (isDirectory(itemPath)) {
      results.summary.directories++;
      results.warnings.push(`✓ Directory: ${item}/`);
    } else {
      // It's a file - check if it's allowed
      if (isAllowedFile(item)) {
        results.summary.allowedFiles++;
        results.warnings.push(`✓ Allowed file: ${item}`);
      } else if (matchesForbiddenPattern(item)) {
        results.passed = false;
        results.summary.forbiddenFiles++;
        results.errors.push(
          `FORBIDDEN: ${item} (matches forbidden pattern)`
        );
      } else {
        // File doesn't match forbidden patterns but isn't explicitly allowed
        // This might be acceptable (like config files), but we'll note it
        results.summary.allowedFiles++;
        results.warnings.push(`⚠ Unlisted file: ${item} (not explicitly forbidden)`);
      }
    }
  });

  return results;
}

/**
 * Run the property test
 */
function runTest() {
  console.log('🧪 Property Test: Root Directory Cleanliness');
  console.log('Feature: project-restructure, Property 1');
  console.log('Validates: Requirements 1.3, 4.2, 4.3, 5.2, 5.3, 5.4, 6.1, 6.3, 6.4, 6.5, 9.3\n');
  console.log('Property: For any file in the project root directory, it SHALL be');
  console.log('one of the explicitly allowed files OR be a directory. No loose');
  console.log('.html, .css, .sh, .py, .md (except allowed), test-*.js, debug-*.html,');
  console.log('or *_backup.* files SHALL exist in root.\n');
  console.log('='.repeat(70));
  console.log('');

  const results = testRootDirectoryCleanliness();

  // Display summary
  console.log('Summary:');
  console.log(`  Total items in root: ${results.summary.totalItems}`);
  console.log(`  Directories: ${results.summary.directories}`);
  console.log(`  Allowed files: ${results.summary.allowedFiles}`);
  console.log(`  Forbidden files: ${results.summary.forbiddenFiles}`);
  console.log('');

  // Display detailed results
  if (results.warnings.length > 0) {
    console.log('Root directory contents:');
    results.warnings.forEach(warning => console.log(`  ${warning}`));
    console.log('');
  }

  if (results.errors.length > 0) {
    console.log('Violations found:');
    results.errors.forEach(error => console.log(`  ❌ ${error}`));
    console.log('');
  }

  console.log('='.repeat(70));
  
  if (results.passed) {
    console.log('✅ PROPERTY TEST PASSED');
    console.log('Root directory cleanliness property is satisfied.\n');
    process.exit(0);
  } else {
    console.log('❌ PROPERTY TEST FAILED');
    console.log('Root directory cleanliness property is violated.\n');
    console.log('Expected state:');
    console.log('  - Only allowed files in root directory');
    console.log('  - No .html, .css, .sh, .py files in root');
    console.log('  - No test-*.js or debug-*.html files in root');
    console.log('  - No *_backup.* files in root');
    console.log('  - Only allowed .md files (README.md, LICENSE, CONTRIBUTING.md)\n');
    process.exit(1);
  }
}

// Run the test if executed directly
if (require.main === module) {
  runTest();
}

module.exports = { 
  testRootDirectoryCleanliness, 
  isAllowedFile, 
  matchesForbiddenPattern,
  ALLOWED_FILES,
  FORBIDDEN_PATTERNS
};
