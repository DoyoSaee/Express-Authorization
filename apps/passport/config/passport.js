const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/users.model");
const sendMail = require("../mail/mail");

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackURL =
  process.env.GOOGLE_CALLBACK_URL ||
  "http://localhost:3500/auth/google/callback";

// Kakao uses REST API Key as clientID. Support both env names for convenience.
const kakaoClientId = process.env.KAKAO_CLIENT_ID || process.env.KAKAO_REST_KEY;
const kakaoClientSecret = process.env.KAKAO_CLIENT_SECRET; // optional: if enabled in Kakao console
const kakaoCallbackURL =
  process.env.KAKAO_CALLBACK_URL || "http://localhost:3500/auth/kakao/callback";

const KakaoStrategy = require("passport-kakao").Strategy;

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
        if (user.isDeleted) {
          return done(null, false, { message: "탈퇴한 계정입니다." });
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
          (profile?.emails && profile.emails[0] && profile.emails[0].value
            ? profile.emails[0].value
            : undefined) ||
          (profile && profile._json && profile._json.kakao_account
            ? profile._json.kakao_account.email
            : undefined);
        const nickname =
          (profile && profile.displayName) ||
          (profile && profile.username) ||
          (profile &&
            profile._json &&
            profile._json.kakao_account &&
            profile._json.kakao_account.profile &&
            profile._json.kakao_account.profile.nickname) ||
          undefined;
        const displayName = (profile && profile.displayName) || undefined;

        let user = await User.findOne({
          $or: [{ googleId: profile.id }, ...(email ? [{ email }] : [])],
        }).exec();

        let isNew = false;
        if (user && user.isDeleted) {
          return done(null, false, { message: "탈퇴한 계정입니다." });
        }
        if (!user) {
          // Create a new user; set email only if available to avoid unique issues
          user = new User({ googleId: profile.id });
          if (email) user.email = email;
          if (displayName) user.name = displayName;
          await user.save();
          isNew = true;
        } else if (!user.googleId) {
          // Link existing local account by email
          user.googleId = profile.id;
          if (!user.name && displayName) user.name = displayName;
          await user.save();
        }

        // Send welcome email only for brand-new Google signups
        try {
          if (isNew && email) {
            const name = user.name || displayName || email.split("@")[0];
            sendMail(email, name, "welcome");
          }
        } catch (mailErr) {
          console.error(
            "[mailer] Failed to queue welcome email:",
            mailErr?.message || mailErr
          );
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Kakao OAuth
passport.use(
  "kakao",
  new KakaoStrategy(
    {
      clientID: kakaoClientId,
      callbackURL: kakaoCallbackURL,
      clientSecret: kakaoClientSecret,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          (profile?.emails && profile.emails[0] && profile.emails[0].value
            ? profile.emails[0].value
            : undefined) ||
          (profile && profile._json && profile._json.kakao_account
            ? profile._json.kakao_account.email
            : undefined);

        const nickname =
          (profile && profile.displayName) ||
          (profile && profile.username) ||
          (profile &&
            profile._json &&
            profile._json.kakao_account &&
            profile._json.kakao_account.profile &&
            profile._json.kakao_account.profile.nickname) ||
          undefined;

        let user = await User.findOne({
          $or: [{ kakaoId: profile.id }, ...(email ? [{ email }] : [])],
        }).exec();

        let isNew = false;
        if (user && user.isDeleted) {
          return done(null, false, { message: "탈퇴한 계정입니다." });
        }
        if (!user) {
          // Create a new user; set email only if available to avoid unique issues
          user = new User({ kakaoId: profile.id });
          if (email) user.email = email;
          if (nickname) user.name = nickname;
          await user.save();
          isNew = true;
        } else if (!user.kakaoId) {
          // Link existing local account by email
          user.kakaoId = profile.id;
          if (!user.name && nickname) user.name = nickname;
          await user.save();
        }

        // Send welcome email only for brand-new Kakao signups
        try {
          if (isNew && email) {
            const name = (user && user.name) || nickname || email.split("@")[0];
            sendMail(email, name, "welcome");
          }
        } catch (mailErr) {
          console.error(
            "[mailer] Failed to queue welcome email:",
            mailErr?.message || mailErr
          );
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

module.exports = passport;
