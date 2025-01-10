const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  context_type: { type: String, enum: ['studygroups', 'project'], required: true },
  context_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message_content: { type: String, required: true },
  sent_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Chat', chatSchema);
