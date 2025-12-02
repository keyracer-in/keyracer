/**
 * AI Career Agent - Multi-Mode Chat System
 */

class AICareerAgent {
  constructor() {
    this.currentMode = 'market';
    this.chatHistory = [];
    this.isProcessing = false;
    this.initializeUI();
  }

  initializeUI() {
    // Mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.currentTarget.dataset.mode;
        this.switchMode(mode);
      });
    });

    // File upload
    const fileInput = document.getElementById('resume-upload');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }

    // Send message
    const sendBtn = document.getElementById('send-button');
    const messageInput = document.getElementById('chat-input');
    
    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.sendMessage());
    }
    
    if (messageInput) {
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    // Show welcome message
    this.showWelcomeMessage();
  }

  showWelcomeMessage() {
    const welcomeMsg = `🤖 **Welcome to KeyRacer AI Career Agent!**

I'm your intelligent career assistant with three specialized modes:

📊 **Market Insights** - Get real-time job market trends and salary data
🗺️ **Learning Roadmap** - Receive week-by-week structured learning plans
💼 **Interview Prep** - Practice with FAANG-level interview questions

📄 You can also upload your resume for AI-powered analysis!

How can I help you today?`;
    
    setTimeout(() => this.addMessage(welcomeMsg, 'bot'), 500);
  }

  switchMode(mode) {
    if (this.currentMode === mode) return;
    
    this.currentMode = mode;
    this.chatHistory = [];
    
    // Update UI with animation
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Clear messages with fade
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.style.opacity = '0';
    
    setTimeout(() => {
      messagesContainer.innerHTML = '';
      messagesContainer.style.opacity = '1';
      
      const modeMessages = {
        market: '📊 Switched to **Market Insights** mode. I\'ll help you understand job trends, salaries, and opportunities. What\'s your field of interest?',
        roadmap: '🗺️ Switched to **Learning Roadmap** mode. I\'ll create a structured week-by-week learning plan. What do you want to learn?',
        interview: '💼 Switched to **Interview Prep** mode. I\'ll ask you technical questions one at a time. Ready to start?'
      };
      
      this.addMessage(modeMessages[mode], 'system');
    }, 300);
  }

  async handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.addMessage('❌ Please upload a PDF file only.', 'error');
      this.showNotification('Invalid file type', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.addMessage('❌ File size must be less than 5MB.', 'error');
      this.showNotification('File too large', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    this.addMessage(`📄 Analyzing **${file.name}** (${(file.size / 1024).toFixed(1)} KB)...`, 'system');
    this.setLoading(true);

    try {
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        this.addMessage(data.analysis, 'bot');
        this.showNotification('Resume analyzed successfully!', 'success');
      } else {
        this.addMessage('❌ Failed to analyze resume: ' + data.error, 'error');
        this.showNotification('Analysis failed', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      this.addMessage('❌ Error uploading resume. Please try again.', 'error');
      this.showNotification('Upload failed', 'error');
    } finally {
      this.setLoading(false);
      event.target.value = '';
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
      color: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideInRight 0.3s ease;
      font-weight: 600;
      font-size: 14px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  async sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message || this.isProcessing) return;

    // Add user message
    this.addMessage(message, 'user');
    input.value = '';

    // Add to history
    this.chatHistory.push({ role: 'user', content: message });

    // Show typing
    this.setLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: this.chatHistory.slice(0, -1), // Exclude current message
          mode: this.currentMode
        })
      });

      const data = await response.json();

      if (data.success) {
        this.addMessage(data.response, 'bot');
        this.chatHistory.push({ role: 'model', content: data.response });
      } else {
        this.addMessage('❌ Error: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('Chat error:', error);
      this.addMessage('❌ Failed to send message. Please check your connection.', 'error');
    } finally {
      this.setLoading(false);
    }
  }

  addMessage(text, type) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    
    if (type === 'bot' || type === 'system') {
      avatarDiv.innerHTML = '<i class="fas fa-robot"></i>';
    } else if (type === 'user') {
      avatarDiv.innerHTML = '<i class="fas fa-user"></i>';
    } else {
      avatarDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = this.formatMessage(text);
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }

  formatMessage(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^\• (.*$)/gm, '<li>$1</li>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      .replace(/((<li>.*<\/li>\s*)+)/g, '<ul>$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  }

  setLoading(loading) {
    this.isProcessing = loading;
    const sendBtn = document.getElementById('send-button');
    const input = document.getElementById('chat-input');
    const typingIndicator = document.getElementById('typing-indicator');
    
    if (sendBtn) sendBtn.disabled = loading;
    if (input) input.disabled = loading;
    if (typingIndicator) {
      typingIndicator.style.display = loading ? 'block' : 'none';
    }
  }

  scrollToBottom() {
    const messagesContainer = document.getElementById('chat-messages');
    if (messagesContainer) {
      setTimeout(() => {
        messagesContainer.scrollTo({
          top: messagesContainer.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.aiCareerAgent = new AICareerAgent();
});
