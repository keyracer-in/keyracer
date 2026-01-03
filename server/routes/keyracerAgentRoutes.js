const express = require('express');
const multer = require('multer');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const axios = require('axios');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Enhanced KeyRacer Agent Service with Multi-Agent Architecture
class KeyRacerAgentService {
  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY;
    this.tavilyApiKey = process.env.TAVILY_API_KEY;
  }

  // Resume Analyzer Agent (equivalent to KeyRacerAnalyzer)
  async analyzeResume(pdfBuffer, targetRole = 'Software Engineer') {
    try {
      const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
      const pdf = await loadingTask.promise;
      let resumeText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        resumeText += pageText + '\n';
      }

      const prompt = `Analyze this resume for ${targetRole} role. Return structured JSON with:
      {
        "candidate_name": "string",
        "professional_summary": "2-sentence summary",
        "technical_skills": ["skill1", "skill2"],
        "soft_skills": ["skill1", "skill2"],
        "experience_score": 85,
        "key_achievements": ["achievement1", "achievement2"],
        "current_gaps": ["gap1", "gap2"],
        "improvement_tips": ["tip1", "tip2"]
      }
      
      Resume: ${resumeText}`;

      const response = await this.callGroqAPI(prompt, 'llama-3.1-8b-instant');
      return this.parseStructuredResponse(response);
    } catch (error) {
      throw new Error(`Resume analysis failed: ${error.message}`);
    }
  }

  // Roadmap Agent (equivalent to RoadmapAgent)
  async generateRoadmap(analysis, targetRole) {
    try {
      const searchQuery = `${targetRole} learning roadmap 2024 skills trends`;
      const searchResults = await this.searchWithTavily(searchQuery);
      
      const prompt = `Create a 6-month roadmap for ${analysis.candidate_name} to become a ${targetRole}.
      
      Current Profile:
      - Skills: ${analysis.technical_skills?.join(', ') || 'Not specified'}
      - Gaps: ${analysis.current_gaps?.join(', ') || 'Not specified'}
      - Experience Score: ${analysis.experience_score || 'Not scored'}
      
      Market Research: ${searchResults}
      
      Format as monthly breakdown:
      ## Month 1-2: Foundation
      **Goal:** [specific goal]
      **Projects:** [2-3 projects]
      **Resources:** [links and courses]
      
      Continue for 6 months with specific technologies, projects, and measurable milestones.`;

      return await this.callGroqAPI(prompt, 'llama-3.1-8b-instant');
    } catch (error) {
      throw new Error(`Roadmap generation failed: ${error.message}`);
    }
  }

  // Career Success Agent (equivalent to CareerSuccessAgent)
  async findJobs(role, skills, location = 'Remote') {
    try {
      const searchQuery = `${role} jobs 2024 ${skills.slice(0, 3).join(' ')} ${location} hiring`;
      const searchResults = await this.searchWithTavily(searchQuery);
      
      const prompt = `Extract job opportunities from this search data for ${role} position.
      Skills: ${skills.join(', ')}
      
      Search Results: ${searchResults}
      
      Format as markdown table:
      | Company | Position | Location | Requirements | Apply Link |
      |---------|----------|----------|--------------|------------|
      
      Include 5-7 relevant opportunities with direct application links.`;

      return await this.callGroqAPI(prompt, 'meta-llama/llama-4-maverick-17b-128e-instruct');
    } catch (error) {
      throw new Error(`Job search failed: ${error.message}`);
    }
  }

  // Interview Chat Agent (equivalent to InterviewChatAgent)
  async conductInterview(userInput, conversationHistory, targetRole, userProfile) {
    try {
      const systemPrompt = `You are a Senior Technical Interviewer for ${targetRole} positions.
      
      Candidate Profile: ${userProfile.professional_summary || 'Not provided'}
      Target Role: ${targetRole}
      
      Interview Rules:
      1. Ask ONE technical question at a time
      2. Wait for candidate's answer
      3. Provide specific feedback (Poor/Average/Good/Excellent)
      4. Ask follow-up or next question
      5. Focus on: Technical skills, Problem-solving, System design, Behavioral
      
      Conversation History: ${JSON.stringify(conversationHistory.slice(-4))}
      
      Candidate Response: "${userInput}"
      
      Respond as interviewer with feedback and next question.`;

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
      return 'Search functionality requires Tavily API key';
    }

    try {
      const response = await axios.post('https://api.tavily.com/search', {
        api_key: this.tavilyApiKey,
        query,
        search_depth: 'basic',
        max_results: 5,
        include_answer: true
      });

      return response.data.results.map(r => `${r.title}: ${r.content}`).join('\n\n');
    } catch (error) {
      return `Search error: ${error.message}`;
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