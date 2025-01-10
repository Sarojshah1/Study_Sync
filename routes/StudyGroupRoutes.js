const express = require('express');
const router = express.Router();
const {
  createStudyGroup,
  sendJoinRequest,
  acceptJoinRequest,
  updateStudyGroup,
  getUserGroups,
  getAllGroups,  
} = require('../controllers/studygroupcontrollers');

const { verifyToken } = require('../middlewares/Authentication');

// Routes
router.post('/groups', verifyToken, createStudyGroup); 
router.post('/groups/:groupId/join', verifyToken, sendJoinRequest); 
router.post('/groups/:groupId/accept/:userId', verifyToken, acceptJoinRequest); 
router.put('/groups/:groupId', verifyToken, updateStudyGroup); 
router.get('/groups/user', verifyToken, getUserGroups); 
router.get('/groups',  getAllGroups); 

module.exports = router;
