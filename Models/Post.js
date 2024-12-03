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
    // Thêm thuộc tính mới 'isVisible' để xác định bài viết có đang hiển thị không
    isVisible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,  // Mặc định là bài viết hiển thị
        allowNull: false,
    }
});

// Quan hệ: một bài viết thuộc về một category
Post.belongsTo(Category, {
    foreignKey: {
        allowNull: false,
    },
    onDelete: 'CASCADE',
});

module.exports = Post;
