const mongoose = require("mongoose");

// email, password 로그인  => googleId null
// googleId 로그인         => email null

const userSchema = mongoose.Schema({
  email: { type: String, unique: true },
  password: { type: String, minlength: 4 },
  googleId: { type: String, unique: true, sparse: true },
});

// comparePassword (demo only: plain text)
// NOTE: Replace with bcrypt hashing for production use.
userSchema.methods.comparePassword = function (candidate, callback) {
  try {
    const isMatch = this.password === candidate;
    callback(null, isMatch);
  } catch (err) {
    callback(err);
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;
