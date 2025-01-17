const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel'); // Import User model

// Register User
const registerUser = async (req, res) => {
  const { name, email, password,bio,contact_number ,address } = req.body;
  let profilePhoto = null;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    if (req.files && req.files.profile_picture) {
      const { profile_picture } = req.files;
      profilePhoto = `photo-${Date.now()}-${profile_picture.name}`;
      const uploadPath = path.join(__dirname, `../public/${profilePhoto}`);
      const directoryPath = path.join(__dirname, '../public');
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
      }
      await profile_picture.mv(uploadPath);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      bio,
      address,
      contact_number,
      profile_picture: profilePhoto,
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user.', error });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET);

    res.status(200).json({ message: 'Login successful!', token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in.', error });
  }
};

// Change Password
const changePassword = async (req, res) => {
  const { userId } = req.user;
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(401).json({ message: 'Incorrect old password.' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password.', error });
  }
};

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile.', error });
  }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
  const { name, bio, contact_number, address } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.contact_number = contact_number || user.contact_number;
    user.address = address || user.address;
   

    await user.save();

    res.status(200).json({ message: 'Profile updated successfully!', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile.', error });
  }
};

// Delete User (Soft Delete)
const deleteUser = async (req, res) => {
  const { userId } = req.user;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await user.delete();

    res.status(200).json({ message: 'User deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user.', error });
  }
};

// Update Profile Picture
const updateProfilePicture = async (req, res) => {
  try {
    if (!req.files || !req.files.profile_picture) {
      return res.status(400).json({ message: 'No profile picture uploaded' });
    }

    const { profile_picture } = req.files;
    const picturePath = `profile-${Date.now()}-${profile_picture.name}`;
    const uploadPath = path.join(__dirname, `../public/${picturePath}`);

    const directoryPath = path.join(__dirname, '../public');
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    await profile_picture.mv(uploadPath);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profile_picture: picturePath },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Profile picture updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update Password by Email
const updatePasswordByEmail = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = {
  registerUser,
  loginUser,
  changePassword,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  updateProfilePicture,
  updatePasswordByEmail,
};
