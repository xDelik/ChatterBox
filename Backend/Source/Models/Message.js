const { DataTypes } = require('sequelize');
const { sequelize } = require('../Config/db');

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: [1, 2000]
        }
    },
    authorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    channelId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'channels',
            key: 'id'
        }
    },
    receiverId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'messages',
    timestamps: true,
    validate: {
        eitherChannelOrReceiver() {
            if (!this.channelId && !this.receiverId) {
                throw new Error('Message must have either channelId or receiverId');
            }
            if (this.channelId && this.receiverId) {
                throw new Error('Message cannot have both channelId and receiverId');
            }
        }
    }
});

module.exports = Message;