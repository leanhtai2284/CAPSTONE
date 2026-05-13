import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const createStoreOwner = async () => {
  try {
    await connectDB();

    const email = process.env.STORE_OWNER_EMAIL || "store.owner@example.com";
    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`Store owner already exists: ${email}`);
      process.exit(0);
    }

    const owner = await User.create({
      name: "Store Owner",
      email,
      password: process.env.STORE_OWNER_PASSWORD || "StoreOwner123!",
      role: "store_owner",
    });

    console.log("Store owner created:", owner.email);
    process.exit(0);
  } catch (err) {
    console.error("Error creating store owner:", err);
    process.exit(1);
  }
};

createStoreOwner();
