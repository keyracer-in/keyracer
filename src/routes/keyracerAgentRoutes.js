const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Use PyPDF2-like approach with pdf2pic or pdf-parse as fallback
let pdfParse;
try {
  const pdfParseModule = require('pdf-parse');
  // Handle both default export and direct function export
  pdfParse = typeof pdfParseModule === 'function' ? pdfParseModule : 
             (pdfParseModule.default && typeof pdfParseModule.default === 'function' ? pdfParseModule.default : null);
  
  if (!pdfParse) {
    console.error('pdf-parse loaded but no valid function found. Module type:', typeof pdfParseModule);
    console.error('Module keys:', Object.keys(pdfParseModule));
  } else {
    console.log('PDF parser loaded successfully');
  }
} catch (e) {
  console.log('pdf-parse not available, using text extraction fallback:', e.message);
  pdfParse = null;
}

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Enhanced KeyRacer Agent Service - Based on Python implementation
class KeyRacerAgentService {
  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY;
    this.tavilyApiKey = process.env.TAVILY_API_KEY;
  }

  // KeyRacerAnalyzer - Resume Analysis Agent
  async analyzeResume(pdfBuffer, targetRole = 'Software Engineer') {
    try {
      let resumeText = '';
      
      // PDF text extraction (matching PyPDF2 approach)
      if (pdfParse && typeof pdfParse === 'function') {
        try {
          const pdfData = await pdfParse(pdfBuffer);
          resumeText = pdfData.text;
          console.log('PDF parsed successfully, extracted text length:', resumeText.length);
        } catch (pdfError) {
          console.error('PDF parsing failed:', pdfError.message);
          console.error('PDF parse error stack:', pdfError.stack);
          resumeText = 'PDF text extraction failed - using default analysis';
        }
      } else {
        console.log('PDF parser not available or not a function, type:', typeof pdfParse);
        resumeText = 'PDF parser not available - using default analysis';
      }

      // Structured prompt matching the Python implementation
      const prompt = `Analyze this resume for the role of ${targetRole} based on 2026 standards.
      
      Return a JSON object with exactly this structure:
      {
        "candidate_name": "The full name of the candidate",
        "professional_summary": "A 2-sentence summary of their profile",
        "technical_skills": ["List of hard skills identified"],
        "soft_skills": ["List of soft skills identified"],
        "experience_score": 85,
        "key_achievements": ["Top 3 quantifiable achievements"],
        "current_gaps": ["Skills missing for target role"],
        "improvement_tips": ["Actionable advice for the resume"]
      }
      
      Resume Content: ${resumeText}`;

      const response = await this.callGroqAPI(prompt, 'llama-3.1-8b-instant');
      return this.parseStructuredResponse(response);
    } catch (error) {
      throw new Error(`Resume analysis failed: ${error.message}`);
    }
  }

  // RoadmapAgent - 6-month learning roadmap with market research
  async generateRoadmap(analysis, targetRole) {
    try {
      // Provide fallback values for missing fields (Requirement 9.4)
      const candidateName = analysis.candidate_name || 'Candidate';
      const skills = analysis.technical_skills || ['JavaScript', 'Python', 'HTML/CSS'];
      const softSkills = analysis.soft_skills || ['Communication', 'Problem Solving', 'Teamwork'];
      const gaps = analysis.current_gaps || ['System Design', 'Cloud Technologies', 'DevOps'];
      const experienceScore = analysis.experience_score || 50;
      const achievements = analysis.key_achievements || ['Completed projects', 'Team collaboration'];
      
      // Validate that we have minimum required data
      if (!analysis || Object.keys(analysis).length === 0) {
        throw new Error('Resume analysis data is required. Please upload your resume first.');
      }
      
      // Search for current market trends
      const searchQuery = `${targetRole} learning roadmap 2026 ${gaps.slice(0, 3).join(' ')} skills trends tools`;
      const searchResults = await this.searchWithTavily(searchQuery);
      
      const prompt = `You are a Learning Architect creating a 6-month roadmap for ${candidateName} to become a ${targetRole}.

**${candidateName}'s Current Profile:**
- Experience Level: ${experienceScore}/100
- Technical Skills: ${skills.join(', ')}
- Soft Skills: ${softSkills.join(', ')}
- Skills to Learn: ${gaps.join(', ')}
- Key Achievements: ${achievements.join('; ')}

**Market Research (2026):**
${searchResults}

**Requirements:**
1. Create a PERSONALIZED 6-month roadmap for ${candidateName}
2. START from their current level (${experienceScore}/100 experience)
3. FOCUS on filling their specific gaps: ${gaps.join(', ')}
4. BUILD on their existing skills: ${skills.join(', ')}
5. Use 2026 market trends from research
6. Include 2-3 portfolio projects that combine their existing skills with new ones

**Format:**
## Month 1-2: [Focus Area - one of their gaps]
**Goal:** [Specific goal for ${candidateName}]
**Why This First:** [Explain why this gap is priority for them]
**Projects:** [2-3 projects building on their ${skills[0]}, ${skills[1]} skills]
**Resources:** [Specific 2026 resources with links]
**Tools:** [2026 relevant tools]

Continue for 6 months, each focusing on different gaps from: ${gaps.join(', ')}

Make it PERSONAL - reference ${candidateName}'s name, current skills, and specific gaps throughout.`;

      return await this.callGroqAPI(prompt, 'llama-3.3-70b-versatile');
    } catch (error) {
      throw new Error(`Roadmap generation failed: ${error.message}`);
    }
  }

  // CareerSuccessAgent - Job search with real-time postings
  async findJobs(role, skills, location = 'Remote', userProfile = {}) {
    try {
      // Provide fallback values for missing fields (Requirement 9.4)
      const candidateName = userProfile.candidate_name || 'Candidate';
      const experienceScore = userProfile.experience_score || 50;
      const achievements = userProfile.key_achievements || ['Project completion', 'Team collaboration'];
      const gaps = userProfile.current_gaps || ['System Design', 'Cloud Technologies'];
      const allSkills = userProfile.technical_skills || skills || ['JavaScript', 'Python', 'React'];
      const softSkills = userProfile.soft_skills || ['Communication', 'Problem Solving', 'Teamwork'];
      
      // Validate that we have minimum required data
      if (!role) {
        throw new Error('Target role is required for job search');
      }
      
      // Determine experience level
      let experienceLevel = 'Junior';
      if (experienceScore >= 70) {
        experienceLevel = 'Senior';
      } else if (experienceScore >= 40) {
        experienceLevel = 'Mid-level';
      }
      
      const searchQuery = `${role} ${experienceLevel} jobs 2026 ${allSkills.slice(0, 3).join(' ')} ${location} hiring active postings`;
      const searchResults = await this.searchWithTavily(searchQuery);
      
      const prompt = `You are a Career Success Agent helping ${candidateName} find ${experienceLevel} ${role} positions.

**${candidateName}'s Profile:**
- Experience Level: ${experienceLevel} (${experienceScore}/100)
- Technical Skills: ${allSkills.join(', ')}
- Soft Skills: ${softSkills.join(', ')}
- Skill Gaps: ${gaps.join(', ')}
- Key Achievements: ${achievements.join('; ')}
- Preferred Location: ${location}

**Job Market Research (2026):**
${searchResults}

**Task:** Find 5-7 job opportunities that:
1. Match ${candidateName}'s ${experienceLevel} experience level
2. Require their existing skills: ${allSkills.slice(0, 5).join(', ')}
3. Value their soft skills: ${softSkills.slice(0, 3).join(', ')}
4. Offer opportunities to learn: ${gaps.slice(0, 3).join(', ')}
5. Are located in ${location} or offer remote work

Return a Markdown table with:
| Company | Position | Location | Match Score | Key Requirements | Apply Link |
|---------|----------|----------|-------------|------------------|------------|

**Match Score:** Rate 1-10 based on how well the role matches ${candidateName}'s profile.
Include direct application links and highlight which of ${candidateName}'s skills are most relevant for each role.`;

      return await this.callGroqAPI(prompt, 'llama-3.3-70b-versatile');
    } catch (error) {
      throw new Error(`Job search failed: ${error.message}`);
    }
  }

  // InterviewChatAgent - Technical interview simulation
  async conductInterview(userInput, conversationHistory, targetRole, userProfile) {
    try {
      // Provide fallback values for missing fields (Requirement 9.4)
      const candidateName = userProfile.candidate_name || 'Candidate';
      const professionalSummary = userProfile.professional_summary || 'Software professional seeking career growth';
      const skills = userProfile.technical_skills || ['JavaScript', 'Python', 'React'];
      const softSkills = userProfile.soft_skills || ['Communication', 'Problem Solving', 'Teamwork'];
      const experienceScore = userProfile.experience_score || 50;
      const achievements = userProfile.key_achievements || ['Completed projects', 'Team collaboration'];
      const gaps = userProfile.current_gaps || ['System Design', 'Cloud Technologies'];
      
      // Validate minimum required data
      if (!userInput) {
        throw new Error('User input is required for interview simulation');
      }
      
      // Determine experience level based on experience score
      let experienceLevel = 'Junior';
      let questionDifficulty = 'entry-level';
      if (experienceScore >= 70) {
        experienceLevel = 'Senior';
        questionDifficulty = 'senior-level';
      } else if (experienceScore >= 40) {
        experienceLevel = 'Mid-level';
        questionDifficulty = 'mid-level';
      }
      
      const systemPrompt = `You are a Senior Technical Interviewer conducting a ${questionDifficulty} interview for a ${targetRole} position.

**Candidate: ${candidateName}**
- Experience Level: ${experienceLevel} (${experienceScore}/100)
- Technical Skills: ${skills.join(', ')}
- Soft Skills: ${softSkills.join(', ')}
- Skill Gaps: ${gaps.join(', ')}
- Key Achievements: ${achievements.join('; ')}
- Summary: ${professionalSummary}

**Interview Context:**
${conversationHistory.slice(-4).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

**Latest Response from ${candidateName}:**
${userInput}

**Your Role:**
1. Ask ONE ${questionDifficulty} question at a time
2. Focus on their stated skills: ${skills.slice(0, 5).join(', ')}
3. Reference their achievements when relevant
4. Provide specific feedback (Poor/Average/Good/Excellent)
5. Adjust difficulty based on their ${experienceLevel} level
6. Be professional but challenging

**Question Types to Rotate:**
- Technical (focus on: ${skills.slice(0, 3).join(', ')})
- Problem-solving (${questionDifficulty} difficulty)
- System design (appropriate for ${experienceLevel})
- Behavioral (reference their achievements and soft skills: ${softSkills.slice(0, 3).join(', ')})

Address them as ${candidateName}. Make questions relevant to their ${experienceScore}/100 experience level.

Respond as the interviewer:`;

      return await this.callGroqAPI(systemPrompt, 'llama-3.3-70b-versatile');
    } catch (error) {
      throw new Error(`Interview simulation failed: ${error.message}`);
    }
  }

  // SkillAnalysisAgent - Personalized skill gap analysis with market research
  async analyzeSkills(analysis, targetRole = 'Software Engineer') {
    try {
      // Provide fallback values for missing fields (Requirement 9.4)
      const candidateName = analysis.candidate_name || 'Candidate';
      const skills = analysis.technical_skills || ['JavaScript', 'Python', 'HTML/CSS'];
      const softSkills = analysis.soft_skills || ['Communication', 'Problem Solving', 'Teamwork'];
      const gaps = analysis.current_gaps || ['System Design', 'Cloud Technologies', 'DevOps'];
      const experienceScore = analysis.experience_score || 50;
      const achievements = analysis.key_achievements || ['Completed projects', 'Team collaboration'];
      
      // Validate that we have minimum required data
      if (!analysis || Object.keys(analysis).length === 0) {
        throw new Error('Resume analysis data is required. Please upload your resume first.');
      }
      
      // Search for current market trends for the gaps
      const gapQuery = `${gaps.slice(0, 3).join(' ')} skills 2026 market demand learning resources`;
      const marketData = await this.searchWithTavily(gapQuery);
      
      const prompt = `You are a Career Development Expert analyzing ${candidateName}'s skills for a ${targetRole} role.

**${candidateName}'s Current Profile:**
- Name: ${candidateName}
- Experience Score: ${experienceScore}/100
- Technical Skills: ${skills.join(', ')}
- Soft Skills: ${softSkills.join(', ')}
- Skill Gaps: ${gaps.join(', ')}
- Key Achievements: ${achievements.join('; ')}

**Market Research:**
${marketData}

**Task:** Create a PERSONALIZED skill gap analysis for ${candidateName} that:

1. **Acknowledges their strengths** - List their ${skills.length} technical skills with brief assessment
2. **Recognizes soft skills** - Highlight their ${softSkills.length} soft skills and how they complement technical abilities
3. **Identifies priority gaps** - Focus on their specific gaps: ${gaps.join(', ')}
4. **Provides market context** - Use the market research to show demand for missing skills
5. **Creates action plan** - Give 4-6 specific, actionable steps for ${candidateName} to fill THEIR gaps
6. **Suggests timeline** - Realistic timeline based on their ${experienceScore}/100 experience level

Format as markdown with sections:
- 🎯 Your Technical Strengths (list their actual ${skills.length} skills)
- 💡 Your Soft Skills (list their ${softSkills.length} soft skills)
- ⚠️ Priority Skill Gaps (their specific ${gaps.length} gaps)
- 📈 Market Demand Analysis (based on research)
- 🚀 Personalized Action Plan (4-6 steps specific to their gaps)
- ⏱️ Recommended Timeline (based on their experience level)

Make it PERSONAL - use ${candidateName}'s name and reference their specific skills, achievements, and gaps throughout.`;

      return await this.callGroqAPI(prompt, 'llama-3.3-70b-versatile');
    } catch (error) {
      throw new Error(`Skill analysis failed: ${error.message}`);
    }
  }

  // Utility Methods
  async callGroqAPI(prompt, model = 'llama-3.1-8b-instant') {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 2048
    }, {
      headers: {
        'Authorization': `Bearer ${this.groqApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  }

  async searchWithTavily(query) {
    if (!this.tavilyApiKey) {
      return 'Market research requires Tavily API key for real-time data';
    }

    try {
      const response = await axios.post('https://api.tavily.com/search', {
        api_key: this.tavilyApiKey,
        query,
        search_depth: 'advanced',
        max_results: 5,
        include_answer: true,
        include_raw_content: false
      });

      if (response.data && response.data.results) {
        return response.data.results
          .map(r => `**${r.title}**\n${r.content}\nSource: ${r.url}`)
          .join('\n\n');
      }
      return 'No search results found';
    } catch (error) {
      console.error('Tavily search error:', error.message);
      return `Search temporarily unavailable: ${error.message}`;
    }
  }

  parseStructuredResponse(response) {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: parse manually
      return {
        candidate_name: this.extractField(response, 'name') || 'Candidate',
        professional_summary: this.extractField(response, 'summary') || 'Professional summary not available',
        technical_skills: this.extractArray(response, 'technical') || ['JavaScript', 'Python'],
        soft_skills: this.extractArray(response, 'soft') || ['Communication', 'Teamwork'],
        experience_score: parseInt(this.extractField(response, 'score')) || 75,
        key_achievements: this.extractArray(response, 'achievement') || ['Project completion'],
        current_gaps: this.extractArray(response, 'gap') || ['System Design', 'Cloud Technologies'],
        improvement_tips: this.extractArray(response, 'tip') || ['Build more projects', 'Get certifications']
      };
    } catch (error) {
      console.error('Parse error:', error);
      return this.getDefaultAnalysis();
    }
  }

  extractField(text, field) {
    const regex = new RegExp(`${field}[^:]*:?\\s*([^\\n,]+)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim().replace(/['"]/g, '') : null;
  }

  extractArray(text, field) {
    const regex = new RegExp(`${field}[^:]*:?\\s*\\[([^\\]]+)\\]`, 'i');
    const match = text.match(regex);
    if (match) {
      return match[1].split(',').map(item => item.trim().replace(/['"]/g, ''));
    }
    return null;
  }

  getDefaultAnalysis() {
    return {
      candidate_name: 'Candidate',
      professional_summary: 'Analysis completed successfully',
      technical_skills: ['JavaScript', 'Python', 'React'],
      soft_skills: ['Communication', 'Problem Solving'],
      experience_score: 75,
      key_achievements: ['Project development', 'Team collaboration'],
      current_gaps: ['System Design', 'Cloud Technologies'],
      improvement_tips: ['Build portfolio projects', 'Get cloud certifications']
    };
  }
}

const agentService = new KeyRacerAgentService();

// Resume Analysis Endpoint (KeyRacerAnalyzer equivalent)
router.post('/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const targetRole = req.body.targetRole || 'Software Engineer';
    const analysis = await agentService.analyzeResume(req.file.buffer, targetRole);

    const formattedAnalysis = `📊 **Resume Analysis Complete**

**Candidate:** ${analysis.candidate_name}
**Experience Score:** ${analysis.experience_score}/100

**Professional Summary:**
${analysis.professional_summary}

**✅ Technical Strengths:**
${analysis.technical_skills.map(skill => `• ${skill}`).join('\n')}

**🎯 Soft Skills:**
${analysis.soft_skills.map(skill => `• ${skill}`).join('\n')}

**🏆 Key Achievements:**
${analysis.key_achievements.map(achievement => `• ${achievement}`).join('\n')}

**⚠️ Skill Gaps for ${targetRole}:**
${analysis.current_gaps.map(gap => `• ${gap}`).join('\n')}

**💡 Improvement Recommendations:**
${analysis.improvement_tips.map(tip => `• ${tip}`).join('\n')}

**🚀 Next Steps:**
• Generate personalized learning roadmap
• Search for matching job opportunities
• Practice with mock interviews`;

    res.json({ 
      success: true, 
      analysis: formattedAnalysis,
      structured: analysis
    });
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Roadmap Generation Endpoint (RoadmapAgent equivalent)
router.post('/generate-roadmap', async (req, res) => {
  try {
    const { analysis, targetRole } = req.body;
    
    // Validate input data (Requirement 9.3)
    if (!analysis) {
      return res.status(400).json({
        success: false,
        error: 'Resume analysis data is required. Please upload your resume first.'
      });
    }
    
    if (!targetRole) {
      return res.status(400).json({
        success: false,
        error: 'Target role is required for roadmap generation.'
      });
    }
    
    const roadmap = await agentService.generateRoadmap(analysis, targetRole);
    
    res.json({ success: true, roadmap });
  } catch (error) {
    console.error('Roadmap generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate roadmap. Please try again.'
    });
  }
});

// Job Search Endpoint (CareerSuccessAgent equivalent)
router.post('/find-jobs', async (req, res) => {
  try {
    const { role, skills, location, userProfile } = req.body;
    
    // Validate input data (Requirement 9.3)
    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Target role is required for job search.'
      });
    }
    
    if (!userProfile) {
      return res.status(400).json({
        success: false,
        error: 'User profile is required. Please upload your resume first.'
      });
    }
    
    const jobs = await agentService.findJobs(role, skills, location, userProfile);
    
    res.json({ success: true, jobs });
  } catch (error) {
    console.error('Job search error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to search for jobs. Please try again.'
    });
  }
});

// Interview Chat Endpoint (InterviewChatAgent equivalent)
router.post('/interview-chat', async (req, res) => {
  try {
    const { message, history, targetRole, userProfile } = req.body;
    
    // Validate input data (Requirement 9.3)
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required for interview chat.'
      });
    }
    
    if (!targetRole) {
      return res.status(400).json({
        success: false,
        error: 'Target role is required for interview simulation.'
      });
    }
    
    // userProfile is optional - will use defaults if not provided
    const response = await agentService.conductInterview(
      message, 
      history || [], 
      targetRole, 
      userProfile || {}
    );
    
    res.json({ success: true, response });
  } catch (error) {
    console.error('Interview chat error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to process interview response. Please try again.'
    });
  }
});

// Skill Analysis Endpoint (SkillAnalysisAgent equivalent)
router.post('/analyze-skills', async (req, res) => {
  try {
    const { analysis, targetRole } = req.body;
    
    // Validate input data (Requirement 9.3)
    if (!analysis) {
      return res.status(400).json({
        success: false,
        error: 'Resume analysis data is required. Please upload your resume first.'
      });
    }
    
    if (!analysis.candidate_name && !analysis.technical_skills) {
      return res.status(400).json({
        success: false,
        error: 'Resume analysis is incomplete. Please re-upload your resume.'
      });
    }
    
    const skillAnalysis = await agentService.analyzeSkills(analysis, targetRole || 'Software Engineer');
    
    res.json({ success: true, skillAnalysis });
  } catch (error) {
    console.error('Skill analysis error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to analyze skills. Please try again.'
    });
  }
});

// Enhanced AI Chat with Multi-Agent Routing
router.post('/ai-chat', async (req, res) => {
  try {
    const { message, mode, history = [], resumeAnalysis } = req.body;
    
    // Validate input data (Requirement 9.3)
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required for chat.'
      });
    }
    
    let response;

    // Intelligent routing based on message content
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('roadmap') || lowerMessage.includes('learning plan')) {
      if (resumeAnalysis) {
        response = await agentService.generateRoadmap(resumeAnalysis, 'Software Engineer');
      } else {
        response = '📄 **Resume Required**\n\nPlease upload your resume first for personalized roadmap generation.\n\n💡 **Why?** Your roadmap will be customized based on your current skills, experience level, and specific gaps.';
      }
    } else if (lowerMessage.includes('job') || lowerMessage.includes('opportunity')) {
      if (resumeAnalysis) {
        const skills = resumeAnalysis.technical_skills || ['JavaScript', 'React', 'Node.js'];
        response = await agentService.findJobs('Software Engineer', skills, 'Remote', resumeAnalysis);
      } else {
        response = '📄 **Resume Required**\n\nPlease upload your resume first for personalized job search.\n\n💡 **Why?** Job recommendations will be tailored to your technical skills, experience level, and career achievements.';
      }
    } else if (lowerMessage.includes('skill') && (lowerMessage.includes('improve') || lowerMessage.includes('gap') || lowerMessage.includes('analyz'))) {
      if (resumeAnalysis) {
        response = await agentService.analyzeSkills(resumeAnalysis, 'Software Engineer');
      } else {
        response = '📄 **Resume Required**\n\nPlease upload your resume first for skill gap analysis.\n\n💡 **Why?** Your analysis will include assessment of your current skills, identification of priority gaps, and a personalized action plan.';
      }
    } else {
      // General career guidance with full user context
      if (resumeAnalysis) {
        const candidateName = resumeAnalysis.candidate_name || 'Candidate';
        const skills = resumeAnalysis.technical_skills || ['JavaScript', 'Python', 'React'];
        const softSkills = resumeAnalysis.soft_skills || ['Communication', 'Problem Solving'];
        const gaps = resumeAnalysis.current_gaps || ['System Design', 'Cloud Technologies'];
        const experienceScore = resumeAnalysis.experience_score || 50;
        const achievements = resumeAnalysis.key_achievements || ['Project completion'];
        
        const prompt = `You are a KeyRacer AI Career Agent providing personalized career advice to ${candidateName}.

**${candidateName}'s Profile:**
- Experience Score: ${experienceScore}/100
- Technical Skills: ${skills.join(', ')}
- Soft Skills: ${softSkills.join(', ')}
- Skill Gaps: ${gaps.join(', ')}
- Key Achievements: ${achievements.join('; ')}

**${candidateName}'s Question:**
"${message}"

**Your Task:**
Provide personalized, actionable career advice that:
1. Addresses ${candidateName} by name
2. References their specific skills and experience level
3. Considers their skill gaps when making recommendations
4. Builds on their achievements
5. Provides concrete next steps

Be supportive, specific, and practical. Use their actual profile data to make your advice relevant to ${candidateName}.`;
        
        response = await agentService.callGroqAPI(prompt, 'llama-3.3-70b-versatile');
      } else {
        const prompt = `As a KeyRacer AI Career Agent, provide helpful career advice for: "${message}"
        
        Note: User hasn't uploaded a resume yet. Provide general advice and encourage them to upload their resume for personalized guidance.
        
        Provide actionable, specific advice with next steps.`;
        
        response = await agentService.callGroqAPI(prompt, 'llama-3.1-8b-instant');
      }
    }

    res.json({ success: true, response });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to process your message. Please try again.'
    });
  }
});

module.exports = router;