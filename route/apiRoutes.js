const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categoryController");
const postController = require("../controller/postController");
const categoryHighlightController = require("../controller/categoryHighlightController");

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
