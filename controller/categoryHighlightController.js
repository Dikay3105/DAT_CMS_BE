const CategoryHighlight = require("../models/CategoryHighlight");
const Post = require("../models/Post");
const Category = require("../models/Category");

// Lấy tất cả CategoryHighlights
exports.getAllCategoryHighlights = async (req, res) => {
    try {
        const highlights = await CategoryHighlight.findAll({
            include: [Post, Category], // Include post và category thông qua quan hệ
        });
        res.status(200).json(highlights);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Lấy một CategoryHighlight theo ID
exports.getCategoryHighlightById = async (req, res) => {
    try {
        const { id } = req.params;
        const highlight = await CategoryHighlight.findByPk(id, {
            include: [Post, Category],
        });
        if (!highlight) return res.status(404).json({ message: "CategoryHighlight not found" });
        res.status(200).json(highlight);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Tạo một CategoryHighlight mới
exports.createCategoryHighlight = async (req, res) => {
    try {
        const { highlightOrder, postId, categoryId } = req.body;

        // Kiểm tra xem postId và categoryId có tồn tại không
        const post = await Post.findByPk(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const category = await Category.findByPk(categoryId);
        if (!category) return res.status(404).json({ message: "Category not found" });

        const newHighlight = await CategoryHighlight.create({
            highlightOrder,
            PostId: postId,
            CategoryId: categoryId,
        });

        res.status(201).json(newHighlight);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Cập nhật một CategoryHighlight
exports.updateCategoryHighlight = async (req, res) => {
    try {
        const { id } = req.params;
        const { highlightOrder, postId, categoryId } = req.body;

        const highlight = await CategoryHighlight.findByPk(id);
        if (!highlight) return res.status(404).json({ message: "CategoryHighlight not found" });

        // Kiểm tra xem postId và categoryId có tồn tại không
        const post = await Post.findByPk(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const category = await Category.findByPk(categoryId);
        if (!category) return res.status(404).json({ message: "Category not found" });

        await highlight.update({
            highlightOrder,
            PostId: postId,
            CategoryId: categoryId,
        });

        res.status(200).json(highlight);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Xóa một CategoryHighlight
exports.deleteCategoryHighlight = async (req, res) => {
    try {
        const { id } = req.params;
        const highlight = await CategoryHighlight.findByPk(id);
        if (!highlight) return res.status(404).json({ message: "CategoryHighlight not found" });

        await highlight.destroy();
        res.status(200).json({ message: "CategoryHighlight deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
