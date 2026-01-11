/**
 * Input Area Enhancements
 * Task 5: Enhance input area
 * Requirements: 4.1, 4.2, 4.5, 13.1-13.4, 5.1-5.5
 */

class InputAreaEnhancer {
  constructor() {
    this.textarea = null;
    this.sendBtn = null;
    this.charCount = null;
    this.fileUploadZone = null;
    this.fileInput = null;
    this.quickActionsContainer = null;
    this.uploadedFile = null;
    this.conversationState = 'initial'; // initial, resume_uploaded, mid_conversation
    
    this.init();
  }
  
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
    } else {
      this.initializeComponents();
    }
  }
  
  initializeComponents() {
    // Get DOM elements
    this.textarea = document.getElementById('chat-input');
    this.sendBtn = document.getElementById('send-button');
    this.fileUploadZone = document.querySelector('.file-upload-zone');
    this.fileInput = document.getElementById('resume-upload');
    this.quickActionsContainer = document.getElementById('quick-actions');
    
    if (!this.textarea) {
      console.warn('Input textarea not found');
      return;
    }
    
    // Initialize all features
    this.initAutoResize();
    this.initKeyboardShortcuts();
    this.initFileUpload();
    this.initQuickActions();
  }
  
  /**
   * Task 5.1: Implement auto-resizing textarea
   * Requirements: 4.1, 4.2, 4.5
   */
  initAutoResize() {
    if (!this.textarea) return;
    
    // Set initial height
    this.textarea.style.height = 'auto';
    this.textarea.style.minHeight = '44px'; // 1 line minimum
    this.textarea.style.maxHeight = '132px'; // 5 lines maximum (44px * 3 lines of text)
    this.textarea.style.overflowY = 'hidden';
    this.textarea.style.resize = 'none';
    
    // Auto-resize on input
    this.textarea.addEventListener('input', () => {
      this.handleTextareaResize();
      this.updateSendButtonState();
    });
    
    // Initial state
    this.updateSendButtonState();
  }
  
  handleTextareaResize() {
    if (!this.textarea) return;
    
    // Reset height to calculate new scroll height
    this.textarea.style.height = 'auto';
    
    // Get the scroll height
    const scrollHeight = this.textarea.scrollHeight;
    
    // Calculate line height
    const computedStyle = window.getComputedStyle(this.textarea);
    const lineHeight = parseInt(computedStyle.lineHeight) || 22;
    
    // Max 5 lines
    const maxHeight = lineHeight * 5;
    
    // Set new height (min 1 line, max 5 lines)
    const newHeight = Math.min(scrollHeight, maxHeight);
    this.textarea.style.height = newHeight + 'px';
    
    // Show scrollbar if content exceeds 5 lines
    if (scrollHeight > maxHeight) {
      this.textarea.style.overflowY = 'auto';
    } else {
      this.textarea.style.overflowY = 'hidden';
    }
  }
  
  /**
   * Task 5.1: Implement keyboard shortcuts
   * Requirements: 4.5
   */
  initKeyboardShortcuts() {
    if (!this.textarea) return;
    
    this.textarea.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + Enter to send message
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (this.sendBtn && !this.sendBtn.disabled) {
          this.sendBtn.click();
          this.announceToScreenReader('Message sent');
        }
        return;
      }
      
      // Escape to clear input
      if (e.key === 'Escape') {
        e.preventDefault();
        this.clearInput();
        this.announceToScreenReader('Input cleared');
        return;
      }
      
      // Shift + Enter for new line (default behavior, just document it)
      if (e.shiftKey && e.key === 'Enter') {
        // Allow default behavior (new line)
        return;
      }
      
      // Enter without modifiers sends message (optional, can be enabled)
      // Commented out to allow multi-line input by default
      /*
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (this.sendBtn && !this.sendBtn.disabled) {
          this.sendBtn.click();
        }
      }
      */
    });
  }
  
  /**
   * Task 5.1: Show character count at 900+ characters
   * Requirements: 4.2
   */
  
  updateSendButtonState() {
    if (!this.textarea || !this.sendBtn) return;
    
    const hasText = this.textarea.value.trim().length > 0;
    this.sendBtn.disabled = !hasText;
    
    // Update aria-label
    if (hasText) {
      this.sendBtn.setAttribute('aria-label', 'Send message');
    } else {
      this.sendBtn.setAttribute('aria-label', 'Send message (disabled - enter text first)');
    }
  }
  
  clearInput() {
    if (!this.textarea) return;
    
    this.textarea.value = '';
    this.textarea.style.height = 'auto';
    this.updateSendButtonState();
    this.textarea.focus();
  }
  
  /**
   * Task 5.2: Create drag-and-drop file upload zone
   * Requirements: 13.1, 13.2, 13.3, 13.4
   */
  initFileUpload() {
    if (!this.fileUploadZone || !this.fileInput) return;
    
    // Click to upload
    this.fileUploadZone.addEventListener('click', (e) => {
      // Don't trigger if clicking on remove button
      if (e.target.closest('.file-remove-btn')) return;
      this.fileInput.click();
    });
    
    // Drag and drop events
    this.fileUploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.fileUploadZone.setAttribute('data-state', 'dragover');
      this.fileUploadZone.style.borderColor = 'var(--primary, #6366f1)';
      this.fileUploadZone.style.background = 'var(--surface-hover, rgba(99, 102, 241, 0.05))';
    });
    
    this.fileUploadZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Only reset if leaving the zone entirely
      if (e.target === this.fileUploadZone) {
        this.fileUploadZone.setAttribute('data-state', 'idle');
        this.fileUploadZone.style.borderColor = '';
        this.fileUploadZone.style.background = '';
      }
    });
    
    this.fileUploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      this.fileUploadZone.setAttribute('data-state', 'idle');
      this.fileUploadZone.style.borderColor = '';
      this.fileUploadZone.style.background = '';
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFileSelection(files[0]);
      }
    });
    
    // File input change
    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFileSelection(e.target.files[0]);
      }
    });
  }
  
  handleFileSelection(file) {
    // Validate file type
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      this.showFileError('Please upload a PDF, DOC, or DOCX file');
      return;
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      this.showFileError('File size must be less than 5MB');
      return;
    }
    
    // Store file and show upload state
    this.uploadedFile = file;
    this.showFileUploading(file);
    
    // Simulate upload progress (in real app, this would be actual upload)
    this.simulateFileUpload(file);
  }
  
  showFileUploading(file) {
    if (!this.fileUploadZone) return;
    
    this.fileUploadZone.setAttribute('data-state', 'uploading');
    
    const fileSizeKB = (file.size / 1024).toFixed(1);
    
    this.fileUploadZone.innerHTML = `
      <div class="file-upload-progress">
        <div class="file-info">
          <i class="fas fa-file-pdf" aria-hidden="true"></i>
          <div class="file-details">
            <div class="file-name">${this.escapeHtml(file.name)}</div>
            <div class="file-size">${fileSizeKB} KB</div>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: 0%"></div>
        </div>
        <div class="progress-text">Uploading... 0%</div>
      </div>
    `;
  }
  
  simulateFileUpload(file) {
    const progressFill = this.fileUploadZone.querySelector('.progress-fill');
    const progressText = this.fileUploadZone.querySelector('.progress-text');
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      
      if (progressFill) {
        progressFill.style.width = progress + '%';
      }
      
      if (progressText) {
        progressText.textContent = `Uploading... ${progress}%`;
      }
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          this.showFileUploaded(file);
          this.updateConversationState('resume_uploaded');
          this.announceToScreenReader('File uploaded successfully');
        }, 300);
      }
    }, 100);
  }
  
  showFileUploaded(file) {
    if (!this.fileUploadZone) return;
    
    this.fileUploadZone.setAttribute('data-state', 'uploaded');
    
    const fileSizeKB = (file.size / 1024).toFixed(1);
    
    this.fileUploadZone.innerHTML = `
      <div class="file-uploaded">
        <div class="file-info">
          <i class="fas fa-file-pdf" aria-hidden="true"></i>
          <div class="file-details">
            <div class="file-name">${this.escapeHtml(file.name)}</div>
            <div class="file-size">${fileSizeKB} KB • Uploaded</div>
          </div>
        </div>
        <button class="file-remove-btn" aria-label="Remove file" title="Remove file">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    // Add remove button handler
    const removeBtn = this.fileUploadZone.querySelector('.file-remove-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeFile();
      });
    }
  }
  
  removeFile() {
    this.uploadedFile = null;
    
    if (this.fileInput) {
      this.fileInput.value = '';
    }
    
    if (this.fileUploadZone) {
      this.fileUploadZone.setAttribute('data-state', 'idle');
      this.fileUploadZone.innerHTML = `
        <i class="fas fa-paperclip" aria-hidden="true"></i>
        <span>Drag & drop resume or click to upload</span>
      `;
    }
    
    this.updateConversationState('initial');
    this.announceToScreenReader('File removed');
  }
  
  showFileError(message) {
    if (!this.fileUploadZone) return;
    
    this.fileUploadZone.setAttribute('data-state', 'error');
    
    this.fileUploadZone.innerHTML = `
      <div class="file-error">
        <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
        <div class="error-message">${this.escapeHtml(message)}</div>
        <button class="error-dismiss-btn" aria-label="Dismiss error">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      if (this.fileUploadZone.getAttribute('data-state') === 'error') {
        this.resetFileUploadZone();
      }
    }, 5000);
    
    // Manual dismiss
    const dismissBtn = this.fileUploadZone.querySelector('.error-dismiss-btn');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        this.resetFileUploadZone();
      });
    }
    
    this.announceToScreenReader('Error: ' + message);
  }
  
  resetFileUploadZone() {
    if (!this.fileUploadZone) return;
    
    this.fileUploadZone.setAttribute('data-state', 'idle');
    this.fileUploadZone.innerHTML = `
      <i class="fas fa-paperclip" aria-hidden="true"></i>
      <span>Drag & drop resume or click to upload</span>
    `;
  }
  
  /**
   * Task 5.3: Implement contextual quick actions
   * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
   */
  initQuickActions() {
    if (!this.quickActionsContainer) return;
    
    // Set initial state
    this.updateQuickActions();
    
    // Add click handlers to quick action buttons
    this.quickActionsContainer.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('.quick-action-chip');
      if (actionBtn) {
        const action = actionBtn.dataset.action;
        this.handleQuickAction(action);
      }
    });
  }
  
  updateConversationState(newState) {
    this.conversationState = newState;
    this.updateQuickActions();
  }
  
  updateQuickActions() {
    if (!this.quickActionsContainer) return;
    
    const actions = this.getQuickActionsForState();
    
    // Fade out
    this.quickActionsContainer.style.opacity = '0';
    this.quickActionsContainer.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      // Update content
      this.quickActionsContainer.innerHTML = actions.map(action => `
        <button class="quick-action-chip" 
                data-action="${action.id}"
                aria-label="${action.label}">
          <i class="${action.icon}" aria-hidden="true"></i>
          <span>${action.text}</span>
        </button>
      `).join('');
      
      // Fade in
      this.quickActionsContainer.style.opacity = '1';
      this.quickActionsContainer.style.transform = 'translateY(0)';
    }, 200);
  }
  
  getQuickActionsForState() {
    switch (this.conversationState) {
      case 'initial':
        return [
          { id: 'upload-resume', icon: 'fas fa-upload', text: 'Upload Resume', label: 'Upload resume' },
          { id: 'learn-about', icon: 'fas fa-info-circle', text: 'Learn About AI Agent', label: 'Learn about AI agent' },
          { id: 'sample-roadmap', icon: 'fas fa-map', text: 'View Sample Roadmap', label: 'View sample roadmap' },
          { id: 'career-tips', icon: 'fas fa-lightbulb', text: 'Career Tips', label: 'Get career tips' }
        ];
      
      case 'resume_uploaded':
        return [
          { id: 'generate-roadmap', icon: 'fas fa-map', text: 'Generate Roadmap', label: 'Generate learning roadmap' },
          { id: 'find-jobs', icon: 'fas fa-briefcase', text: 'Find Jobs', label: 'Find job opportunities' },
          { id: 'analyze-skills', icon: 'fas fa-chart-bar', text: 'Analyze Skills', label: 'Analyze skills' },
          { id: 'start-interview', icon: 'fas fa-microphone', text: 'Start Interview', label: 'Start mock interview' }
        ];
      
      case 'mid_conversation':
        return [
          { id: 'more-details', icon: 'fas fa-plus-circle', text: 'More Details', label: 'Get more details' },
          { id: 'clarify', icon: 'fas fa-question-circle', text: 'Clarify', label: 'Ask for clarification' },
          { id: 'new-topic', icon: 'fas fa-comments', text: 'New Topic', label: 'Start new topic' },
          { id: 'export', icon: 'fas fa-download', text: 'Export', label: 'Export conversation' }
        ];
      
      default:
        return [];
    }
  }
  
  handleQuickAction(action) {
    switch (action) {
      case 'upload-resume':
        if (this.fileInput) {
          this.fileInput.click();
        }
        break;
      
      case 'learn-about':
        this.insertTextIntoInput('Tell me about the AI Career Agent and how it can help me');
        break;
      
      case 'sample-roadmap':
        this.insertTextIntoInput('Show me a sample learning roadmap for a software engineer');
        break;
      
      case 'career-tips':
        this.insertTextIntoInput('Give me career advancement tips');
        break;
      
      case 'generate-roadmap':
        this.insertTextIntoInput('Generate a personalized learning roadmap for me');
        break;
      
      case 'find-jobs':
        this.insertTextIntoInput('Find job opportunities that match my skills');
        break;
      
      case 'analyze-skills':
        this.insertTextIntoInput('Analyze my skills and identify gaps');
        break;
      
      case 'start-interview':
        this.insertTextIntoInput('Start a mock interview session');
        break;
      
      case 'more-details':
        this.insertTextIntoInput('Can you provide more details about that?');
        break;
      
      case 'clarify':
        this.insertTextIntoInput('Can you clarify what you mean?');
        break;
      
      case 'new-topic':
        this.insertTextIntoInput('I\'d like to discuss something else');
        break;
      
      case 'export':
        this.insertTextIntoInput('Export this conversation');
        break;
      
      default:
        console.warn('Unknown quick action:', action);
    }
  }
  
  insertTextIntoInput(text) {
    if (!this.textarea) return;
    
    this.textarea.value = text;
    this.textarea.focus();
    
    // Trigger input event to update UI
    this.textarea.dispatchEvent(new Event('input'));
    
    // Move cursor to end
    this.textarea.setSelectionRange(text.length, text.length);
  }
  
  // Utility functions
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    announcement.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
  
  // Public API for external use
  getUploadedFile() {
    return this.uploadedFile;
  }
  
  setConversationState(state) {
    this.updateConversationState(state);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.inputAreaEnhancer = new InputAreaEnhancer();
  });
} else {
  window.inputAreaEnhancer = new InputAreaEnhancer();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InputAreaEnhancer;
}
