const express = require('express');
const router = express.Router();
const VideoCallSession = require('../models/VideoCallSessionModel');

// Start a video call
router.post('/start', async (req, res) => {
  const { context_type, context_id, host_id } = req.body;

  try {
    const session = await VideoCallSession.create({
      context_type,
      context_id,
      host_id,
      start_time: new Date(),
    });

    res.status(201).json({ message: 'Video call started', session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// End a video call
router.post('/end', async (req, res) => {
  const { session_id } = req.body;

  try {
    const session = await VideoCallSession.findByIdAndUpdate(
      session_id,
      { end_time: new Date() },
      { new: true }
    );

    res.status(200).json({ message: 'Video call ended', session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
