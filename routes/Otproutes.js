const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); // For generating secure tokens
const OTP = require("../models/Otp");
require('dotenv').config();
const otprouter = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.USER,
    pass: process.env.APP_PASSWORD,
  },
});

otprouter.post('/', async (req, res) => {
  const { email } = req.body;
  console.log(email);

  // Generate a secure token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Save token and its expiration time to the database
  const tokenExpiration = new Date();
  tokenExpiration.setMinutes(tokenExpiration.getMinutes() + 15);

  try {
    await OTP.findOneAndUpdate(
      { email: email },
      { resetToken: resetToken, tokenExpiration: tokenExpiration },
      { upsert: true }
    );

    // Construct the password reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: 'Password Reset Request',
      text: `Dear User,

We received a request to reset your password. To proceed, please click the link below or paste it into your web browser:

${resetLink}

Please note that this link will expire in 15 minutes for your security. If you did not request a password reset, please ignore this email, and no changes will be made to your account.

Best regards,
The Support Team`,
      html: `<p>Dear User,</p>
      <p>We received a request to reset your password. To proceed, please click the link below or paste it into your web browser:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Please note that this link will expire in <strong>15 minutes</strong> for your security. If you did not request a password reset, please ignore this email, and no changes will be made to your account.</p>
      <p>Best regards,</p>
      <p><strong>The Support Team</strong></p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).send('Failed to send reset link');
      } else {
        console.log('Reset link sent successfully');
        res.status(200).send('Password reset link sent successfully');
      }
    });
    console.log("Email:", email);
    console.log("Reset Link:", resetLink);

  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to send reset link');
  }
});

module.exports = otprouter;
