const CategoryHighlight = require("../Models/CategoryHighlight");
const Post = require("../Models/Post");
const Category = require("../Models/Category");
const { db } = require('../postgresql'); // Đảm bảo bạn đã kết nối với PostgreSQL

// Cập nhật highlightOrder của bài viết
exports.updateCategoryHighlightOrder = async (req, res) => {
    try {
        const { postId, highlightOrder } = req.body;

        // Gọi function PostgreSQL
        const result = await db.any(
            `SELECT public.update_category_highlight_json($1, $2) AS result`,
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

