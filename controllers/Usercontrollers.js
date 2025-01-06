const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel'); // Import User model

// Register User
const registerUser = async (req, res) => {
    console.log('registerUser')
  const { name, email, password} = req.body;
  let profilePhoto=null;
  console.log(req.files)


  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    if(req.files){
        const { profile_picture} = req.files;
        profilePhoto=`photo-${Date.now()}-${profile_picture.name}`;
        const uploadPath = path.join(__dirname, `../public/${profilePhoto}`);
        const directoryPath = path.join(__dirname, '../public');
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
          }
          await profile_picture.mv(uploadPath);
    }else {
        return res.status(400).json({ message: ' Profile Photo is required.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
 

    // Create a new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
     profile_picture:profilePhoto,
      
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
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

  

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET);

    res.status(200).json({ message: 'Login successful!', token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in.', error });
  }
};

// Change Password
const changePassword = async (req, res) => {
  const { userId } = req.user; // Extract user ID from the JWT middleware
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the old password is correct
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(401).json({ message: 'Incorrect old password.' });
    }

    // Hash the new password
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
  const { userId } = req.user;

  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile.', error });
  }
};

const updateUserProfile = async (req, res) => {
  const { userId } = req.user;
  const { fullName, phone } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update fields
    user.fullName = fullName || user.fullName;
    user.phone = phone || user.phone;

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

    // Soft delete (optional: set a flag or delete)
    await user.delete();

    res.status(200).json({ message: 'User deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user.', error });
  }
};

const updateProfilePicture = async (req, res) => {
    try {
      if (!req.files || !req.files.profile_picture) {
        return res.status(400).json({ message: 'No profile picture uploaded' });
      }
  
      console.log(req.files)
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
const updatePasswordByEmail = async (req, res) => {
    try {
      const { email, newPassword } = req.body;
  
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User with this email does not exist' });
      }
  
      // // Hash the new password and update it
      // const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = newPassword;
  
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
  updatePasswordByEmail

};
