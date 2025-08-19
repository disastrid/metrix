const express = require('express');
const { ObjectId } = require('mongodb');
const randomWords = require('random-words');
const router = express.Router();

// Generate unique 4-digit alphanumeric code
function generateStudyCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Get all studies
router.get('/', async (req, res) => {
  try {
    const studies = await req.db.collection('studies')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(studies);
  } catch (error) {
    console.error('Error fetching studies:', error);
    res.status(500).json({ error: 'Failed to fetch studies' });
  }
});

// Create new study
router.post('/', async (req, res) => {
  try {
    const { name, groupCount, segmentCount, randomUsernames } = req.body;

    if (!name || !groupCount || !segmentCount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique study code
    let studyCode;
    let codeExists = true;
    
    while (codeExists) {
      studyCode = generateStudyCode();
      const existing = await req.db.collection('studies').findOne({ code: studyCode });
      codeExists = !!existing;
    }

    const study = {
      name,
      code: studyCode,
      groupCount: parseInt(groupCount),
      segmentCount: parseInt(segmentCount),
      randomUsernames: Boolean(randomUsernames),
      status: 'upcoming',
      practiceActive: false,
      currentSegment: null,
      segmentStates: Array(parseInt(segmentCount)).fill(false), // track which segments are active
      createdAt: new Date(),
      settings: {}
    };

    const result = await req.db.collection('studies').insertOne(study);
    study._id = result.insertedId;

    res.json(study);
  } catch (error) {
    console.error('Error creating study:', error);
    res.status(500).json({ error: 'Failed to create study' });
  }
});

// Get single study
router.get('/:id', async (req, res) => {
  try {
    const study = await req.db.collection('studies')
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!study) {
      return res.status(404).json({ error: 'Study not found' });
    }

    res.json(study);
  } catch (error) {
    console.error('Error fetching study:', error);
    res.status(500).json({ error: 'Failed to fetch study' });
  }
});

// Update study
router.put('/:id', async (req, res) => {
  try {
    const { name, groupCount, segmentCount, randomUsernames, status } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (groupCount) updateData.groupCount = parseInt(groupCount);
    if (segmentCount) {
      updateData.segmentCount = parseInt(segmentCount);
      updateData.segmentStates = Array(parseInt(segmentCount)).fill(false);
    }
    if (randomUsernames !== undefined) updateData.randomUsernames = Boolean(randomUsernames);
    if (status) updateData.status = status;

    updateData.updatedAt = new Date();

    const result = await req.db.collection('studies').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Study not found' });
    }

    const updatedStudy = await req.db.collection('studies')
      .findOne({ _id: new ObjectId(req.params.id) });

    res.json(updatedStudy);
  } catch (error) {
    console.error('Error updating study:', error);
    res.status(500).json({ error: 'Failed to update study' });
  }
});

// Delete study
router.delete('/:id', async (req, res) => {
  try {
    // Delete study
    const result = await req.db.collection('studies').deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Study not found' });
    }

    // Delete associated submissions
    await req.db.collection('submissions').deleteMany({
      studyId: req.params.id
    });

    res.json({ success: true, message: 'Study deleted successfully' });
  } catch (error) {
    console.error('Error deleting study:', error);
    res.status(500).json({ error: 'Failed to delete study' });
  }
});

// Export study data
router.get('/:id/export', async (req, res) => {
  try {
    const study = await req.db.collection('studies')
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!study) {
      return res.status(404).json({ error: 'Study not found' });
    }

    const submissions = await req.db.collection('submissions')
      .find({ studyId: req.params.id })
      .sort({ timestamp: 1 })
      .toArray();

    // Convert to CSV
    const headers = ['timestamp', 'sessionId', 'groupId', 'segmentId', 'buttonType', 'submittedAt'];
    const csvRows = [headers.join(',')];
    
    submissions.forEach(sub => {
      const row = [
        sub.timestamp || '',
        sub.sessionId || '',
        sub.groupId || '',
        sub.segmentId || '',
        sub.buttonType || '',
        sub.submittedAt || ''
      ].join(',');
      csvRows.push(row);
    });

    const csvContent = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${study.name}_data.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting study data:', error);
    res.status(500).json({ error: 'Failed to export study data' });
  }
});

// Start practice phase
router.post('/:id/start-practice', async (req, res) => {
  try {
    await req.db.collection('studies').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { practiceActive: true, status: 'active' } }
    );

    const study = await req.db.collection('studies').findOne({ _id: new ObjectId(req.params.id) });
    // Emit to all participants in this study
    req.app.io.to(`study_${study.code}`).emit('practice_started');

    res.json({ success: true, action: 'practice_started' });
  } catch (error) {
    console.error('Error starting practice:', error);
    res.status(500).json({ error: 'Failed to start practice' });
  }
});

// Stop practice phase
router.post('/:id/stop-practice', async (req, res) => {
  try {
    await req.db.collection('studies').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { practiceActive: false } }
    );

    req.app.io.to(`study_${req.params.id}`).emit('practice_stopped');

    res.json({ success: true, action: 'practice_stopped' });
  } catch (error) {
    console.error('Error stopping practice:', error);
    res.status(500).json({ error: 'Failed to stop practice' });
  }
});

// Start segment
router.post('/:id/segments/:segmentId/start', async (req, res) => {
  try {
    const segmentId = parseInt(req.params.segmentId);
    
    const study = await req.db.collection('studies')
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!study) {
      return res.status(404).json({ error: 'Study not found' });
    }

    // Update segment state
    const segmentStates = study.segmentStates || Array(study.segmentCount).fill(false);
    segmentStates[segmentId] = true;

    await req.db.collection('studies').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          currentSegment: segmentId,
          segmentStates: segmentStates,
          status: 'active'
        } 
      }
    );

    req.app.io.to(`study_${req.params.id}`).emit('segment_started', { segmentId });

    res.json({ success: true, action: 'segment_started', segmentId });
  } catch (error) {
    console.error('Error starting segment:', error);
    res.status(500).json({ error: 'Failed to start segment' });
  }
});

// Stop segment
router.post('/:id/segments/:segmentId/stop', async (req, res) => {
  try {
    const segmentId = parseInt(req.params.segmentId);
    
    const study = await req.db.collection('studies')
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!study) {
      return res.status(404).json({ error: 'Study not found' });
    }

    // Update segment state
    const segmentStates = study.segmentStates || Array(study.segmentCount).fill(false);
    segmentStates[segmentId] = false;

    // Check if this is the last segment
    const allSegmentsCompleted = segmentStates.every((state, index) => index === segmentId || state === false);
    const newStatus = allSegmentsCompleted ? 'completed' : 'active';

    await req.db.collection('studies').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          currentSegment: null,
          segmentStates: segmentStates,
          status: newStatus
        } 
      }
    );

    req.app.io.to(`study_${req.params.id}`).emit('segment_stopped', { segmentId });

    res.json({ success: true, action: 'segment_stopped', segmentId });
  } catch (error) {
    console.error('Error stopping segment:', error);
    res.status(500).json({ error: 'Failed to stop segment' });
  }
});

// Get study status and connected participants (by code for control panel)
router.get('/code/:code/status', async (req, res) => {
  try {
    const study = await req.db.collection('studies')
      .findOne({ code: req.params.code.toUpperCase() });

    if (!study) {
      return res.status(404).json({ error: 'Study not found' });
    }

    // Get connected participants count
    const room = req.app.io.sockets.adapter.rooms.get(`study_${study.code}`);
    const connectedParticipants = room ? room.size : 0;

    res.json({
      study,
      connectedParticipants,
      practiceActive: study.practiceActive,
      currentSegment: study.currentSegment,
      segmentStates: study.segmentStates || Array(study.segmentCount).fill(false)
    });
  } catch (error) {
    console.error('Error fetching study status by code:', error);
    res.status(500).json({ error: 'Failed to fetch study status' });
  }
});

// Show random usernames
router.post('/:id/show-usernames', async (req, res) => {
  try {
    const study = await req.db.collection('studies')
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!study || !study.randomUsernames) {
      return res.status(400).json({ error: 'Random usernames not enabled for this study' });
    }

    req.app.io.to(`study_${req.params.id}`).emit('show_usernames');
    res.json({ success: true, action: 'show_usernames' });
  } catch (error) {
    console.error('Error showing usernames:', error);
    res.status(500).json({ error: 'Failed to show usernames' });
  }
});

module.exports = router;