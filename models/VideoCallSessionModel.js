const mongoose = require('mongoose');

const videoCallSessionSchema = new mongoose.Schema({
  context_type: { type: String, enum: ['group', 'project'], required: true },
  context_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  host_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [
    {
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      joined_at: { type: Date, default: Date.now },
    },
  ],
  start_time: { type: Date, default: Date.now },
  end_time: { type: Date },
});

module.exports = mongoose.model('VideoCallSession', videoCallSessionSchema);
