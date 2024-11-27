const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/middleware");

// Home route
router.get("/", isLoggedIn, (req, res) => {
  res.render("index");
});

module.exports = router;
