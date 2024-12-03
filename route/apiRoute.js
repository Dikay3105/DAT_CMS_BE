const router = require("express").Router();
const apiData = require("../controller/apiController");

router.get("/", (req, res) => {
    res.status(200).json({ message: "REST APIs is working" });
});

router.get("/getAllUser", async (req, res) => {
    try {
        const result = await apiData.getAllUserData();
        if (result.status) {
            res.status(200).json(result.data);
        } else {
            res.status(500).json({ message: "Failed to retrieve data" });
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/createUser", async (req, res) => {
    try {
        const { name, balance, email, password } = req.body
        const result = await apiData.createUser({ name, balance, email, password })
        res.status(200).json({ result });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
})

router.post("/deleteUser", async (req, res) => {
    try {
        const { id } = req.body
        const result = await apiData.deleteUser(id)
        res.status(200).json({ result });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
})
router.post("/getDetailUser", async (req, res) => {
    try {
        const { id } = req.body
        const result = await apiData.getDetailUser(id)
        res.status(200).json({ result });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
})
router.post("/updateUser", async (req, res) => {
    try {
        const { id, name, balance, email, password } = req.body
        const result = await apiData.updateUser({ id, name, balance, email, password })
        res.status(200).json({ result });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
})
router.post("/importUserFromExcel", async (req, res) => {
    try {
        const { data } = req.body;
        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ message: "Invalid data format" });
        }
        const result = await apiData.importUserFromExcel(data);
        res.status(200).json({ result });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

module.exports = router;