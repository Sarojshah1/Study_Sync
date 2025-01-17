const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile_picture: { type: String, default: null },
  bio: { type: String, default: '' }, 
  contact_number: { type: String, default: '' }, 
  address: { type: String, default: '' }, 
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudyGroup' }],
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Middleware to update `updated_at` before saving
userSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
