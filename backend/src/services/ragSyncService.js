import fs from "fs";
import path from "path";
import Recipe from "../models/Recipe.js";
import { forceRebuildIndex } from "./ragRetrievalService.js";

/**
 * Hàm đồng bộ dữ liệu từ MongoDB sang RAG.
 * Quá trình này sẽ query toàn bộ món ăn, tạo file markdown, và yêu cầu rebuild index.
 */
export async function syncDbToRag() {
  console.log("[RAG Sync] Bắt đầu đồng bộ Recipe sang RAG...");
  const startTime = Date.now();

  try {
    const recipes = await Recipe.find({}).lean();
    console.log(`[RAG Sync] Tìm thấy ${recipes.length} công thức trong DB.`);

    if (recipes.length === 0) {
      console.warn("[RAG Sync] Cảnh báo: Không có món ăn nào trong DB.");
      return false;
    }

    const OUTPUT_DIR = path.resolve(process.cwd(), "data/rag/papers");
    const OUTPUT_FILE = path.join(OUTPUT_DIR, "db_recipes.md");

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
    console.log(`[RAG Sync] Đã xuất thành công ${recipes.length} món ăn ra: ${OUTPUT_FILE}`);

    // Bắt buộc RAG phải rebuild index từ các file mới
    console.log(`[RAG Sync] Đang yêu cầu Vector DB rebuild index...`);
    const indexMeta = await forceRebuildIndex();
    console.log(`[RAG Sync] Rebuild thành công! (Chunk: ${indexMeta.chunkCount}, Time: ${Date.now() - startTime}ms)`);
    return true;
  } catch (error) {
    console.error("[RAG Sync] Gặp lỗi trong quá trình đồng bộ:", error);
    return false;
  }
}
