const express = require('express');
const router = express.Router();
const {
  createStudyGroup,
  sendJoinRequest,
  acceptJoinRequest,
  updateStudyGroup,
  getUserGroups,
  getAllGroups,  
  getMembers,
  getJoinRequests
} = require('../controllers/studygroupcontrollers');

const { verifyToken } = require('../middlewares/Authentication');

// Routes
router.post('/creategroups', verifyToken, createStudyGroup);
router.post('/groups/:groupId/join', verifyToken, sendJoinRequest); 
router.post('/groups/:groupId/accept/:userId', verifyToken, acceptJoinRequest); 
router.put('/groups/:groupId', verifyToken, updateStudyGroup); 
router.get('/groups/user', verifyToken, getUserGroups); 
router.get('/groups',  getAllGroups); 

router.get('/groups/:groupId/members', verifyToken, getMembers); 
router.get('/groups/:groupId/join-requests', verifyToken, getJoinRequests); 

module.exports = router;
