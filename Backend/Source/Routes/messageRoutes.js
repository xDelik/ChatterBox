const express = require('express');
const router = express.Router();
const {
    getMessagesByChannel,
    sendMessage,
    getPrivateMessages
} = require('../Controllers/messageController');
const { protect } = require('../Middleware/authMiddleware');

router.get('/channel/:channelId', protect, getMessagesByChannel);
router.get('/private/:userId1/:userId2', protect, getPrivateMessages);
router.post('/', protect, sendMessage);

module.exports = router;