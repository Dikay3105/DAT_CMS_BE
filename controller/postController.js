const Post = require("../models/Post");
const Category = require("../models/Category");

// Lấy tất cả posts
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({
            include: [Category], // Include category thông qua quan hệ
        });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Lấy một post theo ID
exports.getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findByPk(id, {
            include: [Category],
        });
        if (!post) return res.status(404).json({ message: "Post not found" });
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Tạo một post mới
exports.createPost = async (req, res) => {
    try {
        const { title, image, content, author, categoryId, highlightOrder } = req.body;

        // Kiểm tra xem categoryId có tồn tại không
        const category = await Category.findByPk(categoryId);
        if (!category) return res.status(404).json({ message: "Category not found" });

        const newPost = await Post.create({
            title,
            image,
            content,
            author,
            highlightOrder,
            CategoryId: categoryId,
        });

        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Cập nhật một post
exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, image, content, author, categoryId, highlightOrder } = req.body;

        const post = await Post.findByPk(id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Kiểm tra xem categoryId có tồn tại không
        const category = await Category.findByPk(categoryId);
        if (!category) return res.status(404).json({ message: "Category not found" });

        await post.update({
            title,
            image,
            content,
            author,
            highlightOrder,
            CategoryId: categoryId,
        });

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Xóa một post
exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findByPk(id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        await post.destroy();
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
