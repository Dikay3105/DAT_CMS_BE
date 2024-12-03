// File: server/Models/Post.js
const { DataTypes } = require('sequelize');
const sequelize = require('../postgresql').sequelize;
const Category = require('./Category');

// Định nghĩa mô hình Post
const Post = sequelize.define('Post', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    highlightOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true,
    },
});

// Quan hệ: một bài viết thuộc về một category
Post.belongsTo(Category, {
    foreignKey: {
        allowNull: false,
    },
    onDelete: 'CASCADE',
});

module.exports = Post;
