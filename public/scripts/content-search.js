// Content Search System
class ContentSearch {
    constructor() {
        this.searchIndex = new Map();
        this.contentCache = new Map();
    }

    async buildSearchIndex() {
        try {
            const response = await fetch('/content/meta/navigation.json');
            const navigation = await response.json();
            
            // Index all content
            for (const [category, items] of Object.entries(navigation)) {
                for (const item of items) {
                    await this.indexContent(item.path, item.title);
                }
            }
        } catch (error) {
            console.error('Error building search index:', error);
        }
    }

    async indexContent(contentPath, title) {
        try {
            const response = await fetch(`/content/${contentPath}.md`);
            const content = await response.text();
            
            // Store content for quick access
            this.contentCache.set(contentPath, { title, content });
            
            // Create search index
            const searchableText = this.extractSearchableText(content);
            const keywords = this.extractKeywords(searchableText);
            
            this.searchIndex.set(contentPath, {
                title,
                keywords,
                content: searchableText.substring(0, 200) // Preview
            });
        } catch (error) {
            console.error(`Error indexing ${contentPath}:`, error);
        }
    }

    extractSearchableText(markdown) {
        // Remove markdown syntax and extract plain text
        return markdown
            .replace(/```[\s\S]*?```/g, '') // Remove code blocks
            .replace(/`[^`]+`/g, '') // Remove inline code
            .replace(/#{1,6}\s/g, '') // Remove headers
            .replace(/[*_~`]/g, '') // Remove formatting
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Extract link text
            .toLowerCase();
    }

    extractKeywords(text) {
        const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
        
        return text
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word))
            .slice(0, 50); // Limit keywords
    }

    search(query) {
        const queryLower = query.toLowerCase();
        const results = [];

        this.searchIndex.forEach((data, path) => {
            let score = 0;
            
            // Title match (higher weight)
            if (data.title.toLowerCase().includes(queryLower)) {
                score += 10;
            }
            
            // Keyword matches
            const matchingKeywords = data.keywords.filter(keyword => 
                keyword.includes(queryLower)
            );
            score += matchingKeywords.length * 2;
            
            // Content preview match
            if (data.content.includes(queryLower)) {
                score += 1;
            }
            
            if (score > 0) {
                results.push({
                    path,
                    title: data.title,
                    preview: data.content,
                    score
                });
            }
        });

        return results.sort((a, b) => b.score - a.score);
    }

    renderSearchResults(results, container) {
        if (results.length === 0) {
            container.innerHTML = '<p class="no-results">No results found</p>';
            return;
        }

        const resultsHTML = results.map(result => `
            <div class="search-result" onclick="loadContent('${result.path}')">
                <h4>${result.title}</h4>
                <p>${result.preview}...</p>
                <span class="result-path">${result.path}</span>
            </div>
        `).join('');

        container.innerHTML = resultsHTML;
    }
}

// Search UI Component
class SearchUI {
    constructor() {
        this.search = new ContentSearch();
        this.searchInput = null;
        this.searchResults = null;
        this.isVisible = false;
    }

    init() {
        this.createSearchUI();
        this.search.buildSearchIndex();
        this.bindEvents();
    }

    createSearchUI() {
        const searchHTML = `
            <div id="search-overlay" class="search-overlay">
                <div class="search-container">
                    <div class="search-header">
                        <input type="text" id="search-input" placeholder="Search tutorials and guides..." />
                        <button id="search-close">×</button>
                    </div>
                    <div id="search-results" class="search-results"></div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', searchHTML);
        
        this.searchInput = document.getElementById('search-input');
        this.searchResults = document.getElementById('search-results');
    }

    bindEvents() {
        // Search input
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length > 2) {
                const results = this.search.search(query);
                this.search.renderSearchResults(results, this.searchResults);
            } else {
                this.searchResults.innerHTML = '';
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.toggleSearch();
            }
            if (e.key === 'Escape' && this.isVisible) {
                this.hideSearch();
            }
        });

        // Close button
        document.getElementById('search-close').addEventListener('click', () => {
            this.hideSearch();
        });

        // Click outside to close
        document.getElementById('search-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'search-overlay') {
                this.hideSearch();
            }
        });
    }

    toggleSearch() {
        if (this.isVisible) {
            this.hideSearch();
        } else {
            this.showSearch();
        }
    }

    showSearch() {
        document.getElementById('search-overlay').style.display = 'flex';
        this.searchInput.focus();
        this.isVisible = true;
    }

    hideSearch() {
        document.getElementById('search-overlay').style.display = 'none';
        this.searchInput.value = '';
        this.searchResults.innerHTML = '';
        this.isVisible = false;
    }
}

// Initialize search when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const searchUI = new SearchUI();
    searchUI.init();
});

// Global function to load content from search results
function loadContent(contentPath) {
    const renderer = new MarkdownRenderer();
    const contentElement = document.getElementById('main-content');
    renderer.renderToElement(contentPath, contentElement);
    
    // Hide search
    document.querySelector('.search-overlay').style.display = 'none';
    
    // Update URL
    history.pushState({ contentPath }, '', `#${contentPath}`);
}