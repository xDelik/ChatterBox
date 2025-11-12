const { messages, getNextMessageId } = require('../Data/mockData');

const getMessagesByChannel = (req, res) => {
    const channelId = parseInt(req.params.channelId);
    const channelMessages = messages.filter(msg => msg.channelId === channelId);

    res.json({
        success: true,
        data: channelMessages
    });
};

const sendMessage = (req, res) => {
    const { channelId, author, content } = req.body;

    if (!channelId || !author || !content) {
        return res.status(400).json({
            success: false,
            message: 'channelId, author, and content are required'
        });
    }

    const newMessage = {
        id: getNextMessageId(),
        channelId: parseInt(channelId),
        author,
        content,
        createdAt: new Date()
    };

    messages.push(newMessage);

    res.status(201).json({
        success: true,
        data: newMessage
    });
};

module.exports = {
    getMessagesByChannel,
    sendMessage
};