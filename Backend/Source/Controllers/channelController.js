const { Channel, User, ChannelSubscription } = require('../models');

const getAllChannels = async (req, res) => {
    try {
        const channels = await Channel.findAll({
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'username', 'avatar']
                },
                {
                    model: User,
                    as: 'subscribers',
                    attributes: ['id', 'username', 'avatar'],
                    through: { attributes: [] }
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: channels.length,
            data: channels
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};





const getChannelById = async (req, res) => {
    try {
        const channel = await Channel.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'username', 'avatar']
                },
                {
                    model: User,
                    as: 'subscribers',
                    attributes: ['id', 'username', 'avatar'],
                    through: { attributes: [] }
                }
            ]
        });

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createChannel = async (req, res) => {
    try {
        const { name, description, createdBy } = req.body;

        if (!name || !createdBy) {
            return res.status(400).json({
                success: false,
                message: 'Please provide channel name and creator ID'
            });
        }

        const channelExists = await Channel.findOne({ where: { name } });
        if (channelExists) {
            return res.status(400).json({
                success: false,
                message: 'Channel with this name already exists'
            });
        }

        const channel = await Channel.create({
            name,
            description,
            createdBy
        });

        await ChannelSubscription.create({
            userId: createdBy,
            channelId: channel.id
        });

        const channelWithCreator = await Channel.findByPk(channel.id, {
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'username', 'avatar']
                }
            ]
        });

        res.status(201).json({
            success: true,
            data: channelWithCreator
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const subscribeToChannel = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const channel = await Channel.findByPk(req.params.id);

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        const existingSubscription = await ChannelSubscription.findOne({
            where: {
                userId,
                channelId: req.params.id
            }
        });

        if (existingSubscription) {
            return res.status(400).json({
                success: false,
                message: 'Already subscribed to this channel'
            });
        }

        await ChannelSubscription.create({
            userId,
            channelId: req.params.id
        });

        res.json({
            success: true,
            message: 'Successfully subscribed'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const unsubscribeFromChannel = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const deleted = await ChannelSubscription.destroy({
            where: {
                userId,
                channelId: req.params.id
            }
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        res.json({
            success: true,
            message: 'Successfully unsubscribed'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllChannels,
    getChannelById,
    createChannel,
    subscribeToChannel,
    unsubscribeFromChannel
};