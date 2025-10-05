import express from "express";
import passport from "passport";
import { login } from "../controllers/authController.js";
import { generateToken } from "../controllers/authController.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", login);

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

export default router;
