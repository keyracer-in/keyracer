// HTML to Markdown Converter
class HTMLToMarkdownConverter {
    constructor() {
        this.sectionMappings = new Map();
    }

    // Extract content from existing HTML tutorial
    extractSections(htmlContent) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const sections = doc.querySelectorAll('.tutorial-section');
        
        sections.forEach(section => {
            const id = section.id;
            const title = section.querySelector('h1')?.textContent || id;
            const content = this.convertSectionToMarkdown(section);
            
            this.sectionMappings.set(id, {
                title,
                content,
                filename: `${id}.md`
            });
        });
        
        return this.sectionMappings;
    }

    convertSectionToMarkdown(section) {
        let markdown = '';
        
        // Process each element in the section
        const elements = section.children;
        
        for (let element of elements) {
            markdown += this.convertElementToMarkdown(element) + '\n\n';
        }
        
        return markdown.trim();
    }

    convertElementToMarkdown(element) {
        const tagName = element.tagName.toLowerCase();
        
        switch (tagName) {
            case 'h1':
                return `# ${element.textContent}`;
            case 'h2':
                return `## ${element.textContent}`;
            case 'h3':
                return `### ${element.textContent}`;
            case 'h4':
                return `#### ${element.textContent}`;
            
            case 'p':
                return element.textContent;
            
            case 'ul':
                return this.convertList(element, false);
            case 'ol':
                return this.convertList(element, true);
            
            case 'pre':
                const code = element.querySelector('code');
                const language = this.extractLanguage(code);
                const codeText = code ? code.textContent : element.textContent;
                return `\`\`\`${language}\n${codeText}\n\`\`\``;
            
            case 'div':
                if (element.classList.contains('example-box')) {
                    return this.convertExampleBox(element);
                }
                return this.convertChildren(element);
            
            default:
                return this.convertChildren(element);
        }
    }

    convertList(listElement, isOrdered) {
        const items = listElement.querySelectorAll('li');
        let markdown = '';
        
        items.forEach((item, index) => {
            const prefix = isOrdered ? `${index + 1}. ` : '- ';
            markdown += `${prefix}${item.textContent}\n`;
        });
        
        return markdown.trim();
    }

    convertExampleBox(boxElement) {
        let markdown = '';
        const title = boxElement.querySelector('h3, h4')?.textContent;
        
        if (title) {
            markdown += `## ${title}\n\n`;
        }
        
        // Convert remaining content
        const otherElements = Array.from(boxElement.children).filter(
            el => !['h3', 'h4'].includes(el.tagName.toLowerCase())
        );
        
        otherElements.forEach(el => {
            markdown += this.convertElementToMarkdown(el) + '\n\n';
        });
        
        return markdown.trim();
    }

    convertChildren(element) {
        let markdown = '';
        Array.from(element.children).forEach(child => {
            markdown += this.convertElementToMarkdown(child) + '\n\n';
        });
        return markdown.trim();
    }

    extractLanguage(codeElement) {
        if (!codeElement) return '';
        
        const classList = Array.from(codeElement.classList);
        const langClass = classList.find(cls => cls.startsWith('language-'));
        
        return langClass ? langClass.replace('language-', '') : 'python';
    }

    // Generate files for each section
    generateMarkdownFiles() {
        const files = new Map();
        
        this.sectionMappings.forEach((section, id) => {
            const path = `content/tutorials/python/${section.filename}`;
            files.set(path, section.content);
        });
        
        return files;
    }
}

// Usage example
function convertExistingContent() {
    // This would be called with your existing HTML content
    const converter = new HTMLToMarkdownConverter();
    
    // Extract from existing python-tutorial.html
    fetch('/python-tutorial.html')
        .then(response => response.text())
        .then(html => {
            const sections = converter.extractSections(html);
            const files = converter.generateMarkdownFiles();
            
            // Log the converted content
            files.forEach((content, path) => {
                console.log(`File: ${path}`);
                console.log(content);
                console.log('---\n');
            });
        });
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HTMLToMarkdownConverter;
}