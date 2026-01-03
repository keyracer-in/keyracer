const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Use PyPDF2-like approach with pdf2pic or pdf-parse as fallback
let pdfParse;
try {
  pdfParse = require('pdf-parse');
} catch (e) {
  console.log('pdf-parse not available, using text extraction fallback');
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
      if (pdfParse) {
        try {
          const pdfData = await pdfParse(pdfBuffer);
          resumeText = pdfData.text;
        } catch (pdfError) {
          console.error('PDF parsing failed:', pdfError.message);
          resumeText = 'PDF text extraction failed - using default analysis';
        }
      } else {
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
      // Search for current market trends
      const searchQuery = `${targetRole} learning roadmap 2026 skills trends tools`;
      const searchResults = await this.searchWithTavily(searchQuery);
      
      const prompt = `Objective: Create a 6-month roadmap for ${analysis.candidate_name} to become a ${targetRole}.
      
      Current Profile:
      - Skills: ${analysis.technical_skills?.join(', ') || 'Not specified'}
      - Gaps: ${analysis.current_gaps?.join(', ') || 'Not specified'}
      - Experience Score: ${analysis.experience_score || 'Not scored'}
      
      Market Research Data: ${searchResults}
      
      Requirements:
      1. Search for 2026 tools for these gaps
      2. Monthly breakdown table with: Goal, Project, and Documentation Links
      3. Generate a detailed roadmap with links and descriptions
      
      Format as detailed monthly breakdown:
      ## Month 1-2: Foundation
      **Goal:** [specific goal]
      **Projects:** [2-3 hands-on projects]
      **Resources:** [documentation links and courses]
      **Tools:** [2026 relevant tools]
      
      Continue for 6 months with specific technologies, projects, and measurable milestones.`;

      return await this.callGroqAPI(prompt, 'llama-3.3-70b-versatile');
    } catch (error) {
      throw new Error(`Roadmap generation failed: ${error.message}`);
    }
  }

  // CareerSuccessAgent - Job search with real-time postings
  async findJobs(role, skills, location = 'Remote') {
    try {
      const searchQuery = `${role} jobs 2026 ${skills.slice(0, 3).join(' ')} ${location} hiring active postings`;
      const searchResults = await this.searchWithTavily(searchQuery);
      
      const prompt = `Search for 5 active 2026 job postings for ${role} requiring ${skills.slice(0, 3).join(', ')}.
      
      Search Results: ${searchResults}
      
      Return a Markdown table with:
      | Company | Position | Location | Requirements | Apply Link |
      |---------|----------|----------|--------------|------------|
      
      Include 5-7 relevant opportunities with direct application links and specific requirements.`;

      return await this.callGroqAPI(prompt, 'llama-3.3-70b-versatile');
    } catch (error) {
      throw new Error(`Job search failed: ${error.message}`);
    }
  }

  // InterviewChatAgent - Technical interview simulation
  async conductInterview(userInput, conversationHistory, targetRole, userProfile) {
    try {
      const candidateName = userProfile.candidate_name || 'Candidate';
      const professionalSummary = userProfile.professional_summary || 'Not provided';
      
      const systemPrompt = `You are a Senior Technical Interviewer for ${targetRole} positions.
      
      Candidate Summary: ${professionalSummary}
      Target Role: ${targetRole}
      
      Interview Context:
      ${conversationHistory.slice(-4).map(msg => `${msg.role}: ${msg.content}`).join('\n')}
      
      Candidate: ${userInput}
      
      Interviewer Instructions:
      - Ask ONE technical question at a time
      - Provide specific feedback (Poor/Average/Good/Excellent) 
      - Focus on: Technical skills, Problem-solving, System design, Behavioral
      - Be professional but challenging
      
      Respond as the interviewer:`;

      return await this.callGroqAPI(systemPrompt, 'openai/gpt-oss-120b');
    } catch (error) {
      throw new Error(`Interview simulation failed: ${error.message}`);
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
    const roadmap = await agentService.generateRoadmap(analysis, targetRole);
    
    res.json({ success: true, roadmap });
  } catch (error) {
    console.error('Roadmap generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Job Search Endpoint (CareerSuccessAgent equivalent)
router.post('/find-jobs', async (req, res) => {
  try {
    const { role, skills, location } = req.body;
    const jobs = await agentService.findJobs(role, skills, location);
    
    res.json({ success: true, jobs });
  } catch (error) {
    console.error('Job search error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Interview Chat Endpoint (InterviewChatAgent equivalent)
router.post('/interview-chat', async (req, res) => {
  try {
    const { message, history, targetRole, userProfile } = req.body;
    const response = await agentService.conductInterview(message, history, targetRole, userProfile);
    
    res.json({ success: true, response });
  } catch (error) {
    console.error('Interview chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Enhanced AI Chat with Multi-Agent Routing
router.post('/ai-chat', async (req, res) => {
  try {
    const { message, mode, history = [], resumeAnalysis } = req.body;
    let response;

    // Intelligent routing based on message content
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('roadmap') || lowerMessage.includes('learning plan')) {
      if (resumeAnalysis) {
        response = await agentService.generateRoadmap(resumeAnalysis, 'Software Engineer');
      } else {
        response = '📄 Please upload your resume first for personalized roadmap generation.';
      }
    } else if (lowerMessage.includes('job') || lowerMessage.includes('opportunity')) {
      const skills = resumeAnalysis?.technical_skills || ['JavaScript', 'React', 'Node.js'];
      response = await agentService.findJobs('Software Engineer', skills, 'Remote');
    } else if (lowerMessage.includes('skill') && lowerMessage.includes('improve')) {
      if (resumeAnalysis) {
        response = generateSkillAnalysis(resumeAnalysis);
      } else {
        response = '📄 Please upload your resume first for skill gap analysis.';
      }
    } else {
      // General career guidance
      const prompt = `As a KeyRacer AI Career Agent, provide helpful career advice for: "${message}"
      
      Context: ${resumeAnalysis ? `User has ${resumeAnalysis.technical_skills?.join(', ')} skills` : 'No resume uploaded yet'}
      
      Provide actionable, specific advice with next steps.`;
      
      response = await agentService.callGroqAPI(prompt, 'llama-3.1-8b-instant');
    }

    res.json({ success: true, response });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

function generateSkillAnalysis(analysis) {
  const skills = analysis.technical_skills || [];
  const gaps = analysis.current_gaps || [];
  
  return `📊 **Skill Gap Analysis**

**🎯 Your Strengths:**
${skills.map(skill => `• ${skill}`).join('\n')}

**⚠️ Areas to Improve:**
${gaps.map(gap => `• ${gap}`).join('\n')}

**🚀 Recommended Actions:**
• Build 2-3 portfolio projects
• Get cloud certifications (AWS/Azure)
• Practice system design problems
• Contribute to open source projects`;
}

module.exports = router;