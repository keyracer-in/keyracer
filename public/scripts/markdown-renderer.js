// Markdown Content Renderer
class MarkdownRenderer {
    constructor(language = 'python') {
        this.language = language;
        
        // Define supported languages for explicit validation
        this.supportedLanguages = ['python', 'java', 'javascript', 'js', 'typescript', 'ts', 'html', 'css', 'json', 'markdown', 'md', 'bash', 'shell', 'sql'];
        
        // Configure marked.js with enhanced syntax highlighting
        marked.setOptions({
            highlight: (code, lang) => {
                return this.highlightCode(code, lang);
            },
            breaks: true,
            gfm: true
        });
    }

    /**
     * Enhanced syntax highlighting with explicit language support and fallback
     * @param {string} code - The code to highlight
     * @param {string} lang - The language identifier (optional)
     * @returns {string} Highlighted HTML or plain code
     */
    highlightCode(code, lang) {
        try {
            // Normalize language identifier
            const normalizedLang = lang ? lang.toLowerCase().trim() : null;
            
            // Try explicit language highlighting if language is specified
            if (normalizedLang) {
                // Check if language is supported by highlight.js
                if (hljs.getLanguage(normalizedLang)) {
                    return hljs.highlight(code, { language: normalizedLang }).value;
                }
                
                // Handle common aliases
                const languageAliases = {
                    'py': 'python',
                    'js': 'javascript',
                    'ts': 'typescript',
                    'sh': 'bash',
                    'md': 'markdown'
                };
                
                const aliasedLang = languageAliases[normalizedLang];
                if (aliasedLang && hljs.getLanguage(aliasedLang)) {
                    return hljs.highlight(code, { language: aliasedLang }).value;
                }
                
                console.warn(`Language "${normalizedLang}" not supported by highlight.js, falling back to auto-detection`);
            }
            
            // Fallback to auto-detection
            const result = hljs.highlightAuto(code, this.supportedLanguages);
            
            // Log detected language for debugging
            if (result.language) {
                console.debug(`Auto-detected language: ${result.language} (confidence: ${result.relevance})`);
            }
            
            return result.value;
        } catch (error) {
            console.error('Syntax highlighting error:', error, {
                language: lang,
                codeLength: code.length
            });
            // Return plain code without highlighting on error
            return code;
        }
    }

    async loadContent(contentPath) {
        try {
            // Use relative path that works from pages directory
            const response = await fetch(`../../content/${contentPath}.md`);
            
            if (!response.ok) {
                const errorMessage = `Content not found: ${contentPath}`;
                console.error(errorMessage, {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url
                });
                
                return this.getFallbackContent(contentPath, response.status);
            }
            
            const content = await response.text();
            
            // Validate content is not empty
            if (!content || content.trim().length === 0) {
                console.warn(`Empty content loaded from: ${contentPath}`);
                return this.getEmptyContentFallback(contentPath);
            }
            
            return content;
        } catch (error) {
            console.error('Error loading content:', error, {
                contentPath,
                errorType: error.name,
                errorMessage: error.message
            });
            
            return this.getNetworkErrorFallback(contentPath, error);
        }
    }

    getFallbackContent(contentPath, statusCode) {
        const pathParts = contentPath.split('/');
        const topic = pathParts[pathParts.length - 1] || 'content';
        
        if (statusCode === 404) {
            return `# Content Not Found

The requested tutorial content could not be found.

**Path:** \`${contentPath}\`

## What you can do:

- Check if the content path is correct
- Navigate to another section using the sidebar
- Return to the [introduction](/#tutorials/${this.language}/introduction)

If you believe this is an error, please report it to the site administrators.`;
        }
        
        return `# Error Loading Content

An error occurred while loading the tutorial content.

**Path:** \`${contentPath}\`  
**Status Code:** ${statusCode}

Please try again or navigate to another section.`;
    }

    getEmptyContentFallback(contentPath) {
        return `# Empty Content

The content file exists but appears to be empty.

**Path:** \`${contentPath}\`

This content may still be under development. Please check back later or navigate to another section.`;
    }

    getNetworkErrorFallback(contentPath, error) {
        return `# Network Error

Unable to load tutorial content due to a network error.

**Path:** \`${contentPath}\`  
**Error:** ${error.message}

## Troubleshooting:

- Check your internet connection
- Refresh the page
- Try again in a few moments

If the problem persists, please contact support.`;
    }

    renderMarkdown(markdownText) {
        try {
            return marked.parse(markdownText);
        } catch (error) {
            console.error('Error rendering markdown:', error);
            return `<div class="error-message">
                <h2>Rendering Error</h2>
                <p>An error occurred while rendering the content.</p>
                <pre>${error.message}</pre>
            </div>`;
        }
    }

    async renderToElement(contentPath, targetElement) {
        try {
            // Show loading state
            targetElement.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div></div>';
            
            const markdown = await this.loadContent(contentPath);
            const html = this.renderMarkdown(markdown);
            targetElement.innerHTML = html;
            
            // Add syntax highlighting
            targetElement.querySelectorAll('pre code').forEach(block => {
                try {
                    hljs.highlightElement(block);
                } catch (error) {
                    console.error('Error highlighting code block:', error);
                }
            });
            
            // Add copy buttons to code blocks
            this.addCodeCopyButtons(targetElement);
            
            // Generate table of contents
            this.generateTOC(targetElement);
        } catch (error) {
            console.error('Error in renderToElement:', error);
            targetElement.innerHTML = `<div class="error-message">
                <h1>Rendering Error</h1>
                <p>An unexpected error occurred while rendering the content.</p>
                <p><strong>Error:</strong> ${error.message}</p>
            </div>`;
        }
    }

    /**
     * Add copy-to-clipboard buttons to all code blocks
     * @param {HTMLElement} container - The container element with code blocks
     * 
     * Features:
     * - Adds a copy button to each <pre> element
     * - Provides visual feedback on successful copy
     * - Handles clipboard API errors gracefully
     * - Supports both modern and legacy clipboard APIs
     */
    addCodeCopyButtons(container) {
        const codeBlocks = container.querySelectorAll('pre');
        
        if (codeBlocks.length === 0) {
            console.debug('No code blocks found to add copy buttons');
            return;
        }
        
        codeBlocks.forEach((pre, index) => {
            try {
                // Skip if button already exists
                if (pre.querySelector('.copy-code-btn')) {
                    return;
                }
                
                // Create copy button
                const button = document.createElement('button');
                button.className = 'copy-code-btn';
                button.setAttribute('aria-label', 'Copy code to clipboard');
                button.setAttribute('title', 'Copy code');
                button.innerHTML = '<i class="fas fa-copy"></i> Copy';
                
                // Get the code content (text only, no HTML)
                const getCodeText = () => {
                    const codeElement = pre.querySelector('code');
                    return codeElement ? codeElement.textContent : pre.textContent;
                };
                
                // Handle copy button click
                button.onclick = async (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    
                    const codeText = getCodeText();
                    
                    try {
                        // Try modern clipboard API first
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                            await navigator.clipboard.writeText(codeText);
                            this.showCopySuccess(button);
                        } else {
                            // Fallback to legacy method
                            this.copyToClipboardLegacy(codeText);
                            this.showCopySuccess(button);
                        }
                    } catch (error) {
                        console.error('Error copying to clipboard:', error, {
                            codeBlockIndex: index,
                            codeLength: codeText.length,
                            errorType: error.name
                        });
                        this.showCopyError(button, error);
                    }
                };
                
                // Position the button
                pre.style.position = 'relative';
                pre.appendChild(button);
                
                console.debug(`Copy button added to code block ${index + 1}/${codeBlocks.length}`);
            } catch (error) {
                console.error('Error adding copy button:', error, {
                    codeBlockIndex: index
                });
            }
        });
        
        console.debug(`Added copy buttons to ${codeBlocks.length} code blocks`);
    }
    
    /**
     * Show visual feedback for successful copy
     * @param {HTMLElement} button - The copy button element
     */
    showCopySuccess(button) {
        const originalContent = button.innerHTML;
        
        // Update button to show success
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.classList.add('copy-success');
        button.disabled = true;
        
        // Reset after 2 seconds
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove('copy-success');
            button.disabled = false;
        }, 2000);
    }
    
    /**
     * Show visual feedback for copy error
     * @param {HTMLElement} button - The copy button element
     * @param {Error} error - The error that occurred
     */
    showCopyError(button, error) {
        const originalContent = button.innerHTML;
        
        // Update button to show error
        button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
        button.classList.add('copy-error');
        button.disabled = true;
        button.setAttribute('title', `Copy failed: ${error.message}`);
        
        // Reset after 3 seconds
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove('copy-error');
            button.disabled = false;
            button.setAttribute('title', 'Copy code');
        }, 3000);
    }
    
    /**
     * Legacy clipboard copy method for older browsers
     * @param {string} text - The text to copy
     */
    copyToClipboardLegacy(text) {
        // Create temporary textarea
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.opacity = '0';
        
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (!successful) {
                throw new Error('execCommand copy failed');
            }
        } finally {
            document.body.removeChild(textarea);
        }
    }

    /**
     * Generate table of contents from h2 and h3 headings
     * @param {HTMLElement} container - The container element with content
     * 
     * This method:
     * 1. Extracts all h2 and h3 headings from the content
     * 2. Generates unique IDs for all headings (for anchor linking)
     * 3. Creates a hierarchical TOC structure
     * 4. Displays TOC in the sidebar under the active navigation item
     * 5. Adds smooth scroll behavior to TOC links
     * 
     * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
     */
    generateTOC(container) {
        try {
            const headings = container.querySelectorAll('h2, h3');
            
            // If no headings, clear any existing TOC and return
            if (headings.length === 0) {
                console.debug('No headings found for TOC generation');
                return;
            }

            console.debug(`Generating TOC from ${headings.length} headings`);

            // Step 1 & 2: Extract headings and assign unique IDs
            const tocItems = [];
            const usedIds = new Set();

            headings.forEach((heading, index) => {
                // Generate unique ID if not present
                if (!heading.id) {
                    // Create base ID from heading text
                    const baseId = heading.textContent
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
                        .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
                    
                    // Ensure uniqueness by checking against existing IDs in the document
                    let id = baseId || `heading-${index}`;
                    let counter = 1;
                    
                    // Check both document and our tracking set for uniqueness
                    while (document.getElementById(id) || usedIds.has(id)) {
                        id = `${baseId}-${counter}`;
                        counter++;
                    }
                    
                    heading.id = id;
                    usedIds.add(id);
                    
                    console.debug(`Generated ID "${id}" for heading: "${heading.textContent}"`);
                } else {
                    usedIds.add(heading.id);
                }

                // Store heading info for TOC structure
                tocItems.push({
                    id: heading.id,
                    text: heading.textContent.trim(),
                    level: parseInt(heading.tagName.substring(1)), // h2 -> 2, h3 -> 3
                    element: heading
                });
            });

            // Step 3 & 4: Create TOC structure and display in sidebar
            this.displayTOCInSidebar(tocItems);

            console.debug(`TOC generated successfully with ${tocItems.length} items`);
        } catch (error) {
            console.error('Error generating TOC:', error, {
                errorType: error.name,
                errorMessage: error.message,
                stack: error.stack
            });
        }
    }

    /**
     * Display the table of contents in the sidebar
     * @param {Array} tocItems - Array of TOC items with id, text, and level
     * 
     * This method creates the TOC HTML structure and injects it into the sidebar
     * under the currently active navigation item. It creates a hierarchical structure
     * where h2 headings are top-level and h3 headings are nested.
     */
    displayTOCInSidebar(tocItems) {
        try {
            // Find the active navigation link
            const activeNavLink = document.querySelector('.content-navigation a.active');
            
            if (!activeNavLink) {
                console.warn('No active navigation link found, cannot display TOC');
                return;
            }

            // Find the subsection container for the active link
            const subsectionContainer = activeNavLink.parentElement.querySelector('.nav-subsections');
            
            if (!subsectionContainer) {
                console.warn('No subsection container found for active link');
                return;
            }

            // Clear existing subsections
            subsectionContainer.innerHTML = '';

            // Build hierarchical TOC structure
            let currentH2Item = null;

            tocItems.forEach((item) => {
                if (item.level === 2) {
                    // Create h2 item (top-level)
                    const li = document.createElement('li');
                    const link = this.createTOCLink(item);
                    li.appendChild(link);
                    
                    // Create nested list for h3 items
                    const nestedList = document.createElement('ul');
                    nestedList.className = 'nav-subsections-nested';
                    li.appendChild(nestedList);
                    
                    subsectionContainer.appendChild(li);
                    currentH2Item = nestedList;
                } else if (item.level === 3 && currentH2Item) {
                    // Create h3 item (nested under h2)
                    const li = document.createElement('li');
                    const link = this.createTOCLink(item);
                    li.appendChild(link);
                    currentH2Item.appendChild(li);
                } else if (item.level === 3 && !currentH2Item) {
                    // h3 without parent h2, add to top level
                    const li = document.createElement('li');
                    const link = this.createTOCLink(item);
                    li.appendChild(link);
                    subsectionContainer.appendChild(li);
                }
            });

            // Show the subsection container
            subsectionContainer.style.display = 'block';

            console.debug(`TOC displayed in sidebar with ${tocItems.length} items`);
        } catch (error) {
            console.error('Error displaying TOC in sidebar:', error);
        }
    }

    /**
     * Create a TOC link element with smooth scroll behavior
     * @param {Object} item - TOC item with id, text, and level
     * @returns {HTMLElement} The anchor element for the TOC link
     * 
     * This method creates a link that smoothly scrolls to the corresponding heading
     * when clicked, providing a better user experience.
     */
    createTOCLink(item) {
        const link = document.createElement('a');
        link.href = `#${item.id}`;
        link.textContent = item.text;
        link.className = `toc-link toc-level-${item.level}`;
        
        // Add smooth scroll behavior
        link.onclick = (e) => {
            e.preventDefault();
            
            // Find the target heading
            const targetHeading = document.getElementById(item.id);
            
            if (targetHeading) {
                // Smooth scroll to the heading
                targetHeading.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
                
                // Update URL hash without triggering hashchange event
                history.replaceState(null, '', `#${item.id}`);
                
                // Optional: Add visual feedback by briefly highlighting the heading
                targetHeading.classList.add('toc-target-highlight');
                setTimeout(() => {
                    targetHeading.classList.remove('toc-target-highlight');
                }, 2000);
                
                console.debug(`Scrolled to heading: ${item.text}`);
            } else {
                console.warn(`Target heading not found: ${item.id}`);
            }
        };
        
        return link;
    }
}

// Content Navigation System
class ContentNavigator {
    constructor(configPath = '../../content/meta/navigation.json', language = 'python') {
        this.configPath = configPath;
        this.language = language;
        this.navigation = null;
        this.renderer = new MarkdownRenderer(language);
    }

    async loadNavigation() {
        try {
            const response = await fetch(this.configPath);
            
            if (!response.ok) {
                console.error('Error loading navigation config:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url
                });
                return this.getFallbackNavigation();
            }
            
            this.navigation = await response.json();
            return this.navigation;
        } catch (error) {
            console.error('Error loading navigation:', error, {
                configPath: this.configPath,
                errorType: error.name,
                errorMessage: error.message
            });
            return this.getFallbackNavigation();
        }
    }

    getFallbackNavigation() {
        // Provide minimal fallback navigation
        const languageTitle = this.language.charAt(0).toUpperCase() + this.language.slice(1);
        return {
            [`${languageTitle} Tutorial`]: [
                {
                    title: "Introduction",
                    path: `tutorials/${this.language}/introduction`
                },
                {
                    title: "Getting Started",
                    path: `tutorials/${this.language}/getting-started`
                }
            ]
        };
    }

    /**
     * Render the navigation sidebar with language-filtered content
     * @param {HTMLElement} sidebarElement - The DOM element to render the sidebar into
     * @param {string} language - Optional language override (defaults to constructor language)
     * 
     * This method:
     * 1. Loads the navigation configuration if not already loaded
     * 2. Filters navigation items by language
     * 3. Generates HTML structure for the sidebar
     * 4. Attaches click handlers for navigation
     * 5. Sets up subsection containers for table of contents
     */
    async renderSidebar(sidebarElement, language = null) {
        try {
            // Allow language override
            if (language) {
                this.language = language;
                this.renderer = new MarkdownRenderer(language);
            }
            
            if (!this.navigation) await this.loadNavigation();
            
            const nav = document.createElement('nav');
            nav.className = 'content-navigation';
            
            // Filter navigation to show only relevant language sections
            const filteredNavigation = this.filterNavigationByLanguage(this.navigation);
            
            // Check if we have any navigation items
            if (Object.keys(filteredNavigation).length === 0) {
                console.warn(`No navigation items found for language: ${this.language}`);
                sidebarElement.innerHTML = `<div class="nav-empty">
                    <p>No navigation items available for ${this.language}</p>
                </div>`;
                return;
            }
            
            Object.entries(filteredNavigation).forEach(([category, items]) => {
                const section = document.createElement('div');
                section.className = 'nav-section';
                
                const title = document.createElement('h3');
                title.textContent = category;
                title.className = 'nav-category-title';
                section.appendChild(title);
                
                const list = document.createElement('ul');
                items.forEach(item => {
                    const li = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = `#${item.path}`;
                    link.textContent = item.title;
                    link.dataset.path = item.path;
                    link.onclick = (e) => {
                        e.preventDefault();
                        this.loadContent(item.path);
                        this.setActiveLink(link);
                    };
                    li.appendChild(link);
                    
                    // Add subsection container for table of contents
                    const subsectionList = document.createElement('ul');
                    subsectionList.className = 'nav-subsections';
                    subsectionList.style.display = 'none';
                    li.appendChild(subsectionList);
                    
                    list.appendChild(li);
                });
                
                section.appendChild(list);
                nav.appendChild(section);
            });
            
            sidebarElement.innerHTML = '';
            sidebarElement.appendChild(nav);
        } catch (error) {
            console.error('Error rendering sidebar:', error);
            sidebarElement.innerHTML = `<div class="error-message">
                <p>Error loading navigation</p>
                <p class="error-details">${error.message}</p>
            </div>`;
        }
    }

    /**
     * Filter navigation items to show only those relevant to the current language
     * @param {Object} navigation - The full navigation configuration object
     * @returns {Object} Filtered navigation containing only relevant items
     * 
     * Filtering rules:
     * 1. Include items whose path contains the current language (e.g., /python/, /java/, /javascript/)
     * 2. Include shared resources that don't specify a language (e.g., guides, documentation)
     * 3. Exclude categories that have no items after filtering
     */
    filterNavigationByLanguage(navigation) {
        if (!navigation) return {};
        
        const filtered = {};
        const languagePattern = `/${this.language}/`;
        
        Object.entries(navigation).forEach(([category, items]) => {
            // Skip if items is not an array
            if (!Array.isArray(items)) {
                console.warn(`Navigation category "${category}" does not contain an array of items`);
                return;
            }
            
            const filteredItems = items.filter(item => {
                // Validate item structure
                if (!item || !item.path) {
                    console.warn(`Invalid navigation item in category "${category}":`, item);
                    return false;
                }
                
                // Include if path contains the current language
                if (item.path.includes(languagePattern)) {
                    return true;
                }
                
                // Include shared resources (not under tutorials/)
                // Note: paths don't have leading slash, so check for 'tutorials/' not '/tutorials/'
                if (!item.path.startsWith('tutorials/')) {
                    return true;
                }
                
                // Exclude items from other language tutorials
                return false;
            });
            
            // Only include categories that have items after filtering
            if (filteredItems.length > 0) {
                filtered[category] = filteredItems;
            }
        });
        
        return filtered;
    }

    /**
     * Set the active navigation link and remove active state from others
     * @param {HTMLElement} activeLink - The link element to mark as active
     * 
     * This method ensures only one navigation item is highlighted at a time,
     * working consistently across all language tutorials.
     */
    setActiveLink(activeLink) {
        if (!activeLink) {
            console.warn('setActiveLink called with null or undefined link');
            return;
        }
        
        // Remove active class from all navigation links
        document.querySelectorAll('.content-navigation a').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to the current link
        activeLink.classList.add('active');
        
        // Ensure the active link is visible (scroll into view if needed)
        activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    updateSubsections(contentPath) {
        try {
            // Clear all subsections
            document.querySelectorAll('.nav-subsections').forEach(sub => {
                sub.innerHTML = '';
                sub.style.display = 'none';
            });

            // Find active link and populate its subsections
            const activeLink = document.querySelector(`a[data-path="${contentPath}"]`);
            if (!activeLink) return;

            const subsectionContainer = activeLink.parentElement.querySelector('.nav-subsections');
            const headings = document.querySelectorAll('#main-content h2');
            
            if (headings.length > 0) {
                headings.forEach((heading) => {
                    const li = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = `#${heading.id}`;
                    link.textContent = heading.textContent;
                    link.onclick = (e) => {
                        e.preventDefault();
                        heading.scrollIntoView({ behavior: 'smooth' });
                    };
                    li.appendChild(link);
                    subsectionContainer.appendChild(li);
                });
                subsectionContainer.style.display = 'block';
            }
        } catch (error) {
            console.error('Error updating subsections:', error);
        }
    }

    /**
     * Load content and update URL hash for deep linking support
     * @param {string} contentPath - The path to the content to load
     * @param {boolean} updateHistory - Whether to update browser history (default: true)
     * 
     * This method:
     * 1. Loads and renders the content
     * 2. Updates the URL hash for bookmarking/sharing
     * 3. Updates subsections (table of contents)
     * 4. Maintains browser history for back/forward navigation
     * 5. Uses pushState for proper history integration
     */
    loadContent(contentPath, updateHistory = true) {
        try {
            const contentElement = document.getElementById('main-content');
            
            // Validate content path
            if (!contentPath || typeof contentPath !== 'string') {
                console.error('Invalid content path:', contentPath);
                return;
            }
            
            // Render content
            this.renderer.renderToElement(contentPath, contentElement).then(() => {
                this.updateSubsections(contentPath);
                
                // Update browser history and URL
                if (updateHistory) {
                    const currentHash = window.location.hash.slice(1);
                    
                    // Only update history if the path is different
                    if (currentHash !== contentPath) {
                        // Use pushState to add to browser history
                        // This enables proper back/forward button functionality
                        const state = { 
                            contentPath: contentPath,
                            timestamp: Date.now(),
                            language: this.language
                        };
                        
                        const url = `#${contentPath}`;
                        
                        // Push state to history
                        history.pushState(state, '', url);
                        
                        console.log('History state pushed:', state);
                    }
                }
            }).catch(error => {
                console.error('Error loading content:', error);
            });
        } catch (error) {
            console.error('Error in loadContent:', error);
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Detect language from body class or default to 'python'
    // Note: Body has both 'tutorial-page' and 'tutorial-{language}' classes
    // We need to find the language-specific one (not 'tutorial-page')
    const bodyClasses = document.body.className.split(' ');
    const languageClass = bodyClasses.find(cls => 
        cls.startsWith('tutorial-') && cls !== 'tutorial-page'
    );
    const language = languageClass ? languageClass.replace('tutorial-', '') : 'python';
    
    const renderer = new MarkdownRenderer(language);
    const navigator = new ContentNavigator('/content/meta/navigation.json', language);
    
    /**
     * Enhanced hash-based routing for deep linking support
     * 
     * This implementation:
     * 1. Reads the URL hash on initial page load
     * 2. Loads the corresponding content if hash is present
     * 3. Falls back to default introduction page if no hash
     * 4. Supports bookmarking and sharing of specific sections
     */
    const getInitialContentPath = () => {
        const hash = window.location.hash.slice(1); // Remove the '#' character
        
        // If hash exists and is not empty, use it
        if (hash && hash.trim().length > 0) {
            console.log('Loading content from URL hash:', hash);
            return hash;
        }
        
        // Default to introduction page for the current language
        const defaultPath = `tutorials/${language}/introduction`;
        console.log('No hash found, loading default content:', defaultPath);
        return defaultPath;
    };
    
    const initialContent = getInitialContentPath();
    
    // Load navigation first, then content
    navigator.renderSidebar(document.getElementById('sidebar')).then(() => {
        renderer.renderToElement(initialContent, document.getElementById('main-content')).then(() => {
            navigator.updateSubsections(initialContent);
            
            // Set active link in navigation
            const activeLink = document.querySelector(`a[data-path="${initialContent}"]`);
            if (activeLink) {
                navigator.setActiveLink(activeLink);
            } else {
                console.warn('Active link not found for path:', initialContent);
            }
            
            // Set initial history state for proper back/forward navigation
            // Use replaceState for initial load to avoid creating an extra history entry
            const initialState = {
                contentPath: initialContent,
                timestamp: Date.now(),
                language: language
            };
            
            history.replaceState(initialState, '', `#${initialContent}`);
            console.log('Initial history state set:', initialState);
        }).catch(error => {
            console.error('Error loading initial content:', error);
        });
    }).catch(error => {
        console.error('Error loading navigation:', error);
    });
    
    /**
     * Handle hash changes for navigation within the page
     * This enables deep linking - users can bookmark or share URLs with specific sections
     */
    window.addEventListener('hashchange', (event) => {
        const newHash = window.location.hash.slice(1);
        
        // Ignore empty hashes
        if (!newHash || newHash.trim().length === 0) {
            return;
        }
        
        console.log('Hash changed to:', newHash);
        
        // Load the new content without updating history (to avoid duplicate entries)
        renderer.renderToElement(newHash, document.getElementById('main-content')).then(() => {
            navigator.updateSubsections(newHash);
            
            // Update active link
            const activeLink = document.querySelector(`a[data-path="${newHash}"]`);
            if (activeLink) {
                navigator.setActiveLink(activeLink);
            }
        }).catch(error => {
            console.error('Error loading content from hash change:', error);
        });
    });
    
    /**
     * Handle browser back/forward button navigation (popstate event)
     * 
     * This implementation:
     * 1. Listens for popstate events (triggered by back/forward buttons)
     * 2. Extracts the content path from the history state
     * 3. Loads the appropriate content without creating new history entries
     * 4. Maintains URL synchronization with the displayed content
     * 5. Updates the active navigation link
     */
    window.addEventListener('popstate', (event) => {
        console.log('Popstate event triggered:', event.state);
        
        let contentPath = null;
        
        // Try to get content path from state first
        if (event.state && event.state.contentPath) {
            contentPath = event.state.contentPath;
            console.log('Content path from state:', contentPath);
        } else {
            // Fallback to reading from URL hash
            const hash = window.location.hash.slice(1);
            if (hash && hash.trim().length > 0) {
                contentPath = hash;
                console.log('Content path from hash:', contentPath);
            } else {
                // If no state and no hash, load default content
                contentPath = `tutorials/${language}/introduction`;
                console.log('No state or hash, loading default:', contentPath);
            }
        }
        
        // Load content without updating history (we're already in a history navigation)
        renderer.renderToElement(contentPath, document.getElementById('main-content')).then(() => {
            navigator.updateSubsections(contentPath);
            
            // Update active link in navigation
            const activeLink = document.querySelector(`a[data-path="${contentPath}"]`);
            if (activeLink) {
                navigator.setActiveLink(activeLink);
            } else {
                console.warn('Active link not found for path:', contentPath);
            }
            
            // Ensure URL hash is synchronized
            if (window.location.hash.slice(1) !== contentPath) {
                // Use replaceState to update URL without adding to history
                history.replaceState(
                    { contentPath: contentPath, timestamp: Date.now(), language: language },
                    '',
                    `#${contentPath}`
                );
            }
        }).catch(error => {
            console.error('Error loading content from history:', error);
        });
    });
});