const Category = require("../models/Category");
const { db } = require("../postgresql");

// Lấy tất cả categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Lấy một category theo ID
exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Tạo một category mới
exports.createCategory = async (req, res) => {
    const { name, description } = req.body;
    try {
        // Gọi function PostgreSQL với tham số name và description
        const result = await db.any(
            `SELECT public.add_category_json($1, $2) AS result`,
            [name, description]
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
                error: 'Failed to add category'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};


// Cập nhật một category
// Cập nhật category
exports.updateCategory = async (req, res) => {
    const { id } = req.params; // ID của category
    const { name, description } = req.body; // Tên và mô tả

    if (!name || !description) {
        return res.status(400).json({
            status: false,
            message: "Both category_name and category_description must be provided",
        });
    }

    try {
        const result = await db.any(
            `SELECT public.update_category_json($1, $2, $3) AS result`,
            [id, name, description]
        );

        const response = result[0].result;
        res.status(response.status).json(response);
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};



// Xóa một category
exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.one(
            `SELECT public.delete_category_json($1) AS result`,
            [id]
        );

        const resultData = result.result;

        if (resultData.status === 200) {
            res.status(200).json(resultData);
        } else {
            res.status(400).json({
                status: resultData.status,
                error: resultData.error
            });
        }
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

