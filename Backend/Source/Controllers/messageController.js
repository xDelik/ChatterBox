const { Message, User, Channel } = require('../Models');
const { Op } = require('sequelize');

const getMessagesByChannel = async (req, res) => {
    try {
        const messages = await Message.findAll({
            where: { channelId: req.params.channelId },
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'username', 'avatar']
                }
            ],
            order: [['createdAt', 'ASC']]
        });

        res.json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { content, authorId, channelId, receiverId } = req.body;

        if (!content || !authorId) {
            return res.status(400).json({
                success: false,
                message: 'Content and author ID are required'
            });
        }

        if (!channelId && !receiverId) {
            return res.status(400).json({
                success: false,
                message: 'Either channelId or receiverId is required'
            });
        }

        const message = await Message.create({
            content,
            authorId,
            channelId: channelId || null,
            receiverId: receiverId || null
        });

        const messageWithAuthor = await Message.findByPk(message.id, {
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'username', 'avatar']
                }
            ]
        });

        res.status(201).json({
            success: true,
            data: messageWithAuthor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getPrivateMessages = async (req, res) => {
    try {
        const { userId1, userId2 } = req.params;





        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { authorId: userId1, receiverId: userId2 },
                    { authorId: userId2, receiverId: userId1 }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'username', 'avatar']
                },
                {
                    model: User,
                    as: 'receiver',
                    attributes: ['id', 'username', 'avatar']
                }
            ],
            order: [['createdAt', 'ASC']]
        });

        res.json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getMessagesByChannel,
    sendMessage,
    getPrivateMessages
};