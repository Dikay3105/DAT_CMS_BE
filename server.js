require("dotenv").config({ path: `${process.cwd()}/.env` });
const express = require("express");
const cors = require("cors");
const apiRouter = require("./route/apiRoutes"); // Đảm bảo chỉ import đúng tên file
const { syncDatabase } = require("./postgresql");

const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const PORT = process.env.APP_PORT || 4000;

// Cấu hình danh sách các domain được phép kết nối
const allowedOrigins = [
    "http://localhost:3000",
    "http://192.168.68.49",
    "http://192.168.68.49:3002",
];

// Cấu hình CORS
app.use(
    cors({
        origin: (origin, callback) => {
            if (allowedOrigins.includes(origin) || !origin) {
                callback(null, true);
            } else {
                console.log("Not allowed by CORS");
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

// Middleware xử lý body request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Định tuyến API
app.use("/api", apiRouter);

// Xử lý các route không tồn tại
app.use("*", (req, res) => {
    res.status(404).json({
        status: "Not Found",
        message: "Route not found",
    });
});

// Xử lý lỗi server
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

// Kết nối với cơ sở dữ liệu và khởi động server
syncDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to sync database:", err.message);
        process.exit(1); // Thoát ứng dụng nếu không thể kết nối database
    });
