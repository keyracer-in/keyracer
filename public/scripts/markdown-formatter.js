/**
 * Enhanced Markdown Formatter
 * Task 3.3: Implement markdown formatting with syntax highlighting
 * Requirements: 2.3, 2.4
 */

class MarkdownFormatter {
  /**
   * Format text with markdown support
   * @param {string} text - The text to format
   * @returns {string} - HTML formatted text
   */
  static format(text) {
    let formatted = text;
    
    // Code blocks with syntax highlighting (must be done before inline code)
    formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'plaintext';
      const escapedCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      const highlightedCode = this.highlightCode(escapedCode, language);
      
      return `<div class="code-block-wrapper">
        <div class="code-block-header">
          <span class="code-language">${language}</span>
          <button class="code-copy-btn" onclick="MarkdownFormatter.copyCode(this)">
            <i class="fas fa-copy"></i> Copy
          </button>
        </div>
        <pre><code class="language-${language}">${highlightedCode}</code></pre>
      </div>`;
    });
    
    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Bold text (must be before italic to handle ***)
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    
    // Italic text
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/_([^_]+)_/g, '<em>$1</em>');
    
    // Headers
    formatted = formatted.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    formatted = formatted.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    formatted = formatted.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    formatted = formatted.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    formatted = formatted.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    formatted = formatted.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
    
    // Links
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Blockquotes
    formatted = formatted.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
    
    // Horizontal rules
    formatted = formatted.replace(/^---$/gm, '<hr>');
    formatted = formatted.replace(/^\*\*\*$/gm, '<hr>');
    
    // Unordered lists
    formatted = formatted.replace(/^\*\s+(.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/^-\s+(.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/^•\s+(.+)$/gm, '<li>$1</li>');
    
    // Ordered lists
    formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    
    // Wrap consecutive list items in ul/ol tags
    formatted = formatted.replace(/((?:<li>.*<\/li>\s*)+)/g, (match) => {
      return `<ul>${match}</ul>`;
    });
    
    // Line breaks and paragraphs
    formatted = formatted.replace(/\n\n/g, '</p><p>');
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Wrap in paragraph if not already wrapped
    if (!formatted.startsWith('<')) {
      formatted = `<p>${formatted}</p>`;
    }
    
    return formatted;
  }
  
  /**
   * Basic syntax highlighting for code
   * @param {string} code - The code to highlight
   * @param {string} language - The programming language
   * @returns {string} - Highlighted code
   */
  static highlightCode(code, language) {
    // Simple syntax highlighting patterns
    const patterns = {
      javascript: [
        { regex: /\b(const|let|var|function|return|if|else|for|while|class|extends|import|export|from|async|await|try|catch|throw|new)\b/g, class: 'hljs-keyword' },
        { regex: /(["'`])(?:(?=(\\?))\2.)*?\1/g, class: 'hljs-string' },
        { regex: /\b(\d+)\b/g, class: 'hljs-number' },
        { regex: /\/\/.*/g, class: 'hljs-comment' },
        { regex: /\/\*[\s\S]*?\*\//g, class: 'hljs-comment' },
        { regex: /\b(console|document|window|Array|Object|String|Number|Boolean|Math)\b/g, class: 'hljs-built_in' }
      ],
      python: [
        { regex: /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|lambda|yield|async|await)\b/g, class: 'hljs-keyword' },
        { regex: /(["'])(?:(?=(\\?))\2.)*?\1/g, class: 'hljs-string' },
        { regex: /\b(\d+)\b/g, class: 'hljs-number' },
        { regex: /#.*/g, class: 'hljs-comment' },
        { regex: /\b(print|len|range|str|int|float|list|dict|set|tuple)\b/g, class: 'hljs-built_in' }
      ],
      java: [
        { regex: /\b(public|private|protected|static|final|class|interface|extends|implements|return|if|else|for|while|new|this|super|void|int|String|boolean|double|float|long)\b/g, class: 'hljs-keyword' },
        { regex: /(["'])(?:(?=(\\?))\2.)*?\1/g, class: 'hljs-string' },
        { regex: /\b(\d+)\b/g, class: 'hljs-number' },
        { regex: /\/\/.*/g, class: 'hljs-comment' },
        { regex: /\/\*[\s\S]*?\*\//g, class: 'hljs-comment' }
      ]
    };
    
    const langPatterns = patterns[language.toLowerCase()] || patterns.javascript;
    let highlighted = code;
    
    // Apply syntax highlighting
    langPatterns.forEach(pattern => {
      highlighted = highlighted.replace(pattern.regex, (match) => {
        return `<span class="${pattern.class}">${match}</span>`;
      });
    });
    
    return highlighted;
  }
  
  /**
   * Copy code to clipboard
   * @param {HTMLElement} button - The copy button element
   */
  static copyCode(button) {
    const codeBlock = button.closest('.code-block-wrapper').querySelector('code');
    const code = codeBlock.textContent;
    
    navigator.clipboard.writeText(code).then(() => {
      const originalText = button.innerHTML;
      button.innerHTML = '<i class="fas fa-check"></i> Copied!';
      button.style.background = 'var(--success)';
      button.style.color = 'white';
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = '';
        button.style.color = '';
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy code:', err);
    });
  }
}

// Make available globally
window.MarkdownFormatter = MarkdownFormatter;
