const { DataTypes } = require('sequelize');
const { sequelize } = require('../Config/db');

const ChannelSubscription = sequelize.define('ChannelSubscription', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    channelId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'channels',
            key: 'id'
        }
    }
}, {
    tableName: 'channelSubscriptions',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'channelId']
        }
    ]
});

module.exports = ChannelSubscription;