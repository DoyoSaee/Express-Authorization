const express = require("express");
const auth = require("../middlewares/auth");
const users = require("../controllers/users.controller");

const router = express.Router();

// Local auth pages
router.get("/login", auth.checkNotAuthenticated, users.renderLogin);
router.post("/login", auth.checkNotAuthenticated, users.login);

router.get("/signup", auth.checkNotAuthenticated, users.renderSignup);
router.post("/signup", auth.checkNotAuthenticated, users.signup);

// Logout
router.post("/logout", users.logoutPost);
router.get("/logout", users.logoutGet);

// Google OAuth
router.get("/auth/google", users.googleAuthStart);
router.get("/auth/google/callback", users.googleCallback);

// Kakao OAuth
router.get("/auth/kakao", users.kakaoAuthStart);
router.get("/auth/kakao/callback", users.kakaoCallback);

module.exports = router;
