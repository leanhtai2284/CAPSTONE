import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import recipeRoutes from "./routes/recipe.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`✅ Backend running at http://localhost:${PORT}`)
  );
});
