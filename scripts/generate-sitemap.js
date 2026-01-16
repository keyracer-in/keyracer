/**
 * KeyRacer Sitemap Generator
 * 
 * This Node.js script generates a comprehensive sitemap.xml file
 * for better search engine indexing of the KeyRacer website.
 */

const fs = require('fs');
const path = require('path');

// Directory to scan for HTML files
const rootDir = path.resolve(__dirname, '..');

// Output file path
const outputFile = path.join(rootDir, 'sitemap.xml');

// Centralized page configuration object
const pageConfig = {
    // Base URL for the site
    baseUrl: 'https://keyracer.in',
    
    // Pages to explicitly exclude (private pages, dashboards, test pages)
    excludePages: [
        'login.html',
        'reset-password.html',
        'forgot-password.html',
        'conductor-dashboard.html',
        'organizer-dashboard.html',
        'participant-dashboard.html',
        'login-success.html',
        'test-ai-agent.html',
        'tutorial-template.html'
    ],
    
    // Page definitions with SEO properties
    pages: [
        // Homepage
        {
            path: 'index.html',
            priority: 1.0,
            changefreq: 'daily'
        },
        
        // Core feature pages
        {
            path: 'pages/typing-test.html',
            priority: 0.9,
            changefreq: 'weekly'
        },
        {
            path: 'pages/code-racer.html',
            priority: 0.9,
            changefreq: 'weekly'
        },
        
        // Tutorial pages
        {
            path: 'pages/tutorial-python.html',
            priority: 0.8,
            changefreq: 'weekly'
        },
        {
            path: 'pages/tutorial-javascript.html',
            priority: 0.8,
            changefreq: 'weekly'
        },
        {
            path: 'pages/tutorial-java.html',
            priority: 0.8,
            changefreq: 'weekly'
        },
        
        // Aptitude pages
        {
            path: 'pages/aptitude-learn.html',
            priority: 0.8,
            changefreq: 'weekly'
        },
        {
            path: 'pages/aptitude-challenges.html',
            priority: 0.6,
            changefreq: 'weekly'
        },
        {
            path: 'pages/aptitude-leaderboard.html',
            priority: 0.7,
            changefreq: 'daily'
        },
        
        // Challenge and leaderboard pages
        {
            path: 'pages/challenges.html',
            priority: 0.7,
            changefreq: 'weekly'
        },
        {
            path: 'pages/pro-skills-challenges.html',
            priority: 0.7,
            changefreq: 'weekly'
        },
        {
            path: 'pages/leaderboard.html',
            priority: 0.7,
            changefreq: 'daily'
        },
        {
            path: 'pages/coderacer-leaderboard.html',
            priority: 0.7,
            changefreq: 'daily'
        },
        {
            path: 'pages/solve-challenge.html',
            priority: 0.7,
            changefreq: 'weekly'
        },
        
        // Career and pro skills pages
        {
            path: 'pages/career-chat-widget.html',
            priority: 0.7,
            changefreq: 'weekly'
        },
        {
            path: 'pages/pro-skills.html',
            priority: 0.7,
            changefreq: 'weekly'
        },
        
        // Hackathon page
        {
            path: 'pages/hackathon.html',
            priority: 0.6,
            changefreq: 'weekly'
        },
        
        // Training and lesson pages
        {
            path: 'pages/training.html',
            priority: 0.5,
            changefreq: 'monthly'
        },
        {
            path: 'pages/lessons.html',
            priority: 0.5,
            changefreq: 'monthly'
        },
        {
            path: 'pages/grammar-lessons-complete.html',
            priority: 0.5,
            changefreq: 'monthly'
        },
        
        // Informational pages
        {
            path: 'pages/about.html',
            priority: 0.5,
            changefreq: 'monthly'
        },
        {
            path: 'pages/typing-tips.html',
            priority: 0.5,
            changefreq: 'monthly'
        },
        
        // Legal pages
        {
            path: 'pages/privacy-policy.html',
            priority: 0.3,
            changefreq: 'yearly'
        },
        {
            path: 'pages/terms-conditions.html',
            priority: 0.3,
            changefreq: 'yearly'
        }
    ],
    
    // Default values for pages not in configuration
    defaults: {
        priority: 0.5,
        changefreq: 'monthly'
    }
};

// Function to get the relative URL from the file path
function getRelativeUrl(filePath) {
    // Get path relative to root directory
    let relativeUrl = filePath.replace(rootDir, '').replace(/\\/g, '/').replace(/^\//, '');
    
    // Remove 'public/' prefix if present
    relativeUrl = relativeUrl.replace(/^public\//, '');
    
    return relativeUrl;
}

/**
 * Generates full URL from file path
 * @param {string} filePath - Relative file path (e.g., "index.html" or "pages/about.html")
 * @returns {string} - Full URL with base URL prepended
 * 
 * Requirements:
 * - Prepend base URL (https://keyracer.in)
 * - Preserve directory structure (pages/ subdirectory)
 * - Use forward slashes for all paths
 * - Handle root-level files (index.html)
 */
function generateFullUrl(filePath) {
    // Normalize path separators to forward slashes
    let normalizedPath = filePath.replace(/\\/g, '/');
    
    // Remove leading slash if present
    normalizedPath = normalizedPath.replace(/^\//, '');
    
    // Prepend base URL with forward slash
    const fullUrl = `${pageConfig.baseUrl}/${normalizedPath}`;
    
    return fullUrl;
}

// Function to get page configuration by path
function getPageConfig(relativeUrl) {
    // The relativeUrl is already normalized (without 'public/' prefix)
    // Find matching configuration
    const config = pageConfig.pages.find(page => page.path === relativeUrl);
    
    if (config) {
        return {
            priority: config.priority,
            changefreq: config.changefreq
        };
    }
    
    // Return defaults if not found
    return {
        priority: pageConfig.defaults.priority,
        changefreq: pageConfig.defaults.changefreq
    };
}

// Function to get the priority for a page
function getPriority(relativeUrl) {
    const config = getPageConfig(relativeUrl);
    return config.priority;
}

// Function to get the change frequency for a page
function getChangeFrequency(relativeUrl) {
    const config = getPageConfig(relativeUrl);
    return config.changefreq;
}

/**
 * Gets the last modification date of a file
 * @param {string} filePath - Absolute path to the file
 * @returns {string} - ISO 8601 formatted date (YYYY-MM-DD)
 * 
 * Requirements:
 * - Read file stats from file system
 * - Format date as ISO 8601 (YYYY-MM-DD)
 * - Use current date as fallback for errors
 */
function getLastModDate(filePath) {
    try {
        // Read file stats from file system
        const stats = fs.statSync(filePath);
        
        // Get modification time and format as ISO 8601 (YYYY-MM-DD)
        const modDate = stats.mtime.toISOString().split('T')[0];
        
        return modDate;
    } catch (error) {
        // Use current date as fallback for errors
        console.warn(`Warning: Could not read modification date for ${filePath}: ${error.message}. Using current date.`);
        
        const currentDate = new Date().toISOString().split('T')[0];
        return currentDate;
    }
}

/**
 * Scans directories recursively for HTML files
 * @param {string[]} directories - Array of directory paths to scan
 * @returns {string[]} - Array of file paths relative to root
 */
function scanForHtmlFiles(directories) {
    const fileList = [];
    
    function scanDirectory(dir) {
        try {
            const files = fs.readdirSync(dir);
            
            files.forEach(file => {
                const filePath = path.join(dir, file);
                
                try {
                    const stat = fs.statSync(filePath);
                    
                    if (stat.isDirectory()) {
                        // Recursively scan subdirectories
                        // Skip node_modules and other non-public directories
                        if (!filePath.includes('node_modules') && 
                            !filePath.includes('.git') &&
                            !filePath.includes('admin') && 
                            !filePath.includes('private')) {
                            scanDirectory(filePath);
                        }
                    } else if (stat.isFile() && file.endsWith('.html')) {
                        // Get path relative to root
                        const relativeUrl = getRelativeUrl(filePath);
                        fileList.push(relativeUrl);
                    }
                } catch (err) {
                    console.warn(`Warning: Could not access ${filePath}: ${err.message}`);
                }
            });
        } catch (err) {
            console.warn(`Warning: Could not read directory ${dir}: ${err.message}`);
        }
    }
    
    // Scan each provided directory
    directories.forEach(dir => {
        if (fs.existsSync(dir)) {
            scanDirectory(dir);
        } else {
            console.warn(`Warning: Directory does not exist: ${dir}`);
        }
    });
    
    return fileList;
}

/**
 * Filters out excluded pages from the file list
 * @param {string[]} files - Array of file paths relative to root
 * @param {string[]} excludeList - Array of filenames to exclude
 * @returns {string[]} - Filtered array of file paths
 */
function filterPages(files, excludeList) {
    return files.filter(file => {
        const filename = path.basename(file);
        
        // Check if filename is in exclusion list
        if (excludeList.includes(filename)) {
            console.log(`Excluding: ${file} (matched exclusion rule: ${filename})`);
            return false;
        }
        
        return true;
    });
}

/**
 * Escapes special XML characters in a string
 * @param {string} str - String to escape
 * @returns {string} - Escaped string safe for XML
 */
function escapeXml(str) {
    if (typeof str !== 'string') {
        return str;
    }
    
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Generates XML for a single URL entry
 * @param {Object} urlEntry - URL entry object
 * @param {string} urlEntry.loc - Full URL location
 * @param {string} urlEntry.lastmod - Last modification date (ISO 8601)
 * @param {string} urlEntry.changefreq - Change frequency
 * @param {number} urlEntry.priority - Priority value (0.0-1.0)
 * @returns {string} - XML fragment for the URL entry
 * 
 * Requirements:
 * - Create <url> element with loc, lastmod, changefreq, priority
 * - Escape special XML characters if present
 */
function generateUrlEntry(urlEntry) {
    const { loc, lastmod, changefreq, priority } = urlEntry;
    
    // Escape special XML characters in URL and other fields
    const escapedLoc = escapeXml(loc);
    const escapedChangefreq = escapeXml(changefreq);
    
    let xml = '  <url>\n';
    xml += `    <loc>${escapedLoc}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>${escapedChangefreq}</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += '  </url>\n';
    
    return xml;
}

/**
 * Generates complete sitemap XML document
 * @param {string[]} relativeUrls - Array of relative URLs to include
 * @returns {string} - Complete XML document
 * 
 * Requirements:
 * - Add XML declaration with UTF-8 encoding
 * - Add urlset element with correct namespace
 * - Add XSI schema location declaration
 * - Wrap all URL entries in urlset
 */
function generateSitemapXml(relativeUrls) {
    // XML declaration with UTF-8 encoding
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    
    // urlset element with correct namespace and XSI schema location
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
    xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
    xml += '                            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n';
    
    // Generate URL entries
    relativeUrls.forEach(relativeUrl => {
        const fullUrl = generateFullUrl(relativeUrl);
        const priority = getPriority(relativeUrl);
        const changeFreq = getChangeFrequency(relativeUrl);
        
        // Get absolute path for file stats
        const filePath = path.join(rootDir, 'public', relativeUrl);
        const lastMod = getLastModDate(filePath);
        
        // Create URL entry object
        const urlEntry = {
            loc: fullUrl,
            lastmod: lastMod,
            changefreq: changeFreq,
            priority: priority
        };
        
        // Generate XML for this URL entry
        xml += generateUrlEntry(urlEntry);
    });
    
    // Close urlset element
    xml += '</urlset>';
    
    return xml;
}

// Main function to generate the sitemap
function generateSitemap() {
    console.log('Starting sitemap generation...');
    console.log(`Base URL: ${pageConfig.baseUrl}`);
    console.log(`Excluded pages: ${pageConfig.excludePages.join(', ')}`);
    
    try {
        // Define directories to scan
        const publicDir = path.join(rootDir, 'public');
        const directoriesToScan = [publicDir];
        
        // Scan for HTML files
        console.log('Scanning for HTML files...');
        const allHtmlFiles = scanForHtmlFiles(directoriesToScan);
        console.log(`Found ${allHtmlFiles.length} HTML files`);
        
        // Filter out excluded pages
        console.log('Filtering excluded pages...');
        const filteredFiles = filterPages(allHtmlFiles, pageConfig.excludePages);
        console.log(`After filtering: ${filteredFiles.length} pages to include in sitemap`);
        
        // Generate the sitemap XML
        const sitemapXml = generateSitemapXml(filteredFiles);
        
        // Write the sitemap to file
        fs.writeFileSync(outputFile, sitemapXml, 'utf8');
        console.log(`Sitemap generated successfully: ${outputFile}`);
        console.log(`Total URLs in sitemap: ${filteredFiles.length}`);
    } catch (error) {
        console.error(`Error generating sitemap: ${error.message}`);
        process.exit(1);
    }
}

// Run the sitemap generator
generateSitemap();