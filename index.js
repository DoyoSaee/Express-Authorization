const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});

// login
app.get("/login", (req, res) => {
  res
    .status(405)
    .json({ error: 'Use POST /login with body { "userName": "..." }' });
});
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
  // jwt sign
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
  res.json({ accessToken });
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
