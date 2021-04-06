const Sequelize = require('sequelize');

const sequelize = new Sequelize('nodejs_lessons', 'root', 'kitonga', {
    dialect: 'mysql',
    host: 'localhost',
    timezone: "+03:00",
    logging: false
});

module.exports = sequelize;