const express = require('express');
const { ObjectId } = require('mongodb');
const randomWords = require('random-words');
const router = express.Router();

// Get study info by code for participants
router.get('/join/:code', async (req, res) => {
  try {
    const study = await req.db.collection('studies')
      .findOne({ code: req.params.code.toUpperCase() });

    if (!study) {
      return res.status(404).json({ error: 'Study not found. Please check your code.' });
    }

    if (study.status === 'completed') {
      return res.status(400).json({ error: 'This study has been completed.' });
    }

    // Generate groups array
    const groups = Array.from({ length: study.groupCount }, (_, i) => ({
      id: i + 1,
      name: `Group ${i + 1}`
    }));

    // Generate random username if enabled
    const randomUsername = null;

    res.json({
      id: study._id,
      code: study.code,
      name: study.name,
      groups,
      randomUsername,
      randomUsernames: study.randomUsernames,
      segmentCount: study.segmentCount,
      status: study.status
    });
  } catch (error) {
    console.error('Error fetching study by code:', error);
    res.status(500).json({ error: 'Failed to fetch study' });
  }
});

// Join study by code (participant selects group and gets session)
router.post('/join/:code', async (req, res) => {
  try {
    const { groupId, sessionId } = req.body;

    if (!groupId || !sessionId) {
      return res.status(400).json({ error: 'Group ID and session ID required' });
    }

    const study = await req.db.collection('studies')
      .findOne({ code: req.params.code.toUpperCase() });

    if (!study) {
      return res.status(404).json({ error: 'Study not found. Please check your code.' });
    }

    if (study.status === 'completed') {
      return res.status(400).json({ error: 'This study has been completed.' });
    }

    if (groupId < 1 || groupId > study.groupCount) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    // Create session record
    const session = {
      studyId: study._id.toString(),
      studyCode: study.code,
      sessionId,
      groupId: groupId.toString(),
      joinedAt: new Date(),
      randomUsername: null
    };

    await req.db.collection('sessions').insertOne(session);

    res.json({
      success: true,
      session: {
        studyId: study._id.toString(),
        studyCode: study.code,
        sessionId,
        groupId: groupId.toString(),
        randomUsername: session.randomUsername
      }
    });
  } catch (error) {
    console.error('Error joining study:', error);
    res.status(500).json({ error: 'Failed to join study' });
  }
});

// Submit participant data (updated to work with study codes)
router.post('/submit', async (req, res) => {
  try {
    const { buttonType, sessionId, studyCode, groupId, segmentId, timestamp, additionalData } = req.body;
    
    if (!buttonType || !sessionId || !studyCode) {
      return res.status(400).json({ error: 'Button type, session ID, and study code required' });
    }

    // Get study by code
    const study = await req.db.collection('studies')
      .findOne({ code: studyCode.toUpperCase() });

    if (!study) {
      return res.status(404).json({ error: 'Study not found' });
    }

    const submission = {
      studyId: study._id.toString(),
      studyCode: study.code,
      buttonType,
      sessionId,
      groupId: groupId || null,
      segmentId: segmentId || null,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      additionalData: additionalData || {},
      submittedAt: new Date()
    };

    // Insert into MongoDB
    const result = await req.db.collection('submissions').insertOne(submission);

    res.json({ 
      success: true, 
      id: result.insertedId,
      message: 'Data submitted successfully' 
    });
  } catch (error) {
    console.error('Error submitting participant data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit data' 
    });
  }
});

// Get participant's session data
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const submissions = await req.db.collection('submissions')
      .find({ sessionId })
      .sort({ timestamp: 1 })
      .toArray();

    const session = await req.db.collection('sessions')
      .findOne({ sessionId });

    res.json({
      sessionId,
      session,
      submissions,
      count: submissions.length
    });
  } catch (error) {
    console.error('Error fetching session data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch session data' 
    });
  }
});

// Generate new random username for a study code
router.get('/random-username/:code', async (req, res) => {
  try {
    const study = await req.db.collection('studies')
      .findOne({ code: req.params.code.toUpperCase() });

    if (!study || !study.randomUsernames) {
      return res.status(400).json({ error: 'Random usernames not enabled for this study' });
    }

    const randomUsername = randomWords(2).join('-');
    res.json({ randomUsername });
  } catch (error) {
    console.error('Error generating random username:', error);
    res.status(500).json({ error: 'Failed to generate username' });
  }
});

module.exports = router;