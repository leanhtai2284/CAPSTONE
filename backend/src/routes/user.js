import express from "express";
import { Register } from "../controllers/userController.js";

const router = express.Router();

// GET /api/users/profile
router.get("/profile", (req, res) => {
  res.json({ message: "User profile API working!" });
});

// PUT /api/users/profile
router.put("/profile", (req, res) => {
  res.json({ message: "Update profile API working!" });
});

router.post("/register", Register);

export default router;
