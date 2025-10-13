import express from "express";
import passport from "passport";
import {
  login,
  generateToken,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { Register } from "../controllers/userController.js";

const router = express.Router();

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
  console.log("Starting Google OAuth...");
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account", // Thêm này để luôn hiện form chọn tài khoản Google
  })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.FRONTEND_URL}/login-success?token=${token}`);
  }
);

// POST /api/auth/logout
router.post("/logout", logout);

// POST /api/auth/forgot-password
router.post("/forgot-password", forgotPassword);

// POST /api/auth/reset-password/:resetToken
router.post("/reset-password/:resetToken", resetPassword);

export default router;
