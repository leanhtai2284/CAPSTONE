import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const email = process.env.ADMIN_EMAIL || "admin@example.com";
    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`Admin user already exists: ${email}`);
      process.exit(0);
    }

    const admin = await User.create({
      name: "Administrator",
      email,
      password: process.env.ADMIN_PASSWORD || "Admin123!",
      role: "admin",
    });

    console.log("Admin user created:", admin.email);
    process.exit(0);
  } catch (err) {
    console.error("Error creating admin:", err);
    process.exit(1);
  }
};

createAdmin();
