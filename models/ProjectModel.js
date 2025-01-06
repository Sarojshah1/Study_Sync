const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  project_name: { type: String, required: true },
  description: { type: String, required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String },
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyGroup', required: true },
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

module.exports = mongoose.model('Project', projectSchema);
