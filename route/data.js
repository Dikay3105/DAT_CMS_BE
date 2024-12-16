const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require('fs');
const path = require("path");
const data = require("./dataProcess");
const mime = require('mime-types');


// Thiết lập multer để upload file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Lấy phần mở rộng từ MIME type của tệp (ví dụ image/jpeg -> .jpg)
        const extname = mime.extension(file.mimetype);  // Lấy phần mở rộng từ MIME type
        cb(null, Date.now() + '.' + extname);  // Đặt tên tệp với thời gian và phần mở rộng
    }
});

const upload = multer({ storage: storage });

// Category routes
router.get("/categories", async (req, res) => {
    try {
        const result = await data.funcTable('func_getAllCategories', '()');
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(222).json({ status: false, mess: "Internal Server Error", error });
    }
});
//...............................

// Post routes
router.get("/posts", async (req, res) => {
    try {
        const result = await data.funcTable('func_getAllPosts', '()');
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(222).json({ status: false, mess: "Internal Server Error", error });
    }
});

router.get("/posts/:categoryId/latest-posts", async (req, res) => {
    const { categoryId } = req.params;
    const { excludePostId } = req.query;

    try {
        // Kiểm tra xem categoryId có hợp lệ không
        if (!categoryId) {
            return res.status(253).json({ status: false, number: 253, mes: "Format Err" });
        }

        // Gọi hàm Postgres với tham số categoryId và excludePostId
        const result = await data.funcTable(
            "func_get_latest_posts_by_category",
            `(${categoryId}, ${excludePostId || "NULL"})`
        );

        // Trả về kết quả nếu thành công
        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching latest posts by category:", error);

        // Xử lý lỗi và trả về thông báo lỗi
        res.status(222).json({
            status: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});

// Thêm bài viết mới
router.post("/posts", upload.single('image'), async (req, res) => {
    try {
        const { title, content, author, categoryId, highlightOrder } = req.body;
        console.log(author)

        // Kiểm tra nếu có trường bị thiếu
        if (!title || !content || !author || !categoryId || !req.file) {
            return res.status(253).json({ status: false, number: 253, mes: "Format Err" });
        }

        const url = `uploads/${req.file.filename}`;

        // Thêm bài viết vào cơ sở dữ liệu và nhận ID bài viết mới
        const result = await data.funcJSON('func_addpost', `( '${title}', '${url}', '${content}', '${author}', ${categoryId}, ${highlightOrder || null})`);

        if (!result || !result.data) {
            return res.status(500).json({ status: false, message: "No response from database" });
        }

        const postId = result.data._id; // Lấy ID bài viết từ kết quả trả về

        // Tạo thư mục với tên là ID của bài viết trong thư mục uploads
        const uploadDir = path.join(__dirname, '..', 'uploads');
        const postDir = path.join(uploadDir, `${postId}`);

        // Kiểm tra xem thư mục với ID bài viết có tồn tại ko
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
        res.status(222).json({ status: false, message: "Server Error", error: error.message });
    }
});

// Cập nhật bài viết
router.put("/posts/:id", upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { title, content, author, categoryId, highlightOrder } = req.body;

    // Kiểm tra nếu thiếu trường
    if (!title || !content || !author || !categoryId) {
        return res.status(253).json({ status: false, number: 253, mes: "Format Err" });
    }

    try {
        const existingPost = await data.funcJSON('func_getpostbyid', `( ${id} )`);
        if (!existingPost || !existingPost.data) {
            return res.status(252).json({ status: false, message: "Post not found" });
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
                    return res.status(251).json({ status: false, message: "Uploaded file not found" });
                }
            }
        }

        // Cập nhật bài viết trong database

        const result = await data.funcJSON('func_updatepost', `( ${id}, '${title}', '${imageUrl}', '${content}', '${author}', ${categoryId} )`);

        if (!result || result.status !== 200) {
            return res.status(250).json(result);
        }

        res.status(200).json(result); // Trả về thông tin bài viết đã được cập nhật
    } catch (error) {
        console.error("Error:", error.message);
        res.status(222).json({ status: false, message: "Server Error", error: error.message });
    }
});

router.delete("/posts/:postId", async (req, res) => {
    const { postId } = req.params;

    try {
        // Gọi function func_delete_post_json trong database
        const result = await data.funcJSON('func_delete_post_json', `(${postId})`);

        // Kiểm tra status trả về từ function
        if (result.status === 256) {
            return res.status(254).json(result); // Trả về nếu không tìm thấy
        }

        // Đường dẫn tới folder chứa hình ảnh của postID
        const postDir = path.join(__dirname, '..', 'uploads', postId);

        // Kiểm tra xem folder có tồn tại không
        if (!fs.existsSync(postDir)) {
            return res.status(253).json({
                status: false,
                message: `Folder for postID ${postId} not found`,
            });
        }

        try {
            // Xóa folder và tất cả nội dung bên trong
            fs.rmSync(postDir, { recursive: true, force: true });
        } catch (error) {
            console.error("Error deleting folder:", error.message);
            return res.status(222).json({ status: false, message: "Server error", error: error.message });
        }

        // Trả về kết quả thành công
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(222).json({
            status: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});


router.get("/postsAdmin", async (req, res) => {
    try {
        const result = await data.funcTable('func_getallpostsadmin', '()');
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(222).json({ status: false, mess: "Internal Server Error", error });
    }
});

router.get("/posts/:id", async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(253).json({ status: false, number: 253, mes: "Format Err" });
    }

    try {
        const result = await data.funcJSON('func_getpostbyid', `('${id}')`);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(222).json({ status: false, mess: "Internal Server Error", error });
    }
});



router.post("/upload-image/:postID", upload.single("image"), async (req, res) => {
    try {
        const { postID } = req.params;
        const { file } = req;

        if (!file) {
            return res.status(253).json({ status: false, message: "No file uploaded" });
        }

        const postDir = path.join(__dirname, '..', 'uploads', postID);
        if (!fs.existsSync(postDir)) {
            fs.mkdirSync(postDir, { recursive: true });
        }

        const newFilePath = path.join(postDir, file.filename);
        fs.renameSync(file.path, newFilePath);

        const imageUrl = `uploads/${postID}/${file.filename}`;
        res.status(200).json({
            status: true,
            message: "Image uploaded successfully",
            imageUrl: imageUrl,
        });
    } catch (error) {
        console.error("Error uploading image:", error.message);
        res.status(222).json({ status: false, message: "Server error", error: error.message });
    }
});

router.delete("/delete-images/:postID", async (req, res) => {
    try {
        const { postID } = req.params;

        // Đường dẫn tới folder chứa hình ảnh của postID
        const postDir = path.join(__dirname, '..', 'uploads', postID);

        // Kiểm tra xem folder có tồn tại không
        if (!fs.existsSync(postDir)) {
            return res.status(232).json({
                status: false,
                message: `Folder for postID ${postID} not found`,
            });
        }

        // Đọc danh sách file trong folder
        const files = fs.readdirSync(postDir);

        // Xóa từng file trong folder
        files.forEach((file) => {
            const filePath = path.join(postDir, file);
            fs.unlinkSync(filePath); // Xóa file
        });

        // Sau khi xóa file, có thể xóa folder nếu cần
        // fs.rmdirSync(postDir);

        res.status(200).json({
            status: true,
            message: `All images for postID ${postID} have been deleted`,
        });
    } catch (error) {
        console.error("Error deleting images:", error.message);
        res.status(222).json({ status: false, message: "Server error", error: error.message });
    }
});

router.delete("/delete-images-folder/:postID", async (req, res) => {
    try {
        const { postID } = req.params;

        // Đường dẫn tới folder chứa hình ảnh của postID
        const postDir = path.join(__dirname, '..', 'uploads', postID);

        // Kiểm tra xem folder có tồn tại không
        if (!fs.existsSync(postDir)) {
            return res.status(232).json({
                status: false,
                message: `Folder for postID ${postID} not found`,
            });
        }
        fs.rmdirSync(postDir);

        res.status(200).json({
            status: true,
            message: `Folder postID ${postID} have been deleted`,
        });
    } catch (error) {
        console.error("Error deleting folder:", error.message);
        res.status(222).json({ status: false, message: "Server error", error: error.message });
    }
});

router.put("/highlightPost", async (req, res) => {
    console.log("Request body:", req.body);
    const { postId, highlightOrder } = req.body;

    // Kiểm tra nếu thiếu trường
    if (!postId || highlightOrder === undefined || highlightOrder === null) {
        return res.status(253).json({ status: false, number: 253, mes: "Format Err" });
    }

    try {
        const result = await data.funcJSON('func_update_post_highlight_json', `( ${postId}, ${highlightOrder} )`);

        if (!result) {
            return res.status(221).json({ status: false, message: "Database did not return a response." });
        }

        // Xử lý phản hồi từ hàm PostgreSQL
        const { status, message, data: responseData } = result;

        // Nếu phản hồi không thành công
        if (!status) {
            return res.status(400).json({ status: false, message });
        }

        // Thành công
        res.status(200).json(result);

    } catch (error) {
        console.error("Error:", error.message);
        res.status(222).json({ status: false, message: "Server Error", error: error.message });
    }
});

router.put("/highlightCategory", async (req, res) => {
    const { postId, highlightOrder } = req.body;

    // Kiểm tra nếu thiếu trường
    if (!postId || highlightOrder === undefined) {
        return res.status(400).json({ status: false, number: 253, mes: "Format Err" });
    }

    try {
        // Gọi hàm PostgreSQL
        const result = await data.funcJSON('func_update_category_highlight_json', `( ${postId}, ${highlightOrder} )`);

        if (!result) {
            return res.status(221).json({ status: false, message: "Database did not return a response." });
        }

        // Xử lý phản hồi từ hàm PostgreSQL
        const { status, message, data: responseData } = result;

        // Nếu phản hồi không thành công
        if (status !== 200) {
            return res.status(400).json({ status: false, message });
        }

        // Thành công
        res.status(200).json(result);

    } catch (error) {
        console.error("Error:", error.message);
        res.status(222).json({ status: false, message: "Server Error", error: error.message });
    }
});


module.exports = router;
