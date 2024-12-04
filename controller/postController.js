const Post = require("../models/Post");
const Category = require("../models/Category");
const { db } = require("../postgresql");

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

        // Gọi function PostgreSQL
        const result = await db.any(
            `SELECT public.add_post_json($1, $2, $3, $4, $5, $6) AS result`,
            [title, image, content, author, categoryId, highlightOrder || null]
        );

        // Xử lý kết quả trả về
        const resultData = result[0].result;

        if (resultData) {
            res.status(201).json({
                status: 200,
                data: resultData
            });
        } else {
            res.status(400).json({
                status: 400,
                error: 'Failed to add post'
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Cập nhật một post
exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, image, content, author, categoryId, highlightOrder } = req.body;

        // Gọi function PostgreSQL
        const result = await db.any(
            `SELECT public.update_post_json($1, $2, $3, $4, $5, $6, $7) AS result`,
            [id, title, image, content, author, highlightOrder || null, categoryId]
        );

        // Xử lý kết quả trả về
        const resultData = result[0].result;

        const response = result[0].result;
        res.status(response.status).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Xóa một post
exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        // Gọi function PostgreSQL
        const result = await db.one(
            `SELECT public.delete_post_json($1) AS result`,
            [id]
        );

        // Xử lý kết quả trả về từ PostgreSQL
        const response = result.result;

        // Kiểm tra trạng thái trả về từ hàm PostgreSQL
        if (response.status === 200) {
            res.status(200).json({
                message: response.message,
                postId: response.postId
            });
        } else {
            res.status(response.status).json({ message: response.message });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePostHighlightOrder = async (req, res) => {
    try {
        const { postId, highlightOrder } = req.body;

        // Gọi function PostgreSQL
        const result = await db.any(
            `SELECT public.update_post_highlight_json($1, $2) AS result`,
            [postId, highlightOrder]
        );

        const resultData = result[0].result;

        if (resultData.status === 200) {
            res.status(200).json({
                status: 200,
                message: resultData.message,
                postId: resultData.postId,
                newHighlightOrder: resultData.newHighlightOrder
            });
        } else {
            res.status(resultData.status).json({
                status: resultData.status,
                message: resultData.message
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getHighlightCategoryPosts = async (req, res) => {
    const { category_id } = req.params;

    try {
        const posts = await db.any(
            `SELECT * FROM public.get_highlight_category_posts($1)`,
            [category_id]
        );

        // Trả về kết quả
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getPostsByCategory = async (req, res) => {
    const { category_id } = req.params;

    try {
        // Gọi hàm PostgreSQL với category_id làm tham số
        const posts = await db.any(
            'SELECT * FROM public.get_posts_by_category($1)',
            [category_id]
        );

        // Trả về kết quả
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};





