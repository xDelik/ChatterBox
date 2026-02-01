const express = require('express');
const router = express.Router();
const {
    getAllChannels,
    getChannelById,
    createChannel,
    subscribeToChannel,
    unsubscribeFromChannel
} = require('../Controllers/channelController');
const { protect } = require('../Middleware/authMiddleware');

router.get('/', protect, getAllChannels);
router.get('/:id', protect, getChannelById);
router.post('/', protect, createChannel);
router.post('/:id/subscribe', protect, subscribeToChannel);
router.post('/:id/unsubscribe', protect, unsubscribeFromChannel);

module.exports = router;