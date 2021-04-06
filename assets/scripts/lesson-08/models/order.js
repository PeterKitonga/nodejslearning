const Sequelize = require('sequelize');

const sequelize = require('../utils/database');

const Order = sequelize.define('order', 
{
    id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
}, 
{
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Order;