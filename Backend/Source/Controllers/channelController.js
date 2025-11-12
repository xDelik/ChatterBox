const { channels, getNextChannelId } = require('../Data/mockData');

const getAllChannels = (req, res) => {
    res.json({
        success: true,
        data: channels
    });
};

const getChannelById = (req, res) => {
    const channelId = parseInt(req.params.id);
    const channel = channels.find(ch => ch.id === channelId);

    if (!channel) {
        return res.status(404).json({
            success: false,
            message: 'Channel not found'
        });
    }

    res.json({
        success: true,
        data: channel
    });
};

const createChannel = (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: 'Channel name is required'
        });
    }

    const newChannel = {
        id: getNextChannelId(),
        name,
        description: description || '',
        createdAt: new Date()
    };

    channels.push(newChannel);

    res.status(201).json({
        success: true,
        data: newChannel
    });
};

module.exports = {
    getAllChannels,
    getChannelById,
    createChannel
};