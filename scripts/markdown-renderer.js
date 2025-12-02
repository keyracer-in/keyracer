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
        const headings = container.querySelectorAll('h2, h3');
        if (headings.length === 0) return;

        headings.forEach((heading, index) => {
            heading.id = `heading-${index}`;
        });
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
                
                // Add subsection container
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
    }

    setActiveLink(activeLink) {
        document.querySelectorAll('.content-navigation a').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    updateSubsections(contentPath) {
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
            headings.forEach((heading, index) => {
                const li = document.createElement('li');
                const link = document.createElement('a');
                link.href = `#heading-${index}`;
                link.textContent = heading.textContent;
                link.onclick = (e) => {
                    e.preventDefault();
                    document.getElementById(`heading-${index}`).scrollIntoView({ behavior: 'smooth' });
                };
                li.appendChild(link);
                subsectionContainer.appendChild(li);
            });
            subsectionContainer.style.display = 'block';
        }
    }

    loadContent(contentPath) {
        const renderer = new MarkdownRenderer();
        const contentElement = document.getElementById('main-content');
        renderer.renderToElement(contentPath, contentElement).then(() => {
            this.updateSubsections(contentPath);
        });
        
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
        renderer.renderToElement(initialContent, document.getElementById('main-content')).then(() => {
            navigator.updateSubsections(initialContent);
            const activeLink = document.querySelector(`a[data-path="${initialContent}"]`);
            if (activeLink) navigator.setActiveLink(activeLink);
        });
    });
    
    // Handle browser back/forward
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.contentPath) {
            renderer.renderToElement(event.state.contentPath, document.getElementById('main-content')).then(() => {
                navigator.updateSubsections(event.state.contentPath);
            });
        }
    });
});