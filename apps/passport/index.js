const express = require("express");
const { default: mongoose } = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const app = express();
const passport = require("passport");
require("./config/passport");

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

// Routers
const mainRouter = require("./routes/main.router");
const usersRouter = require("./routes/users.router");

app.use("/", mainRouter);
app.use("/", usersRouter);

// Start server
app.listen(3500, () => {
  console.log("Passport server is running on port 3500");
});
