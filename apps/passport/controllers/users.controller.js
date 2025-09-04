const passport = require("passport");
const User = require("../models/users.model");

// GET /login
async function renderLogin(req, res) {
  res.render("login");
}

// POST /login
async function login(req, res, next) {
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
}

// GET /signup
async function renderSignup(req, res) {
  res.render("signup");
}

// POST /signup
async function signup(req, res) {
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
}

// POST /logout
function logoutPost(req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session = null; // Clear cookie-session explicitly
    res.redirect("/login");
  });
}

// GET /logout (optional)
function logoutGet(req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session = null;
    res.redirect("/login");
  });
}

// GET /auth/google
function googleAuthStart(req, res, next) {
  return passport.authenticate("google", { scope: ["email"] })(req, res, next);
}

// GET /auth/google/callback
function googleCallback(req, res, next) {
  return passport.authenticate("google", { failureRedirect: "/login" })(
    req,
    res,
    function () {
      res.redirect("/");
    }
  );
}

module.exports = {
  renderLogin,
  login,
  renderSignup,
  signup,
  logoutPost,
  logoutGet,
  googleAuthStart,
  googleCallback,
};

