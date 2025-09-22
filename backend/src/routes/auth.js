import express from "express";
const router = express.Router();

// POST /api/auth/login
router.post("/login", (req, res) => {
  res.json({ message: "Login API working!" });
});

// POST /api/auth/register
router.post("/register", (req, res) => {
  res.json({ message: "Register API working!" });
});

// GET /api/auth/logout
router.get("/logout", (req, res) => {
  res.json({ message: "Logout API working!" });
});

export default router;
