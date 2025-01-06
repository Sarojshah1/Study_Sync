const mongoose = require('mongoose');

const studyGroupSchema = new mongoose.Schema({
  group_name: { type: String, required: true },
  description: { type: String, required: true },
  groupPhoto:{ type: String, default:null},
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [
    {
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      joined_at: { type: Date, default: Date.now },
    },
  ],
  join_requests: [
    {
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      requested_at: { type: Date, default: Date.now },
    },
  ],
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('StudyGroup', studyGroupSchema);
