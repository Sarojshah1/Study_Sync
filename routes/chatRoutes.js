const express = require('express');
const router = express.Router();
const { createChatMessage, getChatMessagesByContext } = require('../controllers/chatControllers');
const {verifyToken} = require('../middlewares/Authentication');

router.post('/',verifyToken, createChatMessage);

// Get all chat messages by context ID
router.get('/:context_id',verifyToken, getChatMessagesByContext);

module.exports = router;
