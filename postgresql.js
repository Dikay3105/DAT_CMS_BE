// // postgresql.js

// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize({
//   dialect: 'postgres',
//   host: process.env.PGHOST,
//   username: process.env.PGUSER,
//   password: process.env.PGPASSWORD,
//   database: process.env.PGDATABASE,
//   port: process.env.PGPORT,
//   logging: false,
// });

// const pgp = require('pg-promise')();

// // Khai báo kết nối đến PostgreSQL
// const client = pgp({
//   host: process.env.PGHOST,       // Địa chỉ host
//   port: process.env.PGPORT,       // Cổng kết nối PostgreSQL (mặc định là 5432)
//   database: process.env.PGDATABASE, // Tên cơ sở dữ liệu
//   user: process.env.PGUSER,         // Tên người dùng
//   password: process.env.PGPASSWORD, // Mật khẩu
//   extendedQuery: true,
//   rowMode: "array",
// });

// // Kiểm tra kết nối và đồng bộ cơ sở dữ liệu
// const syncDatabase = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("PostgreSQL connected");

//     // Đồng bộ cơ sở dữ liệu (force: true để xóa và tạo lại bảng)
//     await sequelize.sync({ force: false });
//     console.log("Database synced successfully");
//   } catch (err) {
//     console.error("Error syncing database:", err.message);
//   }
// };

// function SELECT(select, table, value_db, Callback) {
//   if (value_db != "") {
//     client.query(
//       "SELECT " + select + " FROM " + table + " WHERE " + value_db,
//       function (err, result) {
//         if (err) {
//           console.error("Database query error:", err);
//           return Callback(null, err);
//         }
//         Callback(result, null);
//       }
//     );
//   } else {
//     client.query("SELECT " + select + " FROM " + table, function (err, result) {
//       if (err) {
//         console.error("Database query error:", err);
//         return Callback(null, err);
//       }
//       Callback(result, null);
//     });
//   }
// }

// module.exports = { sequelize, syncDatabase, client, SELECT };


const { Client } = require("pg");
require("dotenv").config();

const client = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  extendedQuery: true,
  rowMode: "array",
})

client.connect()

const connection = async () => {
  try {
    // const res = await client.query('SELECT * FROM accounts')
    // console.log(res.rows)
  } catch (err) {
    console.error("query error", err.stack)
  }
}

function SELECT(select, table, value_db, Callback) {
  if (value_db != "") {
    client.query(
      "SELECT " + select + " FROM " + table + " WHERE " + value_db,
      function (err, result) {
        if (err) {
          console.error("Database query error:", err);
          return Callback(null, err);
        }
        Callback(result, null);
      }
    );
  } else {
    client.query("SELECT " + select + " FROM " + table, function (err, result) {
      if (err) {
        console.error("Database query error:", err);
        return Callback(null, err);
      }
      Callback(result, null);
    });
  }
}

module.exports = { connection, SELECT };