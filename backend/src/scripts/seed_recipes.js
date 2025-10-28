import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import csv from "csv-parser";
import slugify from "slugify";
import Recipe from "../models/Recipe.js";

const csvPath =
  process.argv[2] || path.resolve("./data/wikipedia_vn_dishes_filtered.csv");

// ----- Helpers -----
const REGION_SET = new Set(["Bắc", "Trung", "Nam"]);
const DIFFICULTY_SET = new Set(["easy", "medium", "hard"]);
const MEAL_SET = new Set(["breakfast", "lunch", "dinner"]);

function parseList(val) {
  if (val == null) return [];
  return String(val)
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function cleanStr(v) {
  if (v == null) return "";
  return String(v)
    .replace(/^\uFEFF/, "")
    .trim(); // strip BOM + trim
}

function fixUrl(u = "") {
  return cleanStr(u).replace(/\\+$/, ""); // bỏ "\" ở cuối nếu có
}

function fixMeals(val) {
  const arr = parseList(val).map((x) => x.toLowerCase());
  return arr
    .map((m) => (m === "breakfas" ? "breakfast" : m))
    .filter((m) => MEAL_SET.has(m));
}

function safeId(r, idx) {
  const raw = cleanStr(r.id);
  if (raw) return raw;
  const base = slugify(cleanStr(r.name_vi) || `mon-${idx}`, {
    lower: true,
    strict: true,
  });
  return `${base}-${idx}`;
}

function mapRegion(v) {
  const s = cleanStr(v);
  if (REGION_SET.has(s)) return s;
  // map nhẹ vài biến thể hay gặp
  const map = {
    Bac: "Bắc",
    bac: "Bắc",
    Trung: "Trung",
    trung: "Trung",
    Nam: "Nam",
    nam: "Nam",
  };
  return map[s] || ""; // trả về rỗng để validation phía dưới loại doc
}

function mapDifficulty(v) {
  const s = cleanStr(v).toLowerCase();
  if (DIFFICULTY_SET.has(s)) return s;
  return "easy";
}

function parseIngredients(raw) {
  if (!raw) return [];

  // ví dụ: "Bột gạo: 190g, Nước: 100ml"
  return String(raw)
    .split(/[,;]/)
    .map((item) => {
      const parts = item.split(":").map((s) => s.trim());
      const name = parts[0] || "";
      const right = parts[1] || "";

      // tách số và đơn vị
      const amountMatch = right.match(/([\d.]+)/);
      const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
      const unit = right.replace(/[\d.]/g, "").trim() || "g";

      // gán scalable = false cho các gia vị nhỏ (muối, tiêu, nước mắm,...)
      const scalable = !/(muối|tiêu|nước mắm|bột ngọt|mắm|đường)/i.test(name);

      return { name, amount, unit, scalable };
    })
    .filter((ing) => ing.name);
}

// ----- DB -----
async function connect() {
  await mongoose.connect(process.env.MONGO_URI, {});
  console.log(" Connected Mongo");
}

async function run() {
  await connect();

  if (!fs.existsSync(csvPath)) {
    console.error("CSV not found:", csvPath);
    process.exit(1);
  }

  const rows = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.replace(/^\uFEFF/, "").trim(), // loại BOM header
          // csv-parser tự xử lý field có dấu phẩy nếu được bọc "..."
        })
      )
      .on("data", (r) => rows.push(r))
      .on("error", reject)
      .on("end", resolve);
  });

  let skipped = 0;
  let success = 0;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];

    // Chuẩn hóa & validate những trường dễ lỗi
    const doc = {
      id: safeId(r, i),
      name_vi: cleanStr(r.name_vi),
      region: mapRegion(r.region),
      category: cleanStr(r.category) || undefined,

      meal_types: fixMeals(r.meal_types),

      prep_time_min: Number(r.prep_time_min || 0),
      cook_time_min: Number(r.cook_time_min || 0),
      difficulty: mapDifficulty(r.difficulty),

      nutrition: {
        calories: Number(r.calories || 0),
        protein_g: Number(r.protein_g || 0),
        carbs_g: Number(r.carbs_g || 0),
        fat_g: Number(r.fat_g || 0),
        fiber_g: Number(r.fiber_g || 0),
        sodium_mg: Number(r.sodium_mg || 0),
        sugar_g: Number(r.sugar_g || 0),
      },

      price_estimate: {
        min: Number(r.price_est_vnd_min || 0),
        max: Number(r.price_est_vnd_max || 0),
        currency: "VND",
      },

      diet_tags: parseList(r.diet_tags).map(cleanStr),
      allergens: parseList(r.allergens).map(cleanStr),
      taste_profile: parseList(r.taste_profile).map(cleanStr),

      spice_level: Number(r.spice_level || 0),
      servings: Number(r.servings || 1),

      image_url: fixUrl(r.image_url || ""),
      description: cleanStr(r.description || ""),

      ingredients: parseIngredients(r.ingredients),
      utensils: parseList(r.utensils).map(cleanStr),
      steps: parseList(r.steps).map(cleanStr),

      suitable_for: parseList(r.suitable_for).map(cleanStr),
      avoid_for: parseList(r.avoid_for).map(cleanStr),
    };

    // Bỏ qua document nếu thiếu bắt buộc:
    if (!doc.name_vi) {
      skipped++;
      console.warn(`[SKIP row ${i}] missing name_vi`);
      continue;
    }
    if (!doc.region) {
      skipped++;
      console.warn(
        `[SKIP row ${i}] invalid/empty region, expect one of [Bắc, Trung, Nam]`
      );
      continue;
    }

    try {
      await Recipe.findOneAndUpdate({ id: doc.id }, doc, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });
      success++;
    } catch (e) {
      skipped++;
      console.warn(
        `[SKIP row ${i}] upsert error: ${e?.code || ""} ${e?.message || e}`
      );
    }
  }

  console.log(
    ` ✅ Seed done. Success: ${success}, Skipped: ${skipped}, Total rows: ${rows.length}`
  );
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
