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
router.post("/posts", postController.createPost);
router.put("/posts/:id", postController.updatePost);
router.delete("/posts/:id", postController.deletePost);

// CategoryHighlight routes
router.get("/category-highlights", categoryHighlightController.getAllCategoryHighlights);
router.get("/category-highlights/:id", categoryHighlightController.getCategoryHighlightById);
router.post("/category-highlights", categoryHighlightController.createCategoryHighlight);
router.put("/category-highlights/:id", categoryHighlightController.updateCategoryHighlight);
router.delete("/category-highlights/:id", categoryHighlightController.deleteCategoryHighlight);

module.exports = router;
