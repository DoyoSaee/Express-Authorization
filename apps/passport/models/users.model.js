const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// email, password 로그인  => googleId null
// googleId 로그인         => email null

const userSchema = mongoose.Schema({
  email: { type: String, unique: true },
  password: { type: String, minlength: 4 },
  name: { type: String }, // display name / nickname from providers
  googleId: { type: String, unique: true, sparse: true },
  kakaoId: { type: String, unique: true, sparse: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
});

//비밀번호 비교
userSchema.methods.comparePassword = function (candidate, callback) {
  bcrypt.compare(candidate, this.password, callback);
};

//비밀번호 암호화
userSchema.pre("save", function (next) {
  let user = this;
  if (user.isModified("password")) {
    bcrypt.hash(user.password, 10, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  } else {
    // Ensure next() is called when password isn't modified
    next();
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
