// postgresql.js

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.PGHOST,
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
  logging: false,
});

const pgp = require('pg-promise')();

// Khai báo kết nối đến PostgreSQL
const db = pgp({
  host: process.env.PGHOST,       // Địa chỉ host
  port: process.env.PGPORT,       // Cổng kết nối PostgreSQL (mặc định là 5432)
  database: process.env.PGDATABASE, // Tên cơ sở dữ liệu
  user: process.env.PGUSER,         // Tên người dùng
  password: process.env.PGPASSWORD, // Mật khẩu
});

// Kiểm tra kết nối và đồng bộ cơ sở dữ liệu
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected");

    // Đồng bộ cơ sở dữ liệu (force: true để xóa và tạo lại bảng)
    await sequelize.sync({ force: false });
    console.log("Database synced successfully");
  } catch (err) {
    console.error("Error syncing database:", err.message);
  }
};

module.exports = { sequelize, syncDatabase, db };
