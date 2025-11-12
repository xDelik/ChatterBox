const express = require('express');
const router = express.Router();
const {
    getAllChannels,
    getChannelById,
    createChannel
} = require('../controllers/channelController');

router.get('/', getAllChannels);

router.get('/:id', getChannelById);

router.post('/', createChannel);

module.exports = router;