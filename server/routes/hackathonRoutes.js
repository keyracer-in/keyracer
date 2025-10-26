const express = require('express');
const router = express.Router();
const Hackathon = require('../models/Hackathon');

// Create hackathon
router.post('/create', async (req, res) => {
  try {
    const hackathonData = req.body;

    // Generate unique ID and organizer code
    const id = 'HK' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const organizerCode = 'ORG' + Math.random().toString(36).substr(2, 9).toUpperCase();

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

    let hackathon;
    if (identifier.startsWith('ORG')) {
      // Search by organizer code
      hackathon = await Hackathon.findOne({ organizerCode: identifier });
    } else {
      // Search by hackathon ID
      hackathon = await Hackathon.findOne({ id: identifier });
    }

    if (!hackathon) {
      return res.status(404).json({ error: 'Hackathon not found' });
    }

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

module.exports = router;
