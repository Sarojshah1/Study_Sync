const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  resetToken: { type: String },
  tokenExpiration: { type: Date },
});

const OTP = mongoose.model('OTP', OTPSchema);

module.exports = OTP;
