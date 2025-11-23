import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load env vars first
dotenv.config();

import connectDB from "./config/db.js";
import passport from "./config/passport.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import recipeRoutes from "./routes/recipe.js";
import adminRoutes from "./routes/admin.js";
import nutritionRoutes from "./routes/nutrition.js";
import reportsRoutes from "./routes/reports.js";
import menuRoutes from "./routes/menu.js";
const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(passport.initialize());

// Debug middleware
app.use((req, res, next) => {
  console.log(`Main app accessed: ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/menus", menuRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(` Backend running at http://localhost:${PORT}`)
  );
});
