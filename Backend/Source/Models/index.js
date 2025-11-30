const User = require('./User');
const Channel = require('./Channel');
const Message = require('./Message');
const ChannelSubscription = require('./ChannelSubscription');

// User <- (ChannelSubscription) -> Channel
User.belongsToMany(Channel, {
    through: ChannelSubscription,
    foreignKey: 'userId',
    as: 'subscribedChannels'
});

Channel.belongsToMany(User, {
    through: ChannelSubscription,
    foreignKey: 'channelId',
    as: 'subscribers'
});

// Channel -> User (creator)
Channel.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator'
});

// Message -> User (author)
Message.belongsTo(User, {
    foreignKey: 'authorId',
    as: 'author'
});

// Message -> Channel
Message.belongsTo(Channel, {
    foreignKey: 'channelId',
    as: 'channel'
});

// Message -> User (receiver dla DM)
Message.belongsTo(User, {
    foreignKey: 'receiverId',
    as: 'receiver'
});

module.exports = {
    User,
    Channel,
    Message,
    ChannelSubscription
};