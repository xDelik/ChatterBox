const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Channel = sequelize.define('Channel', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            len: [2, 50]
        }
    },
    description: {
        type: DataTypes.STRING(200),
        defaultValue: ''
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'channels',
    timestamps: true
});

module.exports = Channel;