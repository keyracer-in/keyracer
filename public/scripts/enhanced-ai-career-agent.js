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
    this.chatSessions = this.loadChatSessions();
    this.currentSessionId = this.generateSessionId();
    
    // Initialize mode theming on page load
    const appShell = document.querySelector('.app-shell');
    if (appShell) {
      appShell.setAttribute('data-mode', this.currentMode);
    }
    
    this.initializeUI();
    this.attachSessionEvents();
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
    this.updateHistorySidebar();
  }
  
  attachSessionEvents() {
    // Listen for session loaded event from session manager
    window.addEventListener('sessionLoaded', (e) => {
      const { session } = e.detail;
      this.loadSessionData(session);
    });
    
    // Listen for new session created event
    window.addEventListener('newSessionCreated', (e) => {
      const { sessionId } = e.detail;
      this.startNewChat(sessionId);
    });
  }
  
  loadSessionData(session) {
    // Save current session before switching
    this.saveCurrentSession();
    
    // Load the selected session
    this.currentSessionId = session.id;
    this.currentMode = session.mode;
    this.chatHistory = session.messages ? session.messages.slice() : [];
    this.resumeAnalysis = session.resumeAnalysis;
    
    // Update UI
    this.updateModeButtons();
    this.displayChatHistory();
    
    // Update mode indicator
    this.updateModeIndicatorBadge(this.currentMode);
  }
  
  startNewChat(sessionId) {
    // Save current session
    this.saveCurrentSession();
    
    // Reset to new session
    this.currentSessionId = sessionId || this.generateSessionId();
    this.chatHistory = [];
    this.resumeAnalysis = null;
    
    // Clear chat display
    const messagesContainer = document.getElementById('chat-messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
    }
    
    // Show welcome message
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
    // Check for resume analysis before personalized requests (Requirement 9.1)
    if (!this.resumeAnalysis) {
      this.addMessage('📄 **Resume Required**\n\nPlease upload your resume first to generate a personalized learning roadmap.\n\n💡 **Why?** Your roadmap will be customized based on:\n• Your current technical skills\n• Your experience level\n• Your specific skill gaps\n• Your career achievements', 'system');
      return;
    }
    
    // Handle incomplete resume data gracefully (Requirement 9.2)
    const candidateName = this.resumeAnalysis.candidate_name || 'there';
    const skillCount = this.resumeAnalysis.technical_skills?.length || 0;
    const gapCount = this.resumeAnalysis.current_gaps?.length || 0;
    
    if (skillCount === 0 || gapCount === 0) {
      this.addMessage('⚠️ **Incomplete Resume Data**\n\nYour resume analysis is incomplete. The roadmap may be less personalized.\n\n**Missing:**\n' + 
        (skillCount === 0 ? '• Technical skills\n' : '') +
        (gapCount === 0 ? '• Skill gaps\n' : '') +
        '\n💡 **Tip:** Try re-uploading your resume for better results.', 'system');
    }
    
    this.addMessage(`🗺️ **Generating Personalized Learning Roadmap for ${candidateName}**\n\nAnalyzing your profile and market trends...`, 'system');
    this.showProgress('Generating Learning Roadmap', 'generating', 25);
    
    try {
      const response = await fetch('/api/keyracer-agent/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis: this.resumeAnalysis,
          targetRole: 'Software Engineer'
        })
      });
      
      // Show specific error messages for API failures (Requirement 9.5)
      if (!response.ok) {
        this.hideProgress();
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        this.addMessage(`❌ **Roadmap Generation Failed**\n\n**Error:** ${errorData.error || response.statusText}\n**Status Code:** ${response.status}\n\n💡 **What to try:**\n• Check your internet connection\n• Try again in a few moments\n• Contact support if the issue persists`, 'error');
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        this.hideProgress();
        // Add personalization indicator before the roadmap
        this.addPersonalizationIndicator('roadmap');
        this.addMessage(data.roadmap, 'bot');
      } else {
        this.hideProgress();
        this.addMessage(`❌ **Roadmap Generation Failed**\n\n**Error:** ${data.error}\n\n💡 **What to try:**\n• Ensure your resume has been uploaded\n• Try re-uploading your resume\n• Contact support if the issue persists`, 'error');
      }
    } catch (error) {
      this.hideProgress();
      console.error('Roadmap generation error:', error);
      this.addMessage(`❌ **Connection Error**\n\n**Details:** ${error.message}\n\n💡 **What to try:**\n• Check your internet connection\n• Refresh the page and try again\n• Clear your browser cache\n• Contact support if the issue persists`, 'error');
    }
  }

  async findJobs() {
    // Check for resume analysis before personalized requests (Requirement 9.1)
    if (!this.resumeAnalysis) {
      this.addMessage('📄 **Resume Required**\n\nPlease upload your resume first for personalized job search.\n\n💡 **Why?** Job recommendations will be tailored to:\n• Your technical skills\n• Your experience level\n• Your career achievements\n• Your preferred location', 'system');
      return;
    }
    
    // Handle incomplete resume data gracefully (Requirement 9.2)
    const candidateName = this.resumeAnalysis.candidate_name || 'there';
    const skills = this.resumeAnalysis?.technical_skills || [];
    
    if (skills.length === 0) {
      this.addMessage('⚠️ **Limited Resume Data**\n\nNo technical skills found in your resume. Job search will use default skills.\n\n💡 **Tip:** Try re-uploading your resume with clear technical skills listed.', 'system');
    }
    
    this.addMessage(`🔍 **Searching Job Market for ${candidateName}**\n\nLooking for opportunities matching your skills: ${skills.slice(0, 3).join(', ') || 'General skills'}...`, 'system');
    this.setLoading(true, 'searching');
    
    try {
      const response = await fetch('/api/keyracer-agent/find-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'Software Engineer',
          skills: skills.length > 0 ? skills : ['JavaScript', 'React', 'Node.js'], // Provide fallback values (Requirement 9.4)
          location: 'Remote',
          userProfile: this.resumeAnalysis
        })
      });
      
      // Show specific error messages for API failures (Requirement 9.5)
      if (!response.ok) {
        this.setLoading(false);
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        this.addMessage(`❌ **Job Search Failed**\n\n**Error:** ${errorData.error || response.statusText}\n**Status Code:** ${response.status}\n\n💡 **What to try:**\n• Check your internet connection\n• Try again in a few moments\n• Verify your resume has been uploaded\n• Contact support if the issue persists`, 'error');
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        // Add personalization indicator before the jobs
        this.addPersonalizationIndicator('jobs');
        this.addMessage(data.jobs, 'bot');
      } else {
        this.addMessage(`❌ **Job Search Failed**\n\n**Error:** ${data.error}\n\n💡 **What to try:**\n• Ensure your resume has been uploaded\n• Try re-uploading your resume\n• Contact support if the issue persists`, 'error');
      }
    } catch (error) {
      console.error('Job search error:', error);
      this.addMessage(`❌ **Connection Error**\n\n**Details:** ${error.message}\n\n💡 **What to try:**\n• Check your internet connection\n• Refresh the page and try again\n• Clear your browser cache\n• Contact support if the issue persists`, 'error');
    } finally {
      this.setLoading(false);
    }
  }

  async startInterview() {
    // Check for resume analysis before personalized requests (Requirement 9.1)
    if (!this.resumeAnalysis) {
      this.addMessage('📄 **Resume Recommended**\n\nFor the best interview experience, please upload your resume first.\n\n💡 **Benefits:**\n• Questions tailored to your experience level\n• Focus on your technical skills\n• Reference your achievements\n• Appropriate difficulty level\n\n**Continue anyway?** You can still practice, but questions will be generic.', 'system');
      
      // Allow interview to continue with generic questions
      setTimeout(() => {
        this.switchMode('interview');
        this.addMessage(`🎯 **Mock Interview Session Started**\n\nI'll conduct a technical interview simulation. Answer as you would in a real interview.\n\n**Interview Format:**\n• Technical questions\n• Behavioral questions  \n• Real-time feedback\n• Performance scoring\n\n⚠️ **Note:** Upload your resume for personalized questions.\n\nReady? Let's begin!`, 'system');
        
        setTimeout(() => {
          this.addMessage(`**Question 1:** Tell me about yourself and walk me through your technical background. What programming languages and technologies are you most comfortable with?`, 'bot');
        }, 1500);
      }, 2000);
      return;
    }
    
    const candidateName = this.resumeAnalysis?.candidate_name || 'there';
    this.switchMode('interview');
    this.addMessage(`🎯 **Mock Interview Session Started for ${candidateName}**\n\nI'll conduct a technical interview simulation tailored to your experience level. Answer as you would in a real interview.\n\n**Interview Format:**\n• Technical questions\n• Behavioral questions  \n• Real-time feedback\n• Performance scoring\n\nReady? Let's begin!`, 'system');
    
    setTimeout(() => {
      this.addMessage(`**Question 1:** ${candidateName}, tell me about yourself and walk me through your technical background. What programming languages and technologies are you most comfortable with?`, 'bot');
    }, 1500);
  }

  async analyzeSkills() {
    // Check for resume analysis before personalized requests (Requirement 9.1)
    if (!this.resumeAnalysis) {
      this.addMessage('📄 **Resume Required**\n\nPlease upload your resume first for personalized skill gap analysis.\n\n💡 **Why?** Your analysis will include:\n• Assessment of your current technical skills\n• Identification of priority skill gaps\n• Market demand for missing skills\n• Personalized action plan\n• Realistic timeline based on your experience', 'system');
      return;
    }
    
    // Handle incomplete resume data gracefully (Requirement 9.2)
    const candidateName = this.resumeAnalysis.candidate_name || 'there';
    const skillCount = this.resumeAnalysis.technical_skills?.length || 0;
    const gapCount = this.resumeAnalysis.current_gaps?.length || 0;
    
    if (skillCount === 0 && gapCount === 0) {
      this.addMessage('⚠️ **Incomplete Resume Data**\n\nYour resume analysis is missing critical information:\n• No technical skills identified\n• No skill gaps identified\n\n💡 **Tip:** Try re-uploading your resume with:\n• Clear technical skills section\n• Detailed work experience\n• Project descriptions\n\n**Continue anyway?** The analysis will be limited.', 'system');
    }
    
    this.addMessage(`🔍 **Analyzing Skills for ${candidateName}**\n\nGenerating personalized analysis based on your ${skillCount} technical skills and identifying ${gapCount} priority gaps...`, 'system');
    this.setLoading(true, 'analyzing');
    
    try {
      const response = await fetch('/api/keyracer-agent/analyze-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis: this.resumeAnalysis,
          targetRole: 'Software Engineer'
        })
      });
      
      // Show specific error messages for API failures (Requirement 9.5)
      if (!response.ok) {
        this.setLoading(false);
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        this.addMessage(`❌ **Skill Analysis Failed**\n\n**Error:** ${errorData.error || response.statusText}\n**Status Code:** ${response.status}\n\n💡 **What to try:**\n• Check your internet connection\n• Verify your resume has been uploaded\n• Try re-uploading your resume\n• Contact support if the issue persists`, 'error');
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Add personalization indicator before the analysis
        this.addPersonalizationIndicator('skills');
        this.addMessage(data.skillAnalysis, 'bot');
      } else {
        this.addMessage(`❌ **Skill Analysis Failed**\n\n**Error:** ${data.error}\n\n💡 **What to try:**\n• Ensure your resume has been uploaded\n• Try re-uploading your resume\n• Contact support if the issue persists`, 'error');
      }
    } catch (error) {
      console.error('Skill analysis error:', error);
      this.addMessage(`❌ **Connection Error**\n\n**Details:** ${error.message}\n\n💡 **What to try:**\n• Check your internet connection\n• Refresh the page and try again\n• Clear your browser cache\n• Contact support if the issue persists`, 'error');
    } finally {
      this.setLoading(false);
    }
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
    this.showProgress('Analyzing Resume', 'analyzing', 20);

    try {
      const response = await fetch('/api/keyracer-agent/analyze-resume', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        this.resumeAnalysis = data.structured;
        this.hideProgress();
        this.addMessage(data.analysis, 'bot');
        
        // Show personalization confirmation with user's name
        const candidateName = data.structured.candidate_name || 'there';
        this.showNotification(`✅ Resume analyzed for ${candidateName}!`, 'success');
        
        // Enable natural conversation instead of button clicks
        // Users can simply ask: "generate roadmap", "find jobs", etc.
        
        // Show follow-up suggestions with personalization
        setTimeout(() => {
          this.addMessage(`🚀 **Analysis Complete, ${candidateName}! What's Next?**\n\n**Personalized Options:**\n• "Generate a learning roadmap for me" - Based on your ${data.structured.technical_skills?.length || 0} skills\n• "Find job opportunities that match my skills" - Tailored to your experience\n• "Start a mock interview" - Adjusted to your level\n• "What skills should I improve?" - Focus on your ${data.structured.current_gaps?.length || 0} gaps\n\n💡 All responses will be personalized using your resume data!`, 'system');
        }, 2000);
      } else {
        this.hideProgress();
        this.addMessage('❌ Failed to analyze resume: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      this.hideProgress();
      this.addMessage('❌ Error uploading resume. Please try again.', 'error');
    } finally {
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
    
    const previousMode = this.currentMode;
    this.currentMode = mode;
    
    // Apply mode-specific theming to app shell
    const appShell = document.querySelector('.app-shell');
    if (appShell) {
      appShell.setAttribute('data-mode', mode);
    }
    
    // Update mode indicator badge
    this.updateModeIndicatorBadge(mode);
    
    // Update UI with smooth animation
    const modeButtons = document.querySelectorAll('.mode-btn');
    const modeIndicator = document.querySelector('.mode-indicator');
    
    // Add transition class for smooth animation
    if (modeIndicator) {
      modeIndicator.style.transition = 'transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1), background 200ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)';
    }
    
    modeButtons.forEach(btn => {
      const isActive = btn.dataset.mode === mode;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      
      // Add subtle animation to button
      if (isActive) {
        btn.style.transform = 'scale(1.02)';
        setTimeout(() => {
          btn.style.transform = '';
        }, 300);
      }
    });

    // Fade out messages container
    const messagesContainer = document.getElementById('chat-messages');
    if (messagesContainer) {
      messagesContainer.style.transition = 'opacity 300ms ease';
      messagesContainer.style.opacity = '0.5';
    }
    
    // Show mode transition message after fade
    setTimeout(() => {
      if (messagesContainer) {
        messagesContainer.style.opacity = '1';
      }
      
      const modeMessages = {
        career: '🚀 **Career Guidance Mode Activated**\n\nI\'ll provide comprehensive career advice including market insights, learning roadmaps, skill analysis, and job opportunities. What can I help you with?',
        interview: '💼 **Interview Prep Mode Activated**\n\nI\'ll conduct realistic interview simulations with immediate feedback. Ready to practice technical and behavioral questions?'
      };
      
      this.addMessage(modeMessages[mode], 'system');
      
      // Update chat container aria-labelledby
      const chatContainer = document.getElementById('chat-container');
      if (chatContainer) {
        chatContainer.setAttribute('aria-labelledby', `mode-${mode}`);
      }
    }, 300);
  }
  
  updateModeIndicatorBadge(mode) {
    const badge = document.getElementById('mode-indicator-badge');
    if (!badge) return;
    
    const modeConfig = {
      career: {
        icon: 'fa-briefcase',
        text: 'Career Guidance',
        tooltip: 'Get comprehensive career advice, learning roadmaps, and job opportunities'
      },
      interview: {
        icon: 'fa-microphone',
        text: 'Interview Prep',
        tooltip: 'Practice technical and behavioral interviews with real-time feedback'
      }
    };
    
    const config = modeConfig[mode];
    if (!config) return;
    
    // Update badge with animation
    badge.style.transform = 'scale(0.9)';
    badge.style.opacity = '0.5';
    
    setTimeout(() => {
      const icon = badge.querySelector('.mode-badge-icon');
      const text = badge.querySelector('.mode-badge-text');
      const tooltip = badge.querySelector('.mode-badge-tooltip');
      
      if (icon) {
        icon.className = `fas ${config.icon} mode-badge-icon`;
      }
      if (text) {
        text.textContent = config.text;
      }
      if (tooltip) {
        tooltip.textContent = config.tooltip;
      }
      
      // Animate back
      badge.style.transform = 'scale(1)';
      badge.style.opacity = '1';
    }, 150);
  }

  async sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message || this.isProcessing) return;

    this.addMessage(message, 'user');
    input.value = '';
    this.chatHistory.push({ role: 'user', content: message });
    
    // Show skeleton loader for expected response
    const skeletonId = this.showSkeleton('message', 1);
    this.setLoading(true, this.currentMode === 'interview' ? 'interviewing' : 'thinking');

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

      // Hide skeleton before showing actual message
      this.hideSkeleton(skeletonId);

      // Show specific error messages for API failures (Requirement 9.5)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        this.addMessage(`❌ **Message Failed**\n\n**Error:** ${errorData.error || response.statusText}\n**Status Code:** ${response.status}\n\n💡 **What to try:**\n• Check your internet connection\n• Try sending your message again\n• Refresh the page if the issue persists\n• Contact support if problems continue`, 'error');
        return;
      }

      const data = await response.json();

      if (data.success) {
        this.addMessage(data.response, 'bot');
        this.chatHistory.push({ role: 'model', content: data.response });
      } else {
        this.addMessage(`❌ **Error Processing Message**\n\n**Details:** ${data.error}\n\n💡 **What to try:**\n• Try rephrasing your question\n• Ensure your resume is uploaded for personalized responses\n• Contact support if the issue persists`, 'error');
      }
    } catch (error) {
      console.error('Chat error:', error);
      this.hideSkeleton(skeletonId);
      this.addMessage(`❌ **Connection Error**\n\n**Details:** ${error.message}\n\n💡 **What to try:**\n• Check your internet connection\n• Refresh the page and try again\n• Clear your browser cache\n• Contact support if the issue persists`, 'error');
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

  addMessage(text, type, saveToHistory = true) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    // Avatar
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    
    const avatars = {
      bot: '<i class="fas fa-robot"></i>',
      system: '<i class="fas fa-cog"></i>',
      user: '<i class="fas fa-user"></i>',
      error: '<i class="fas fa-exclamation-triangle"></i>'
    };
    
    avatarDiv.innerHTML = avatars[type] || avatars.bot;
    
    // Content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'message-content';
    
    // Message text bubble
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    
    // Check if this should be a response card
    let shouldUseCard = false;
    let cardElement = null;
    
    // Detect roadmap responses - look for month-based structure or "roadmap" keyword
    if ((text.includes('Month') || text.includes('roadmap') || text.includes('Roadmap')) && 
        (text.includes('Goal:') || text.includes('Projects:') || text.includes('Resources:') || text.includes('## Month'))) {
      try {
        const roadmapData = this.parseRoadmapResponse(text);
        if (window.ResponseCards && roadmapData.phases.length > 0) {
          cardElement = window.ResponseCards.createRoadmapCard(roadmapData);
          shouldUseCard = true;
        }
      } catch (error) {
        console.error('Error creating roadmap card:', error);
      }
    } 
    // Detect job listing responses - look for job-related keywords and table structure
    else if ((text.includes('job') || text.includes('Job') || text.includes('Position')) && 
             (text.includes('| Company |') || text.includes('| Position |') || text.includes('Apply Link'))) {
      try {
        const jobsData = this.parseJobsResponse(text);
        if (window.ResponseCards && jobsData.jobs.length > 0) {
          cardElement = window.ResponseCards.createJobListingCard(jobsData);
          shouldUseCard = true;
        }
      } catch (error) {
        console.error('Error creating jobs card:', error);
      }
    } 
    // Detect skill analysis responses - look for skill-related keywords and structure
    else if ((text.includes('Skill') || text.includes('skill') || text.includes('Gap Analysis')) && 
             (text.includes('Strengths:') || text.includes('Improve:') || text.includes('🎯') || text.includes('⚠️'))) {
      try {
        const skillsData = this.parseSkillsResponse(text);
        if (window.ResponseCards && (skillsData.strengths.length > 0 || skillsData.improvements.length > 0)) {
          cardElement = window.ResponseCards.createSkillAnalysisCard(skillsData);
          shouldUseCard = true;
        }
      } catch (error) {
        console.error('Error creating skills card:', error);
      }
    }
    
    // Use card if available, otherwise use markdown formatting
    if (shouldUseCard && cardElement) {
      contentWrapper.appendChild(cardElement);
    } else {
      // Use markdown formatter for regular messages
      const formattedText = window.MarkdownFormatter ? window.MarkdownFormatter.format(text) : text;
      textDiv.innerHTML = formattedText;
      contentWrapper.appendChild(textDiv);
    }
    
    // Message actions (for bot messages only)
    if (type === 'bot' || type === 'system') {
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'message-actions';
      actionsDiv.innerHTML = `
        <button class="action-btn" aria-label="Copy message" title="Copy">
          <i class="fas fa-copy"></i>
        </button>
        <button class="action-btn" aria-label="Regenerate response" title="Regenerate">
          <i class="fas fa-redo"></i>
        </button>
        <button class="action-btn" aria-label="Bookmark message" title="Bookmark">
          <i class="fas fa-bookmark"></i>
        </button>
      `;
      
      // Add event listeners for actions
      const copyBtn = actionsDiv.querySelector('.action-btn:nth-child(1)');
      const regenerateBtn = actionsDiv.querySelector('.action-btn:nth-child(2)');
      const bookmarkBtn = actionsDiv.querySelector('.action-btn:nth-child(3)');
      
      if (copyBtn) {
        copyBtn.addEventListener('click', () => this.copyMessage(text));
      }
      
      if (regenerateBtn) {
        regenerateBtn.addEventListener('click', () => this.regenerateResponse());
      }
      
      if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', () => this.bookmarkMessage(text));
      }
      
      contentWrapper.appendChild(actionsDiv);
    }
    
    // Message metadata
    const metaDiv = document.createElement('div');
    metaDiv.className = 'message-meta';
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    metaDiv.innerHTML = `
      <span class="message-time">${timeString}</span>
      ${type === 'bot' ? '<span class="message-model"><i class="fas fa-robot"></i> Llama 3.3 70B</span>' : ''}
    `;
    
    contentWrapper.appendChild(metaDiv);
    
    // Assemble message
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentWrapper);
    
    messagesContainer.appendChild(messageDiv);
    
    // Save to session if needed
    if (saveToHistory) {
      setTimeout(() => this.saveCurrentSession(), 500);
    }
    
    this.scrollToBottom();
  }
  
  copyMessage(text) {
    // Remove HTML tags for plain text copy
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    navigator.clipboard.writeText(plainText).then(() => {
      this.showNotification('✅ Message copied to clipboard', 'success');
    }).catch(() => {
      this.showNotification('❌ Failed to copy message', 'error');
    });
  }
  
  regenerateResponse() {
    // Get the last user message and resend it
    const lastUserMessage = this.chatHistory.slice().reverse().find(msg => msg.role === 'user');
    if (lastUserMessage) {
      this.showNotification('🔄 Regenerating response...', 'info');
      // Remove the last bot response
      this.chatHistory = this.chatHistory.slice(0, -1);
      // Resend the message
      const input = document.getElementById('chat-input');
      if (input) {
        input.value = lastUserMessage.content;
        this.sendMessage();
      }
    }
  }
  
  bookmarkMessage(text) {
    // Save bookmarked messages to localStorage
    const bookmarks = JSON.parse(localStorage.getItem('keyracer_bookmarks') || '[]');
    bookmarks.push({
      text,
      timestamp: new Date().toISOString(),
      mode: this.currentMode
    });
    localStorage.setItem('keyracer_bookmarks', JSON.stringify(bookmarks));
    this.showNotification('🔖 Message bookmarked', 'success');
  }

  /**
   * Parse roadmap response text into structured data for ResponseCards
   * Handles both markdown table format and markdown header format
   */
  parseRoadmapResponse(text) {
    const lines = text.split('\n');
    const phases = [];
    let inTable = false;
    let currentPhase = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Handle markdown table format (old format)
      if (line.startsWith('| Month |') || line.startsWith('| Phase |')) {
        inTable = true;
        continue;
      }
      
      if (line.startsWith('|---')) {
        continue;
      }
      
      if (line.startsWith('|') && inTable) {
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
        if (cells.length >= 4) {
          phases.push({
            title: cells[0],
            goal: cells[1],
            projects: cells[2].split(',').map(p => p.trim()).filter(p => p),
            resources: cells[3].split(',').map(r => r.trim()).filter(r => r)
          });
        }
      }
      
      if (inTable && !line.startsWith('|')) {
        inTable = false;
      }
      
      // Handle markdown header format (new API format)
      // Look for patterns like "## Month 1-2: Foundation" or "## Month 1: Getting Started"
      if (line.match(/^##\s*(Month|Phase)\s*\d+/i)) {
        // Save previous phase if exists
        if (currentPhase && currentPhase.title) {
          phases.push(currentPhase);
        }
        
        // Extract title from header
        const titleMatch = line.match(/^##\s*(.+)$/);
        currentPhase = {
          title: titleMatch ? titleMatch[1] : line.replace(/^##\s*/, ''),
          goal: '',
          projects: [],
          resources: []
        };
      }
      // Extract goal
      else if (currentPhase && line.match(/^\*\*Goal:\*\*/i)) {
        currentPhase.goal = line.replace(/^\*\*Goal:\*\*/i, '').trim();
      }
      // Extract projects
      else if (currentPhase && line.match(/^\*\*Projects?:\*\*/i)) {
        const projectText = line.replace(/^\*\*Projects?:\*\*/i, '').trim();
        if (projectText) {
          currentPhase.projects = projectText.split(/[,;]/).map(p => p.trim()).filter(p => p);
        }
        // Look ahead for bullet points
        for (let j = i + 1; j < lines.length && j < i + 5; j++) {
          const nextLine = lines[j].trim();
          if (nextLine.match(/^[•\-\*]\s+/)) {
            currentPhase.projects.push(nextLine.replace(/^[•\-\*]\s+/, '').trim());
          } else if (nextLine.match(/^\*\*/)) {
            break;
          }
        }
      }
      // Extract resources
      else if (currentPhase && line.match(/^\*\*Resources?:\*\*/i)) {
        const resourceText = line.replace(/^\*\*Resources?:\*\*/i, '').trim();
        if (resourceText) {
          currentPhase.resources = resourceText.split(/[,;]/).map(r => r.trim()).filter(r => r);
        }
        // Look ahead for bullet points
        for (let j = i + 1; j < lines.length && j < i + 5; j++) {
          const nextLine = lines[j].trim();
          if (nextLine.match(/^[•\-\*]\s+/)) {
            currentPhase.resources.push(nextLine.replace(/^[•\-\*]\s+/, '').trim());
          } else if (nextLine.match(/^\*\*/)) {
            break;
          }
        }
      }
      // Extract tools
      else if (currentPhase && line.match(/^\*\*Tools?:\*\*/i)) {
        const toolText = line.replace(/^\*\*Tools?:\*\*/i, '').trim();
        if (toolText) {
          currentPhase.resources.push(...toolText.split(/[,;]/).map(t => t.trim()).filter(t => t));
        }
      }
    }
    
    // Add the last phase if exists
    if (currentPhase && currentPhase.title) {
      phases.push(currentPhase);
    }
    
    return {
      id: Date.now(),
      title: 'Your Learning Roadmap',
      phases: phases
    };
  }

  /**
   * Parse job listings response text into structured data for ResponseCards
   */
  parseJobsResponse(text) {
    const lines = text.split('\n');
    const jobs = [];
    let inTable = false;
    let jobCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.includes('job postings')) {
        const match = line.match(/(\d+)\s+/);
        jobCount = match ? parseInt(match[1]) : 0;
      }
      
      if (line.startsWith('| Company |')) {
        inTable = true;
        continue;
      }
      
      if (line.startsWith('|---')) {
        continue;
      }
      
      if (line.startsWith('|') && inTable) {
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
        if (cells.length >= 4) {
          jobs.push({
            company: cells[0],
            title: cells[1],
            location: cells[2],
            skills: cells[3].split(',').map(s => s.trim()).filter(s => s),
            applyUrl: cells[4] || '#',
            detailsUrl: cells[4] || '#',
            level: cells[2].toLowerCase().includes('senior') ? 'senior' : 'junior'
          });
        }
      }
      
      if (inTable && !line.startsWith('|')) {
        break;
      }
    }
    
    return {
      id: Date.now(),
      count: jobCount || jobs.length,
      jobs: jobs
    };
  }

  /**
   * Parse skill analysis response text into structured data for ResponseCards
   */
  parseSkillsResponse(text) {
    const lines = text.split('\n');
    const data = {
      id: Date.now(),
      overallScore: 75,
      strengths: [],
      improvements: [],
      actions: []
    };
    
    let currentSection = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect section headers - more flexible matching
      if (line.match(/🎯|strength|technical\s+strength/i)) {
        currentSection = 'strengths';
        continue;
      } else if (line.match(/⚠️|improve|gap|area.*improve|skill.*gap/i)) {
        currentSection = 'improvements';
        continue;
      } else if (line.match(/🚀|recommend|action|next\s+step/i)) {
        currentSection = 'actions';
        continue;
      }
      
      // Skip empty lines and section headers
      if (!line || line.match(/^\*\*.*\*\*$/) || line.match(/^#{1,3}\s/)) {
        continue;
      }
      
      // Extract bullet points
      const bulletMatch = line.match(/^[•\-\*]\s*(.+)$/);
      if (bulletMatch) {
        const cleanLine = bulletMatch[1].trim();
        
        if (currentSection === 'strengths' && cleanLine) {
          data.strengths.push({
            name: cleanLine,
            level: 80,
            levelText: 'Advanced'
          });
        } else if (currentSection === 'improvements' && cleanLine) {
          data.improvements.push({
            name: cleanLine,
            level: 40,
            levelText: 'Beginner'
          });
        } else if (currentSection === 'actions' && cleanLine) {
          data.actions.push(cleanLine);
        }
      }
    }
    
    return data;
  }

  

  

  setLoading(loading, context = 'thinking') {
    this.isProcessing = loading;
    const sendBtn = document.getElementById('send-button');
    const input = document.getElementById('chat-input');
    const typingIndicator = document.getElementById('typing-indicator');
    
    if (sendBtn) sendBtn.disabled = loading;
    if (input) input.disabled = loading;
    
    if (typingIndicator) {
      if (loading) {
        // Set contextual message based on context
        const contextMessages = {
          thinking: 'AI is thinking...',
          analyzing: 'Analyzing your resume...',
          searching: 'Searching job market...',
          generating: 'Generating roadmap...',
          processing: 'Processing your request...',
          interviewing: 'Preparing interview question...'
        };
        
        const message = contextMessages[context] || contextMessages.thinking;
        const textElement = typingIndicator.querySelector('.typing-text');
        
        if (textElement) {
          textElement.textContent = message;
        }
        
        // Set data attribute for context-specific styling
        typingIndicator.setAttribute('data-context', context);
        
        // Show with animation
        typingIndicator.style.display = 'flex';
        typingIndicator.classList.remove('hiding');
      } else {
        // Hide with animation
        typingIndicator.classList.add('hiding');
        setTimeout(() => {
          typingIndicator.style.display = 'none';
          typingIndicator.classList.remove('hiding');
        }, 300);
      }
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
  
  /**
   * Show progress indicator for long operations
   * @param {string} title - Title of the operation
   * @param {string} context - Context type (analyzing, generating, searching)
   * @param {number} estimatedSeconds - Estimated time in seconds
   */
  showProgress(title, context = 'processing', estimatedSeconds = 30) {
    const progressIndicator = document.getElementById('progress-indicator');
    if (!progressIndicator) return;
    
    // Hide typing indicator if showing
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.style.display = 'none';
    }
    
    // Set title and context
    const titleElement = document.getElementById('progress-title-text');
    if (titleElement) {
      titleElement.textContent = title;
    }
    
    progressIndicator.setAttribute('data-context', context);
    
    // Set estimated time
    const etaElement = document.getElementById('progress-eta');
    if (etaElement) {
      etaElement.textContent = `${estimatedSeconds}s`;
    }
    
    // Reset progress
    this.updateProgress(0, 'Initializing...');
    
    // Show indicator
    progressIndicator.style.display = 'block';
    progressIndicator.classList.remove('hiding');
    
    // Start simulated progress
    this.startProgressSimulation(estimatedSeconds);
  }
  
  /**
   * Update progress bar
   * @param {number} percentage - Progress percentage (0-100)
   * @param {string} status - Status message
   */
  updateProgress(percentage, status = '') {
    const fillElement = document.getElementById('progress-bar-fill');
    const percentageElement = document.getElementById('progress-percentage');
    const statusElement = document.getElementById('progress-status-text');
    
    if (fillElement) {
      fillElement.style.width = `${percentage}%`;
    }
    
    if (percentageElement) {
      percentageElement.textContent = `${Math.round(percentage)}%`;
    }
    
    if (statusElement && status) {
      statusElement.textContent = status;
    }
  }
  
  /**
   * Simulate progress for long operations
   * @param {number} estimatedSeconds - Estimated duration
   */
  startProgressSimulation(estimatedSeconds) {
    // Clear any existing simulation
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    
    let progress = 0;
    const steps = estimatedSeconds * 2; // Update every 500ms
    const increment = 100 / steps;
    
    // Status messages for different progress stages
    const statusMessages = [
      { threshold: 0, message: 'Initializing...' },
      { threshold: 20, message: 'Processing data...' },
      { threshold: 40, message: 'Analyzing information...' },
      { threshold: 60, message: 'Generating results...' },
      { threshold: 80, message: 'Finalizing...' },
      { threshold: 95, message: 'Almost done...' }
    ];
    
    this.progressInterval = setInterval(() => {
      progress += increment;
      
      // Slow down as we approach 100%
      if (progress > 90) {
        progress += increment * 0.3;
      }
      
      // Cap at 95% until actual completion
      if (progress > 95) {
        progress = 95;
      }
      
      // Find appropriate status message
      const currentStatus = statusMessages
        .reverse()
        .find(s => progress >= s.threshold);
      
      this.updateProgress(progress, currentStatus?.message || 'Processing...');
      
      // Update ETA
      const remainingSeconds = Math.ceil((100 - progress) / increment * 0.5);
      const etaElement = document.getElementById('progress-eta');
      if (etaElement && remainingSeconds > 0) {
        etaElement.textContent = `${remainingSeconds}s`;
      }
      
      if (progress >= 95) {
        clearInterval(this.progressInterval);
      }
    }, 500);
  }
  
  /**
   * Hide progress indicator
   */
  hideProgress() {
    const progressIndicator = document.getElementById('progress-indicator');
    if (!progressIndicator) return;
    
    // Clear simulation interval
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    
    // Complete the progress
    this.updateProgress(100, 'Complete!');
    
    // Hide with animation after a brief delay
    setTimeout(() => {
      progressIndicator.classList.add('hiding');
      setTimeout(() => {
        progressIndicator.style.display = 'none';
        progressIndicator.classList.remove('hiding');
      }, 300);
    }, 500);
  }
  
  /**
   * Show skeleton loader for cards
   * @param {string} type - Type of skeleton (roadmap, job, skill, message)
   * @param {number} count - Number of skeleton items to show
   */
  showSkeleton(type = 'message', count = 1) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    const skeletonId = `skeleton-${type}-${Date.now()}`;
    const skeletonContainer = document.createElement('div');
    skeletonContainer.id = skeletonId;
    skeletonContainer.className = 'skeleton-container';
    
    for (let i = 0; i < count; i++) {
      let skeletonHTML = '';
      
      switch (type) {
        case 'roadmap':
          skeletonHTML = this.createRoadmapSkeleton();
          break;
        case 'job':
          skeletonHTML = this.createJobSkeleton();
          break;
        case 'skill':
          skeletonHTML = this.createSkillSkeleton();
          break;
        case 'message':
        default:
          skeletonHTML = this.createMessageSkeleton();
          break;
      }
      
      skeletonContainer.innerHTML += skeletonHTML;
    }
    
    messagesContainer.appendChild(skeletonContainer);
    this.scrollToBottom();
    
    return skeletonId;
  }
  
  /**
   * Hide skeleton loader
   * @param {string} skeletonId - ID of skeleton container to remove
   */
  hideSkeleton(skeletonId) {
    const skeleton = document.getElementById(skeletonId);
    if (skeleton) {
      skeleton.style.opacity = '0';
      skeleton.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => {
        skeleton.remove();
      }, 300);
    }
  }
  
  /**
   * Create message skeleton HTML
   */
  createMessageSkeleton() {
    return `
      <div class="skeleton-message">
        <div class="skeleton skeleton-message-avatar"></div>
        <div class="skeleton-message-content">
          <div class="skeleton-message-bubble">
            <div class="skeleton skeleton-message-text long"></div>
            <div class="skeleton skeleton-message-text medium"></div>
            <div class="skeleton skeleton-message-text short"></div>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Create roadmap skeleton HTML
   */
  createRoadmapSkeleton() {
    return `
      <div class="skeleton-card">
        <div class="skeleton-header">
          <div class="skeleton skeleton-avatar"></div>
          <div class="skeleton skeleton-title"></div>
        </div>
        <div class="skeleton-roadmap">
          ${Array(3).fill(0).map(() => `
            <div class="skeleton-phase">
              <div class="skeleton-phase-header">
                <div class="skeleton skeleton-phase-title"></div>
                <div class="skeleton skeleton-phase-badge"></div>
              </div>
              <div class="skeleton-phase-content">
                <div class="skeleton-phase-section">
                  <div class="skeleton skeleton-section-title"></div>
                  <div class="skeleton skeleton-section-text"></div>
                  <div class="skeleton skeleton-section-text short"></div>
                </div>
                <div class="skeleton-phase-section">
                  <div class="skeleton skeleton-section-title"></div>
                  <div class="skeleton skeleton-section-text"></div>
                  <div class="skeleton skeleton-section-text short"></div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  /**
   * Create job skeleton HTML
   */
  createJobSkeleton() {
    return `
      <div class="skeleton-job">
        <div class="skeleton-job-header">
          <div class="skeleton-job-info">
            <div class="skeleton skeleton-company-name"></div>
            <div class="skeleton skeleton-job-location"></div>
          </div>
          <div class="skeleton skeleton-apply-btn"></div>
        </div>
        <div class="skeleton skeleton-job-title"></div>
        <div class="skeleton-tags">
          <div class="skeleton skeleton-tag"></div>
          <div class="skeleton skeleton-tag"></div>
          <div class="skeleton skeleton-tag"></div>
          <div class="skeleton skeleton-tag"></div>
        </div>
      </div>
    `;
  }
  
  /**
   * Create skill analysis skeleton HTML
   */
  createSkillSkeleton() {
    return `
      <div class="skeleton-card">
        <div class="skeleton-header">
          <div class="skeleton skeleton-avatar"></div>
          <div class="skeleton skeleton-title"></div>
        </div>
        ${Array(3).fill(0).map(() => `
          <div class="skeleton-skill-section">
            <div class="skeleton skeleton-skill-header"></div>
            <div class="skeleton-skill-content">
              <div class="skeleton skeleton-skill-item"></div>
              <div class="skeleton skeleton-skill-item"></div>
              <div class="skeleton skeleton-skill-item"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Add personalization indicator to show content is customized
   * @param {string} type - Type of personalized content (roadmap, jobs, skills, interview)
   */
  addPersonalizationIndicator(type) {
    if (!this.resumeAnalysis) return;
    
    const candidateName = this.resumeAnalysis.candidate_name || 'You';
    const experienceScore = this.resumeAnalysis.experience_score || 0;
    const skillCount = this.resumeAnalysis.technical_skills?.length || 0;
    const gapCount = this.resumeAnalysis.current_gaps?.length || 0;
    
    let indicatorText = '';
    
    switch (type) {
      case 'roadmap':
        indicatorText = `✨ **Personalized for ${candidateName}**\n\n📊 Based on your ${skillCount} technical skills and ${gapCount} priority gaps\n🎯 Experience Level: ${experienceScore}/100\n\n`;
        break;
      case 'jobs':
        indicatorText = `✨ **Personalized Job Search for ${candidateName}**\n\n🔍 Matching your ${skillCount} technical skills\n📈 Filtered by your experience level (${experienceScore}/100)\n\n`;
        break;
      case 'skills':
        indicatorText = `✨ **Personalized Skill Analysis for ${candidateName}**\n\n💪 Analyzing your ${skillCount} current skills\n⚠️ Identifying your ${gapCount} priority gaps\n📊 Experience Score: ${experienceScore}/100\n\n`;
        break;
      case 'interview':
        indicatorText = `✨ **Personalized Interview for ${candidateName}**\n\n🎯 Questions tailored to your experience (${experienceScore}/100)\n💼 Focused on your ${skillCount} technical skills\n\n`;
        break;
      default:
        indicatorText = `✨ **Personalized for ${candidateName}**\n\n`;
    }
    
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;

    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'personalization-indicator';
    indicatorDiv.innerHTML = `
      <div class="personalization-badge">
        <i class="fas fa-user-check"></i>
        <span class="personalization-text">${indicatorText}</span>
      </div>
    `;
    
    messagesContainer.appendChild(indicatorDiv);
    this.scrollToBottom();
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
  
  
  
  
  // Chat History Management
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  loadChatSessions() {
    try {
      return JSON.parse(localStorage.getItem('keyracer_chat_sessions') || '[]');
    } catch {
      return [];
    }
  }
  
  saveChatSessions() {
    try {
      localStorage.setItem('keyracer_chat_sessions', JSON.stringify(this.chatSessions));
    } catch (error) {
      console.warn('Failed to save chat sessions:', error);
    }
  }
  
  saveCurrentSession() {
    if (this.chatHistory.length === 0) return;
    
    const sessionData = {
      id: this.currentSessionId,
      title: this.generateSessionTitle(),
      preview: this.generateSessionPreview(),
      timestamp: new Date().toISOString(),
      mode: this.currentMode,
      messages: this.chatHistory.slice(),
      resumeAnalysis: this.resumeAnalysis
    };
    
    // Update session manager if available
    if (window.sessionManager) {
      window.sessionManager.addSession(sessionData);
    } else {
      // Fallback to old method
      const existingIndex = this.chatSessions.findIndex(s => s.id === this.currentSessionId);
      if (existingIndex >= 0) {
        this.chatSessions[existingIndex] = sessionData;
      } else {
        this.chatSessions.unshift(sessionData);
      }
      
      // Keep only last 20 sessions
      this.chatSessions = this.chatSessions.slice(0, 20);
      this.saveChatSessions();
      this.updateHistorySidebar();
    }
  }
  
  generateSessionTitle() {
    if (this.chatHistory.length === 0) return 'New Chat';
    
    const firstUserMessage = this.chatHistory.find(msg => msg.role === 'user');
    if (firstUserMessage) {
      const title = firstUserMessage.content.substring(0, 40);
      return title.length < firstUserMessage.content.length ? title + '...' : title;
    }
    
    return `${this.currentMode} Chat - ${new Date().toLocaleDateString()}`;
  }
  
  generateSessionPreview() {
    if (this.chatHistory.length === 0) return 'No messages yet';
    
    const lastUserMessage = [...this.chatHistory].reverse().find(msg => msg.role === 'user');
    if (lastUserMessage) {
      const preview = lastUserMessage.content.substring(0, 60);
      return preview.length < lastUserMessage.content.length ? preview + '...' : preview;
    }
    
    return 'Chat in progress';
  }
  
  updateHistorySidebar() {
    const historyList = document.getElementById('chat-history-list');
    if (!historyList) return;
    
    historyList.innerHTML = '';
    
    this.chatSessions.forEach(session => {
      const listItem = document.createElement('li');
      listItem.className = 'history-item';
      if (session.id === this.currentSessionId) {
        listItem.classList.add('active');
      }
      
      listItem.innerHTML = `
        <div class="history-item-content">
          <div class="history-title">${session.title}</div>
          <div class="history-meta">
            <span class="history-mode">${session.mode}</span>
            <span class="history-date">${this.formatDate(session.timestamp)}</span>
          </div>
        </div>
        <button class="history-delete" onclick="event.stopPropagation(); window.enhancedAICareerAgent.deleteSession('${session.id}')">
          <i class="fas fa-trash"></i>
        </button>
      `;
      
      listItem.addEventListener('click', () => this.loadSession(session.id));
      historyList.appendChild(listItem);
    });
    
    // Add "New Chat" button
    const newChatItem = document.createElement('li');
    newChatItem.className = 'history-item new-chat-item';
    newChatItem.innerHTML = `
      <div class="history-item-content">
        <div class="history-title"><i class="fas fa-plus"></i> New Chat</div>
      </div>
    `;
    newChatItem.addEventListener('click', () => this.startNewChat());
    historyList.appendChild(newChatItem);
  }
  
  formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
  
  loadSession(sessionId) {
    const session = this.chatSessions.find(s => s.id === sessionId);
    if (!session) return;
    
    // Save current session before switching
    this.saveCurrentSession();
    
    // Load the selected session
    this.currentSessionId = sessionId;
    this.currentMode = session.mode;
    this.chatHistory = session.messages.slice();
    this.resumeAnalysis = session.resumeAnalysis;
    
    // Update UI
    this.updateModeButtons();
    this.displayChatHistory();
    this.updateHistorySidebar();
  }
  
  startNewChat() {
    // Save current session
    this.saveCurrentSession();
    
    // Reset to new session
    this.currentSessionId = this.generateSessionId();
    this.chatHistory = [];
    this.resumeAnalysis = null;
    
    // Clear chat display
    const messagesContainer = document.getElementById('chat-messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
    }
    
    // Update UI
    this.updateHistorySidebar();
    this.showWelcomeMessage();
  }
  
  deleteSession(sessionId) {
    this.chatSessions = this.chatSessions.filter(s => s.id !== sessionId);
    this.saveChatSessions();
    
    if (sessionId === this.currentSessionId) {
      this.startNewChat();
    } else {
      this.updateHistorySidebar();
    }
  }
  
  updateModeButtons() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === this.currentMode);
    });
  }
  
  displayChatHistory() {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '';
    
    this.chatHistory.forEach(msg => {
      if (msg.role === 'user') {
        this.addMessage(msg.content, 'user', false);
      } else {
        this.addMessage(msg.content, 'bot', false);
      }
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.enhancedAICareerAgent = new EnhancedAICareerAgent();
});

/**
 * Sidebar Toggle and Mobile Drawer Functionality
 * Task 2.3: Mobile drawer with slide animation
 * Requirement: 9.2
 */

// Initialize sidebar toggle on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeSidebarToggle();
  initializeModeSelector();
});

function initializeSidebarToggle() {
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.session-sidebar');
  
  if (!sidebarToggle || !sidebar) return;
  
  // Create overlay for mobile
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);
  
  // Toggle sidebar
  sidebarToggle.addEventListener('click', () => {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // Mobile: use 'open' class with overlay
      const isOpen = sidebar.classList.contains('open');
      if (isOpen) {
        closeSidebarMobile();
      } else {
        openSidebarMobile();
      }
    } else {
      // Desktop: use 'closed' class (toggle closed state)
      const isClosed = sidebar.classList.contains('closed');
      if (isClosed) {
        openSidebarDesktop();
      } else {
        closeSidebarDesktop();
      }
    }
  });
  
  // Close sidebar when clicking overlay (mobile only)
  overlay.addEventListener('click', () => {
    closeSidebarMobile();
  });
  
  // Close sidebar on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
        closeSidebarMobile();
      }
    }
  });
  
  function openSidebarMobile() {
    sidebar.classList.add('open');
    sidebar.classList.remove('closed');
    overlay.classList.add('active');
    sidebarToggle.setAttribute('aria-expanded', 'true');
    trapFocus(sidebar);
  }
  
  function closeSidebarMobile() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    sidebarToggle.setAttribute('aria-expanded', 'false');
    sidebarToggle.focus();
  }
  
  function openSidebarDesktop() {
    sidebar.classList.remove('closed');
    sidebarToggle.setAttribute('aria-expanded', 'true');
    // Save preference
    localStorage.setItem('sidebar-state', 'open');
  }
  
  function closeSidebarDesktop() {
    sidebar.classList.add('closed');
    sidebarToggle.setAttribute('aria-expanded', 'false');
    // Save preference
    localStorage.setItem('sidebar-state', 'closed');
  }
  
  // Restore sidebar state on desktop
  if (window.innerWidth > 768) {
    const savedState = localStorage.getItem('sidebar-state');
    if (savedState === 'closed') {
      closeSidebarDesktop();
    }
  }
  
  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 768) {
        // Desktop: remove mobile classes, restore saved state
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        
        const savedState = localStorage.getItem('sidebar-state');
        if (savedState === 'closed') {
          sidebar.classList.add('closed');
        } else {
          sidebar.classList.remove('closed');
        }
      } else {
        // Mobile: remove desktop classes
        sidebar.classList.remove('closed');
      }
    }, 250);
  });
}

function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) return;
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  element.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  });
  
  // Focus first element
  firstFocusable.focus();
}

function initializeModeSelector() {
  const modeButtons = document.querySelectorAll('.mode-btn');
  const modeIndicator = document.querySelector('.mode-indicator');
  
  if (!modeButtons.length || !modeIndicator) return;
  
  modeButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      // Update active state
      modeButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      
      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');
      
      // Update mode indicator position
      const mode = button.dataset.mode;
      if (mode === 'interview') {
        modeIndicator.style.transform = 'translateX(100%)';
      } else {
        modeIndicator.style.transform = 'translateX(0)';
      }
      
      // Apply mode-specific theming
      applyModeTheming(mode);
    });
  });
}

function applyModeTheming(mode) {
  const root = document.documentElement;
  
  if (mode === 'career') {
    // Blue theme for career mode
    root.style.setProperty('--mode-accent', '#06b6d4');
  } else if (mode === 'interview') {
    // Purple theme for interview mode
    root.style.setProperty('--mode-accent', '#7c3aed');
  }
  
  // Announce mode change to screen readers
  announceToScreenReader(`Switched to ${mode} mode`);
}

function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Session management functions
function initializeSessionManagement() {
  const newChatBtn = document.querySelector('.new-chat-btn');
  const sessionItems = document.querySelectorAll('.session-item');
  const sessionSearch = document.getElementById('session-search');
  
  // New chat button
  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
      createNewSession();
    });
  }
  
  // Session item clicks
  sessionItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.session-actions')) {
        const sessionId = item.dataset.sessionId;
        loadSession(sessionId);
      }
    });
    
    // Session actions
    const pinBtn = item.querySelector('.session-actions button:first-child');
    const deleteBtn = item.querySelector('.session-actions button:last-child');
    
    if (pinBtn) {
      pinBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePinSession(item);
      });
    }
    
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteSession(item);
      });
    }
  });
  
  // Session search
  if (sessionSearch) {
    sessionSearch.addEventListener('input', (e) => {
      filterSessions(e.target.value);
    });
  }
}

function createNewSession() {
  // Clear current chat
  const chatMessages = document.getElementById('chat-messages');
  if (chatMessages) {
    chatMessages.innerHTML = '';
  }
  
  // Update active session
  document.querySelectorAll('.session-item').forEach(item => {
    item.classList.remove('active');
    item.setAttribute('aria-current', 'false');
  });
  
  announceToScreenReader('New chat session created');
}

function loadSession(sessionId) {
  // Update active state
  document.querySelectorAll('.session-item').forEach(item => {
    item.classList.remove('active');
    item.setAttribute('aria-current', 'false');
  });
  
  const activeItem = document.querySelector(`[data-session-id="${sessionId}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
    activeItem.setAttribute('aria-current', 'true');
  }
  
  // Load session messages (implement based on your data structure)
  announceToScreenReader('Session loaded');
}

function togglePinSession(item) {
  const isPinned = item.classList.contains('pinned');
  
  if (isPinned) {
    item.classList.remove('pinned');
    announceToScreenReader('Session unpinned');
  } else {
    item.classList.add('pinned');
    announceToScreenReader('Session pinned');
  }
}

function deleteSession(item) {
  const sessionTitle = item.querySelector('.session-title').textContent;
  
  if (confirm(`Delete session "${sessionTitle}"?`)) {
    item.remove();
    announceToScreenReader('Session deleted');
  }
}

function filterSessions(query) {
  const sessionItems = document.querySelectorAll('.session-item');
  const lowerQuery = query.toLowerCase();
  
  sessionItems.forEach(item => {
    const title = item.querySelector('.session-title').textContent.toLowerCase();
    const preview = item.querySelector('.session-preview').textContent.toLowerCase();
    
    if (title.includes(lowerQuery) || preview.includes(lowerQuery)) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
}

// Initialize session management when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeSessionManagement();
});

// Auto-resize textarea
function initializeTextareaAutoResize() {
  const textarea = document.querySelector('.text-input');
  
  if (!textarea) return;
  
  textarea.addEventListener('input', function() {
    // Reset height to auto to get the correct scrollHeight
    this.style.height = 'auto';
    
    // Calculate new height (max 5 lines)
    const lineHeight = parseInt(getComputedStyle(this).lineHeight);
    const maxHeight = lineHeight * 5;
    const newHeight = Math.min(this.scrollHeight, maxHeight);
    
    this.style.height = newHeight + 'px';
    
    // Enable/disable send button
    const sendBtn = document.querySelector('.send-btn');
    if (sendBtn) {
      sendBtn.disabled = this.value.trim().length === 0;
    }
  });
  
  // Handle keyboard shortcuts
  textarea.addEventListener('keydown', function(e) {
    // Cmd/Ctrl + Enter to send
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      const sendBtn = document.querySelector('.send-btn');
      if (sendBtn && !sendBtn.disabled) {
        sendBtn.click();
      }
    }
    
    // Escape to clear
    if (e.key === 'Escape') {
      this.value = '';
      this.style.height = 'auto';
      this.dispatchEvent(new Event('input'));
    }
  });
}

// Initialize textarea auto-resize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeTextareaAutoResize();
});

// Scroll to bottom functionality
function initializeScrollToBottom() {
  const chatMessages = document.querySelector('.chat-messages');
  const scrollBtn = document.querySelector('.scroll-to-bottom');
  
  if (!chatMessages || !scrollBtn) return;
  
  // Show/hide scroll button based on scroll position
  chatMessages.addEventListener('scroll', () => {
    const isNearBottom = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < 100;
    
    if (isNearBottom) {
      scrollBtn.style.display = 'none';
    } else {
      scrollBtn.style.display = 'flex';
    }
  });
  
  // Scroll to bottom on click
  scrollBtn.addEventListener('click', () => {
    chatMessages.scrollTo({
      top: chatMessages.scrollHeight,
      behavior: 'smooth'
    });
  });
}

// Initialize scroll to bottom when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeScrollToBottom();
});

// File upload zone functionality
function initializeFileUploadZone() {
  const uploadZone = document.querySelector('.file-upload-zone');
  const fileInput = document.getElementById('resume-upload');
  
  if (!uploadZone || !fileInput) return;
  
  // Click to upload
  uploadZone.addEventListener('click', () => {
    fileInput.click();
  });
  
  // Drag and drop
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--primary)';
    uploadZone.style.background = 'var(--surface-hover)';
  });
  
  uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.borderColor = '';
    uploadZone.style.background = '';
  });
  
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = '';
    uploadZone.style.background = '';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      fileInput.files = files;
      fileInput.dispatchEvent(new Event('change'));
    }
  });
}

// Initialize file upload zone when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeFileUploadZone();
});
