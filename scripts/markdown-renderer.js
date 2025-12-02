// Markdown Content Renderer
class MarkdownRenderer {
    constructor() {
        // Configure marked.js with syntax highlighting
        marked.setOptions({
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(code, { language: lang }).value;
                }
                return hljs.highlightAuto(code).value;
            },
            breaks: true,
            gfm: true
        });
    }

    async loadContent(contentPath) {
        try {
            const response = await fetch(`/content/${contentPath}.md`);
            if (!response.ok) throw new Error(`Content not found: ${contentPath}`);
            return await response.text();
        } catch (error) {
            console.error('Error loading content:', error);
            return '# Content Not Found\n\nThe requested content could not be loaded.';
        }
    }

    renderMarkdown(markdownText) {
        return marked.parse(markdownText);
    }

    async renderToElement(contentPath, targetElement) {
        const markdown = await this.loadContent(contentPath);
        const html = this.renderMarkdown(markdown);
        targetElement.innerHTML = html;
        
        // Add syntax highlighting
        targetElement.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
        });
        
        // Add copy buttons to code blocks
        this.addCodeCopyButtons(targetElement);
        
        // Generate table of contents
        this.generateTOC(targetElement);
    }

    addCodeCopyButtons(container) {
        container.querySelectorAll('pre').forEach(pre => {
            const button = document.createElement('button');
            button.className = 'copy-code-btn';
            button.textContent = 'Copy';
            button.onclick = () => {
                navigator.clipboard.writeText(pre.textContent);
                button.textContent = 'Copied!';
                setTimeout(() => button.textContent = 'Copy', 2000);
            };
            pre.style.position = 'relative';
            pre.appendChild(button);
        });
    }

    generateTOC(container) {
        const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        // Remove existing TOC
        const existingTOC = document.getElementById('table-of-contents');
        if (existingTOC) existingTOC.remove();
        
        // Don't create TOC if no headings or content not found
        if (headings.length === 0) return;
        
        // Check if content is "Content Not Found"
        const firstHeading = headings[0];
        if (firstHeading && firstHeading.textContent.includes('Content Not Found')) return;

        const tocDiv = document.createElement('div');
        tocDiv.id = 'table-of-contents';
        tocDiv.innerHTML = '<h3>Table of Contents</h3>';
        
        const tocList = document.createElement('ul');
        tocList.className = 'toc-list';

        headings.forEach((heading, index) => {
            const id = `heading-${index}`;
            heading.id = id;
            
            const li = document.createElement('li');
            li.className = `toc-level-${heading.tagName.toLowerCase()}`;
            
            const link = document.createElement('a');
            link.href = `#${id}`;
            link.textContent = heading.textContent;
            
            li.appendChild(link);
            tocList.appendChild(li);
        });

        tocDiv.appendChild(tocList);
        sidebar.appendChild(tocDiv);
    }
}

// Content Navigation System
class ContentNavigator {
    constructor(configPath = '/content/meta/navigation.json') {
        this.configPath = configPath;
        this.navigation = null;
    }

    async loadNavigation() {
        try {
            const response = await fetch(this.configPath);
            this.navigation = await response.json();
            return this.navigation;
        } catch (error) {
            console.error('Error loading navigation:', error);
            return {};
        }
    }

    async renderSidebar(sidebarElement) {
        if (!this.navigation) await this.loadNavigation();
        
        const nav = document.createElement('nav');
        nav.className = 'content-navigation';
        
        Object.entries(this.navigation).forEach(([category, items]) => {
            const section = document.createElement('div');
            section.className = 'nav-section';
            
            const title = document.createElement('h3');
            title.textContent = category;
            section.appendChild(title);
            
            const list = document.createElement('ul');
            items.forEach(item => {
                const li = document.createElement('li');
                const link = document.createElement('a');
                link.href = `#${item.path}`;
                link.textContent = item.title;
                link.onclick = (e) => {
                    e.preventDefault();
                    this.loadContent(item.path);
                };
                li.appendChild(link);
                list.appendChild(li);
            });
            
            section.appendChild(list);
            nav.appendChild(section);
        });
        
        sidebarElement.innerHTML = '';
        sidebarElement.appendChild(nav);
    }

    loadContent(contentPath) {
        const renderer = new MarkdownRenderer();
        const contentElement = document.getElementById('main-content');
        renderer.renderToElement(contentPath, contentElement);
        
        // Update URL without page reload
        history.pushState({ contentPath }, '', `#${contentPath}`);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const renderer = new MarkdownRenderer();
    const navigator = new ContentNavigator();
    
    // Load initial content based on URL hash
    const hash = window.location.hash.slice(1);
    const initialContent = hash || 'tutorials/python/introduction';
    
    // Load navigation first, then content
    navigator.renderSidebar(document.getElementById('sidebar')).then(() => {
        renderer.renderToElement(initialContent, document.getElementById('main-content'));
    });
    
    // Handle browser back/forward
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.contentPath) {
            renderer.renderToElement(event.state.contentPath, document.getElementById('main-content'));
        }
    });
});