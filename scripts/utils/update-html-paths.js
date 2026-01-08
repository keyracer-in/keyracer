#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Update HTML file paths to reflect new structure
 * - HTML files in public/pages/ need ../ prefix for styles, scripts, assets
 * - HTML files in public/ root can use direct paths
 * - Absolute paths starting with / should remain unchanged
 */

const publicDir = path.join(__dirname, '../../public');
const pagesDir = path.join(publicDir, 'pages');

function updateHtmlFile(filePath, isInPagesDir) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    if (isInPagesDir) {
      // For files in public/pages/, add ../ prefix to relative paths
      
      // Update CSS href paths (not starting with http, https, /, or already ../)
      content = content.replace(/href="(?!http|https|\/|\.\.\/)(styles\/[^"]+)"/g, 'href="../$1"');
      content = content.replace(/href='(?!http|https|\/|\.\.\/)(styles\/[^']+)'/g, "href='../$1'");
      
      // Update script src paths
      content = content.replace(/src="(?!http|https|\/|\.\.\/)(scripts\/[^"]+)"/g, 'src="../$1"');
      content = content.replace(/src='(?!http|https|\/|\.\.\/)(scripts\/[^']+)'/g, "src='../$1'");
      
      // Update asset paths (images, etc.)
      content = content.replace(/src="(?!http|https|\/|\.\.\/)(assets\/[^"]+)"/g, 'src="../$1"');
      content = content.replace(/src='(?!http|https|\/|\.\.\/)(assets\/[^']+)'/g, "src='../$1'");
      content = content.replace(/href="(?!http|https|\/|\.\.\/)(assets\/[^"]+)"/g, 'href="../$1"');
      content = content.replace(/href='(?!http|https|\/|\.\.\/)(assets\/[^']+)'/g, "href='../$1'");
      
      // Update client directory references to scripts
      content = content.replace(/src="client\/js\/([^"]+)"/g, 'src="../scripts/$1"');
      content = content.replace(/src='client\/js\/([^']+)'/g, "src='../scripts/$1'");
      content = content.replace(/src="client\/([^"]+)"/g, 'src="../scripts/$1"');
      content = content.replace(/src='client\/([^']+)'/g, "src='../scripts/$1'");
      
      // Update links to preference.html (now index.html in root)
      content = content.replace(/href="preference\.html"/g, 'href="../index.html"');
      content = content.replace(/href='preference\.html'/g, "href='../index.html'");
      
      // Update links to other pages (keep in same directory)
      // This handles links like href="login.html" -> keep as is (same directory)
      // Already correct
      
    } else {
      // For files in public/ root, ensure paths don't have ../
      
      // Remove ../ from paths that shouldn't have it
      content = content.replace(/href="\.\.\/styles\//g, 'href="styles/');
      content = content.replace(/href='\.\.\/styles\//g, "href='styles/");
      content = content.replace(/src="\.\.\/scripts\//g, 'src="scripts/');
      content = content.replace(/src='\.\.\/scripts\//g, "src='scripts/");
      content = content.replace(/src="\.\.\/assets\//g, 'src="assets/');
      content = content.replace(/src='\.\.\/assets\//g, "src='assets/");
      content = content.replace(/href="\.\.\/assets\//g, 'href="assets/');
      content = content.replace(/href='\.\.\/assets\//g, "href='assets/");
      
      // Update links to HTML pages to point to pages/ directory
      // But be careful not to match URLs with protocols or already correct paths
      content = content.replace(/href="(?!http|https|\/|pages\/|#)([a-z-]+\.html)"/g, 'href="pages/$1"');
      content = content.replace(/href='(?!http|https|\/|pages\/|#)([a-z-]+\.html)'/g, "href='pages/$1'");
      
      // Fix double pages/pages/ if it occurs
      content = content.replace(/href="pages\/pages\//g, 'href="pages/');
      content = content.replace(/href='pages\/pages\//g, "href='pages/");
      
      // Keep index.html references to root
      content = content.replace(/href="pages\/index\.html"/g, 'href="index.html"');
      content = content.replace(/href='pages\/index\.html'/g, "href='index.html'");
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated: ${path.relative(publicDir, filePath)}`);
      return true;
    } else {
      console.log(`  Skipped: ${path.relative(publicDir, filePath)} (no changes needed)`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dir, isInPagesDir) {
  const files = fs.readdirSync(dir);
  let updatedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      updatedCount += processDirectory(filePath, isInPagesDir);
    } else if (file.endsWith('.html')) {
      if (updateHtmlFile(filePath, isInPagesDir)) {
        updatedCount++;
      }
    }
  });
  
  return updatedCount;
}

console.log('Updating HTML file paths...\n');

// Update files in public/pages/
console.log('Processing files in public/pages/...');
const pagesUpdated = processDirectory(pagesDir, true);

// Update files in public/ root
console.log('\nProcessing files in public/ root...');
const rootFiles = fs.readdirSync(publicDir);
let rootUpdated = 0;
rootFiles.forEach(file => {
  const filePath = path.join(publicDir, file);
  const stat = fs.statSync(filePath);
  
  if (!stat.isDirectory() && file.endsWith('.html')) {
    if (updateHtmlFile(filePath, false)) {
      rootUpdated++;
    }
  }
});

console.log(`\n✓ Complete! Updated ${pagesUpdated + rootUpdated} HTML files.`);
