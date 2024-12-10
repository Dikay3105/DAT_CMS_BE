// // File: server/Models/CategoryHighlight.js
// const { DataTypes } = require('sequelize');
// const sequelize = require('../postgresql').sequelize;
// const Post = require('./Post');
// const Category = require('./Category');

// // Định nghĩa mô hình CategoryHighlight
// const CategoryHighlight = sequelize.define('CategoryHighlight', {
//     highlightOrder: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//     },
// });

// CategoryHighlight.belongsTo(Post, {
//     foreignKey: {
//         allowNull: false,
//     },
//     onDelete: 'CASCADE',
// });

// CategoryHighlight.belongsTo(Category, {
//     foreignKey: {
//         allowNull: false,
//     },
//     onDelete: 'CASCADE',
// });

// module.exports = CategoryHighlight;
