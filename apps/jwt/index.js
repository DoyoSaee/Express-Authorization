const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, ".env") });
const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
let refreshTokens = [];

// login
app.get("/login", (req, res) => {
  res
    .status(405)
    .json({ error: 'Use POST /login with body { "userName": "..." }' });
});

// login
app.post("/login", (req, res) => {
  const { userName } = req.body || {};
  if (!userName) {
    return res
      .status(400)
      .json({ error: 'Missing "userName" in request body' });
  }
  if (!process.env.ACCESS_TOKEN_SECRET) {
    return res
      .status(500)
      .json({ error: "Server misconfigured: ACCESS_TOKEN_SECRET not set" });
  }
  const user = { name: userName };
  //accessToken 생성
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "30s",
  });
  //refreshToken 생성
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "1d",
  });
  //refreshToken을 메모리에 저장
  refreshTokens.push(refreshToken);
  //refreshToken을 cookie에 저장
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    // secure: true,
    // sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });
  //accessToken 반환
  res.json({ accessToken: accessToken });
});

//refreshToken으로 accessToken 재발급
app.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  //refreshToken이 없으면
  if (!refreshToken) {
    return res.status(401).json({ error: "Missing refresh token" });
  }
  //REFRESH_TOKEN_SECRET이 없으면
  if (!process.env.REFRESH_TOKEN_SECRET) {
    return res
      .status(500)
      .json({ error: "Server misconfigured: REFRESH_TOKEN_SECRET not set" });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = jwt.sign(
      { name: decoded.name },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "30s",
      }
    );
    res.json({ accessToken: accessToken });
  } catch (error) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

//인증 미들웨어
function authMiddleware(req, res, next) {
  //토큰을 request headers 에서 가져오기
  const authHeader = req.headers["authorization"];
  //Bearer 토큰을 가져오기
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

//포스트 샘플
const posts = [
  { userName: "user1", title: "Post 1", content: "Content 1" },
  { userName: "user2", title: "Post 2", content: "Content 2" },
  { userName: "user3", title: "Post 3", content: "Content 3" },
];

//일반조회
app.get("/posts", authMiddleware, (req, res) => {
  res.json(posts);
});
