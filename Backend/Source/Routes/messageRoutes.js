const express = require('express');
const router = express.Router();
const {
    getMessagesByChannel,
    sendMessage,
    getPrivateMessages
} = require('../controllers/messageController');

router.get('/channel/:channelId', getMessagesByChannel);
router.get('/private/:userId1/:userId2', getPrivateMessages);
router.post('/', sendMessage);

module.exports = router;