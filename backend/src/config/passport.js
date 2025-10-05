import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/User.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey:
    process.env.JWT_SECRET || "smartmeal_jwt_secret_key_2025_$#@!%^&*()",
};

// Initialize JWT Strategy
passport.use(
  new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Debug: Log Google credentials availability
console.log("Google OAuth Configuration:", {
  clientID: process.env.GOOGLE_CLIENT_ID ? "Set" : "Not set",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ? "Set" : "Not set",
  callbackURL: "http://localhost:5000/api/auth/google/callback",
});

// Initialize Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Google callback received:", {
        profileId: profile.id,
        email: profile.emails?.[0]?.value,
        displayName: profile.displayName,
      });

      try {
        // Check if user exists
        let user = await User.findOne({ email: profile.emails[0].value });
        console.log("Existing user found:", user ? "Yes" : "No");

        if (user) {
          return done(null, user);
        }

        // Create new user if not exists
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          password: profile.id, // Using profile.id as password for Google users
          googleId: profile.id,
        });
        console.log("New user created:", user._id);

        return done(null, user);
      } catch (error) {
        console.error("Error in Google Strategy:", error);
        return done(error, false);
      }
    }
  )
);

// Required for maintaining sessions
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
