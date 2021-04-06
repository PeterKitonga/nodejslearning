const Sequelize = require('sequelize');

const sequelize = require('../utils/database');

const Cart = sequelize.define('cart', 
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

module.exports = Cart;