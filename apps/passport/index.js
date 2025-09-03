const express = require("express");
const { default: mongoose } = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const app = express();
const User = require("./models/users.model");
const passport = require("passport");
require("./config/passport");
const authMiddleware = require("./middlewares/auth");

const cookieSession = require("cookie-session");

const cookieEncryptionKey = "supersecretKey";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cookieSession({
    name: "session",
    keys: [cookieEncryptionKey],
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  })
);

// cookie-session lacks regenerate/save used by Passport; shim them.
app.use((req, res, next) => {
  if (req.session && typeof req.session.regenerate !== "function") {
    req.session.regenerate = (cb) => cb && cb();
  }
  if (req.session && typeof req.session.save !== "function") {
    req.session.save = (cb) => cb && cb();
  }
  next();
});

// Initialize Passport (must come after sessions)
app.use(passport.initialize());
app.use(passport.session());

// MongoDB 연결 (환경변수 사용)
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("❌ Missing MONGODB_URI. Set it in apps/passport/.env");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));
app.use("/static", express.static(path.join(__dirname, "public")));

//vies engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//passport
app.listen(3500, () => {
  console.log("Passport server is running on port 3500");
});

// 기본 라우트: 로그인 상태 표시
app.get("/", authMiddleware.checkNotAuthenticated, (req, res) => {
  res.render("index", { user: req.user || null });
});

//login
app.get("/login", authMiddleware.checkNotAuthenticated, (req, res) => {
  res.render("login");
});

//login post
app.post("/login", authMiddleware.checkNotAuthenticated, (req, res, next) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res
      .status(400)
      .render("login", { error: "이메일과 비밀번호를 모두 입력하세요." });
  }
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Auth error:", err);
      return res.status(500).render("login", {
        error:
          err && err.message
            ? err.message
            : "서버 오류로 로그인에 실패했습니다.",
      });
    }
    if (!user) {
      const message =
        (info && info.message) || "이메일 또는 비밀번호가 올바르지 않습니다.";
      return res.status(401).render("login", { error: message });
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error("Login error:", err);
        return res
          .status(500)
          .render("login", { error: "세션 생성 중 오류가 발생했습니다." });
      }
      return res.redirect("/success");
    });
  })(req, res, next);
});

//signup
app.get("/signup", authMiddleware.checkNotAuthenticated, (req, res) => {
  res.render("signup");
});

//signup post
app.post("/signup", authMiddleware.checkNotAuthenticated, async (req, res) => {
  //user 객체를 생성
  const user = new User(req.body);
  try {
    await user.save();
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    const message =
      err && err.code === 11000
        ? "이미 등록된 이메일입니다."
        : "회원가입 중 오류가 발생했습니다.";
    res.status(400).render("signup", { error: message });
  }
});

//logout
app.get("/logout", authMiddleware.checkAuthenticated, (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    // cookie-session 사용 시 세션 쿠키 제거
    req.session = null;
    res.redirect("/");
  });
});

// success page (after login)
app.get("/success", authMiddleware.checkAuthenticated, (req, res) => {
  if (!req.user) return res.redirect("/login");
  res.render("success", { user: req.user });
});
