import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import Recipe from "../models/Recipe.js";
import connectDB from "../config/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildKnowledgeGraph() {
  console.log("🚀 Bắt đầu xây dựng Knowledge Graph...");
  await connectDB();

  try {
    const recipes = await Recipe.find({}).lean();
    console.log(`Đã lấy ${recipes.length} công thức từ Database.`);

    const graph = {
      nodes: {}, // node_id -> { id, type, label, attributes }
      edges: [], // { source, target, relation }
    };

    function addNode(id, type, label, attributes = {}) {
      const sanitizedId = id.trim().toLowerCase();
      if (!graph.nodes[sanitizedId]) {
        graph.nodes[sanitizedId] = { id: sanitizedId, type, label: label.trim(), attributes };
      }
      return sanitizedId;
    }

    function addEdge(source, target, relation) {
      graph.edges.push({ source, target, relation });
    }

    // Node đặc biệt: "Low Calorie"
    const lowCalNode = addNode("low_calorie", "Concept", "Thấp Calo", { max: 500 });

    for (const recipe of recipes) {
      const recipeName = recipe.name_vi || recipe.name || recipe.title || "Unknown Recipe";
      const recipeId = addNode(recipeName, "Recipe", recipeName, {
        calories: recipe.nutrition?.calories || 0,
        prep_time: recipe.time?.prep || 0,
        original_id: recipe._id.toString()
      });

      // Rút trích quan hệ Nguyên Liệu (Ingredients)
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        for (const ing of recipe.ingredients) {
          if (ing.name) {
            const ingId = addNode(ing.name, "Ingredient", ing.name);
            addEdge(recipeId, ingId, "CONTAINS_INGREDIENT");
            addEdge(ingId, recipeId, "USED_IN_RECIPE"); // Quan hệ 2 chiều cho dễ tìm
          }
        }
      }

      // Rút trích quan hệ Calories
      if (recipe.nutrition?.calories && recipe.nutrition.calories < 500) {
        addEdge(recipeId, lowCalNode, "IS_LOW_CALORIE");
      }

      // Rút trích Tags/Categories
      if (recipe.tags && Array.isArray(recipe.tags)) {
        for (const tag of recipe.tags) {
          const tagId = addNode(tag, "Category", tag);
          addEdge(recipeId, tagId, "BELONGS_TO_CATEGORY");
        }
      }
    }

    const graphFilePath = path.join(__dirname, "../../data/rag/graph.json");
    await fs.writeFile(graphFilePath, JSON.stringify(graph, null, 2), "utf-8");
    
    console.log(`✅ Xây dựng Knowledge Graph thành công!`);
    console.log(`- Tổng số Node: ${Object.keys(graph.nodes).length}`);
    console.log(`- Tổng số Edge: ${graph.edges.length}`);
    console.log(`Đã lưu tại: ${graphFilePath}`);
    
  } catch (err) {
    console.error("❌ Lỗi khi xây dựng Graph:", err);
  } finally {
    mongoose.connection.close();
  }
}

buildKnowledgeGraph();
