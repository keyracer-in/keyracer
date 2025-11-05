const express = require('express');
const router = express.Router();
const Hackathon = require('../models/Hackathon');

// Create hackathon
router.post('/create', async (req, res) => {
  try {
    const hackathonData = req.body;

    // Generate unique ID
    const id = 'HK' + Math.random().toString(36).substr(2, 6).toUpperCase();

    // Use provided organizer code or generate one
    const organizerCode = hackathonData.organizerCode || 'ORG' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const hackathon = new Hackathon({
      ...hackathonData,
      id,
      organizerCode
    });

    await hackathon.save();

    res.json({
      success: true,
      hackathon: {
        id: hackathon.id,
        organizerCode: hackathon.organizerCode,
        title: hackathon.title
      }
    });
  } catch (error) {
    console.error('Error creating hackathon:', error);
    res.status(500).json({ error: 'Failed to create hackathon' });
  }
});

// Get hackathon by ID or organizer code
router.get('/find/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    console.log(`[HACKATHON FIND] Searching for identifier: ${identifier}`);

    let hackathon;
    if (identifier.toUpperCase().startsWith('ORG')) {
      // Search by organizer code (case-insensitive)
      console.log(`[HACKATHON FIND] Searching by organizer code: ${identifier}`);
      hackathon = await Hackathon.findOne({
        organizerCode: { $regex: new RegExp(`^${identifier}$`, 'i') }
      });
      console.log(`[HACKATHON FIND] Organizer code search result:`, hackathon ? `Found hackathon ${hackathon.id}` : 'Not found');
    } else {
      // Search by hackathon ID
      console.log(`[HACKATHON FIND] Searching by hackathon ID: ${identifier}`);
      hackathon = await Hackathon.findOne({ id: identifier });
      console.log(`[HACKATHON FIND] Hackathon ID search result:`, hackathon ? `Found hackathon ${hackathon.id}` : 'Not found');
    }

    if (!hackathon) {
      console.log(`[HACKATHON FIND] No hackathon found for identifier: ${identifier}`);
      return res.status(404).json({
        error: 'Hackathon not found',
        identifier: identifier,
        message: `No hackathon found with ${identifier.startsWith('ORG') ? 'organizer code' : 'ID'} "${identifier}"`
      });
    }

    console.log(`[HACKATHON FIND] Successfully found hackathon: ${hackathon.title} (${hackathon.id})`);
    res.json({
      success: true,
      hackathon: {
        id: hackathon.id,
        organizerCode: hackathon.organizerCode,
        title: hackathon.title,
        date: hackathon.date,
        startTime: hackathon.startTime,
        endTime: hackathon.endTime,
        status: hackathon.status,
        participants: hackathon.participants.length
      }
    });
  } catch (error) {
    console.error('Error finding hackathon:', error);
    res.status(500).json({ error: 'Failed to find hackathon' });
  }
});

// Register participant
router.post('/:hackathonId/participants', async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { name, email } = req.body;

    const hackathon = await Hackathon.findOne({ id: hackathonId });
    if (!hackathon) {
      return res.status(404).json({ error: 'Hackathon not found' });
    }

    // Generate unique participant ID
    const participantId = 'PART' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();

    const participant = {
      id: participantId,
      name: name.trim(),
      email: email ? email.trim() : '',
      joinedAt: new Date(),
      status: 'active',
      submissions: [],
      lastActivity: new Date()
    };

    hackathon.participants.push(participant);
    await hackathon.save();

    res.json({
      success: true,
      participant: {
        id: participantId,
        name: participant.name
      }
    });
  } catch (error) {
    console.error('Error registering participant:', error);
    res.status(500).json({ error: 'Failed to register participant' });
  }
});

// Get hackathon participants
router.get('/:hackathonId/participants', async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const hackathon = await Hackathon.findOne({ id: hackathonId });
    if (!hackathon) {
      return res.status(404).json({ error: 'Hackathon not found' });
    }

    res.json({
      success: true,
      participants: hackathon.participants
    });
  } catch (error) {
    console.error('Error getting participants:', error);
    res.status(500).json({ error: 'Failed to get participants' });
  }
});

// Get hackathon problems
router.get('/:hackathonId/problems', async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const hackathon = await Hackathon.findOne({ id: hackathonId });
    if (!hackathon) {
      return res.status(404).json({ error: 'Hackathon not found' });
    }

    res.json({
      success: true,
      problems: hackathon.problems
    });
  } catch (error) {
    console.error('Error getting problems:', error);
    res.status(500).json({ error: 'Failed to get problems' });
  }
});

// Add problem to hackathon
router.post('/:hackathonId/problems', async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const problemData = req.body;

    const hackathon = await Hackathon.findOne({ id: hackathonId });
    if (!hackathon) {
      return res.status(404).json({ error: 'Hackathon not found' });
    }

    // Generate problem ID
    const problemId = 'PROB' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();

    const problem = {
      id: problemId,
      ...problemData
    };

    hackathon.problems.push(problem);
    await hackathon.save();

    res.json({
      success: true,
      problem
    });
  } catch (error) {
    console.error('Error adding problem:', error);
    res.status(500).json({ error: 'Failed to add problem' });
  }
});

// Submit solution
router.post('/:hackathonId/submit', async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { participantId, problemId, code, language } = req.body;

    const hackathon = await Hackathon.findOne({ id: hackathonId });
    if (!hackathon) {
      return res.status(404).json({ error: 'Hackathon not found' });
    }

    const participant = hackathon.participants.find(p => p.id === participantId);
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    // Check if participant already submitted for this problem
    const existingSubmission = participant.submissions.find(s => s.problemId === problemId);
    if (existingSubmission) {
      return res.status(400).json({
        error: 'You can only submit one solution per problem. You have already submitted a solution for this problem.'
      });
    }

    const submission = {
      problemId,
      code,
      language,
      submittedAt: new Date(),
      status: 'pending'
    };

    participant.submissions.push(submission);
    participant.lastActivity = new Date();

    await hackathon.save();

    res.json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('Error submitting solution:', error);
    res.status(500).json({ error: 'Failed to submit solution' });
  }
});

// Get participant data
router.get('/:hackathonId/participant/:participantId', async (req, res) => {
  try {
    const { hackathonId, participantId } = req.params;

    const hackathon = await Hackathon.findOne({ id: hackathonId });
    if (!hackathon) {
      return res.status(404).json({ error: 'Hackathon not found' });
    }

    const participant = hackathon.participants.find(p => p.id === participantId);
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    res.json({
      success: true,
      participant: {
        id: participant.id,
        name: participant.name,
        email: participant.email,
        joinedAt: participant.joinedAt,
        status: participant.status,
        submissions: participant.submissions,
        lastActivity: participant.lastActivity
      }
    });
  } catch (error) {
    console.error('Error getting participant:', error);
    res.status(500).json({ error: 'Failed to get participant' });
  }
});

// Get participant submissions
router.get('/:hackathonId/participant/:participantId/submissions', async (req, res) => {
  try {
    const { hackathonId, participantId } = req.params;

    const hackathon = await Hackathon.findOne({ id: hackathonId });
    if (!hackathon) {
      return res.status(404).json({ error: 'Hackathon not found' });
    }

    const participant = hackathon.participants.find(p => p.id === participantId);
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    res.json({
      success: true,
      submissions: participant.submissions
    });
  } catch (error) {
    console.error('Error getting participant submissions:', error);
    res.status(500).json({ error: 'Failed to get participant submissions' });
  }
});

// Get all submissions for a hackathon
router.get('/:hackathonId/submissions', async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const hackathon = await Hackathon.findOne({ id: hackathonId });
    if (!hackathon) {
      return res.status(404).json({ error: 'Hackathon not found' });
    }

    // Collect all submissions from all participants
    const allSubmissions = [];
    hackathon.participants.forEach(participant => {
      participant.submissions.forEach(submission => {
        allSubmissions.push({
          id: submission._id ? submission._id.toString() : `sub_${Date.now()}_${Math.random()}`,
          participantId: participant.id,
          participantName: participant.name,
          problemId: submission.problemId,
          code: submission.code,
          language: submission.language,
          submittedAt: submission.submittedAt,
          status: submission.status,
          evaluated: submission.evaluated || false,
          evaluation: submission.evaluation || null
        });
      });
    });

    // Sort by submission time (newest first)
    allSubmissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    res.json({
      success: true,
      submissions: allSubmissions
    });
  } catch (error) {
    console.error('Error getting hackathon submissions:', error);
    res.status(500).json({ error: 'Failed to get hackathon submissions' });
  }
});

// Evaluate a submission
router.post('/:hackathonId/evaluate', async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { participantId, problemId, evaluation } = req.body;

    console.log(`[EVALUATE] Evaluating submission for hackathon ${hackathonId}, participant ${participantId}, problem ${problemId}`);

    const hackathon = await Hackathon.findOne({ id: hackathonId });
    if (!hackathon) {
      return res.status(404).json({ error: 'Hackathon not found' });
    }

    const participant = hackathon.participants.find(p => p.id === participantId);
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    const submission = participant.submissions.find(s => s.problemId === problemId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Update submission with evaluation
    submission.evaluated = true;
    submission.evaluation = {
      score: evaluation.score,
      status: evaluation.status,
      feedback: evaluation.feedback,
      evaluatedAt: evaluation.evaluatedAt,
      evaluatedBy: evaluation.evaluatedBy
    };

    // Update participant last activity
    participant.lastActivity = new Date();

    await hackathon.save();

    console.log(`[EVALUATE] Successfully evaluated submission for participant ${participantId}, problem ${problemId}`);

    res.json({
      success: true,
      message: 'Evaluation saved successfully',
      evaluation: submission.evaluation
    });
  } catch (error) {
    console.error('Error evaluating submission:', error);
    res.status(500).json({ error: 'Failed to evaluate submission' });
  }
});

// Update problem
router.put('/:hackathonId/problems/:problemId', async (req, res) => {
  try {
    const { hackathonId, problemId } = req.params;
    const updateData = req.body;

    const hackathon = await Hackathon.findOne({ id: hackathonId });
    if (!hackathon) {
      return res.status(404).json({ error: 'Hackathon not found' });
    }

    const problem = hackathon.problems.find(p => p.id === problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    Object.assign(problem, updateData);
    await hackathon.save();

    res.json({
      success: true,
      problem
    });
  } catch (error) {
    console.error('Error updating problem:', error);
    res.status(500).json({ error: 'Failed to update problem' });
  }
});

// Delete problem
router.delete('/:hackathonId/problems/:problemId', async (req, res) => {
  try {
    const { hackathonId, problemId } = req.params;

    const hackathon = await Hackathon.findOne({ id: hackathonId });
    if (!hackathon) {
      return res.status(404).json({ error: 'Hackathon not found' });
    }

    hackathon.problems = hackathon.problems.filter(p => p.id !== problemId);
    await hackathon.save();

    res.json({
      success: true,
      message: 'Problem deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting problem:', error);
    res.status(500).json({ error: 'Failed to delete problem' });
  }
});

// Get hackathons by organizer code
router.get('/organizer/:organizerCode', async (req, res) => {
  try {
    const { organizerCode } = req.params;

    const hackathons = await Hackathon.find({ organizerCode });
    res.json({
      success: true,
      hackathons: hackathons.map(h => ({
        id: h.id,
        organizerCode: h.organizerCode,
        title: h.title,
        date: h.date,
        status: h.status,
        participantCount: h.participants.length,
        problems: h.problems,
        participants: h.participants
      }))
    });
  } catch (error) {
    console.error('Error getting hackathons by organizer:', error);
    res.status(500).json({ error: 'Failed to get hackathons by organizer' });
  }
});

// Remove participant from hackathon
router.delete('/:hackathonId/participants/:participantId', async (req, res) => {
  try {
    const { hackathonId, participantId } = req.params;

    const hackathon = await Hackathon.findOne({ id: hackathonId });
    if (!hackathon) {
      return res.status(404).json({ error: 'Hackathon not found' });
    }

    const participantIndex = hackathon.participants.findIndex(p => p.id === participantId);
    if (participantIndex === -1) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    // Remove participant from array
    hackathon.participants.splice(participantIndex, 1);
    await hackathon.save();

    res.json({
      success: true,
      message: 'Participant removed successfully'
    });
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({ error: 'Failed to remove participant' });
  }
});

// Update hackathon
router.put('/:hackathonId', async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const updateData = req.body;

    const hackathon = await Hackathon.findOne({ id: hackathonId });
    if (!hackathon) {
      return res.status(404).json({ error: 'Hackathon not found' });
    }

    // Update allowed fields
    const allowedFields = [
      'title', 'date', 'startTime', 'endTime', 'rules', 'allowedTechStack',
      'autoStart', 'antiCheating', 'status'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        hackathon[field] = updateData[field];
      }
    });

    await hackathon.save();

    res.json({
      success: true,
      hackathon: {
        id: hackathon.id,
        organizerCode: hackathon.organizerCode,
        title: hackathon.title,
        date: hackathon.date,
        startTime: hackathon.startTime,
        endTime: hackathon.endTime,
        status: hackathon.status,
        rules: hackathon.rules,
        allowedTechStack: hackathon.allowedTechStack,
        autoStart: hackathon.autoStart,
        antiCheating: hackathon.antiCheating
      }
    });
  } catch (error) {
    console.error('Error updating hackathon:', error);
    res.status(500).json({ error: 'Failed to update hackathon' });
  }
});

// Debug route to list all hackathons (development only)
router.get('/debug/list', async (req, res) => {
  try {
    const hackathons = await Hackathon.find({}, 'id organizerCode title date status participants');
    res.json({
      success: true,
      count: hackathons.length,
      hackathons: hackathons.map(h => ({
        id: h.id,
        organizerCode: h.organizerCode,
        title: h.title,
        date: h.date,
        status: h.status,
        participantCount: h.participants.length
      }))
    });
  } catch (error) {
    console.error('Error listing hackathons:', error);
    res.status(500).json({ error: 'Failed to list hackathons' });
  }
});

module.exports = router;
