const express = require('express');
const router = express.Router();
const {
    createProject,
    sendJoinRequest,
    acceptJoinRequest,
    rejectJoinRequest,
    updateProject,
    getUserProjects,
    getAllProjects,
    getProjectById,
    getJoinRequests
} = require('../controllers/projectcontrollers');

const {verifyToken} = require('../middlewares/Authentication');

// Routes
router.post('/projects', verifyToken, createProject); 
router.post('/project/:projectId/join', verifyToken, sendJoinRequest); 
router.post('/project/:projectId/accept/:userId', verifyToken, acceptJoinRequest); 
router.post('/project/:projectId/reject/:userId', verifyToken, rejectJoinRequest); 
router.put('/project/:groupId', verifyToken, updateProject); 
router.get('/userProjects', verifyToken, getUserProjects); 
router.get('/projects', verifyToken, getAllProjects); 
router.get('/projects/:projectId', getProjectById);
router.get('/projects/:Id/join-requests', verifyToken, getJoinRequests); 
module.exports = router;
