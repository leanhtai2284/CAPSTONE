import express from "express";
import passport from "passport";
import {
  login,
  generateToken,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/authController.js";
import { Register } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

const isGoogleOAuthConfigured =
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET);

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/register
router.post("/register", Register);

// Debug middleware
router.use((req, res, next) => {
  console.log(`Auth Route accessed: ${req.method} ${req.url}`);
  next();
});

// Google OAuth Routes
router.get("/google", (req, res, next) => {
  if (!isGoogleOAuthConfigured) {
    return res.status(503).json({
      success: false,
      message:
        "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
    });
  }

  console.log("Starting Google OAuth...");
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account", // Thêm này để luôn hiện form chọn tài khoản Google
  })(req, res, next);
});

router.get(
  "/google/callback",
  (req, res, next) => {
    if (!isGoogleOAuthConfigured) {
      return res.status(503).json({
        success: false,
        message:
          "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
      });
    }
    return next();
  },
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = generateToken(req.user._id, req.user.role);
    const user = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    };
    const userParam = encodeURIComponent(JSON.stringify(user));
    res.redirect(
      `${process.env.FRONTEND_URL}/login-success?token=${token}&user=${userParam}`
    );
  }
);

// POST /api/auth/logout (Protected route)
router.post("/logout", protect, logout);

// POST /api/auth/forgot-password
router.post("/forgot-password", forgotPassword);

// POST /api/auth/reset-password/:resetToken
router.post("/reset-password/:resetToken", resetPassword);

// POST /api/auth/change-password (Protected route)
router.post("/change-password", protect, changePassword);

export default router;
