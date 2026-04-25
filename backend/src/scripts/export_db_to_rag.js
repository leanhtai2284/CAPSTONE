import mongoose from "mongoose";
import path from "path";
import dotenv from "dotenv";

// Lên cấp để trỏ đúng vào thư mục backend
const envPath = path.resolve(process.cwd(), ".env");
dotenv.config({ path: envPath });

import { syncDbToRag } from "../services/ragSyncService.js";

async function exportRecipesToRag() {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ Thiếu MONGO_URI trong file .env");
      process.exit(1);
    }

    console.log("⏳ Đang kết nối MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Kết nối thành công!");

    // Gọi hàm dùng chung
    await syncDbToRag();

    await mongoose.disconnect();
    console.log("👋 Đã ngắt kết nối DB.");
  } catch (error) {
    console.error("❌ Lỗi khi export:", error);
    process.exit(1);
  }
}

exportRecipesToRag();
