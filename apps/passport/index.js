const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Simple in-memory user for demo
const DEMO_USER = { id: 1, username: "test", password: "secret", name: "Test User" };

passport.use(
  new LocalStrategy(
    { usernameField: "username", passwordField: "password" },
    (username, password, done) => {
      // Replace this with real user lookup and password check
      if (username === DEMO_USER.username && password === DEMO_USER.password) {
        return done(null, { id: DEMO_USER.id, username: DEMO_USER.username, name: DEMO_USER.name });
      }
      return done(null, false, { message: "Invalid credentials" });
    }
  )
);

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Login route using passport-local (no sessions)
app.post(
  "/login",
  passport.authenticate("local", { session: false }),
  (req, res) => {
    // If we are here, authentication succeeded
    res.json({ message: "Logged in", user: req.user });
  }
);

// Example protected route using the same local strategy inline (for demo only)
// In real apps, you'd use sessions or issue JWTs after login.
app.post(
  "/protected",
  passport.authenticate("local", { session: false }),
  (req, res) => {
    res.json({ message: "Access granted", user: req.user });
  }
);

app.listen(5000, () => {
  console.log("Passport server is running on port 5000");
});

