/**
 * Enhanced AI Career Agent with KeyRacer Agent Features
 */

class EnhancedAICareerAgent {
  constructor() {
    this.currentMode = 'career';
    this.chatHistory = [];
    this.isProcessing = false;
    this.userProfile = null;
    this.resumeAnalysis = null;
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

    // Enhanced file upload with KeyRacer features
    const fileInput = document.getElementById('resume-upload');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleResumeUpload(e));
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
      
      // Show/hide suggestions based on input - removed auto-hide
      // messageInput.addEventListener('input', () => this.toggleSuggestions());
      // messageInput.addEventListener('focus', () => this.toggleSuggestions());
    }

    // Reset chat button
    const resetBtn = document.getElementById('reset-chat');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetChat());
    }

    // Quick suggestions
    document.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const text = e.currentTarget.dataset.text;
        messageInput.value = text;
        messageInput.focus();
      });
    });

    // Add quick action buttons
    this.addQuickActions();
    this.showWelcomeMessage();
  }

  addQuickActions() {
    // Removed quick actions grid - users can ask naturally
    // Mode switcher provides sufficient UI guidance
  }

  async handleQuickAction(action) {
    const actions = {
      roadmap: () => this.generateRoadmap(),
      jobs: () => this.findJobs(),
      interview: () => this.startInterview(),
      skills: () => this.analyzeSkills()
    };
    
    if (actions[action]) {
      await actions[action]();
    }
  }

  async generateRoadmap() {
    if (!this.resumeAnalysis) {
      this.addMessage('📄 Please upload your resume first for personalized roadmap generation.', 'system');
      return;
    }
    
    this.addMessage('🗺️ **Generating Personalized Learning Roadmap**\n\nAnalyzing your profile and market trends...', 'system');
    this.setLoading(true);
    
    try {
      const response = await fetch('/api/keyracer-agent/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis: this.resumeAnalysis,
          targetRole: 'Software Engineer'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        this.addMessage(data.roadmap, 'bot');
      } else {
        this.addMessage('❌ Failed to generate roadmap: ' + data.error, 'error');
      }
    } catch (error) {
      this.addMessage('❌ Failed to generate roadmap. Please try again.', 'error');
    } finally {
      this.setLoading(false);
    }
  }

  async findJobs() {
    const skills = this.resumeAnalysis?.technical_skills || ['JavaScript', 'React', 'Node.js'];
    this.addMessage(`🔍 **Searching Job Market**\n\nLooking for opportunities matching: ${skills.slice(0, 3).join(', ')}...`, 'system');
    this.setLoading(true);
    
    try {
      const response = await fetch('/api/keyracer-agent/find-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'Software Engineer',
          skills: skills,
          location: 'Remote'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        this.addMessage(data.jobs, 'bot');
      } else {
        this.addMessage('❌ Failed to find jobs: ' + data.error, 'error');
      }
    } catch (error) {
      this.addMessage('❌ Failed to find jobs. Please try again.', 'error');
    } finally {
      this.setLoading(false);
    }
  }

  async startInterview() {
    this.switchMode('interview');
    this.addMessage('🎯 **Mock Interview Session Started**\n\nI\'ll conduct a technical interview simulation. Answer as you would in a real interview.\n\n**Interview Format:**\n• Technical questions\n• Behavioral questions  \n• Real-time feedback\n• Performance scoring\n\nReady? Let\'s begin!', 'system');
    
    setTimeout(() => {
      this.addMessage('**Question 1:** Tell me about yourself and walk me through your technical background. What programming languages and technologies are you most comfortable with?', 'bot');
    }, 1500);
  }

  async analyzeSkills() {
    if (!this.resumeAnalysis) {
      this.addMessage('📄 Please upload your resume first for skill gap analysis.', 'system');
      return;
    }
    
    const skills = this.resumeAnalysis.technical_skills || [];
    const gaps = this.resumeAnalysis.current_gaps || [];
    
    const analysis = `📊 **Comprehensive Skill Gap Analysis**

**🎯 Your Technical Strengths:**
${skills.map(skill => `• ${skill}`).join('\n')}

**⚠️ Identified Skill Gaps:**
${gaps.map(gap => `• ${gap}`).join('\n')}

**📈 Market Demand Analysis:**
• **High Demand:** Cloud Technologies (AWS, Azure), System Design
• **Growing:** AI/ML, DevOps, Microservices
• **Essential:** Data Structures & Algorithms

**🚀 Recommended Learning Path:**
1. **Week 1-2:** System Design Fundamentals
2. **Week 3-4:** Cloud Platform Basics (AWS/Azure)
3. **Week 5-6:** Advanced Algorithms & Data Structures
4. **Week 7-8:** DevOps & CI/CD Practices

**💡 Action Items:**
• Build 2-3 portfolio projects showcasing new skills
• Get cloud certifications (AWS Solutions Architect)
• Practice system design problems daily
• Contribute to open source projects`;
    
    this.addMessage(analysis, 'bot');
  }

  async handleResumeUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.addMessage('❌ Please upload a PDF file only.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.addMessage('❌ File size must be less than 5MB.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetRole', 'Software Engineer');

    this.addMessage(`📄 **Resume Analysis in Progress**\n\n**File:** ${file.name} (${(file.size / 1024).toFixed(1)} KB)\n\n🔍 Extracting skills and experience...\n⚡ Identifying gaps and opportunities...\n📊 Generating insights and recommendations...`, 'system');
    this.setLoading(true);

    try {
      const response = await fetch('/api/keyracer-agent/analyze-resume', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        this.resumeAnalysis = data.structured;
        this.addMessage(data.analysis, 'bot');
        this.showNotification('✅ Resume analyzed successfully!', 'success');
        
        // Enable natural conversation instead of button clicks
        // Users can simply ask: "generate roadmap", "find jobs", etc.
        
        // Show follow-up suggestions
        setTimeout(() => {
          this.addMessage('🚀 **Analysis Complete! What\'s Next?**\n\n**Try asking:**\n• "Generate a learning roadmap for me"\n• "Find job opportunities that match my skills"\n• "Start a mock interview"\n• "What skills should I improve?"\n\nJust ask naturally - I understand your requests!', 'system');
        }, 2000);
      } else {
        this.addMessage('❌ Failed to analyze resume: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      this.addMessage('❌ Error uploading resume. Please try again.', 'error');
    } finally {
      this.setLoading(false);
      event.target.value = '';
    }
  }

  showWelcomeMessage() {
    const welcomeMsg = `🏎️ **Welcome to KeyRacer AI Career Agent!**

I'm your intelligent career assistant powered by advanced AI agents, designed to accelerate your career growth.

**🤖 Multi-Agent System:**
• **Resume Analyzer** - Deep skill extraction & gap analysis
• **Roadmap Generator** - Personalized learning paths with market research  
• **Job Matcher** - Real-time opportunity discovery
• **Interview Coach** - FAANG-level interview simulation

**🚀 Getting Started:**
1. **Upload your resume** for instant AI analysis
2. **Choose a specialization** using the mode buttons
3. **Use quick actions** for immediate results
4. **Chat naturally** - I understand context and remember our conversation

**💡 Pro Tips:**
• Upload your resume first for personalized recommendations
• Switch between modes for different types of guidance
• Ask specific questions about your career goals

Ready to supercharge your career journey?`;
    
    setTimeout(() => this.addMessage(welcomeMsg, 'bot'), 500);
  }

  switchMode(mode) {
    if (this.currentMode === mode) return;
    
    this.currentMode = mode;
    
    // Update UI with animation
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Clear messages with fade effect
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.style.opacity = '0.5';
    
    setTimeout(() => {
      messagesContainer.style.opacity = '1';
      
      const modeMessages = {
        career: '🚀 **Career Guidance Mode Activated**\n\nI\'ll provide comprehensive career advice including market insights, learning roadmaps, skill analysis, and job opportunities. What can I help you with?',
        interview: '💼 **Interview Prep Mode Activated**\n\nI\'ll conduct realistic interview simulations with immediate feedback. Ready to practice technical and behavioral questions?'
      };
      
      this.addMessage(modeMessages[mode], 'system');
    }, 300);
  }

  async sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message || this.isProcessing) return;

    this.addMessage(message, 'user');
    input.value = '';
    this.chatHistory.push({ role: 'user', content: message });
    this.setLoading(true);

    try {
      let endpoint = '/api/keyracer-agent/ai-chat';
      
      // Use interview-specific endpoint for interview mode
      if (this.currentMode === 'interview') {
        endpoint = '/api/keyracer-agent/interview-chat';
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: this.chatHistory.slice(0, -1),
          mode: this.currentMode,
          resumeAnalysis: this.resumeAnalysis,
          targetRole: 'Software Engineer',
          userProfile: this.resumeAnalysis || {}
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

  resetChat() {
    this.chatHistory = [];
    this.resumeAnalysis = null;
    
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.innerHTML = '';
    
    // Disable quick action buttons until resume is uploaded
    document.querySelectorAll('.quick-btn').forEach(btn => {
      btn.disabled = true;
    });
    
    this.showWelcomeMessage();
    this.showNotification('🔄 Chat reset successfully', 'info');
  }

  addMessage(text, type) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    
    const avatars = {
      bot: '<i class="fas fa-robot"></i>',
      system: '<i class="fas fa-cog"></i>',
      user: '<i class="fas fa-user"></i>',
      error: '<i class="fas fa-exclamation-triangle"></i>'
    };
    
    avatarDiv.innerHTML = avatars[type] || avatars.bot;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = this.formatMessage(text);
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    // Add animation
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(20px)';
    
    messagesContainer.appendChild(messageDiv);
    
    // Trigger animation
    setTimeout(() => {
      messageDiv.style.transition = 'all 0.3s ease';
      messageDiv.style.opacity = '1';
      messageDiv.style.transform = 'translateY(0)';
    }, 50);
    
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
    
    // Disable quick action buttons during processing
    document.querySelectorAll('.quick-btn').forEach(btn => {
      if (loading) {
        btn.style.opacity = '0.6';
        btn.style.pointerEvents = 'none';
      } else {
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
      }
    });
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
      font-weight: 600;
      font-size: 14px;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Slide out and remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // toggleSuggestions method removed - suggestions now always visible
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.enhancedAICareerAgent = new EnhancedAICareerAgent();
});