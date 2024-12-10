const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const categoryController = require("../controller/categoryController");
const postController = require("../controller/postController");
const categoryHighlightController = require("../controller/categoryHighlightController");
const data = require("./dataProcess");

// Cấu hình multer để lưu trữ ảnh
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Đường dẫn nơi ảnh sẽ được lưu trữ
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        // Tạo tên file từ thời gian hiện tại và tên file gốc
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

// Tạo middleware multer
const upload = multer({ storage: storage });

// Category routes
// router.get("/categories", categoryController.getAllCategories);
// router.get("/categories/:id", categoryController.getCategoryById);
// router.post("/categories", categoryController.createCategory);
// router.put("/categories/:id", categoryController.updateCategory);
// router.delete("/categories/:id", categoryController.deleteCategory);
router.get("/categories", async (req, res) => {
    try {
        const result = await data.funcTable('func_getAllCategories', '()');
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, mess: "Internal Server Error", error });
    }
});



//------------------------------------------------------------------


// Post routes
router.get("/posts", async (req, res) => {
    try {
        const result = await data.funcTable('func_getAllPosts', '()');
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, mess: "Internal Server Error", error });
    }
});

router.get("/posts/:id", async (req, res) => {
    const { id } = req.params;
    if (!id) {
        res.status(200).json({ status: false, number: 253, mes: "Format Err" });
    }

    const result = await data.funcJSON('func_getpostbyid', `('${id}')`);
    res.status(200).json(result);
});
// , upload.single('image')
router.post("/posts", async (req, res) => {
    const { title, content, author, image, categoryId, highlightOrder } = req.body;

    // Kiểm tra nếu có trường bị thiếu
    if (!title || !content || !author || !categoryId || !req.file) {
        return res.status(400).json({ status: false, number: 253, mes: title });
    }

    const url = `uploads/${req.file.filename}`;

    // Tạo truy vấn và gọi hàm func_addPost
    const result = await data.funcJSON('func_addPost', `( '${title}', '${url}', '${content}', '${author}', ${categoryId}, ${highlightOrder || 0})`);
    res.status(200).json(result);
});



// router.post("/posts", upload.single('image'), postController.createPost);




// router.get("/posts/:id", postController.getPostById);

// router.post("/posts/highlight", postController.updatePostHighlightOrder);
// router.put("/posts/:id", upload.single('image'), postController.updatePost);
// router.delete("/posts/:id", postController.deletePost);
// router.get("/posts/highlight-posts/:category_id", postController.getHighlightCategoryPosts);
// router.get("/posts/category/:category_id", postController.getPostsByCategory);
//------------------------------------------------------------------

// Category Highlight routes
router.put("/category-highlights", categoryHighlightController.updateCategoryHighlightOrder);
//------------------------------------------------------------------


module.exports = router;
