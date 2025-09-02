const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/users.model");

//req.login(user)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

//req.user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    done(null, user);
  } catch (err) {
    done(err);
  }
});

//passport
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email }).exec();
        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        const isMatch = await new Promise((resolve, reject) => {
          user.comparePassword(password, (err, ok) => (err ? reject(err) : resolve(ok)));
        });
        if (!isMatch) {
          return done(null, false, { message: "Incorrect email or password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Export the configured passport instance for clarity when imported elsewhere
module.exports = passport;
