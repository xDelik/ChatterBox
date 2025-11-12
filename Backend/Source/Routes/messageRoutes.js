const express = require('express');
const router = express.Router();
const {
    getMessagesByChannel,
    sendMessage
} = require('../controllers/messageController');

router.get('/:channelId', getMessagesByChannel);

router.post('/', sendMessage);

module.exports = router;