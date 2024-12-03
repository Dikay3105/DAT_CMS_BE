// File: server/Models/Category.js
const { DataTypes } = require('sequelize');
const sequelize = require('../postgresql').sequelize;

const Category = sequelize.define('Category', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

module.exports = Category;
