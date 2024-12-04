const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const categoryController = require("../controller/categoryController");
const postController = require("../controller/postController");
const categoryHighlightController = require("../controller/categoryHighlightController");

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
router.get("/categories", categoryController.getAllCategories);
router.get("/categories/:id", categoryController.getCategoryById);
router.post("/categories", categoryController.createCategory);
router.put("/categories/:id", categoryController.updateCategory);
router.delete("/categories/:id", categoryController.deleteCategory);

// Post routes
router.get("/posts", postController.getAllPosts);
router.get("/posts/:id", postController.getPostById);
router.post("/posts", upload.single('image'), postController.createPost);
router.post("/posts/highlight", postController.updatePostHighlightOrder);
router.put("/posts/:id", upload.single('image'), postController.updatePost);
router.delete("/posts/:id", postController.deletePost);
router.get("/posts/highlight-posts/:category_id", postController.getHighlightCategoryPosts);
router.get("/posts/category/:category_id", postController.getPostsByCategory);

// Category Highlight routes
router.put("/category-highlights", categoryHighlightController.updateCategoryHighlightOrder);


module.exports = router;
