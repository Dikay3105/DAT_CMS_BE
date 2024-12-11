require("dotenv").config({ path: `${process.cwd()}/.env` });
const PORT = process.env.APP_PORT || 4000;
const express = require("express");
const app = express();
const cors = require("cors");
const apiRouter = require("./route/data.js");
const db = require("./postgresql.js");
const bodyParser = require("body-parser");
const path = require('path');

const host = [
    "http://localhost:3000",
    "http://192.168.68.49",
    "http://192.168.68.49:3002",
]

db.connection()
    .then(() => {
        console.log("Postgres connected");
    })
    .catch((err) => {
        console.log("Connection error:", err.message);
    });


app.use(
    cors({
        origin: (origin, callback) => {
            // console.log("Request origin:", origin);
            if (host.indexOf(origin) !== -1 || !origin) {
                callback(null, true);
            } else {
                console.log("Not allowed by CORS");
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
        optionsSuccessStatus: 200,
    })
);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRouter);

app.use("*", (req, res) => {
    res.status(404).json({
        status: "Not Found",
        mess: "Route not found",
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
