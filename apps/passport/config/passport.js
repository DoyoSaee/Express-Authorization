const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/users.model");

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackURL =
  process.env.GOOGLE_CALLBACK_URL ||
  "http://localhost:3500/auth/google/callback";

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

// Local username/password strategy
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
          user.comparePassword(password, (err, ok) =>
            err ? reject(err) : resolve(ok)
          );
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

// Google OAuth2 strategy
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: googleCallbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile?.emails && profile.emails[0] && profile.emails[0].value
            ? profile.emails[0].value
            : undefined;

        let user = await User.findOne({
          $or: [{ googleId: profile.id }, ...(email ? [{ email }] : [])],
        }).exec();

        if (!user) {
          // Create a new user; set email only if available to avoid unique issues
          user = new User({ googleId: profile.id });
          if (email) user.email = email;
          await user.save();
        } else if (!user.googleId) {
          // Link existing local account by email
          user.googleId = profile.id;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

module.exports = passport;
