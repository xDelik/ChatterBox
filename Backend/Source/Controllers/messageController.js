const { Message, User, Channel } = require('../Models');
const { Op } = require('sequelize');

const buildContentFilter = (query = '', matchType = 'substring') => {
    const sanitized = query.trim();
    if (!sanitized) return null;

    switch (matchType) {
        case 'prefix':
            return { [Op.iLike]: `${sanitized}%` };
        case 'suffix':
            return { [Op.iLike]: `%${sanitized}` };
        case 'exact':
            return { [Op.iLike]: sanitized };
        case 'substring':
        default:
            return { [Op.iLike]: `%${sanitized}%` };
    }
};

const fetchMessagesByChannel = async ({
    channelId,
    limit = 15,
    offset = 0,
    authorUsername,
    contentQuery,
    matchType = 'substring'
}) => {
    const safeLimit = Math.min(parseInt(limit, 10) || 15, 100);
    const safeOffset = parseInt(offset, 10) || 0;

    const where = { channelId };
    const include = [
        {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'avatar'],
            required: Boolean(authorUsername),
            ...(authorUsername
                ? { where: { username: { [Op.iLike]: authorUsername.trim() } } }
                : {})
        }
    ];

    const contentFilter = buildContentFilter(contentQuery, matchType);
    if (contentFilter) {
        where.content = contentFilter;
    }

    const { rows: messages, count } = await Message.findAndCountAll({
        where,
        include,
        order: [['createdAt', 'DESC']],
        limit: safeLimit,
        offset: safeOffset,
        distinct: true
    });

    return { messages, count, limit: safeLimit, offset: safeOffset };
};

const getMessagesByChannel = async (req, res) => {
    try {
        const { authorUsername, contentQuery, matchType = 'substring' } = req.query;
        const { messages, count, limit, offset } = await fetchMessagesByChannel({
            channelId: req.params.channelId,
            limit: req.query.limit,
            offset: req.query.offset,
            authorUsername,
            contentQuery,
            matchType
        });

        res.json({
            success: true,
            count: messages.length,
            total: count,
            hasMore: offset + messages.length < count,
            data: messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createMessageWithAuthor = async ({ content, authorId, channelId, receiverId }) => {
    const message = await Message.create({
        content,
        authorId,
        channelId: channelId || null,
        receiverId: receiverId || null
    });

    return Message.findByPk(message.id, {
        include: [
            {
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'avatar']
            }
        ]
    });
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

        const messageWithAuthor = await createMessageWithAuthor({
            content,
            authorId,
            channelId,
            receiverId
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
    getPrivateMessages,
    createMessageWithAuthor,
    fetchMessagesByChannel,
    buildContentFilter
};
