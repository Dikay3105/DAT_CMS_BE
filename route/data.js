const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require('fs');
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
router.get("/categories", async (req, res) => {
    try {
        const result = await data.funcTable('func_getAllCategories', '()');
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, mess: "Internal Server Error", error });
    }
});

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
        return res.status(400).json({ status: false, number: 253, mes: "Format Err" });
    }

    try {
        const result = await data.funcJSON('func_getpostbyid', `('${id}')`);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, mess: "Internal Server Error", error });
    }
});

// Thêm bài viết mới
router.post("/posts", upload.single('image'), async (req, res) => {
    try {
        const { title, content, author, categoryId, highlightOrder } = req.body;

        // Kiểm tra nếu có trường bị thiếu
        if (!title || !content || !author || !categoryId || !req.file) {
            return res.status(400).json({ status: false, number: 253, mes: "Format Err" });
        }

        const url = `uploads/${req.file.filename}`;

        // Thêm bài viết vào cơ sở dữ liệu và nhận ID bài viết mới
        const result = await data.funcJSON('func_addpost', `( '${title}', '${url}', '${content}', '${author}', ${categoryId}, ${highlightOrder || 0})`);

        if (!result || !result.data) {
            return res.status(500).json({ status: false, message: "No response from database" });
        }

        const postId = result.data.id; // Lấy ID bài viết từ kết quả trả về

        // Tạo thư mục với tên là ID của bài viết trong thư mục uploads
        const uploadDir = path.join(__dirname, '..', 'uploads');
        const postDir = path.join(uploadDir, `${postId}`);

        // Kiểm tra xem thư mục với ID bài viết có tồn tại chưa, nếu chưa thì tạo mới
        if (!fs.existsSync(postDir)) {
            fs.mkdirSync(postDir);
        }

        // Di chuyển ảnh vào thư mục mới
        const newFilePath = path.join(postDir, req.file.filename);
        fs.renameSync(path.join(uploadDir, req.file.filename), newFilePath);

        const imageUrl = `uploads/${postId}/${req.file.filename}`;  // Cập nhật đường dẫn tới file mới

        // Cập nhật lại thông tin bài viết với đường dẫn ảnh mới
        const updateResult = await data.funcJSON('func_updatepostimage', `( ${postId}, '${imageUrl}')`);

        res.status(200).json(updateResult);
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ status: false, message: "Server Error", error: error.message });
    }
});

// Cập nhật bài viết
router.put("/posts/:id", upload.single('image'), async (req, res) => {
    const { id } = req.params; // Lấy ID bài viết từ params
    const { title, content, author, categoryId, highlightOrder } = req.body;

    // Kiểm tra nếu thiếu trường
    if (!title || !content || !author || !categoryId) {
        return res.status(400).json({ status: false, number: 253, mes: "Format Err" });
    }

    try {
        // Lấy bài viết hiện tại từ database
        const existingPost = await data.funcJSON('func_getpostbyid', `( ${id} )`);
        if (!existingPost || !existingPost.data) {
            return res.status(404).json({ status: false, message: "Post not found" });
        }

        const oldImage = existingPost.data._image; // Lấy hình cũ từ database
        let imageUrl = oldImage; // Mặc định giữ lại hình cũ

        // Kiểm tra nếu có hình mới được upload
        if (req.file) {
            const newImage = `uploads/${id}/${req.file.filename}`;

            // Nếu hình mới khác hình cũ, xóa hình cũ
            if (newImage !== oldImage) {
                const oldImagePath = path.join(__dirname, '..', oldImage);

                // Xóa hình cũ nếu tồn tại
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath); // Xóa hình cũ
                }

                // Tạo thư mục mới cho bài viết nếu chưa có
                const uploadDir = path.join(__dirname, '..', 'uploads');
                const postDir = path.join(uploadDir, `${id}`);

                if (!fs.existsSync(postDir)) {
                    fs.mkdirSync(postDir, { recursive: true });
                }

                const newFilePath = path.join(postDir, req.file.filename);
                const tempFilePath = path.join(uploadDir, req.file.filename);

                if (fs.existsSync(tempFilePath)) {
                    fs.renameSync(tempFilePath, newFilePath); // Di chuyển file vào thư mục bài viết
                    imageUrl = newImage;
                } else {
                    return res.status(400).json({ status: false, message: "Uploaded file not found" });
                }
            }
        }

        // Cập nhật bài viết trong database
        const result = await data.funcJSON('func_updatepost', `( ${id}, '${title}', '${imageUrl}', '${content}', '${author}', ${categoryId} )`);

        if (!result || result.status !== 200) {
            return res.status(500).json({ status: false, message: "Failed to update post", error: result });
        }

        res.status(200).json(result); // Trả về thông tin bài viết đã được cập nhật
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ status: false, message: "Server Error", error: error.message });
    }
});

router.post("/upload-image/:postID", upload.single('image'), async (req, res) => {
    try {
        const { postID } = req.params; // Lấy postID từ URL
        const { file } = req;

        if (!file) {
            return res.status(400).json({ status: false, message: "No file uploaded" });
        }

        // Tạo thư mục mới cho bài viết nếu chưa có
        const uploadDir = path.join(__dirname, '..', 'uploads');
        const postDir = path.join(uploadDir, `${id}`);

        if (!fs.existsSync(postDir)) {
            fs.mkdirSync(postDir, { recursive: true });
        }

        const newFilePath = path.join(postDir, req.file.filename);
        const tempFilePath = path.join(uploadDir, req.file.filename);

        if (fs.existsSync(tempFilePath)) {
            fs.renameSync(tempFilePath, newFilePath); // Di chuyển file vào thư mục bài viết
            imageUrl = newImage;
        } else {
            return res.status(400).json({ status: false, message: "Uploaded file not found" });
        }

        // Tạo đường dẫn mới cho ảnh sau khi đã tải lên
        const imageUrl = `uploads/${postID}/${file.filename}`;

        res.status(200).json({
            status: true,
            message: "Image uploaded successfully",
            imageUrl: imageUrl, // Đường dẫn ảnh mới
        });
    } catch (error) {
        console.error("Error uploading image:", error.message);
        res.status(500).json({ status: false, message: "Server error", error: error.message });
    }
});

// Category Highlight routes
router.put("/category-highlights", categoryHighlightController.updateCategoryHighlightOrder);

module.exports = router;
