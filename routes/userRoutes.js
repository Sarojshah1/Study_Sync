const express = require('express');
const userController = require('../controllers/Usercontrollers');
const {verifyToken} = require('../middlewares/Authentication');

const router = express.Router();

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Protected routes
router.get('/profile', verifyToken, userController.getUserProfile);
router.put('/profile', verifyToken, userController.updateUserProfile);
router.put('/change-password', verifyToken, userController.changePassword);
router.delete('/delete', verifyToken, userController.deleteUser);
router.put('/update-profile-picture', verifyToken, userController.updateProfilePicture);

router.put('/update-password-by-email', userController.updatePasswordByEmail);
router.put('/reset-password', userController.updatePasswordByToken);

module.exports = router;
