const express = require("express");
const auth = require("../middlewares/auth");

const router = express.Router();

// Home page: show auth state
router.get("/", (req, res) => {
  res.render("index", { user: req.user || null });
});

// Success page (requires login)
router.get("/success", auth.checkAuthenticated, (req, res) => {
  if (!req.user) return res.redirect("/login");
  res.render("success", { user: req.user });
});

module.exports = router;

