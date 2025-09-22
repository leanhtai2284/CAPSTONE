import express from "express";
const router = express.Router();

// GET /api/recipes
router.get("/", (req, res) => {
  res.json({ message: "Get all recipes API working!" });
});

// POST /api/recipes
router.post("/", (req, res) => {
  res.json({ message: "Create recipe API working!" });
});

// GET /api/recipes/:id
router.get("/:id", (req, res) => {
  res.json({ message: `Get recipe with ID ${req.params.id} API working!` });
});

export default router;
