const express = require('express');
const router = express.Router();
const {
    getAllChannels,
    getChannelById,
    createChannel,
    subscribeToChannel,
    unsubscribeFromChannel
} = require('../controllers/channelController');

router.get('/', getAllChannels);

router.get('/:id', getChannelById);

router.post('/', createChannel);
router.post('/:id/subscribe', subscribeToChannel);
router.post('/:id/unsubscribe', unsubscribeFromChannel);

module.exports = router;