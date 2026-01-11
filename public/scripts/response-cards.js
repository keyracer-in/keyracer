/**
 * Response Cards - Interactive UI Components for AI Agent Responses
 * Task 4: Create interactive response cards
 * Requirements: 3.1, 3.2, 3.3, 3.4, 19.1, 19.2
 */

class ResponseCards {
  constructor() {
    this.expandedPhases = new Set();
    this.bookmarkedJobs = new Set();
    this.initializeEventListeners();
  }

  /**
   * Task 4.1: Build roadmap timeline card
   * Creates expandable phase components with markers and visual timeline
   * Requirements: 3.1, 3.4
   */
  createRoadmapCard(roadmapData) {
    const card = document.createElement('div');
    card.className = 'response-card roadmap-card';
    card.setAttribute('role', 'region');
    card.setAttribute('aria-label', 'Learning Roadmap');
    card.dataset.cardType = 'roadmap';
    card.dataset.cardId = roadmapData.id || Date.now();
    
    // Card header with export button
    const header = document.createElement('div');
    header.className = 'card-header';
    header.innerHTML = `
      <h3 class="card-title">
        <i class="fas fa-map" aria-hidden="true"></i>
        <span>${roadmapData.title || 'Your Learning Roadmap'}</span>
      </h3>
      <button class="export-btn" 
              aria-label="Export roadmap"
              data-card-type="roadmap"
              data-card-id="${roadmapData.id || Date.now()}">
        <i class="fas fa-download" aria-hidden="true"></i>
        <span>Export</span>
      </button>
    `;
    
    // Roadmap timeline container
    const timeline = document.createElement('div');
    timeline.className = 'roadmap-timeline';
    timeline.setAttribute('role', 'list');
    
    // Create phase components
    roadmapData.phases.forEach((phase, index) => {
      const phaseElement = this.createRoadmapPhase(phase, index);
      timeline.appendChild(phaseElement);
    });
    
    card.appendChild(header);
    card.appendChild(timeline);
    
    return card;
  }

  createRoadmapPhase(phase, index) {
    const phaseId = `phase-${index}`;
    const isExpanded = this.expandedPhases.has(phaseId);
    
    const phaseElement = document.createElement('div');
    phaseElement.className = 'roadmap-phase';
    phaseElement.setAttribute('role', 'listitem');
    phaseElement.dataset.phaseId = phaseId;
    
    // Phase marker with connecting line
    const marker = document.createElement('div');
    marker.className = 'phase-marker';
    marker.innerHTML = `
      <span class="phase-number" aria-label="Phase ${index + 1}">${index + 1}</span>
      <div class="phase-line" aria-hidden="true"></div>
    `;
    
    // Phase content
    const content = document.createElement('div');
    content.className = 'phase-content';
    
    // Phase header (always visible)
    const header = document.createElement('div');
    header.className = 'phase-header';
    header.innerHTML = `
      <h4 class="phase-title">${phase.title || `Phase ${index + 1}`}</h4>
      <button class="expand-btn" 
              aria-label="${isExpanded ? 'Collapse' : 'Expand'} phase details"
              aria-expanded="${isExpanded}"
              aria-controls="${phaseId}-body"
              data-phase-id="${phaseId}">
        <i class="fas fa-chevron-${isExpanded ? 'up' : 'down'}" aria-hidden="true"></i>
      </button>
    `;
    
    // Phase body (collapsible)
    const body = document.createElement('div');
    body.className = `phase-body ${isExpanded ? 'expanded' : ''}`;
    body.id = `${phaseId}-body`;
    body.setAttribute('aria-hidden', !isExpanded);
    
    // Goal section
    if (phase.goal) {
      const goalDiv = document.createElement('div');
      goalDiv.className = 'phase-goal';
      goalDiv.innerHTML = `
        <strong><i class="fas fa-bullseye" aria-hidden="true"></i> Goal:</strong>
        <p>${phase.goal}</p>
      `;
      body.appendChild(goalDiv);
    }
    
    // Projects section
    if (phase.projects && phase.projects.length > 0) {
      const projectsDiv = document.createElement('div');
      projectsDiv.className = 'phase-projects';
      projectsDiv.innerHTML = `
        <strong><i class="fas fa-code" aria-hidden="true"></i> Projects:</strong>
        <ul>
          ${phase.projects.map(project => `<li>${project}</li>`).join('')}
        </ul>
      `;
      body.appendChild(projectsDiv);
    }
    
    // Resources section
    if (phase.resources && phase.resources.length > 0) {
      const resourcesDiv = document.createElement('div');
      resourcesDiv.className = 'phase-resources';
      resourcesDiv.innerHTML = `
        <strong><i class="fas fa-book" aria-hidden="true"></i> Resources:</strong>
        <ul>
          ${phase.resources.map(resource => {
            if (typeof resource === 'string') {
              return `<li>${resource}</li>`;
            } else if (resource.url) {
              return `<li><a href="${resource.url}" target="_blank" rel="noopener noreferrer">${resource.name}</a></li>`;
            }
            return '';
          }).join('')}
        </ul>
      `;
      body.appendChild(resourcesDiv);
    }
    
    content.appendChild(header);
    content.appendChild(body);
    
    phaseElement.appendChild(marker);
    phaseElement.appendChild(content);
    
    return phaseElement;
  }

  /**
   * Task 4.2: Build job listing cards
   * Creates job item layout with company info, skills, and actions
   * Requirements: 3.2, 3.4
   */
  createJobListingCard(jobsData) {
    const card = document.createElement('div');
    card.className = 'response-card jobs-card';
    card.setAttribute('role', 'region');
    card.setAttribute('aria-label', 'Job Opportunities');
    card.dataset.cardType = 'jobs';
    card.dataset.cardId = jobsData.id || Date.now();
    
    // Card header with filters
    const header = document.createElement('div');
    header.className = 'card-header';
    header.innerHTML = `
      <h3 class="card-title">
        <i class="fas fa-briefcase" aria-hidden="true"></i>
        <span>${jobsData.count || jobsData.jobs.length} Matching Opportunities</span>
      </h3>
      <div class="filter-chips" role="toolbar" aria-label="Job filters">
        <button class="chip active" data-filter="all" aria-pressed="true">All</button>
        <button class="chip" data-filter="remote" aria-pressed="false">Remote</button>
        <button class="chip" data-filter="senior" aria-pressed="false">Senior</button>
        <button class="chip" data-filter="junior" aria-pressed="false">Junior</button>
      </div>
      <button class="export-btn" 
              aria-label="Export job listings"
              data-card-type="jobs"
              data-card-id="${jobsData.id || Date.now()}">
        <i class="fas fa-download" aria-hidden="true"></i>
        <span>Export</span>
      </button>
    `;
    
    // Job list container
    const jobList = document.createElement('div');
    jobList.className = 'job-list';
    jobList.setAttribute('role', 'list');
    
    // Create job items
    jobsData.jobs.forEach((job, index) => {
      const jobItem = this.createJobItem(job, index);
      jobList.appendChild(jobItem);
    });
    
    card.appendChild(header);
    card.appendChild(jobList);
    
    return card;
  }

  createJobItem(job, index) {
    const jobId = `job-${index}`;
    const isBookmarked = this.bookmarkedJobs.has(jobId);
    
    const jobItem = document.createElement('div');
    jobItem.className = 'job-item';
    jobItem.setAttribute('role', 'listitem');
    jobItem.dataset.jobId = jobId;
    jobItem.dataset.location = job.location?.toLowerCase() || '';
    jobItem.dataset.level = job.level?.toLowerCase() || '';
    
    // Job header
    const header = document.createElement('div');
    header.className = 'job-header';
    
    // Company logo (if available)
    const logoHtml = job.companyLogo 
      ? `<img src="${job.companyLogo}" alt="${job.company} logo" class="company-logo">`
      : `<div class="company-logo-placeholder"><i class="fas fa-building"></i></div>`;
    
    header.innerHTML = `
      <div class="company-logo-wrapper">
        ${logoHtml}
      </div>
      <div class="job-info">
        <h4 class="job-title">${job.title}</h4>
        <p class="company-name">${job.company}</p>
      </div>
      <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" 
              aria-label="${isBookmarked ? 'Remove bookmark' : 'Bookmark job'}"
              aria-pressed="${isBookmarked}"
              data-job-id="${jobId}">
        <i class="fas fa-bookmark" aria-hidden="true"></i>
      </button>
    `;
    
    // Job meta information
    const meta = document.createElement('div');
    meta.className = 'job-meta';
    meta.innerHTML = `
      ${job.location ? `<span><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${job.location}</span>` : ''}
      ${job.salary ? `<span><i class="fas fa-dollar-sign" aria-hidden="true"></i> ${job.salary}</span>` : ''}
      ${job.postedDate ? `<span><i class="fas fa-clock" aria-hidden="true"></i> ${job.postedDate}</span>` : ''}
    `;
    
    // Skill tags
    const skills = document.createElement('div');
    skills.className = 'job-skills';
    if (job.skills && job.skills.length > 0) {
      job.skills.forEach(skill => {
        const tag = document.createElement('span');
        tag.className = 'skill-tag';
        tag.textContent = skill;
        skills.appendChild(tag);
      });
    }
    
    // Job actions
    const actions = document.createElement('div');
    actions.className = 'job-actions';
    actions.innerHTML = `
      <button class="btn-secondary" onclick="window.open('${job.detailsUrl || '#'}', '_blank')">
        View Details
      </button>
      <button class="btn-primary" onclick="window.open('${job.applyUrl || '#'}', '_blank')">
        Apply Now
      </button>
    `;
    
    jobItem.appendChild(header);
    jobItem.appendChild(meta);
    jobItem.appendChild(skills);
    jobItem.appendChild(actions);
    
    return jobItem;
  }

  /**
   * Task 4.3: Build skill analysis card
   * Creates color-coded sections with skill bars and score badge
   * Requirements: 3.3, 3.4
   */
  createSkillAnalysisCard(skillsData) {
    const card = document.createElement('div');
    card.className = 'response-card skills-card';
    card.setAttribute('role', 'region');
    card.setAttribute('aria-label', 'Skill Gap Analysis');
    card.dataset.cardType = 'skills';
    card.dataset.cardId = skillsData.id || Date.now();
    
    // Card header with score badge
    const header = document.createElement('div');
    header.className = 'card-header';
    
    const score = skillsData.overallScore || 75;
    const scorePercentage = (score / 100) * 360; // For circular progress
    
    header.innerHTML = `
      <h3 class="card-title">
        <i class="fas fa-chart-bar" aria-hidden="true"></i>
        <span>Skill Gap Analysis</span>
      </h3>
      <div class="score-badge" role="img" aria-label="Overall score ${score} out of 100">
        <svg class="score-circle" width="80" height="80" viewBox="0 0 80 80">
          <circle class="score-bg" cx="40" cy="40" r="35" />
          <circle class="score-fill" 
                  cx="40" cy="40" r="35"
                  style="stroke-dasharray: ${scorePercentage} 360"
                  aria-hidden="true" />
        </svg>
        <div class="score-text">
          <span class="score">${score}</span>
          <span class="label">/100</span>
        </div>
      </div>
      <button class="export-btn" 
              aria-label="Export skill analysis"
              data-card-type="skills"
              data-card-id="${skillsData.id || Date.now()}">
        <i class="fas fa-download" aria-hidden="true"></i>
        <span>Export</span>
      </button>
    `;
    
    // Skills sections container
    const sectionsContainer = document.createElement('div');
    sectionsContainer.className = 'skills-sections';
    
    // Strengths section
    if (skillsData.strengths && skillsData.strengths.length > 0) {
      const strengthsSection = this.createSkillSection(
        'strengths',
        'Your Strengths',
        'check-circle',
        skillsData.strengths
      );
      sectionsContainer.appendChild(strengthsSection);
    }
    
    // Improvements section
    if (skillsData.improvements && skillsData.improvements.length > 0) {
      const improvementsSection = this.createSkillSection(
        'improvements',
        'Areas to Improve',
        'arrow-up',
        skillsData.improvements
      );
      sectionsContainer.appendChild(improvementsSection);
    }
    
    // Actions section
    if (skillsData.actions && skillsData.actions.length > 0) {
      const actionsSection = this.createActionsSection(skillsData.actions);
      sectionsContainer.appendChild(actionsSection);
    }
    
    card.appendChild(header);
    card.appendChild(sectionsContainer);
    
    return card;
  }

  createSkillSection(type, title, icon, skills) {
    const section = document.createElement('div');
    section.className = `skill-section ${type}`;
    
    const header = document.createElement('h4');
    header.className = 'skill-section-title';
    header.innerHTML = `
      <i class="fas fa-${icon}" aria-hidden="true"></i>
      <span>${title}</span>
    `;
    
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'skill-items';
    
    skills.forEach(skill => {
      const item = document.createElement('div');
      item.className = 'skill-item';
      
      const name = document.createElement('span');
      name.className = 'skill-name';
      name.textContent = skill.name;
      
      // Skill bar with animated fill
      const bar = document.createElement('div');
      bar.className = 'skill-bar';
      bar.setAttribute('role', 'progressbar');
      bar.setAttribute('aria-valuenow', skill.level || 0);
      bar.setAttribute('aria-valuemin', '0');
      bar.setAttribute('aria-valuemax', '100');
      bar.setAttribute('aria-label', `${skill.name} proficiency`);
      
      const fill = document.createElement('div');
      fill.className = 'skill-fill';
      fill.style.width = '0%'; // Start at 0 for animation
      fill.dataset.targetWidth = `${skill.level || 0}%`;
      
      bar.appendChild(fill);
      
      const level = document.createElement('span');
      level.className = 'skill-level';
      level.textContent = skill.levelText || this.getLevelText(skill.level);
      
      item.appendChild(name);
      item.appendChild(bar);
      item.appendChild(level);
      
      itemsContainer.appendChild(item);
    });
    
    section.appendChild(header);
    section.appendChild(itemsContainer);
    
    return section;
  }

  createActionsSection(actions) {
    const section = document.createElement('div');
    section.className = 'skill-section actions';
    
    const header = document.createElement('h4');
    header.className = 'skill-section-title';
    header.innerHTML = `
      <i class="fas fa-rocket" aria-hidden="true"></i>
      <span>Recommended Actions</span>
    `;
    
    const list = document.createElement('ul');
    list.className = 'action-list';
    
    actions.forEach(action => {
      const item = document.createElement('li');
      item.innerHTML = `
        <i class="fas fa-check" aria-hidden="true"></i>
        <span>${action}</span>
      `;
      list.appendChild(item);
    });
    
    section.appendChild(header);
    section.appendChild(list);
    
    return section;
  }

  getLevelText(level) {
    if (level >= 90) return 'Expert';
    if (level >= 70) return 'Advanced';
    if (level >= 50) return 'Intermediate';
    if (level >= 30) return 'Beginner';
    return 'Learning';
  }

  /**
   * Task 4.4: Add card export functionality
   * Implements export with format selection and file generation
   * Requirements: 3.4, 19.1, 19.2
   */
  async exportCard(cardElement, format = 'pdf') {
    const cardType = cardElement.dataset.cardType;
    const cardId = cardElement.dataset.cardId;
    
    // Show loading state
    this.showExportLoading(cardElement);
    
    try {
      let exportData;
      
      // Extract data based on card type
      switch (cardType) {
        case 'roadmap':
          exportData = this.extractRoadmapData(cardElement);
          break;
        case 'jobs':
          exportData = this.extractJobsData(cardElement);
          break;
        case 'skills':
          exportData = this.extractSkillsData(cardElement);
          break;
        default:
          throw new Error('Unknown card type');
      }
      
      // Generate file based on format
      let fileContent, fileName, mimeType;
      
      switch (format) {
        case 'pdf':
          // For PDF, open print dialog (browser will handle PDF generation)
          this.printToPDF(exportData, cardType);
          this.hideExportLoading(cardElement);
          this.showToast('Opening print dialog...', 'info');
          return; // Exit early since print dialog handles the rest
          
        case 'markdown':
          fileContent = this.generateMarkdown(exportData, cardType);
          fileName = `${cardType}-${cardId}.md`;
          mimeType = 'text/markdown';
          break;
          
        case 'json':
          fileContent = JSON.stringify(exportData, null, 2);
          fileName = `${cardType}-${cardId}.json`;
          mimeType = 'application/json';
          break;
          
        default:
          throw new Error('Unsupported format');
      }
      
      // Download file
      this.downloadFile(fileContent, fileName, mimeType);
      
      // Show success notification
      this.showToast('Export successful!', 'success');
      
    } catch (error) {
      console.error('Export error:', error);
      this.showToast('Export failed. Please try again.', 'error');
    } finally {
      this.hideExportLoading(cardElement);
    }
  }

  extractRoadmapData(cardElement) {
    const title = cardElement.querySelector('.card-title span')?.textContent || 'Learning Roadmap';
    const phases = [];
    
    cardElement.querySelectorAll('.roadmap-phase').forEach((phaseEl, index) => {
      const phase = {
        number: index + 1,
        title: phaseEl.querySelector('.phase-title')?.textContent || `Phase ${index + 1}`,
        goal: phaseEl.querySelector('.phase-goal p')?.textContent || '',
        projects: [],
        resources: []
      };
      
      // Extract projects
      phaseEl.querySelectorAll('.phase-projects li').forEach(li => {
        phase.projects.push(li.textContent.trim());
      });
      
      // Extract resources
      phaseEl.querySelectorAll('.phase-resources li').forEach(li => {
        const link = li.querySelector('a');
        if (link) {
          phase.resources.push({
            name: link.textContent.trim(),
            url: link.href
          });
        } else {
          phase.resources.push(li.textContent.trim());
        }
      });
      
      phases.push(phase);
    });
    
    return { title, phases };
  }

  extractJobsData(cardElement) {
    const title = cardElement.querySelector('.card-title span')?.textContent || 'Job Opportunities';
    const jobs = [];
    
    cardElement.querySelectorAll('.job-item').forEach(jobEl => {
      const job = {
        title: jobEl.querySelector('.job-title')?.textContent || '',
        company: jobEl.querySelector('.company-name')?.textContent || '',
        location: '',
        salary: '',
        postedDate: '',
        skills: []
      };
      
      // Extract meta info
      const metaSpans = jobEl.querySelectorAll('.job-meta span');
      metaSpans.forEach(span => {
        const text = span.textContent.trim();
        if (text.includes('$')) {
          job.salary = text;
        } else if (span.querySelector('.fa-clock')) {
          job.postedDate = text;
        } else if (span.querySelector('.fa-map-marker-alt')) {
          job.location = text;
        }
      });
      
      // Extract skills
      jobEl.querySelectorAll('.skill-tag').forEach(tag => {
        job.skills.push(tag.textContent.trim());
      });
      
      jobs.push(job);
    });
    
    return { title, jobs };
  }

  extractSkillsData(cardElement) {
    const title = cardElement.querySelector('.card-title span')?.textContent || 'Skill Analysis';
    const scoreText = cardElement.querySelector('.score')?.textContent || '0';
    const overallScore = parseInt(scoreText);
    
    const data = {
      title,
      overallScore,
      strengths: [],
      improvements: [],
      actions: []
    };
    
    // Extract strengths
    const strengthsSection = cardElement.querySelector('.skill-section.strengths');
    if (strengthsSection) {
      strengthsSection.querySelectorAll('.skill-item').forEach(item => {
        data.strengths.push({
          name: item.querySelector('.skill-name')?.textContent || '',
          level: parseInt(item.querySelector('.skill-bar')?.getAttribute('aria-valuenow') || '0'),
          levelText: item.querySelector('.skill-level')?.textContent || ''
        });
      });
    }
    
    // Extract improvements
    const improvementsSection = cardElement.querySelector('.skill-section.improvements');
    if (improvementsSection) {
      improvementsSection.querySelectorAll('.skill-item').forEach(item => {
        data.improvements.push({
          name: item.querySelector('.skill-name')?.textContent || '',
          level: parseInt(item.querySelector('.skill-bar')?.getAttribute('aria-valuenow') || '0'),
          levelText: item.querySelector('.skill-level')?.textContent || ''
        });
      });
    }
    
    // Extract actions
    const actionsSection = cardElement.querySelector('.skill-section.actions');
    if (actionsSection) {
      actionsSection.querySelectorAll('.action-list li').forEach(li => {
        const text = li.querySelector('span')?.textContent || li.textContent;
        data.actions.push(text.trim());
      });
    }
    
    return data;
  }

  generateMarkdown(data, cardType) {
    let markdown = '';
    
    switch (cardType) {
      case 'roadmap':
        markdown = `# ${data.title}\n\n`;
        data.phases.forEach(phase => {
          markdown += `## ${phase.title}\n\n`;
          if (phase.goal) {
            markdown += `**Goal:** ${phase.goal}\n\n`;
          }
          if (phase.projects.length > 0) {
            markdown += `**Projects:**\n`;
            phase.projects.forEach(project => {
              markdown += `- ${project}\n`;
            });
            markdown += '\n';
          }
          if (phase.resources.length > 0) {
            markdown += `**Resources:**\n`;
            phase.resources.forEach(resource => {
              if (typeof resource === 'string') {
                markdown += `- ${resource}\n`;
              } else {
                markdown += `- [${resource.name}](${resource.url})\n`;
              }
            });
            markdown += '\n';
          }
        });
        break;
        
      case 'jobs':
        markdown = `# ${data.title}\n\n`;
        data.jobs.forEach((job, index) => {
          markdown += `## ${index + 1}. ${job.title}\n\n`;
          markdown += `**Company:** ${job.company}\n\n`;
          if (job.location) markdown += `**Location:** ${job.location}\n\n`;
          if (job.salary) markdown += `**Salary:** ${job.salary}\n\n`;
          if (job.postedDate) markdown += `**Posted:** ${job.postedDate}\n\n`;
          if (job.skills.length > 0) {
            markdown += `**Required Skills:** ${job.skills.join(', ')}\n\n`;
          }
          markdown += '---\n\n';
        });
        break;
        
      case 'skills':
        markdown = `# ${data.title}\n\n`;
        markdown += `**Overall Score:** ${data.overallScore}/100\n\n`;
        
        if (data.strengths.length > 0) {
          markdown += `## Your Strengths\n\n`;
          data.strengths.forEach(skill => {
            markdown += `- **${skill.name}** (${skill.levelText}): ${skill.level}%\n`;
          });
          markdown += '\n';
        }
        
        if (data.improvements.length > 0) {
          markdown += `## Areas to Improve\n\n`;
          data.improvements.forEach(skill => {
            markdown += `- **${skill.name}** (${skill.levelText}): ${skill.level}%\n`;
          });
          markdown += '\n';
        }
        
        if (data.actions.length > 0) {
          markdown += `## Recommended Actions\n\n`;
          data.actions.forEach(action => {
            markdown += `- ${action}\n`;
          });
        }
        break;
    }
    
    return markdown;
  }

  printToPDF(data, cardType) {
    // Create a new window with the content to print
    const printWindow = window.open('', '_blank');
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.title || 'Export'}</title>
  <style>
    @media print {
      @page { margin: 1cm; }
      body { margin: 0; }
    }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
      color: #1e293b;
    }
    h1 { 
      color: #6366f1;
      font-size: 32px;
      margin-bottom: 30px;
      border-bottom: 3px solid #6366f1;
      padding-bottom: 10px;
    }
    h2 { 
      color: #334155;
      font-size: 24px;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    h3 {
      color: #475569;
      font-size: 18px;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    .phase { 
      margin-bottom: 40px;
      padding: 25px;
      border-left: 4px solid #6366f1;
      background: #f8fafc;
      page-break-inside: avoid;
    }
    .job { 
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      page-break-inside: avoid;
    }
    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 15px;
    }
    .job-title {
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
    }
    .job-company {
      font-size: 16px;
      color: #64748b;
      margin-top: 5px;
    }
    .skill { 
      margin: 15px 0;
      page-break-inside: avoid;
    }
    .skill-name {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-weight: 500;
    }
    .skill-bar { 
      height: 24px;
      background: #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
    }
    .skill-fill { 
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      transition: width 0.3s ease;
    }
    ul {
      margin: 10px 0;
      padding-left: 25px;
    }
    li {
      margin: 8px 0;
      line-height: 1.6;
    }
    p {
      line-height: 1.6;
      margin: 10px 0;
    }
    strong {
      color: #334155;
    }
    .meta {
      color: #64748b;
      font-size: 14px;
      margin-top: 5px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: #e0e7ff;
      color: #6366f1;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin: 2px;
    }
  </style>
</head>
<body>
  ${this.generateHTMLContent(data, cardType)}
  <script>
    // Auto-print when page loads
    window.onload = function() {
      window.print();
      // Close window after printing (user can cancel)
      window.onafterprint = function() {
        window.close();
      };
    };
  </script>
</body>
</html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  }

  generateHTMLContent(data, cardType) {
    let html = '';
    
    switch (cardType) {
      case 'roadmap':
        html = `<h1>${data.title}</h1>`;
        data.phases.forEach(phase => {
          html += `<div class="phase">`;
          html += `<h2>${phase.title}</h2>`;
          if (phase.goal) html += `<p><strong>Goal:</strong> ${phase.goal}</p>`;
          if (phase.projects.length > 0) {
            html += `<p><strong>Projects:</strong></p><ul>`;
            phase.projects.forEach(p => html += `<li>${p}</li>`);
            html += `</ul>`;
          }
          if (phase.resources.length > 0) {
            html += `<p><strong>Resources:</strong></p><ul>`;
            phase.resources.forEach(r => {
              if (typeof r === 'string') {
                html += `<li>${r}</li>`;
              } else {
                html += `<li><a href="${r.url}">${r.name}</a></li>`;
              }
            });
            html += `</ul>`;
          }
          html += `</div>`;
        });
        break;
        
      case 'jobs':
        html = `<h1>${data.title}</h1>`;
        data.jobs.forEach((job, i) => {
          html += `<div class="job">`;
          html += `<h2>${i + 1}. ${job.title}</h2>`;
          html += `<p><strong>Company:</strong> ${job.company}</p>`;
          if (job.location) html += `<p><strong>Location:</strong> ${job.location}</p>`;
          if (job.salary) html += `<p><strong>Salary:</strong> ${job.salary}</p>`;
          if (job.skills.length > 0) {
            html += `<p><strong>Skills:</strong> ${job.skills.join(', ')}</p>`;
          }
          html += `</div>`;
        });
        break;
        
      case 'skills':
        html = `<h1>${data.title}</h1>`;
        html += `<p><strong>Overall Score:</strong> ${data.overallScore}/100</p>`;
        
        if (data.strengths.length > 0) {
          html += `<h2>Your Strengths</h2>`;
          data.strengths.forEach(skill => {
            html += `<div class="skill">`;
            html += `<p><strong>${skill.name}</strong> (${skill.levelText})</p>`;
            html += `<div class="skill-bar"><div class="skill-fill" style="width: ${skill.level}%"></div></div>`;
            html += `</div>`;
          });
        }
        
        if (data.improvements.length > 0) {
          html += `<h2>Areas to Improve</h2>`;
          data.improvements.forEach(skill => {
            html += `<div class="skill">`;
            html += `<p><strong>${skill.name}</strong> (${skill.levelText})</p>`;
            html += `<div class="skill-bar"><div class="skill-fill" style="width: ${skill.level}%"></div></div>`;
            html += `</div>`;
          });
        }
        
        if (data.actions.length > 0) {
          html += `<h2>Recommended Actions</h2><ul>`;
          data.actions.forEach(action => html += `<li>${action}</li>`);
          html += `</ul>`;
        }
        break;
    }
    
    return html;
  }

  downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Event listeners and interactions
   */
  initializeEventListeners() {
    // Use event delegation for dynamic content
    document.addEventListener('click', (e) => {
      // Phase expand/collapse
      if (e.target.closest('.expand-btn')) {
        const btn = e.target.closest('.expand-btn');
        this.togglePhase(btn);
      }
      
      // Job bookmark
      if (e.target.closest('.bookmark-btn')) {
        const btn = e.target.closest('.bookmark-btn');
        this.toggleBookmark(btn);
      }
      
      // Export button
      if (e.target.closest('.export-btn')) {
        const btn = e.target.closest('.export-btn');
        this.showExportModal(btn);
      }
      
      // Filter chips
      if (e.target.closest('.filter-chips .chip')) {
        const chip = e.target.closest('.chip');
        this.applyFilter(chip);
      }
    });
    
    // Animate skill bars when they come into view
    this.observeSkillBars();
  }

  togglePhase(button) {
    const phaseId = button.dataset.phaseId;
    const body = document.getElementById(`${phaseId}-body`);
    const icon = button.querySelector('i');
    
    if (!body) return;
    
    const isExpanded = body.classList.contains('expanded');
    
    if (isExpanded) {
      // Collapse
      body.classList.remove('expanded');
      body.setAttribute('aria-hidden', 'true');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Expand phase details');
      icon.className = 'fas fa-chevron-down';
      this.expandedPhases.delete(phaseId);
    } else {
      // Expand
      body.classList.add('expanded');
      body.setAttribute('aria-hidden', 'false');
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-label', 'Collapse phase details');
      icon.className = 'fas fa-chevron-up';
      this.expandedPhases.add(phaseId);
    }
  }

  toggleBookmark(button) {
    const jobId = button.dataset.jobId;
    const isBookmarked = button.classList.contains('bookmarked');
    
    if (isBookmarked) {
      button.classList.remove('bookmarked');
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', 'Bookmark job');
      this.bookmarkedJobs.delete(jobId);
      this.showToast('Bookmark removed', 'info');
    } else {
      button.classList.add('bookmarked');
      button.setAttribute('aria-pressed', 'true');
      button.setAttribute('aria-label', 'Remove bookmark');
      this.bookmarkedJobs.add(jobId);
      this.showToast('Job bookmarked!', 'success');
    }
  }

  showExportModal(button) {
    const cardElement = button.closest('.response-card');
    const cardType = button.dataset.cardType;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'export-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'export-modal-title');
    modal.setAttribute('aria-modal', 'true');
    
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="export-modal-title">Export ${cardType}</h3>
          <button class="modal-close" aria-label="Close modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Choose export format:</p>
          <div class="export-formats">
            <button class="format-btn" data-format="pdf">
              <i class="fas fa-file-pdf"></i>
              <span>PDF</span>
            </button>
            <button class="format-btn" data-format="markdown">
              <i class="fas fa-file-alt"></i>
              <span>Markdown</span>
            </button>
            <button class="format-btn" data-format="json">
              <i class="fas fa-file-code"></i>
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus first button
    setTimeout(() => {
      modal.querySelector('.format-btn')?.focus();
    }, 100);
    
    // Event listeners
    modal.querySelector('.modal-close')?.addEventListener('click', () => {
      this.closeModal(modal);
    });
    
    modal.querySelector('.modal-overlay')?.addEventListener('click', () => {
      this.closeModal(modal);
    });
    
    modal.querySelectorAll('.format-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const format = btn.dataset.format;
        this.closeModal(modal);
        this.exportCard(cardElement, format);
      });
    });
    
    // Escape key to close
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeModal(modal);
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  }

  closeModal(modal) {
    modal.classList.add('closing');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }

  applyFilter(chip) {
    const filter = chip.dataset.filter;
    const jobsCard = chip.closest('.jobs-card');
    
    // Update active state
    jobsCard.querySelectorAll('.chip').forEach(c => {
      c.classList.remove('active');
      c.setAttribute('aria-pressed', 'false');
    });
    chip.classList.add('active');
    chip.setAttribute('aria-pressed', 'true');
    
    // Filter jobs
    const jobs = jobsCard.querySelectorAll('.job-item');
    jobs.forEach(job => {
      if (filter === 'all') {
        job.style.display = '';
      } else {
        const matchesFilter = 
          job.dataset.location?.includes(filter) || 
          job.dataset.level?.includes(filter);
        job.style.display = matchesFilter ? '' : 'none';
      }
    });
  }

  observeSkillBars() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          const targetWidth = fill.dataset.targetWidth;
          
          // Animate to target width
          setTimeout(() => {
            fill.style.transition = 'width 1s ease-out';
            fill.style.width = targetWidth;
          }, 100);
          
          observer.unobserve(fill);
        }
      });
    }, { threshold: 0.5 });
    
    // Observe all skill fills
    document.querySelectorAll('.skill-fill').forEach(fill => {
      observer.observe(fill);
    });
  }

  showExportLoading(cardElement) {
    const exportBtn = cardElement.querySelector('.export-btn');
    if (exportBtn) {
      exportBtn.disabled = true;
      exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Exporting...</span>';
    }
  }

  hideExportLoading(cardElement) {
    const exportBtn = cardElement.querySelector('.export-btn');
    if (exportBtn) {
      exportBtn.disabled = false;
      exportBtn.innerHTML = '<i class="fas fa-download"></i> <span>Export</span>';
    }
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      info: 'info-circle',
      warning: 'exclamation-triangle'
    };
    
    toast.innerHTML = `
      <i class="fas fa-${icons[type] || icons.info}"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Auto-dismiss for success, manual for errors
    const duration = type === 'error' ? 0 : 3000;
    if (duration > 0) {
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    } else {
      // Add close button for errors
      const closeBtn = document.createElement('button');
      closeBtn.className = 'toast-close';
      closeBtn.setAttribute('aria-label', 'Close notification');
      closeBtn.innerHTML = '<i class="fas fa-times"></i>';
      closeBtn.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      });
      toast.appendChild(closeBtn);
    }
  }
}

// Initialize ResponseCards when DOM is ready
let responseCardsInstance;
document.addEventListener('DOMContentLoaded', () => {
  responseCardsInstance = new ResponseCards();
  window.ResponseCards = responseCardsInstance;
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResponseCards;
}
