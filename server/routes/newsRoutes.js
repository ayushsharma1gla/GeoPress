const express = require("express");
const router = express.Router();
const { getNews } = require("../controllers/newsController");

// GET /api/news?keyword=india&limit=12
router.get("/", getNews);

module.exports = router;
