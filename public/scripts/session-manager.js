/**
 * Session Manager - Enhanced session management with grouping, search, and actions
 * Task 7: Enhance session management
 * Requirements: 7.2, 7.3, 7.4, 7.5
 */

class SessionManager {
  constructor() {
    this.sessions = this.loadSessions();
    this.pinnedSessions = this.loadPinnedSessions();
    this.currentFilter = 'all'; // 'all', 'career', 'interview'
    this.searchQuery = '';
    
    this.initializeUI();
  }
  
  /**
   * Task 7.1: Initialize session grouping UI
   * Groups sessions by date: Today, Yesterday, Last 7 Days, Older
   */
  initializeUI() {
    this.renderSessionGroups();
    this.attachEventListeners();
  }
  
  /**
   * Task 7.1: Render session groups with collapsible headers
   * Requirement: 7.2
   */
  renderSessionGroups() {
    const sessionList = document.querySelector('.session-list');
    if (!sessionList) return;
    
    // Filter sessions based on search and mode filter
    const filteredSessions = this.getFilteredSessions();
    
    // Group sessions by date
    const groups = this.groupSessionsByDate(filteredSessions);
    
    // Clear existing content
    sessionList.innerHTML = '';
    
    // Render pinned sessions first (if any)
    if (this.pinnedSessions.length > 0) {
      const pinnedGroup = this.createSessionGroup('Pinned', this.pinnedSessions, true);
      sessionList.appendChild(pinnedGroup);
    }
    
    // Render date-based groups
    const groupOrder = ['Today', 'Yesterday', 'Last 7 Days', 'Older'];
    groupOrder.forEach(groupName => {
      if (groups[groupName] && groups[groupName].length > 0) {
        const group = this.createSessionGroup(groupName, groups[groupName], false);
        sessionList.appendChild(group);
      }
    });
    
    // Show empty state if no sessions
    if (filteredSessions.length === 0 && this.sessions.length > 0) {
      this.showEmptySearchState();
    } else if (this.sessions.length === 0) {
      this.showEmptyState();
    }
  }
  
  /**
   * Task 7.1: Create a session group with collapsible header
   * Requirement: 7.2
   */
  createSessionGroup(title, sessions, isPinned = false) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'session-group';
    groupDiv.dataset.group = title.toLowerCase().replace(/\s+/g, '-');
    
    // Group header with collapse toggle
    const headerDiv = document.createElement('div');
    headerDiv.className = 'session-group-header';
    headerDiv.setAttribute('role', 'button');
    headerDiv.setAttribute('aria-expanded', 'true');
    headerDiv.setAttribute('tabindex', '0');
    
    const headerContent = document.createElement('h3');
    headerContent.className = 'group-title';
    headerContent.innerHTML = `
      ${isPinned ? '<i class="fas fa-thumbtack" aria-hidden="true"></i>' : ''}
      <span>${title}</span>
      <span class="session-count">${sessions.length}</span>
    `;
    
    const collapseIcon = document.createElement('i');
    collapseIcon.className = 'fas fa-chevron-down group-collapse-icon';
    collapseIcon.setAttribute('aria-hidden', 'true');
    
    headerDiv.appendChild(headerContent);
    headerDiv.appendChild(collapseIcon);
    
    // Group content (sessions)
    const contentDiv = document.createElement('div');
    contentDiv.className = 'session-group-content';
    contentDiv.setAttribute('role', 'list');
    
    sessions.forEach(session => {
      const sessionItem = this.createSessionItem(session);
      contentDiv.appendChild(sessionItem);
    });
    
    // Add collapse functionality
    headerDiv.addEventListener('click', () => this.toggleGroupCollapse(groupDiv));
    headerDiv.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleGroupCollapse(groupDiv);
      }
    });
    
    groupDiv.appendChild(headerDiv);
    groupDiv.appendChild(contentDiv);
    
    return groupDiv;
  }
  
  /**
   * Task 7.1: Toggle group collapse state
   * Requirement: 7.2
   */
  toggleGroupCollapse(groupDiv) {
    const header = groupDiv.querySelector('.session-group-header');
    const content = groupDiv.querySelector('.session-group-content');
    const icon = groupDiv.querySelector('.group-collapse-icon');
    
    const isExpanded = header.getAttribute('aria-expanded') === 'true';
    
    if (isExpanded) {
      // Collapse
      header.setAttribute('aria-expanded', 'false');
      content.style.maxHeight = '0';
      content.style.opacity = '0';
      icon.style.transform = 'rotate(-90deg)';
      groupDiv.classList.add('collapsed');
    } else {
      // Expand
      header.setAttribute('aria-expanded', 'true');
      content.style.maxHeight = content.scrollHeight + 'px';
      content.style.opacity = '1';
      icon.style.transform = 'rotate(0deg)';
      groupDiv.classList.remove('collapsed');
    }
  }
  
  /**
   * Task 7.1: Group sessions by date categories
   * Requirement: 7.2
   */
  groupSessionsByDate(sessions) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const groups = {
      'Today': [],
      'Yesterday': [],
      'Last 7 Days': [],
      'Older': []
    };
    
    sessions.forEach(session => {
      const sessionDate = new Date(session.timestamp);
      const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
      
      if (sessionDay.getTime() === today.getTime()) {
        groups['Today'].push(session);
      } else if (sessionDay.getTime() === yesterday.getTime()) {
        groups['Yesterday'].push(session);
      } else if (sessionDate >= lastWeek) {
        groups['Last 7 Days'].push(session);
      } else {
        groups['Older'].push(session);
      }
    });
    
    return groups;
  }
  
  /**
   * Task 7.3: Create session item with actions
   * Requirements: 7.3, 7.5
   */
  createSessionItem(session) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'session-item';
    itemDiv.setAttribute('role', 'listitem');
    itemDiv.setAttribute('tabindex', '0');
    itemDiv.dataset.sessionId = session.id;
    
    if (session.id === this.getCurrentSessionId()) {
      itemDiv.classList.add('active');
      itemDiv.setAttribute('aria-current', 'true');
    }
    
    if (this.isPinned(session.id)) {
      itemDiv.classList.add('pinned');
    }
    
    // Session content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'session-content';
    
    const title = document.createElement('h4');
    title.className = 'session-title';
    title.textContent = session.title || 'Untitled Chat';
    
    const preview = document.createElement('p');
    preview.className = 'session-preview';
    preview.textContent = session.preview || 'No messages yet';
    
    const meta = document.createElement('span');
    meta.className = 'session-meta';
    meta.innerHTML = `
      <i class="fas fa-clock" aria-hidden="true"></i>
      <time datetime="${session.timestamp}">${this.formatRelativeTime(session.timestamp)}</time>
      <span class="session-mode ${session.mode || 'career'}">${this.capitalizeFirst(session.mode || 'career')}</span>
    `;
    
    contentDiv.appendChild(title);
    contentDiv.appendChild(preview);
    contentDiv.appendChild(meta);
    
    // Task 7.3: Session actions (pin, rename, delete)
    // Requirement: 7.3, 7.5
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'session-actions';
    actionsDiv.setAttribute('role', 'toolbar');
    actionsDiv.setAttribute('aria-label', 'Session actions');
    
    // Pin/Unpin button
    const pinBtn = document.createElement('button');
    pinBtn.className = 'session-action-btn';
    pinBtn.setAttribute('aria-label', this.isPinned(session.id) ? 'Unpin session' : 'Pin session');
    pinBtn.setAttribute('title', this.isPinned(session.id) ? 'Unpin' : 'Pin');
    pinBtn.innerHTML = `<i class="fas fa-thumbtack"></i>`;
    pinBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.togglePin(session.id);
    });
    
    // Rename button
    const renameBtn = document.createElement('button');
    renameBtn.className = 'session-action-btn';
    renameBtn.setAttribute('aria-label', 'Rename session');
    renameBtn.setAttribute('title', 'Rename');
    renameBtn.innerHTML = `<i class="fas fa-edit"></i>`;
    renameBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showRenameDialog(session.id);
    });
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'session-action-btn session-action-delete';
    deleteBtn.setAttribute('aria-label', 'Delete session');
    deleteBtn.setAttribute('title', 'Delete');
    deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showDeleteConfirmation(session.id);
    });
    
    actionsDiv.appendChild(pinBtn);
    actionsDiv.appendChild(renameBtn);
    actionsDiv.appendChild(deleteBtn);
    
    // Click to load session
    itemDiv.addEventListener('click', () => this.loadSession(session.id));
    itemDiv.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.loadSession(session.id);
      }
    });
    
    itemDiv.appendChild(contentDiv);
    itemDiv.appendChild(actionsDiv);
    
    return itemDiv;
  }
  
  /**
   * Task 7.2: Attach event listeners for search and filter
   * Requirement: 7.4
   */
  attachEventListeners() {
    // Search input
    const searchInput = document.getElementById('session-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.renderSessionGroups();
        this.highlightSearchResults();
      });
    }
    
    // Mode filter buttons (if they exist)
    const filterButtons = document.querySelectorAll('[data-filter-mode]');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentFilter = btn.dataset.filterMode;
        this.updateFilterButtons();
        this.renderSessionGroups();
      });
    });
    
    // New chat button
    const newChatBtn = document.querySelector('.new-chat-btn');
    if (newChatBtn) {
      newChatBtn.addEventListener('click', () => this.createNewSession());
    }
  }
  
  /**
   * Task 7.2: Get filtered sessions based on search and mode
   * Requirement: 7.4
   */
  getFilteredSessions() {
    let filtered = [...this.sessions];
    
    // Filter by mode
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(s => s.mode === this.currentFilter);
    }
    
    // Filter by search query
    if (this.searchQuery) {
      filtered = filtered.filter(s => {
        const titleMatch = (s.title || '').toLowerCase().includes(this.searchQuery);
        const previewMatch = (s.preview || '').toLowerCase().includes(this.searchQuery);
        return titleMatch || previewMatch;
      });
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return filtered;
  }
  
  /**
   * Task 7.2: Highlight search results
   * Requirement: 7.4
   */
  highlightSearchResults() {
    if (!this.searchQuery) return;
    
    const sessionItems = document.querySelectorAll('.session-item');
    sessionItems.forEach(item => {
      const title = item.querySelector('.session-title');
      const preview = item.querySelector('.session-preview');
      
      if (title) {
        title.innerHTML = this.highlightText(title.textContent, this.searchQuery);
      }
      if (preview) {
        preview.innerHTML = this.highlightText(preview.textContent, this.searchQuery);
      }
    });
  }
  
  /**
   * Task 7.2: Highlight matching text
   * Requirement: 7.4
   */
  highlightText(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }
  
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  /**
   * Task 7.3: Toggle pin status
   * Requirement: 7.3
   */
  togglePin(sessionId) {
    const index = this.pinnedSessions.indexOf(sessionId);
    
    if (index > -1) {
      // Unpin
      this.pinnedSessions.splice(index, 1);
      this.showNotification('Session unpinned', 'info');
    } else {
      // Pin
      this.pinnedSessions.push(sessionId);
      this.showNotification('Session pinned', 'success');
    }
    
    this.savePinnedSessions();
    this.renderSessionGroups();
  }
  
  isPinned(sessionId) {
    return this.pinnedSessions.includes(sessionId);
  }
  
  /**
   * Task 7.3: Show rename dialog
   * Requirement: 7.5
   */
  showRenameDialog(sessionId) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    const currentTitle = session.title || 'Untitled Chat';
    const newTitle = prompt('Rename session:', currentTitle);
    
    if (newTitle && newTitle.trim() !== '' && newTitle !== currentTitle) {
      session.title = newTitle.trim();
      this.saveSessions();
      this.renderSessionGroups();
      this.showNotification('Session renamed', 'success');
    }
  }
  
  /**
   * Task 7.3: Show delete confirmation modal
   * Requirement: 7.5
   */
  showDeleteConfirmation(sessionId) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    const confirmed = confirm(`Delete "${session.title || 'Untitled Chat'}"?\n\nThis action cannot be undone.`);
    
    if (confirmed) {
      this.deleteSession(sessionId);
    }
  }
  
  /**
   * Task 7.3: Delete session
   * Requirement: 7.5
   */
  deleteSession(sessionId) {
    // Remove from sessions
    this.sessions = this.sessions.filter(s => s.id !== sessionId);
    
    // Remove from pinned
    const pinnedIndex = this.pinnedSessions.indexOf(sessionId);
    if (pinnedIndex > -1) {
      this.pinnedSessions.splice(pinnedIndex, 1);
      this.savePinnedSessions();
    }
    
    this.saveSessions();
    this.renderSessionGroups();
    this.showNotification('Session deleted', 'info');
    
    // If deleted session was active, create new session
    if (sessionId === this.getCurrentSessionId()) {
      this.createNewSession();
    }
  }
  
  /**
   * Load session
   */
  loadSession(sessionId) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) return;
    
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
    
    // Dispatch event for other components to handle
    window.dispatchEvent(new CustomEvent('sessionLoaded', {
      detail: { sessionId, session }
    }));
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
      this.closeSidebar();
    }
  }
  
  /**
   * Create new session
   */
  createNewSession() {
    const sessionId = this.generateSessionId();
    
    // Dispatch event for other components to handle
    window.dispatchEvent(new CustomEvent('newSessionCreated', {
      detail: { sessionId }
    }));
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
      this.closeSidebar();
    }
  }
  
  /**
   * Update filter buttons
   */
  updateFilterButtons() {
    const filterButtons = document.querySelectorAll('[data-filter-mode]');
    filterButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filterMode === this.currentFilter);
    });
  }
  
  /**
   * Close sidebar (mobile)
   */
  closeSidebar() {
    const sidebar = document.querySelector('.session-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  }
  
  /**
   * Show empty state
   */
  showEmptyState() {
    const sessionList = document.querySelector('.session-list');
    if (!sessionList) return;
    
    sessionList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-comments" aria-hidden="true"></i>
        <h3>No conversations yet</h3>
        <p>Start a new chat to begin your career journey</p>
      </div>
    `;
  }
  
  /**
   * Show empty search state
   */
  showEmptySearchState() {
    const sessionList = document.querySelector('.session-list');
    if (!sessionList) return;
    
    sessionList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search" aria-hidden="true"></i>
        <h3>No results found</h3>
        <p>Try a different search term</p>
      </div>
    `;
  }
  
  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    // Use existing notification system if available
    if (window.enhancedAICareerAgent && window.enhancedAICareerAgent.showNotification) {
      window.enhancedAICareerAgent.showNotification(message, type);
      return;
    }
    
    // Fallback notification
    const notification = document.createElement('div');
    notification.className = `session-notification session-notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      font-size: 14px;
      font-weight: 500;
      transform: translateX(400px);
      transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  /**
   * Utility functions
   */
  formatRelativeTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }
  
  capitalizeFirst(str) {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  getCurrentSessionId() {
    // Get from global agent if available
    if (window.enhancedAICareerAgent) {
      return window.enhancedAICareerAgent.currentSessionId;
    }
    return null;
  }
  
  /**
   * Storage functions
   */
  loadSessions() {
    try {
      const stored = localStorage.getItem('keyracer_chat_sessions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
  
  saveSessions() {
    try {
      localStorage.setItem('keyracer_chat_sessions', JSON.stringify(this.sessions));
    } catch (error) {
      console.warn('Failed to save sessions:', error);
    }
  }
  
  loadPinnedSessions() {
    try {
      const stored = localStorage.getItem('keyracer_pinned_sessions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
  
  savePinnedSessions() {
    try {
      localStorage.setItem('keyracer_pinned_sessions', JSON.stringify(this.pinnedSessions));
    } catch (error) {
      console.warn('Failed to save pinned sessions:', error);
    }
  }
  
  /**
   * Public API for other components to add/update sessions
   */
  addSession(session) {
    const existingIndex = this.sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      this.sessions[existingIndex] = session;
    } else {
      this.sessions.unshift(session);
    }
    
    // Keep only last 50 sessions
    this.sessions = this.sessions.slice(0, 50);
    
    this.saveSessions();
    this.renderSessionGroups();
  }
  
  updateSession(sessionId, updates) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      Object.assign(session, updates);
      this.saveSessions();
      this.renderSessionGroups();
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.sessionManager = new SessionManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SessionManager;
}
