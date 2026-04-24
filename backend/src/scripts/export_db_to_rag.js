import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Lên cấp để trỏ đúng vào thư mục backend
const envPath = path.resolve(process.cwd(), ".env");
dotenv.config({ path: envPath });

import Recipe from "../models/Recipe.js";

const OUTPUT_DIR = path.resolve(process.cwd(), "data/rag/papers");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "db_recipes.md");

async function exportRecipesToRag() {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ Thiếu MONGO_URI trong file .env");
      process.exit(1);
    }

    console.log("⏳ Đang kết nối MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Kết nối thành công!");

    console.log("⏳ Đang lấy dữ liệu từ collection recipes...");
    const recipes = await Recipe.find({}).lean();
    console.log(`✅ Tìm thấy ${recipes.length} công thức.`);

    if (recipes.length === 0) {
      console.log("⚠️ Không có công thức nào để export.");
      process.exit(0);
    }

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    let markdownContent = `# 🥘 Danh Sách Công Thức Nấu Ăn (Cập nhật từ Database)\n\n`;
    markdownContent += `Tài liệu này chứa danh sách các món ăn thực tế đang có trên hệ thống SmartMeal. Bot AI có thể dùng để gợi ý món ăn, nguyên liệu, và cách nấu.\n\n`;

    recipes.forEach((recipe) => {
      markdownContent += `## Món ăn: ${recipe.name_vi}\n`;
      markdownContent += `- **Mã món (ID):** ${recipe.id}\n`;
      markdownContent += `- **Vùng miền:** ${recipe.region || "Không xác định"}\n`;
      markdownContent += `- **Loại món (Category):** ${recipe.category || "N/A"}\n`;
      markdownContent += `- **Thích hợp cho bữa:** ${(recipe.meal_types || []).join(", ") || "N/A"}\n`;
      
      const prep = recipe.prep_time_min || 0;
      const cook = recipe.cook_time_min || 0;
      markdownContent += `- **Thời gian:** Chuẩn bị ${prep} phút, Nấu ${cook} phút. Tổng: ${prep + cook} phút.\n`;
      markdownContent += `- **Độ khó:** ${recipe.difficulty || "N/A"}\n`;
      markdownContent += `- **Khẩu phần:** ${recipe.servings || 1} người ăn.\n`;

      if (recipe.nutrition) {
        markdownContent += `- **Dinh dưỡng (ước tính):** ${recipe.nutrition.calories || 0} calo, ${recipe.nutrition.protein_g || 0}g protein, ${recipe.nutrition.carbs_g || 0}g carbs, ${recipe.nutrition.fat_g || 0}g fat.\n`;
      }

      if (recipe.diet_tags && recipe.diet_tags.length > 0) {
        markdownContent += `- **Chế độ ăn phù hợp (Diet Tags):** ${recipe.diet_tags.join(", ")}\n`;
      }

      if (recipe.description) {
        markdownContent += `- **Mô tả:** ${recipe.description}\n`;
      }

      markdownContent += `\n### Nguyên liệu cần chuẩn bị:\n`;
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        recipe.ingredients.forEach(ing => {
          markdownContent += `- ${ing.amount} ${ing.unit} ${ing.name}\n`;
        });
      } else {
        markdownContent += `- (Đang cập nhật)\n`;
      }

      markdownContent += `\n### Cách làm (Steps):\n`;
      if (recipe.steps && recipe.steps.length > 0) {
        recipe.steps.forEach((step, index) => {
          markdownContent += `${index + 1}. ${step}\n`;
        });
      } else {
        markdownContent += `- (Đang cập nhật)\n`;
      }

      markdownContent += `\n---\n\n`;
    });

    fs.writeFileSync(OUTPUT_FILE, markdownContent, "utf8");
    console.log(`✅ Đã ghi thành công ${recipes.length} món ăn ra file: ${OUTPUT_FILE}`);

    await mongoose.disconnect();
    console.log("👋 Đã ngắt kết nối DB.");
  } catch (error) {
    console.error("❌ Lỗi khi export:", error);
    process.exit(1);
  }
}

exportRecipesToRag();
